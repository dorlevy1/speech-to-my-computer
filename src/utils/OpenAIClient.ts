import OpenAI from "openai";

export default class OpenAIClient {

    protected openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_KEY,
        });
    }

    getOpenAI(): OpenAI {
        return this.openai;
    }
}