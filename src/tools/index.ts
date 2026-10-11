import { Tool } from "../type.ts";
import { readTool } from "./read.ts"
import { bashTool } from "./bash.ts";

export const tools: Tool[] = [readTool, bashTool];