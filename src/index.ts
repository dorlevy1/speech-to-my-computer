import 'dotenv/config'
import InitializeNewChat from "@utils/InitializeNewChat";
import ChatGPTFactory from "@chatFactory/gpt/ChatGPTFactory";


(async () => {
    const chat = await InitializeNewChat.startNewChat()
    console.log(chat)

    switch (chat) {
        case 'GPT':
            new ChatGPTFactory();
            break;
    }
})()
