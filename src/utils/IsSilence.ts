import { Transform, TransformCallback } from 'stream';

export default class IsSilence extends Transform {
    threshold: number;

    constructor(threshold = 0.1) {  // סף העוצמה שאיתו נזהה שקט
        super();
        this.threshold = threshold;
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        let sum = 0.0;

        // חישוב עוצמת הקול מה-Buffer
        for (let i = 0; i < chunk.length; i++) {
            const value = chunk[i] / 128.0 - 1.0;  // סקיילינג לערכים בין -1 ל-1
            sum += value * value;
        }

        const rms = Math.sqrt(sum / chunk.length);  // עוצמת RMS של הקול

        // בדיקה אם ה-RMS קטן מסף הרעש
        if (rms < this.threshold) {
            this.emit('silence');
        } else {
            this.emit('sound');
        }

        callback(null, chunk);  // ממשיך עם ה-Stream
    }
}