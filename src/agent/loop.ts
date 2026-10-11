import { AgentMessage, Message, Provider, Tool, ToolCallBlock } from "../type.ts"


export type AgentEvent = { type: "text", content: string }
    | { type: "turn_start" }
    | { type: "tool_start", call: ToolCallBlock }
    | { type: "tool_end", call: ToolCallBlock, isError: boolean, result: string }
    | { type: "message", message: Message }
    | { type: "turn_end", message: AgentMessage }

export interface AgentOption {
    provider: Provider
    model: string
    tools: Tool[]
    system: string
    maxTurns?: number
    messages: Message[]
    emit: (evt: AgentEvent) => void
}

/**
 * 
 * @param option All the required option for running the loop
 */
export const runAgent = async (option: AgentOption) => {
    const { provider, tools, model, maxTurns, system, messages, emit } = option;

    const push = (message: Message) => {
        messages.push(message);
        emit({ type: "message", message })
    }

    for (let turn = 1; turn <= (maxTurns || 1); turn++) {
        let agentMessage: AgentMessage | undefined;


        for await (const event of provider.stream({ system, tools, messages, model })) {
            if (event.type == "text_delta") {
                emit({ type: "text", content: event.delta })
            } else agentMessage = event.messages;
        }
        if (agentMessage?.stopReason !== "tool_call") return;
        push(agentMessage);
        emit({ type: "turn_end", message: agentMessage })

        const calls = agentMessage.content.filter(c => c.type === "toolCall");
        for (const call of calls) {
            emit({ type: "tool_start", call })
            let result: string;
            let isError: boolean = false;
            try {
                const tool = tools.find(t => t.name === call.name);
                if (!tool)
                    throw new Error(`Tool not exist ${call.name}`)

                result = await tool.execute(call.arguements);

            } catch (e) {
                result = `Error ${String(e)}`;
                isError = true;
            }

            emit({ type: "tool_end", call, result, isError })
            push({ role: "toolResult", id: call.id, name: call.name, isError, content: result })
        }
    }




}


// with in the max limit of turns we are basically trying to iterate and finish the thing

