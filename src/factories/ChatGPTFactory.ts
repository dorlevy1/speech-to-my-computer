import { ChatFactory } from "./ChatFactory";
import { Chat } from "./interfaces/Chat";
import ChatGPT from "../utils/ChatGPT";
import OpenAIClient from "../utils/OpenAIClient";
import GPT from "./GPT";
import GPTSpeech from "./GPTSpeech";
import Speech from "./interfaces/Speech";
import Stream from "./interfaces/Stream";
import GPTStream from "./GPTStream";

export default class ChatGPTFactory implements ChatFactory {

    activeChat(): Chat {
        console.log('chat activated in', this.constructor.name)

        return new GPT(new ChatGPT(new OpenAIClient().getOpenAI()));
    }

    activeVoice(): Speech {
        console.log('speech activated in', this.constructor.name)

        return new GPTSpeech('polly');
    }

    activeStream(): Stream {
        console.log('stream activated in', this.constructor.name)
        return new GPTStream()
    }
}