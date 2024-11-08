import { Chat } from "../interfaces/Chat";
import ChatGPT from "@utils/ChatGPT";
import GPTHooks from "@utils/GPTHooks";
import Listener from "@utils/Listener";
import Speech from "@speechFactory/interfaces/Speech";
import tools, { ITool } from "@chatFactory/gpt/utils/tools.helper";
import { ChatGPTInterface } from "@chatFactory/gpt/interfaces/ChatGPT.interface";
import { WebsitesList } from "@ctypes/ChatGPT/websites";


export default class GPT implements Chat, ChatGPTInterface {

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

    getRelevantContent(websites: WebsitesList, content: string): Promise<string | undefined> {
        return this.chatgpt.getRelevantContent(websites, content)
    }

    async createRun(tools: ITool[]): Promise<void> {
        await this.chatgpt.createRunThread(tools)
    }

    async process(listener: Listener, speech: Speech): Promise<void> {
        try {
            // const actionsStrategy = new ActionsProcessor(new ApplicationStrategy())
            const transcript = await this.translateText();
            // const transcript = await OpenAIHooks.generateAudio();
            console.log('Trigger word detected! Activating ChatGPT...');
            // await actionsStrategy.process(transcript)
            const response = await this.talkToChat(transcript) as string;
            if (response) {
                await speech.say(response);
            }
            listener.setInProgress(false)
        } catch (err) {
            listener.setInProgress(false)
            console.error('Error occurred during processing:', err);
        }
    }

    async talkToChat(question: string): Promise<string | void> {
        try {
            await this.createMessage(question)
            await this.createRun(tools)
            return this.chatgpt.checkRunThreadStatus()

        } catch (err) {
            console.error('Error occurred during askChatGPT:', err);
            throw err; // זרוק את השגיאה כדי שתטופל במקום שבו נקראת הפונקציה
        }
    }

    async checkRunStatus(): Promise<void> {

    }

}