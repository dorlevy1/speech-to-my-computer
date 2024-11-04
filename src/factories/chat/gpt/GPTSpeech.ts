import Speech from "../../speech/interfaces/Speech";
import PolySpeech from "../../../utils/PolySpeech";

export default class GPTSpeech implements Speech {

    private polySpeech: PolySpeech;

    constructor() {
        console.log('poly voice is active')
        this.polySpeech = PolySpeech.getInstance()
    }

    async say(text: string): Promise<void> {
        await this.polySpeech.synthesizeSpeech(text)
    }

    stop(): void {
        this.polySpeech.stopPlaying()
    }
}