import { Chat } from "./interfaces/Chat";
import Speech from "./interfaces/Speech";
import Stream from "./interfaces/Stream";

export interface ChatFactory {
    activeChat(): Chat

    activeVoice(): Speech

    activeStream(): Stream
}