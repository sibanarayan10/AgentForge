import { readFile } from "node:fs/promises";
import { Tool } from "../type.ts";
import { resolve } from "node:path";


export const readTool:Tool={
    name:"readTool",
    description:"Tool for reading the file",
    parameters:{
        type:"object",
        properties:{
            path:{type:"string",description:"Path to the file, relative to the current folder"}
        },
        required:["path"]
    },
    async execute(args){
        return readFile(resolve(process.cwd(),String(args.path)),'utf-8')
    }

}