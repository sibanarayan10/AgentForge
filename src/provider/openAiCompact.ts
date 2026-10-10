import OpenAI from "openai"
import { Provider, StopReason, StreamOption, TokenUsage } from "../type.ts"
import { ChatCompletionMessageParam } from "openai/resources"

export const OpenAICompactProvider=(apiKey:string,name:string,model:string,baseUrl:string):Provider=>{
   const client=new OpenAI({
    apiKey,
    baseURL:baseUrl
   })

   return {
      name,
      defaultModel:model,
      async *stream(options:StreamOption){

         const {system,model,messages}=options;

         const chat:ChatCompletionMessageParam[]=messages.map(m=>({role:m.role,content:m.content}) as ChatCompletionMessageParam);

         const stream =await client.chat.completions.create({
            model,
            messages:system?[{role:"system",content:system},...chat]:[...chat],
            stream:true
         });
         
         let textContent="";
         let usage:TokenUsage={
            input:0,
            output:0
         }
         let stopReason:StopReason="stop";
         for await(const chunk of stream){
      
               const content=chunk.choices[0].delta.content;
               if(content){
                  textContent+=content;
                  yield {
                        type:"text_delta",
                        delta:textContent
                     }
               }
               if(chunk.choices[0].finish_reason==="stop")
                  stopReason=chunk.choices[0]?.finish_reason;

               if(chunk.usage){
                  usage={
                     input:chunk.usage.prompt_tokens,
                     output:chunk.usage.completion_tokens
                  };
               }
         }

         yield{
            type:"done",
            messages:{
               content:textContent,
               stopReason,
               usage,
               role:"agent"
            }
         }

         
      }

   }

}

export interface Nothing{
   mes:ChatCompletionMessageParam
}