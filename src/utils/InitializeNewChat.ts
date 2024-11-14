import readline from "@utils/readline";
import Logger from "../decorators/logger.decorator";
import SpeechFactory from "@speechFactory/SpeechFactory";
import Speech from "@speechFactory/interfaces/Speech";


enum NewChatType {
    GPT = 'GPT',
    BING = 'BING',
    AWS = 'BING'
}

export default class InitializeNewChat {

    private static instance: InitializeNewChat;
    private _newChatType: string = 'GPT';
    private _voice: Speech;


    private constructor() {
        if (InitializeNewChat.instance) {
            throw new Error('Use getInstance() method to create an instance.');
        }
        this._voice = SpeechFactory.createSpeech(null);
        InitializeNewChat.instance = this;
    }

    static getInstance(): InitializeNewChat {
        if (!InitializeNewChat.instance) {
            InitializeNewChat.instance = new InitializeNewChat();
        }
        return InitializeNewChat.instance;
    }

    get newChatType(): NewChatType {
        return <NewChatType>this._newChatType;
    }

    set newChatType(value: NewChatType) {
        this._newChatType = value;
    }

    private validateNewChatType(newChatType: NewChatType): NewChatType {
        if (newChatType === (NewChatType.GPT || NewChatType.BING || NewChatType.AWS).toUpperCase()) {
            return newChatType;
        } else {
            throw new Error('Invalid new chat type');
        }
    }

    async voiceSpeak(message: string): Promise<void> {
        this._voice.stop()
        await this._voice.say(message);
    }

    @Logger('InitializeNewChat.startNewChat')
    async startNewChat(): Promise<string> {
        await this.voiceSpeak(process.env.NEW_CHAT_QUESTION as string)
        return new Promise((resolve, reject) => {
            readline.question(process.env.NEW_CHAT_QUESTION as string, (answer) => {
                try {
                    this.newChatType = this.validateNewChatType(answer as NewChatType);
                    console.log(
                        `New chat type set to ${ this.newChatType }`
                    )
                    resolve(answer);
                } catch (e) {
                    if (e instanceof Error) {
                        reject(e.message);
                    }
                }
            });
        });
    }


}