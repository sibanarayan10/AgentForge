import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { readTool } from "./tools/read.ts";
import type { AgentMessage,Message } from "./type.ts";
import { getProvider } from "./provider/index.ts";

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

const provider=getProvider("groq");
const messages:Message[]=[{role:"user",content:values.prompt}]
const model=values.model;
const tools=[readTool];


const callModel=async():Promise<AgentMessage>=>{
   for await(const event of provider.stream({messages,model,tools})){
    if(event.type==="text_delta")
      process.stdout.write(event.delta);
    else{
      const {usage,stopReason}=event.messages;
      console.log("\n#############");
      console.log("\nKhatam bhai...!! khatam")
      return event.messages;
    }
   }
   throw new Error("Stream ended without a  done event");
}

const first=await callModel();
messages.push(first);

if(first.stopReason=="tool_call"){
  for(const block of first.content){
      if(block.type!=="toolCall")continue;
      console.log(`->${block.name}(${JSON.stringify(block.arguements)})`)
      const result=await readTool.execute(block.arguements);
      messages.push({role:"toolResult",id:block.id,name:block.name,content:result,isError:false});
    }
    messages.push(await callModel());
}

// const messages=await client.messages.create({
//   max_tokens:1024,
//   messages:[{content:values.prompt,role:"user"}],
//   model:values.prompt
// })
 