import OpenAI from "openai";
import axios from "axios";
import puppeteer from "puppeteer";
import GPTHooks from "./GPTHooks";
import {ChatGPTGoogleCredentialsType, ChatGPTThreadType, ChatGPTTRunType} from "../@types/ChatGPT";

export default class ChatGPT {

    private thread: ChatGPTThreadType
    private run: ChatGPTTRunType
    private readonly _hooks: GPTHooks
    private credentials: ChatGPTGoogleCredentialsType


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
                    formatted += `\n\n${message.content?.[0].text.value}\n\n`;
                }
            }
        });
        return formatted
    }


    async createThread() {
        this.thread = await this._hooks.createThread()
        return this.thread
    }

    async createMessageThread(message: string) {
        if (this.thread) {
            await this._hooks.createMessageThread(this.thread.id, message)
        }
    }


    async createRunThread(tools: []) {
        if (this.thread) {
            this.run = await this._hooks.createAndPoll(this.thread.id, tools)
            return this.run
        }
    }


    async checkRunThreadStatus() {
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

    private async handleCompletedRun() {
        if (this.thread) {
            let messages = await this._hooks.listMessage(this.thread.id);
            if (messages.data[0].content && 'text' in messages.data[0].content?.[0]) {
                return messages.data[0].content?.[0].text?.value;
            }
        } else {
            console.log('No Data.');
        }
    }

    async requiresActions() {
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


    async getRelevantContent(websites: { title: string; link: string; }[] | string, content: string) {

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
                    result += `${index + 1}. ${item.title} - ${item.link}\n`;
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
            console.log('dor')
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
                        content: `Question: "${question}"\n\nContent: "${content}"\n\nIs this content relevant to the question? Answer with yes or no.`
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
                        content: `Here is the content I found about "${question}":\n\n${content}\n\nPlease provide a detailed guide or instructions based on this content.`
                    },

                ]
            })

            return response.choices[0].message?.content || '';
        } catch (error) {
            console.error('Error occurred during content summarization:', error);
            return 'אירעה שגיאה בעת הניסיון לסכם את התוכן.';
        }
    }
}