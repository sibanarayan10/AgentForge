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
    content:ContentBlock[],
    usage:TokenUsage,
    stopReason:StopReason
}

export interface TextBlock{
    type:"text",
    text:string
}

export interface ToolCallBlock{
    type:"toolCall",
    id:string,
    name:string,
    arguements:Record<string,unknown>
}

export type ContentBlock=TextBlock|ToolCallBlock;

export interface ToolResultMessage{
    role:"toolResult"
    id:string,
    content:string
    name:string,
    isError:boolean
}

export interface ToolSpec{
    name:string
    description:string
    parameters:Record<string,unknown>
}

export type Tool=ToolSpec & {execute(args:Record<string,unknown>):Promise<string>}

export type Message=UserMessage| AgentMessage | ToolResultMessage; 

export interface StreamOption{
    messages:Message[],
    model:string,
    system?:string
    tools?:Tool[]
}
export type StreamEvent={type:"text_delta";delta:string} |{type:"done",messages:AgentMessage}

export interface Provider{
    name:string,
    defaultModel:string,
    stream(opt:StreamOption):AsyncIterable<StreamEvent>
}

export type StopReason ="length"|"tool_call"|"stop";