import { ITool } from "@chatFactory/gpt/utils/tools.helper";

export interface ChatGPTInterface  {
    createRun(tools: ITool[]): Promise<void>

    checkRunStatus(): Promise<void>

}