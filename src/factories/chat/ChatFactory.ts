import { Chat } from "./interfaces/Chat";
import Speech from "../speech/interfaces/Speech";
import Stream from "./interfaces/Stream";

export interface ChatFactory {
    activeChat(): Chat

    activeStream(): Stream

    activeVoice(program: string): Speech
}