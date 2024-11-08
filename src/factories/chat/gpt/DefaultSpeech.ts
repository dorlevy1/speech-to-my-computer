import Speech from "@speechFactory/interfaces/Speech";
import PolySpeech from "@utils/PolySpeech";

export default class DefaultSpeech implements Speech {

    private polySpeech: PolySpeech;

    constructor() {
        this.polySpeech = PolySpeech.getInstance()
    }

    async say(text: string): Promise<void> {
        await this.polySpeech.synthesizeSpeech(text)
    }

    stop(): void {
        this.polySpeech.stopPlaying()
    }
}