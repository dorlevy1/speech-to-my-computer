import Speech from "@speechFactory/interfaces/Speech";
import PolySpeech from "@utils/PolySpeech";
import GPTHooks from "@chatFactory/gpt/base/GPTHooks";
import { SpeechMessageType } from "@ctypes/ChatGPT/speech";

export default class GPTSpeech implements Speech {

    private polySpeech: PolySpeech;

    constructor(private _hooks: GPTHooks) {
        console.log('poly voice is active')
        this._hooks = _hooks
        this.polySpeech = PolySpeech.getInstance()
    }

    async say(messages: SpeechMessageType[]): Promise<void> {
        await this._hooks.speech(messages)
    }

    stop(): void {
        this.polySpeech.stopPlaying()
    }
}