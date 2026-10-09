import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { parseArgs } from "node:util";
import OpenAI from "openai";

// load the .env next to the code, so mypi works from any folder
config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const{values}=parseArgs({
  options:{
    prompt:{type:"string",short:"p"},
    model:{type:"string",default:"openai/gpt-oss-20b"}
  }
})

if(!values.prompt){
  console.log("Give me a prompt,you naughty dude!!")
  process.exit(1);
}

const client=new Anthropic();
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await groqClient.chat.completions.create({
  messages: [
    {
      role: "user",
      content: values.prompt,
    },
  ],
  model: values.model,
});

console.log("GroqClient response :\n")
console.log(response.choices[0].message?.content)

// const messages=await client.messages.create({
//   max_tokens:1024,
//   messages:[{content:values.prompt,role:"user"}],
//   model:values.prompt
// })
