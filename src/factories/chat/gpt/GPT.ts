import { Chat } from "../interfaces/Chat";
import ChatGPT from "../../../utils/ChatGPT";
import GPTHooks from "@utils/GPTHooks";


export default class GPT implements Chat {

    _hooks: GPTHooks

    constructor(private chatgpt: ChatGPT) {
        this.chatgpt = chatgpt
        this._hooks = this.chatgpt._hooks
    }

    async turnOn(): Promise<void> {
        await this.chatgpt.createThread()
    }

    async createMessage(message: string): Promise<void> {
        await this.chatgpt.createMessageThread(message)
    }

    translateText(): Promise<string> {
        return this.chatgpt.translateText()
    }

    getRelevantContent(websites: {
        title: string;
        link: string
    }[] | string, content: string): Promise<string | undefined> {
        return this.chatgpt.getRelevantContent(websites, content)
    }

    async createRun(tools: []): Promise<void> {
        await this.chatgpt.createRunThread(tools)
    }
}