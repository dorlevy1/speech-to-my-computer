export default interface Speech {

    say(text: string): void;

    stop(): void;

    pause?(): void;

    resume?(): void;

    isSpeaking?(): boolean;

    isPaused?(): boolean;

    isStopped?(): boolean;

    setVolume?(volume: number): void;

    getVolume?(): number;
}