import { ChatFactory } from "../ChatFactory";
import { Chat } from "../interfaces/Chat";
import ChatGPT from "@utils/ChatGPT";
import OpenAIClient from "@utils/OpenAIClient";
import GPT from "./GPT";
import Speech from "@speechFactory/interfaces/Speech";
import Stream from "@chatFactory/interfaces/Stream";
import GPTStream from "@chatFactory/gpt/GPTStream";
import SpeechFactory from "@speechFactory/SpeechFactory";

export default class ChatGPTFactory implements ChatFactory {

    activeChat(): Chat {
        console.log('chat activated in', this.constructor.name)

        return new GPT(new ChatGPT(new OpenAIClient().getOpenAI()));
    }

    activeVoice(program: string): Speech {
        console.log('speech activated in', this.constructor.name)
        return SpeechFactory.createSpeech(program)
    }

    activeStream(): Stream {
        console.log('stream activated in', this.constructor.name)
        return new GPTStream()
    }
}