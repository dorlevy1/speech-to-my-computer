import OpenAI from "openai";
import axios from "axios";
import puppeteer from "puppeteer";
import GPTHooks from "./GPTHooks";
import { ChatGPTGoogleCredentialsType, ChatGPTThreadType, ChatGPTTRunType } from "@ctypes/ChatGPT";
import ActionsProcessor from "@strategies/ActionsProcessor";
import NotepadStrategy from "@strategies/NotepadStrategy";
import { MessageEnum } from "@enums/ChatGPT/messageEnum";
import path from "node:path";
import { ITool } from "@chatFactory/gpt/utils/tools.helper";
import { Run } from "openai/resources/beta/threads";

export default class ChatGPT {

    private thread: ChatGPTThreadType
    private run: ChatGPTTRunType
    readonly _hooks: GPTHooks
    private credentials: ChatGPTGoogleCredentialsType
    private messages: { role: MessageEnum, content: string }[] = []


    constructor(openai: OpenAI) {
        this.thread = null
        this.run = null
        this._hooks = new GPTHooks(openai)
        this.credentials = {
            key: process.env.GOOGLE_KEY as string,
            cx: process.env.GOOGLE_CX as string
        }
    }

    getHooks(): GPTHooks {
        return this._hooks
    }

    formatMessages = (messages: OpenAI.Beta.Threads.Messages.MessagesPage) => {
        let formatted = '';
        messages.data.forEach((message) => {
            if (message.role === 'assistant') {
                if (message.content?.[0] && 'text' in message.content?.[0]) {
                    formatted += `\n\n${ message.content?.[0].text.value }\n\n`;
                }
            }
        });
        return formatted
    }

    getMessages() {
        return this.messages
    }

    async createThread() {
        if (this.thread) {
            console.log('Thread Already Exists, Continue Reply')
            await this._hooks.threadReply(this.thread.id, this.messages[this.messages.length - 1])
            return this.thread;
        }
        this.thread = await this._hooks.createThread(this.messages)
    }

    async createMessageThread(message: string): Promise<void> {
        if (this.thread) {
            this.addTypeMessage(MessageEnum.USER, message)
            await this._hooks.createMessageThread(this.thread.id, message)
        }

    }

    addTypeMessage(type: MessageEnum, message: string): void {
        this.messages.push({
            role: type,
            content: message
        })
    }

    async createRunThread(tools: ITool[]): Promise<void | Run> {
        if (this.thread && this.run) {
            console.log('Run Already exists')
            return this.run
        }
        if (this.thread) {
            this.run = await this._hooks.createAndPoll(this.thread.id, tools)
            return this.run
        }
    }

    async checkRunThreadStatus(): Promise<void | string> {
        if (this.run) {
            switch (this.run.status) {
                case "requires_action":
                    await this.requiresActions()
                    break;
                case "completed":
                    if (this.thread) {
                        return this.handleCompletedRun()
                    } else {
                        return 'No Data.'
                    }
                case "in_progress":
                case "failed":
                case "expired":
                case "cancelled":
                    console.log(this.run.status);
                    break;
            }
        }
    }

    private async handleCompletedRun(): Promise<string> {
        if (!this.thread) return 'No Data'
        let messages = await this._hooks.listMessage(this.thread.id);
        messages.data.forEach(data => {
            console.log(data.content)
        })
        if (messages.data[0].content && 'text' in messages.data[0].content?.[0]) {
            this.addTypeMessage(MessageEnum.ASSISTANT, messages.data[0].content?.[0].text?.value)
            return messages.data[0].content?.[0].text?.value;
        }
        return 'No Data'
    }

    async requiresActions(): Promise<void | string> {
        if (this.run && this.thread &&
            this.run.required_action &&
            this.run.required_action.submit_tool_outputs &&
            this.run.required_action.submit_tool_outputs.tool_calls
        ) {

            const toolOutputs = await Promise.all(
                this.run.required_action.submit_tool_outputs.tool_calls.map(
                    async (tool) => {
                        if (tool.function.name === "searchGoogle") {
                            const content = JSON.parse(tool.function.arguments).query;
                            const google = await this.searchGoogle(content);
                            const summary = await this.getRelevantContent(google, content)
                            if (summary) {
                                return {
                                    tool_call_id: tool.id,
                                    output: summary
                                };
                            }
                            return {
                                tool_call_id: tool.id,
                                output: "לא נמצאו תוצאות רלוונטיות."
                            };
                        }
                        if (tool.function.name === "openNotepad") {
                            const actions = new ActionsProcessor(new NotepadStrategy())
                            const content = await this._hooks.translateText(JSON.parse(tool.function.arguments).content, 'Hebrew')
                            await actions.process(content)
                            return {
                                tool_call_id: tool.id,
                                output: "Notepad opened with provided content."
                            };
                        }
                        return null;
                    }
                )
            );

            const validToolOutputs = toolOutputs.filter(output => output !== null);

            if (validToolOutputs.length > 0) {
                this.run = await this._hooks.submitToolOutputsAndPoll(this.thread.id, this.run.id, validToolOutputs)
                console.log("Tool outputs submitted successfully.");
            } else {
                console.log("No tool outputs to submit.");
            }
            return this.checkRunThreadStatus();
        }
    }


    async translateText(): Promise<string> {
        const text = await this.transcribeAudio();
        return this._hooks.translateText(text)
    }

    async getRelevantContent(websites: {
        title: string;
        link: string;
    }[] | string, content: string): Promise<string | undefined> {

        let summary;
        if (websites && websites.length > 0) {
            for (const searchResult of websites) {
                if ((searchResult.link as string).includes('reddit')) {
                    continue;
                }
                const firstResultUrl = searchResult.link as string;
                const websiteContent = await this.extractWebsiteContent(firstResultUrl);

                const isRelevant = await this.isContentRelevant(websiteContent, content);
                if (!isRelevant) {
                    continue;
                }
                summary = await this.summarizeContent(websiteContent, content);
                break;
            }
            return summary
        }
    }

    async searchGoogle(query: string): Promise<{ title: string, link: string }[] | string> {
        try {
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: this.credentials.key,
                    cx: this.credentials.cx,
                    q: query,
                }
            });

            const items = response.data.items;
            if (items && items.length > 0) {
                let result = 'Here are some search results:\n';
                items.slice(0, 3).forEach((item: any, index: number) => {
                    result += `${ index + 1 }. ${ item.title } - ${ item.link }\n`;
                });
                return items
            } else {
                return 'No results found.';
            }
        } catch (error) {
            console.error('Error occurred during Google search:', error);
            return 'Sorry, I could not perform the search.';
        }
    }

    async extractWebsiteContent(url: string): Promise<string> {
        try {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();

            // ניווט לכתובת האתר
            await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});

            // שליפת תוכן מרכזי מתוך האתר
            const content = await page.evaluate(() => {
                // שליפת כל הטקסט מתוך גוף העמוד
                return document.body.innerText;
            });

            await browser.close();
            console.log('moving to next site')
            return content || 'לא נמצא תוכן משמעותי באתר זה.';
        } catch (error) {
            console.error('Error occurred while extracting website content:', error);
            return 'אירעה שגיאה בעת הניסיון לקרוא את התוכן מהאתר.';
        }
    }

    async isContentRelevant(content: string, question: string): Promise<boolean> {
        try {

            const response = await this._hooks.completions({
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant that determines if the given content is relevant to the user's question."
                    },
                    {
                        role: "user",
                        content: `Question: "${ question }"\n\nContent: "${ content }"\n\nIs this content relevant to the question? Answer with yes or no.`
                    },

                ]
            });


            const answer = response.choices[0].message?.content?.trim().toLowerCase() || 'no';
            return answer === 'yes';
        } catch (error) {
            console.error('Error occurred during relevance check:', error);
            return false;
        }
    }

    async summarizeContent(content: string, question: string): Promise<string> {
        try {

            const response = await this._hooks.completions({
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant that reads articles and gives detailed, step-by-step guides based on the user's question."
                    },
                    {
                        role: "user",
                        content: `Here is the content I found about "${ question }":\n\n${ content }\n\nPlease provide a detailed guide or instructions based on this content.`
                    },

                ]
            })

            return response.choices[0].message?.content || '';
        } catch (error) {
            console.error('Error occurred during content summarization:', error);
            return 'אירעה שגיאה בעת הניסיון לסכם את התוכן.';
        }
    }

    async transcribeAudio(): Promise<string> {
        try {
            const filePath = path.join(process.env.AUDIO_DIR as string, 'output.mp3'); // נתיב לקובץ ההקלטה

            return await this._hooks.transcriptions(filePath);

        } catch (err) {
            console.error('Error occurred during transcription:', err);
            return 'Error in transcription';
        }
    }

    async speech(): Promise<void> {
        await this._hooks.speech(this.messages)
    }
}