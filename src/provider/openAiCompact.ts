import OpenAI from "openai"
import { ContentBlock, Message, Provider, StopReason, StreamOption, TokenUsage } from "../type.ts"
import { ChatCompletionMessageParam } from "openai/resources"


// our messages -> OpenAI's wire format
function toOpenAI(messages: Message[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((m): OpenAI.ChatCompletionMessageParam => {
    if (m.role === "user") return { role: "user", content: m.content };
    if (m.role === "agent") {
      const text = m.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const calls = m.content.filter((b) => b.type === "toolCall");
      return {
        role: "assistant",
        content: text || null,
        // OpenAI wants the arguments as a JSON *string*
        tool_calls: calls.length
          ? calls.map((c) => ({
              id: c.id,
              type: "function" as const,
              function: { name: c.name, arguments: JSON.stringify(c.arguements) },
            }))
          : undefined,
      };
    }
    // toolResult -> its own message with role "tool"
    return { role: "tool", tool_call_id: m.id, content: m.content };
  });
}


export const OpenAICompactProvider=(apiKey:string,name:string,model:string,baseUrl:string):Provider=>{
   const client=new OpenAI({
    apiKey,
    baseURL:baseUrl
   })

   return {
      name,
      defaultModel:model,
      async *stream({ messages, model, system, tools = [] }) {
         const chat = toOpenAI(messages);
         const stream = await client.chat.completions.create({
            model,
            stream: true,
            stream_options: { include_usage: true }, // usage comes in the last chunk
            messages: system ? [{ role: "system", content: system }, ...chat] : chat,
            tools: tools.length
               ? tools.map((t) => ({
                  type: "function" as const,
                  function: { name: t.name, description: t.description, parameters: t.parameters },
                  }))
               : undefined,
         });


         let text = "";
         const calls: { id: string; name: string; args: string }[] = []; // slot = tool_calls[].index
         let usage: TokenUsage = { input: 0, output: 0 };
         let stopReason: StopReason = "stop";
         for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (choice?.delta?.content) {
               text += choice.delta.content;
               yield { type: "text_delta", delta: choice.delta.content };
            }
            for (const tc of choice?.delta?.tool_calls ?? []) {
               // the first piece of a call brings id + name, later pieces only bring more arguments
               calls[tc.index] ??= { id: tc.id ?? `call_${tc.index}`, name: tc.function?.name ?? "", args: "" };
               calls[tc.index].args += tc.function?.arguments ?? "";
            }
            if (choice?.finish_reason === "tool_calls") stopReason = "tool_call";
            else if (choice?.finish_reason === "length") stopReason = "length";
            if (chunk.usage) usage = { input: chunk.usage.prompt_tokens, output: chunk.usage.completion_tokens };
         }
         const content: ContentBlock[] = text ? [{ type: "text", text }] : [];
         for (const c of calls) {
         if (c) content.push({ type: "toolCall", id: c.id, name: c.name, arguements: c.args ? JSON.parse(c.args) : {} });
         }
         if (content.some((b) => b.type === "toolCall")) stopReason = "tool_call";
         yield { type: "done", messages: { role: "agent", content, usage, stopReason } };
   },
 

   }

}

export interface Nothing{
   mes:OpenAI.Chat.Completions.ChatCompletionChunk
}