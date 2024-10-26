import path from "node:path";
import fs from "fs";
import OpenAI from "openai";
import {MessageEnum} from "../enums/ChatGPT/messageEnum";
import {readFileSync, writeFileSync} from "node:fs";
import {exec} from "node:child_process";


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


    async generateAudio() {
        const filePath = path.join(process.env.AUDIO_DIR as string, 'output.mp3'); // נתיב לקובץ ההקלטה
        const buffer = readFileSync(filePath)
        const base64str = buffer.toString("base64");

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-audio-preview",
            modalities: ["text", "audio"],
            audio: {voice: "alloy", format: "wav"},
            messages: [
                {
                    role: "user",
                    content: [
                        {type: "input_audio", input_audio: {data: base64str, format: "mp3"}}
                    ]
                }
            ]
        });
        return response.choices[0].message.audio?.transcript || '';
    }

    async speech(messages: { role: MessageEnum; content: string }[]) {
        try {
            // Request to OpenAI for audio response
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-audio-preview",
                modalities: ["text", "audio"],
                audio: {voice: "alloy", format: "wav"},
                messages: messages
            });

            console.log(response.choices[0]);

            // Extract audio data from the response
            const audioData = response?.choices?.[0]?.message?.audio?.data;

            if (audioData) {
                // Write the audio data to a file
                const audioFilePath = path.join(process.env.AUDIO_DIR as string, 'response.mp3');
                writeFileSync(audioFilePath, Buffer.from(audioData, 'base64'));

                console.log('Response saved as response.mp3');

                // Play the saved audio file using ffplay
                exec(`ffplay -nodisp -autoexit "${audioFilePath}"`, (err) => {
                    if (err) {
                        console.error('Error playing audio with ffplay:', err);
                        return;
                    }
                    console.log('Audio played successfully.');
                });
            } else {
                console.error('No audio data found in the response.');
            }
        } catch (error) {
            console.error('Error generating speech response:', error);
        }
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

    async transcriptions(filePath: string) {

        const data = await this.openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(filePath), // קובץ ההקלטה בפורמט MP3
            language: 'en' // אופציונלי: שפה (לפי הצורך)
        });
        return data?.text || ''
    }
}