import GPTSpeech from "../chat/gpt/GPTSpeech";
import AWSSpeech from "../speech/AWSSpeech";

export default class SpeechFactory {

    static createSpeech(program: string | null | undefined, hooks: any): AWSSpeech | GPTSpeech {
        switch (program) {
            case 'gpt':
                return new GPTSpeech(hooks)
            default:
                return new AWSSpeech(hooks)
        }
    }
}