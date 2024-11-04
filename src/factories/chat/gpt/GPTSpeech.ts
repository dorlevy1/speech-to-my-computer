import Speech from "@speechFactory/interfaces/Speech";
import PolySpeech from "@utils/PolySpeech";
import GPTHooks from "@utils/GPTHooks";
import { MessageEnum } from "@enums/ChatGPT/messageEnum";

export default class GPTSpeech implements Speech {

    private polySpeech: PolySpeech;

    constructor(private _hooks: GPTHooks) {
        console.log('poly voice is active')
        this._hooks = _hooks
        this.polySpeech = PolySpeech.getInstance()
    }

    async say(messages: { role: MessageEnum; content: string }[]): Promise<void> {
        await this._hooks.speech(messages)
    }

    stop(): void {
        this.polySpeech.stopPlaying()
    }
}