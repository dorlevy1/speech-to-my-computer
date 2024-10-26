import path from "node:path";
import fs from "fs";
import OpenAI from "openai";
import {MessageEnum} from "../enums/ChatGPT/messageEnum";


export default class GPTHooks {

    openai: OpenAI

    constructor(openai: OpenAI) {
        this.openai = openai
    }

    completions(data: { messages: object[], tools?: [] }) {
        let bodyData: { messages: []; model: string } | { messages: []; model: string, tools: [] } = {
            model: "gpt-4-turbo",
            messages: data.messages as [],
        }

        if (data.tools) {
            bodyData = {
                model: "gpt-4-turbo",
                messages: data.messages as [],
                tools: data.tools
            }
        }

        return this.openai.chat.completions.create(bodyData);
    }

    submitToolOutputsAndPoll(threadID: string, runID: string, outputTools: { tool_call_id: string, output: string }[]) {
        return this.openai.beta.threads.runs.submitToolOutputsAndPoll(
            threadID,
            runID,
            {tool_outputs: outputTools},
        );
    }

    listMessage(id: string) {
        return this.openai.beta.threads.messages.list(id)
    }


    createThread(messages?: { role: MessageEnum; content: string }[]) {
        if (messages && messages.length > 0) {
            return this.openai.beta.threads.create({messages})
        }
        return this.openai.beta.threads.create()
    }


    async createMessageThread(id: string, message: string) {
        await this.openai.beta.threads.messages.create(id,
            {
                role: "user",
                content: message
            }
        );
    }

    createAndPoll(id: string, tools: any) {
        return this.openai.beta.threads.runs.createAndPoll(id, {
                assistant_id: process.env.ASSISTANT_ID as string,
                tools: tools
            },
        );
    }

    async transcribeAudio() {
        try {
            const filePath = path.join(process.env.AUDIO_DIR as string, 'output.mp3'); // נתיב לקובץ ההקלטה

            const response = await this.transcriptions(filePath)
            return response.text;

        } catch (err) {
            console.error('Error occurred during transcription:', err);
            return 'Error in transcription';
        }
    }

    async translateText(text: string, targetLanguage: string = 'English'): Promise<string> {
        try {
            const response = await this.completions({
                messages: [
                    {role: 'system', content: `You are a translation assistant.`},
                    {role: 'user', content: `Translate the following text to ${targetLanguage}: "${text}"`},
                ]
            })

            return response.choices[0].message?.content || '';

        } catch (error) {
            console.error('Error during translation:', error);
            return 'Translation failed';
        }
    }

    async translateAudio(): Promise<string> {
        try {
            const filePath = path.join(process.env.AUDIO_DIR as string, 'output.mp3'); // נתיב לקובץ ההקלטה

            const response = await this.openai.audio.translations.create({
                file: fs.createReadStream(filePath),
                model: "whisper-1",
            });

            return response.text;

        } catch (error) {
            console.error('Error during translation:', error);
            return 'Translation failed';
        }
    }

    transcriptions(filePath: string) {
        return this.openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(filePath), // קובץ ההקלטה בפורמט MP3
            language: 'he' // אופציונלי: שפה (לפי הצורך)
        });
    }
}