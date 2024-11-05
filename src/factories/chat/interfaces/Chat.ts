import Listener from "@utils/Listener";
import Speech from "@speechFactory/interfaces/Speech";

export interface Chat {

    _hooks: any

    turnOn(): Promise<void>

    createMessage(message: string): Promise<void>

    createRun?(tools: []): Promise<void>

    checkRunStatus?(): Promise<void>

    translateText(): Promise<string>

    process(listener: Listener, speech: Speech): Promise<void>

    getRelevantContent(websites: {
        title: string;
        link: string;
    }[] | string, content: string): Promise<string | undefined>

    talkToChat(message: string): Promise<void | string>
}