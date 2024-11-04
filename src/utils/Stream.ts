import fs from "fs";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import { unlink } from "node:fs";

export default class Stream {

    outputFileStream: fs.WriteStream | null = null;
    silenceTimeout: NodeJS.Timeout | null = null;

    createFileStream(): void {
        this.outputFileStream = fs.createWriteStream(path.join(process.env.AUDIO_DIR as string, 'output.mp3'), {flags: 'w'});
    }

    convertToMP3() {
        return new Promise((resolve, reject) => {
            const inputPath = path.join(process.env.AUDIO_DIR as string, 'output.wav');
            const outputPath = path.join(process.env.AUDIO_DIR as string, 'output.mp3');

            ffmpeg(inputPath)
                .toFormat('mp3')
                .on('start', () => {
                    console.log('המרה ל-MP3 התחילה...');
                })
                .on('end', () => {
                    console.log('המרה ל-MP3 הסתיימה בהצלחה!');
                    resolve({message: 'המרה ל-MP3 הסתיימה בהצלחה!'})
                })
                .on('error', (err: Error) => {
                    console.log('שגיאה');
                    console.log(err)
                    reject({message: 'אירעה שגיאה במהלך ההמרה:', err})
                })
                .save(outputPath);
        })
    }

    writeToStream(data: Buffer) {
        if (this.outputFileStream) {
            this.outputFileStream.write(data); // כתיבה רק אם הזרם פעיל
        }
    }

    async clearOutput(cb: () => any) {
        if (this.outputFileStream) {
            return this.outputFileStream.end(() => {
                console.log('WAV file stream closed, proceeding to process the file.');
                this.outputFileStream = null;
                cb()
            });
        }
    }

    createTimeout(cb: () => void) {
        this.silenceTimeout = setTimeout(async () => {
            cb()
        }, 3000); // מחכים 5 שניות
    }

    clearTimeout() {
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout)
        }
    }

    async deleteFiles(files: string[]) {
        for (const file of files) {
            unlink(file, (err) => {
                if (err) {
                    console.error(`Error deleting ${ file }: ${ err.message }`);
                } else {
                    console.log(`${ file } נמחק בהצלחה.`);
                }
            });
        }
    }

    async refreshStream(cb: () => any) {
        this.clearTimeout()
        await this.clearOutput(cb)
    }

}