declare module 'play-sound' {
    interface PlayOptions {
        player?: string;
    }

    interface Player {
        play(file: string, callback?: (err: Error | null) => void): void;
    }

    function playSound(options?: PlayOptions): Player;

    export = playSound;
}