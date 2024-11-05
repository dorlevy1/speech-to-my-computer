import Listener from "@utils/Listener";

export default interface Stream {

    listener: Listener;

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