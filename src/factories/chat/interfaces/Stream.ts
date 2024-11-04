export default interface Stream {
    start(): void;
    stop(): void;
    pause?(): void;
    resume?(): void;
    isPaused?(): boolean;
    isRunning?(): boolean;
    isStopped?(): boolean;
    isStarted?(): boolean;
    getDuration?(): number;
}