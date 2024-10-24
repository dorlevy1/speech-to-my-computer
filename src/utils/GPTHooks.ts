import path from "node:path";
import fs from "fs";
import OpenAI from "openai";


export default class GPTHooks {

    openai: OpenAI

    constructor(openai: OpenAI) {
        this.openai = openai
    }

    completions(data: { messages: object[], tools?: [] }) {
        return this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: data.messages as [],
            tools: data.tools || []

        });
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


    createThread() {
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
                assistant_id: 'asst_OMAh3Zaz9IFVLTzH3nMkJo1X',
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
            console.log(text)
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

    transcriptions(filePath: string) {
        return this.openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(filePath), // קובץ ההקלטה בפורמט MP3
            language: 'he' // אופציונלי: שפה (לפי הצורך)
        });
    }
}