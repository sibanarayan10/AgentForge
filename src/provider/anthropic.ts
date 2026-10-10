import Anthropic from "@anthropic-ai/sdk";
import { ContentBlock, Message, Provider, StopReason } from "../type.ts";
import { RawMessageStreamEvent } from "@anthropic-ai/sdk/resources";

/**
 * 
 * @param message The generics message,which can be anything,starting from AgentMessage to the UserMessage
 * @returns Basically we are mapping it back to the `Anthropic` message param
 */
function toAnthropic(message:Message[]):Anthropic.MessageParam[]{
    return message.map((m):Anthropic.MessageParam=>{
        if(m.role==="user"){
            return {role:"user",content:m.content}
        }
        if(m.role==="agent"){
            return {role:"assistant",content:m.content.map((b):Anthropic.ContentBlockParam=>{
                if(b.type=="text"){
                    return {type:"text",text:b.text};
                }

                return {type:"tool_use",id:b.id,name:b.name,input:b.arguements}
            })}
        }

        return {
            role:"user",
            content: [{
                type:"tool_result",
                tool_use_id:m?.id,
                content:m?.content,
                is_error:m?.isError
            }]
        }
    })
}



export const createAnthropic=():Provider=>{
    const client=new Anthropic();
    return {
        name:"anthropic",
        defaultModel:"claude-sonnet-5",
        async *stream({messages,model,system,tools=[]}){
            const stream=client.messages.stream({
                model,
                max_tokens:4096,
                system,
                messages:toAnthropic(messages),
                tools:tools.map(t=>({
                    name:t.name,
                    description:t.description,
                    input_schema:t.parameters as Anthropic.Tool.InputSchema
                }))
            })

            let textContent="";
            const content:ContentBlock[]=[];
            let json="";

            for await (const event of stream){
                if(event.type==="content_block_start"){
                    const block=event.content_block;
                    if(block.type==="text"){
                        content.push({type:"text",text:block.text})
                    }else if(block.type==="tool_use"){
                        content.push({type:"toolCall",id:block.id,name:block.name,arguements:{}})
                        json="";
                    }
                }else if(event.type==="content_block_delta"){
                    const block=content.at(-1);
                    if(event.delta.type==="text_delta"&& block?.type==="text"){
                        block.text+=event.delta.text;
                        yield {type:"text_delta",delta:event.delta.text}
                    }else if(event.delta.type==="input_json_delta"){
                        json+=event.delta.partial_json;
                    }
                }else if(event.type==="content_block_stop"){
                    const block=content.at(-1);
                    if(block?.type==="toolCall"){
                        block.arguements=json?JSON.parse(json):{};
                    }
                }

            }

            const final=await stream.finalMessage();
            const stopReason:StopReason=final.stop_reason==="tool_use"?"tool_call":final.stop_reason==="max_tokens"?"length":"stop";
            
            yield {
                type:"done",
                messages:{
                    usage:{
                        input:final.usage.input_tokens,
                        output:final.usage.output_tokens
                    },
                    content,
                    role:"agent",
                    stopReason
                }
            }
        }

    }
}

interface ChatMessage{
    event:RawMessageStreamEvent
}