import Speech from "./interfaces/Speech";
import PolySpeech from "../../utils/PolySpeech";
import GPTHooks from "@chatFactory/gpt/base/GPTHooks";

export default class AWSSpeech implements Speech {

    private polySpeech: PolySpeech;

    constructor(private _hooks: GPTHooks) {
        this.polySpeech = PolySpeech.getInstance()
        this._hooks = _hooks
        console.log('poly voice is active in', this.constructor.name)
    }

    async say(text: string): Promise<void> {
        await this.polySpeech.synthesizeSpeech(text)
    }

    stop(): void {
        this.polySpeech.stopPlaying()
    }
}