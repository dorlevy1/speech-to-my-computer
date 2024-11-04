import { Chat } from "../interfaces/Chat";
import ChatGPT from "../../../utils/ChatGPT";


export default class GPT implements Chat {

    constructor(private openai: ChatGPT) {
        this.openai = openai
    }

    async turnOn(): Promise<void> {
        await this.openai.createThread()
    }

    async createMessage(message: string): Promise<void> {
        await this.openai.createMessageThread(message)
    }

    translateText(): Promise<string> {
        return this.openai.translateText()
    }

    getRelevantContent(websites: {
        title: string;
        link: string
    }[] | string, content: string): Promise<string | undefined> {
        return this.openai.getRelevantContent(websites, content)
    }

    async createRun(tools: []): Promise<void> {
        await this.openai.createRunThread(tools)
    }
}