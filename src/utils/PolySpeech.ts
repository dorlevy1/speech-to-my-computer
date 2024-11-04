import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import path from "node:path";
import fs from "fs";
import { Readable } from "stream";
import { ChildProcess, exec } from "node:child_process";
import { SpeechSynthesizeSpeechType, SpeechType, SpeechVoiceTextType } from "../@types/Speech";

export default class PolySpeech {

    private params: SpeechType = null
    private readonly polly: PollyClient
    static instance: PolySpeech;
    private play: ChildProcess | null = null;

    private constructor() {
        this.polly = new PollyClient({region: 'us-west-2'});
    }

    static getInstance() {
        if (!PolySpeech.instance) {
            PolySpeech.instance = new PolySpeech();
        }
        return PolySpeech.instance;
    }

    setVoiceText(text: SpeechVoiceTextType) {
        this.params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Ruth', // Use the Ruth voice for British English
            Engine: 'neural' // Explicitly set the engine to neural for Ruth
        };
    }

    async synthesizeSpeech(text: SpeechSynthesizeSpeechType) {
        this.setVoiceText(text)
        if (!this.params || !this.polly) return

        try {
            const command = new SynthesizeSpeechCommand(this.params); // Create command
            const data = await this.polly.send(command); // Send command to Polly

            // Check if AudioStream is a readable stream
            if (data.AudioStream) {
                const audioFile = path.join(process.env.AUDIO_DIR as string, 'response.mp3');

                // Create a writable stream to save the audio
                const writableStream = fs.createWriteStream(audioFile);

                // Pipe the AudioStream to the writable stream (write audio to file)
                (data.AudioStream as Readable).pipe(writableStream);

                writableStream.on('finish', () => {
                    console.log('Response saved as response.mp3');
                    this.play = exec(`ffplay -nodisp -autoexit "${ audioFile }"`, async (err, stdout, stderr) => {
                        if (err) {
                            console.error('Error playing audio with ffplay:', err);
                            return;
                        }
                        console.log('Audio played successfully.');
                    });
                });

                writableStream.on('error', (err) => {
                    console.error('Error saving Polly response:', err);
                });

            } else {
                console.error('Polly returned no AudioStream or invalid stream type.');
            }
        } catch (err) {
            console.error('Error with Polly request:', err);
        }
    }

    stopPlaying() {
        this.play?.kill('SIGINT')
    }
}