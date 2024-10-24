declare module 'mic' {
    interface MicOptions {
        rate?: string;
        channels?: string;
        debug?: boolean;
        exitOnSilence?: number;
        fileType?: string;
        device?: string;
    }

    export interface MicInstance {
        getAudioStream(): NodeJS.ReadableStream | null;

        start(): void;

        stop(): void;
    }

    function mic(options?: MicOptions): MicInstance;

    export = mic;
}
