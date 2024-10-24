import OpenAI from "openai";


export type ChatGPTThreadType = OpenAI.Beta.Threads.Thread | null
export type ChatGPTTRunType = OpenAI.Beta.Threads.Runs.Run | null

export type ChatGPTGoogleCredentialsType = {
    key: string;
    cx: string;
};
