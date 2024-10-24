import Listener from "./src/utils/Listener";
import ActionsProcessor from "./src/Strategies/ActionsProcessor";
import ApplicationStrategy from "./src/Strategies/ApplicationStrategy";
import 'dotenv/config'
import ChatGPT from "./src/utils/ChatGPT";
import OpenAIClient from "./src/utils/OpenAIClient";
import Speech from './src/utils/Speech'

const listener = Listener.getInstance()
const OpenAI = new ChatGPT(new OpenAIClient().getOpenAI())
const OpenAIHooks = OpenAI.getHooks()
const speech = new Speech()

// activeApp()

async function listenAndRecognize() {
    try {

        const actionsStrategy = new ActionsProcessor(new ApplicationStrategy())

        await listener.setProcess(processRecording)

        async function processRecording() {
            try {
                const transcript = await OpenAIHooks.translateText(await OpenAIHooks.transcribeAudio());
                console.log(transcript)
                console.log('Trigger word detected! Activating ChatGPT...');
                await actionsStrategy.process(transcript)
                const response = await askChatGPT(transcript);
                if (response) {
                    await synthesizeSpeech(response);
                }
                listener.setInProgress(false)
            } catch (err) {
                listener.setInProgress(false)
                console.error('Error occurred during processing:', err);
            }
        }
    } catch (err) {
        console.error('Error occurred during listenAndRecognize:', err);
    }
}

async function synthesizeSpeech(text: string) {
    try {
        await speech.synthesizeSpeech(text)
    } catch (err) {
        console.error('Error with Polly request:', err);
    }
}

// פונקציה לשאילת ChatGPT

async function askChatGPT(question: string) {
    try {
        const tools = [
            {
                type: "function",
                function: {
                    name: "searchGoogle",
                    description: "This function performs a search on Google using the Custom Search API. It should be called whenever the user asks to search on Google, uses the words 'Google', 'search', or 'find on google'. The function fetches the correct answer from Google's Custom Search API.",
                    strict: true,
                    parameters: {
                        type: "object",
                        required: [
                            "query"
                        ],
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query string to be sent to the API"
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        ]
        await OpenAI.createThread()
        await OpenAI.createMessageThread(question)
        await OpenAI.createRunThread(tools as [])
        return OpenAI.checkRunThreadStatus()

    } catch (err) {
        console.error('Error occurred during askChatGPT:', err);
        throw err; // זרוק את השגיאה כדי שתטופל במקום שבו נקראת הפונקציה
    }
}


listenAndRecognize().catch(err => {
    console.error('Unhandled error in listenAndRecognize:', err);
});