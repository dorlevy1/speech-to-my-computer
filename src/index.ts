import 'dotenv/config'
import ChatGPTFactory from "@chatFactory/gpt/ChatGPTFactory";


(() => {
    const {chat, voice, stream} = new ChatGPTFactory();

    voice.say('hey, this is a test')
})()
//
// const listener = Listener.getInstance()
// const OpenAI = new ChatGPT(new OpenAIClient().getOpenAI())
// const OpenAIHooks = OpenAI.getHooks()
// const speech = new Speech()
//
// // activeApp()
//
// async function listenAndRecognize() {
//     try {
//
//         // const actionsStrategy = new ActionsProcessor(new ApplicationStrategy())
//
//         await listener.setProcess(processRecording)
//
//         async function processRecording() {
//             try {
//                 const transcript = await OpenAI.translateText();
//                 // const transcript = await OpenAIHooks.generateAudio();
//
//                 console.log('Trigger word detected! Activating ChatGPT...');
//                 // await actionsStrategy.process(transcript)
//                 const response = await askChatGPT(transcript) as string;
//                 if (response) {
//                     // await OpenAI.speech()
//                     await synthesizeSpeech(response);
//                 }
//                 console.log('done')
//                 // console.log(OpenAI.getMessages())
//                 listener.setInProgress(false)
//             } catch (err) {
//                 listener.setInProgress(false)
//                 console.error('Error occurred during processing:', err);
//             }
//         }
//     } catch (err) {
//         console.error('Error occurred during listenAndRecognize:', err);
//     }
// }
//
// async function synthesizeSpeech(text: string) {
//     try {
//         await speech.synthesizeSpeech(text)
//     } catch (err) {
//         console.error('Error with Polly request:', err);
//     }
// }
//
// // פונקציה לשאילת ChatGPT
//
// async function askChatGPT(question: string) {
//     try {
//         const tools = [
//             {
//                 type: "function",
//                 function: {
//                     name: "searchGoogle",
//                     description: "Performs a search on Google using the Custom Search API. Should be called when no answer is found in the internal knowledge base, provided instructions, or uploaded files. Should only be used as a fallback mechanism when all other resources have been exhausted.",
//                     strict: true,
//                     parameters: {
//                         type: "object",
//                         required: [
//                             "query"
//                         ],
//                         properties: {
//                             query: {
//                                 type: "string",
//                                 description: "The search query string to be sent to the API"
//                             }
//                         },
//                         additionalProperties: false
//                     }
//                 }
//             }, {
//                 type: "function",
//                 function: {
//                     name: "openNotepad",
//                     description: "Opens the Notepad editor and writes provided content. Should be called whenever the user asks to open an editor or make a note.",
//                     strict: true,
//                     parameters: {
//                         type: "object",
//                         required: ["content"],
//                         properties: {
//                             content: {
//                                 type: "string",
//                                 description: "The content that should be written in Notepad"
//                             }
//                         },
//                         additionalProperties: false
//                     }
//                 }
//             }
//         ]
//
//
//         await OpenAI.createThread()
//         await OpenAI.createMessageThread(question)
//         await OpenAI.createRunThread(tools as [])
//         return OpenAI.checkRunThreadStatus()
//
//     } catch (err) {
//         console.error('Error occurred during askChatGPT:', err);
//         throw err; // זרוק את השגיאה כדי שתטופל במקום שבו נקראת הפונקציה
//     }
// }
//
//
//
// listenAndRecognize().catch(err => {
//     console.error('Unhandled error in listenAndRecognize:', err);
// });