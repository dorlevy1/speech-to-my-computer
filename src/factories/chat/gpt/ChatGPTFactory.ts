import { ChatFactory } from "../ChatFactory";
import { Chat } from "../interfaces/Chat";
import ChatGPT from "@utils/ChatGPT";
import GPT from "./GPT";
import Speech from "@speechFactory/interfaces/Speech";
import Stream from "@chatFactory/interfaces/Stream";
import GPTStream from "@chatFactory/gpt/GPTStream";
import SpeechFactory from "@speechFactory/SpeechFactory";
import OpenAI from "openai";

export default class ChatGPTFactory implements ChatFactory {

    chat: Chat;
    stream: Stream;
    voice: Speech;
    private readonly openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_KEY,
        });
        this.chat = this.activeChat()
        this.stream = this.activeStream()
        this.voice = this.activeVoice()
        console.log('chat factory created in', this.constructor.name)
    }

    activeChat(): Chat {
        return new GPT(new ChatGPT(this.openai));
    }

    activeVoice(program?: string | null): Speech {
        return SpeechFactory.createSpeech(program, this.chat._hooks)
    }

    activeStream(): Stream {
        return new GPTStream()
    }

}