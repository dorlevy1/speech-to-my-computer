export interface ITool {
    type: string;
    function: {
        name: string;
        description: string;
        strict: boolean;
        parameters: {
            type: string;
            required: string[];
            properties: {
                [key: string]: {
                    type: string;
                    description: string;
                }
            },
            additionalProperties: boolean;
        };
    }
}

const tools: ITool[] = [
    {
        type: "function",
        function: {
            name: "searchGoogle",
            description: "Performs a search on Google using the Custom Search API. Should be called when no answer is found in the internal knowledge base, provided instructions, or uploaded files. Should only be used as a fallback mechanism when all other resources have been exhausted.",
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
    }, {
        type: "function",
        function: {
            name: "openNotepad",
            description: "Opens the Notepad editor and writes provided content. Should be called whenever the user asks to open an editor or make a note.",
            strict: true,
            parameters: {
                type: "object",
                required: ["content"],
                properties: {
                    content: {
                        type: "string",
                        description: "The content that should be written in Notepad"
                    }
                },
                additionalProperties: false
            }
        }
    }
]

export default tools;