import Listener from "@utils/Listener";
import Speech from "@speechFactory/interfaces/Speech";
import { ITool } from "@chatFactory/gpt/utils/tools.helper";

export interface Chat {

    _hooks: any

    turnOn(): Promise<void>

    createMessage(message: string): Promise<void>

    createRun?(tools: ITool[]): Promise<void>

    checkRunStatus?(): Promise<void>

    translateText(): Promise<string>

    process(listener: Listener, speech: Speech): Promise<void>

    getRelevantContent(websites: {
        title: string;
        link: string;
    }[] | string, content: string): Promise<string | undefined>

    talkToChat(message: string): Promise<void | string>
}