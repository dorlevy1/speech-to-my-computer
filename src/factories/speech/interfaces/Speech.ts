import { MessageEnum } from "@enums/ChatGPT/messageEnum";

export type SpeechSayType = string | { role: MessageEnum; content: string }[];
export default interface Speech {

    say(text: SpeechSayType): void;

    stop(): void;

    pause?(): void;

    resume?(): void;

    isSpeaking?(): boolean;

    isPaused?(): boolean;

    isStopped?(): boolean;

    setVolume?(volume: number): void;

    getVolume?(): number;
}