import { Provider } from "../type.ts";
import { createAnthropic } from "./anthropic.ts";
import { OpenAICompactProvider } from "./openAiCompact.ts";

const providers:Record<string,()=>Provider>={
    "anthropic":createAnthropic,
    "anthropic-openai":()=>OpenAICompactProvider(process.env.ANTHROPIC_API_KEY!,"anthropic","","https://api.anthropic.com"),
    "groq":()=>OpenAICompactProvider(process.env.GROQ_API_KEY!,"groq","qwen/qwen3.8-27b","https://api.groq.com/openai/v1")
}

export const getProvider=(name:keyof typeof providers)=>{
    const create=providers[name];
    if(!create){
        throw new Error("Something went wrong while getting the provider");
    }
    return create();
}