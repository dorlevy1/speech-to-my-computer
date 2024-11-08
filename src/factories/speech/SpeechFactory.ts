import GPTSpeech from "../chat/gpt/GPTSpeech";
import AWSSpeech from "../speech/AWSSpeech";
import DefaultSpeech from "@chatFactory/gpt/DefaultSpeech";

export default class SpeechFactory {

    static createSpeech(program: string | null | undefined, hooks?: any): AWSSpeech | GPTSpeech | DefaultSpeech {
        switch (program) {
            case 'gpt':
                return new GPTSpeech(hooks)
            case 'aws':
                return new AWSSpeech(hooks)
            default:
                return new DefaultSpeech()
        }
    }
}