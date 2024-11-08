import { MessageEnum } from "@enums/ChatGPT/messageEnum";

export type SpeechMessageType = {
    role: MessageEnum;
    content: string
}
export type SpeechSayType = string | SpeechMessageType[];
