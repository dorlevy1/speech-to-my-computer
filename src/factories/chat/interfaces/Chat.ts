export interface Chat {
    turnOn(): Promise<void>

    createMessage(message: string): Promise<void>

    createRun?(tools: []): Promise<void>

    checkRunStatus?(): Promise<void>

    translateText(): Promise<string>

    getRelevantContent(websites: {
        title: string;
        link: string;
    }[] | string, content: string): Promise<string | undefined>
}