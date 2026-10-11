import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { readTool } from "./tools/read.ts";
import type { AgentMessage, Message } from "./type.ts";
import { getProvider } from "./provider/index.ts";
import { runAgent } from "./agent/loop.ts"
import { tools } from "./tools/index.ts"
import { run } from "node:test";

// load the .env next to the code, so mypi works from any folder
config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const { values, positionals } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    model: { type: "string", default: "openai/gpt-oss-20b" }
  },
  allowPositionals: true
})

const prompt = values.prompt || positionals.join(" ").trim();

if (!prompt) {
  console.log("Give me a prompt,you naughty dude!!")
  process.exit(1);
}

const provider = getProvider("groq");
const messages: Message[] = [{ role: "user", content: prompt }]
const model = values.model;


await runAgent({
  messages, provider, model, tools, maxTurns: 10, system: "", emit(event) {
    if (event.type == "text") process.stdout.write(event.content);
    else if (event.type == "tool_start") console.log(`\nCalling  the tool ${event.call.name}`)
    else if (event.type === "tool_end") {
      const result = event.result;
      console.log(`${event.isError ? "Some error occur while calling the tool" : result}`)

    } else if (event.type == "turn_end") {
      const { usage, stopReason } = event.message;
      console.log(`\n\n ----${provider.name} ${model} ----input-token${usage.input} ----output-token${usage.output} ...${stopReason}`)
    }
  },
});


