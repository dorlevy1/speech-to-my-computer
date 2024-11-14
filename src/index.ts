import 'dotenv/config'
import InitializeNewChat from "@utils/InitializeNewChat";
import ChatGPTFactory from "@chatFactory/gpt/ChatGPTFactory";

const chatManager = InitializeNewChat.getInstance();
(async () => {
    try {
        const chat = await chatManager.startNewChat()
        switch (chat) {
            case 'GPT':
                new ChatGPTFactory();
                break;
        }
    } catch (e) {
        console.log(e)
        await chatManager.voiceSpeak(process.env.NEW_CHAT_ERROR_QUESTION as string)
    }
})()
