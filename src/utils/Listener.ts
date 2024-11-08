import Stream from "./Stream";
import readline from './readline';
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { keypress } from './stdin';
import FfmpegConfig from "../config/ffmpeg.config";


export default class Listener extends Stream {

    static instance: Listener
    inProgress: boolean = false
    process: any = null
    record: ChildProcessWithoutNullStreams | null = null


    private constructor() {
        super()
        if (!Listener.instance) {
            this.setupKeyListeners()
            Listener.instance = this
        }
        return Listener.instance
    }


    static getInstance() {
        if (!Listener.instance) {
            Listener.instance = new Listener()
        }

        return Listener.instance
    }

    setupKeyListeners() {
        keypress((key) => {
            if (key.name === 's') {
                this.startRecording(); // התחלת ההקלטה בלחיצה על המקש
            }
            if (key.name === 'b') {
                this.stopRecording();
            }

            // סגירה אם לוחצים על Ctrl+C
            if (key.ctrl && key.name === 'c') {
                readline.close()
                process.exit();
            }
        })
    }

    setProcess(process: () => any) {
        this.process = process
    }

    setInProgress(boolean: boolean) {
        this.inProgress = boolean
    }

    listen() {
        if (this.record) {
            this.createFileStream()
            this.record.stdout?.on('data', (data) => {
                console.log(`stdout: ${ data }`);

            });

            this.record.stderr?.on('data', (data) => {
                const message = data.toString();
                // חפש הודעה שמבשרת על תחילת ההקלטה

                if (message.includes('silence_start')) {
                    console.log('Silence detected!');
                }

                if (message.includes('silence_end')) {
                    if (this.outputFileStream) {
                        this.writeToStream(data); // כתיבה רק אם הזרם פעיל
                    }
                }

                if (message.includes('Press [q] to stop')) {
                    console.log('Recording has started!');
                }
            });

            this.record.on('close', async (code) => {
                console.log(`FFmpeg process exited with code ${ code }`);
                if (!this.inProgress) {
                    if (this.outputFileStream) {
                        this.clearAll()
                        await this.refreshStream(async () => {
                            this.setInProgress(true)
                            await this.process()
                            // await this.deleteFiles([
                            //     path.join(process.env.AUDIO_DIR as string, 'output.mp3')
                            // ]);
                        })
                    }
                }
            });
        }
    }

    stopRecording() {
        if (!this.isActive()) {
            console.log('There\'s no active recording at this moment.')
            return;
        }
        this.clearAll();

        console.log('Recording stopped.');
    }

    // התחלת ההקלטה
    startRecording() {
        if (this.isActive()) {
            console.log('There\'s already active recording')
            return;
        }
        this.record = spawn(process.env.FFMPEG_PATH as string, FfmpegConfig)

        this.setInProgress(false);
        console.log('Recording started.');
        this.listen()

    }

    isActive() {
        return this.record !== null
    }

    clearAll() {
        if (this.record) {
            this.record.stdin?.write('q');  // שליחת "q" ל-FFmpeg כדי לעצור הקלטה בצורה מסודרת
            this.record = null
        }
    }
}