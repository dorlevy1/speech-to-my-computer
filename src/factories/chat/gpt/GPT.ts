import { Chat } from "../interfaces/Chat";
import ChatGPT from "../../../utils/ChatGPT";
import GPTHooks from "@utils/GPTHooks";
import Listener from "@utils/Listener";
import Speech from "@speechFactory/interfaces/Speech";


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
            const tools = [
                {
                    type: "function",
                    function: {
                        name: "searchGoogle",
                        description: "Performs a search on Google using the Custom Search API. Should be called when no answer is found in the internal knowledge base, provided instructions, or uploaded files. Should only be used as a fallback mechanism when all other resources have been exhausted.",
                        strict: true,
                        parameters: {
                            type: "object",
                            required: [
                                "query"
                            ],
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query string to be sent to the API"
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }, {
                    type: "function",
                    function: {
                        name: "openNotepad",
                        description: "Opens the Notepad editor and writes provided content. Should be called whenever the user asks to open an editor or make a note.",
                        strict: true,
                        parameters: {
                            type: "object",
                            required: ["content"],
                            properties: {
                                content: {
                                    type: "string",
                                    description: "The content that should be written in Notepad"
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            ]
            await this.createMessage(question)
            await this.createRun(tools as [])
            return this.chatgpt.checkRunThreadStatus()

        } catch (err) {
            console.error('Error occurred during askChatGPT:', err);
            throw err; // זרוק את השגיאה כדי שתטופל במקום שבו נקראת הפונקציה
        }
    }
}