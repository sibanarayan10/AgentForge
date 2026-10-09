import Anthropic from "@anthropic-ai/sdk";
import { Provider, StopReason } from "../type.ts";

const createAnthropicProvider=():Provider=>{
    const client=new Anthropic();
    return {
        name:"anthropic",
        defaultModel:"claude-sonnet-5",
        async *stream({messages,model,system}){
            const stream=client.messages.stream({
                model,
                max_tokens:4096,
                system,
                messages:messages.map(m=>({role:"user",content:m.content}))
            })

            let textContent="";

            for await (const event of stream){
                if(event.type==="content_block_delta" && event.delta.type==="text_delta"){
                    textContent+=event.delta.text;
                    yield {type:"text_delta",delta:event.delta.text}
                }
            }

            const final=await stream.finalMessage();
            const stopReason:StopReason=final.stop_reason==="max_tokens"?"length":"stop";
            
            yield {type:"done",messages:{
                usage:{
                    input:final.usage.input_tokens,
                    output:final.usage.output_tokens
                },
                content:textContent,
                role:"agent",
                stopReason
            }}
        }

    }
}