import { SpeechSayType } from "@ctypes/ChatGPT/speech";

export default interface Speech {

    say(text: SpeechSayType): Promise<void>;

    stop(): void;

    pause?(): void;

    resume?(): void;

    isSpeaking?(): boolean;

    isPaused?(): boolean;

    isStopped?(): boolean;

    setVolume?(volume: number): void;

    getVolume?(): number;
}