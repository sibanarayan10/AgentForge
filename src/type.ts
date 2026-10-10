export interface TokenUsage{
    input:number,
    output:number
}

export type UserMessage={
    role:"user",
    content:string
}

export type AgentMessage={
    role:"agent",
    content:string,
    usage:TokenUsage,
    stopReason:StopReason
}
export type Message=UserMessage| AgentMessage;

export interface StreamOption{
    messages:Message[],
    model:string,
    system?:string
}
export type StreamEvent={type:"text_delta";delta:string} |{type:"done",messages:AgentMessage}

export interface Provider{
    name:string,
    defaultModel:string,
    stream(opt:StreamOption):AsyncIterable<StreamEvent>
}

export type StopReason ="length"|"tool_call"|"stop";