import GPTSpeech from "../chat/gpt/GPTSpeech";
import AWSSpeech from "../speech/AWSSpeech";

export default class SpeechFactory {
    static createSpeech(program: string): AWSSpeech | GPTSpeech {
        switch (program) {
            case 'gpt':
                return new GPTSpeech()
            default:
                return new AWSSpeech()
        }
    }
}