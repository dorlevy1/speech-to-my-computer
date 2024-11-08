import readline from "@utils/readline";
import Logger from "../decorators/logger.decorator";


enum NewChatType {
    GPT = 'GPT',
    BING = 'BING',
    AWS = 'BING'
}

export default class InitializeNewChat {

    private static _newChatType: string = 'GPT';


    static get newChatType(): NewChatType {
        return <NewChatType>this._newChatType;
    }

    static set newChatType(value: NewChatType) {
        this._newChatType = value;
    }


    private static validateNewChatType(newChatType: NewChatType): NewChatType {
        if (newChatType === (NewChatType.GPT || NewChatType.BING || NewChatType.AWS).toUpperCase()) {
            return newChatType;
        } else {
            throw new Error('Invalid new chat type');
        }
    }

    @Logger('InitializeNewChat.startNewChat')
    static startNewChat(): Promise<string> {
        return new Promise((resolve) => {
            readline.question(process.env.NEW_CHAT_QUESTION as string, (answer) => {
                this.newChatType = this.validateNewChatType(answer as NewChatType);
                console.log(
                    `New chat type set to ${ this.newChatType }`
                )
                resolve(answer);
            });
        });
    }


}