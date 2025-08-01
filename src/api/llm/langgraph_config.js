const fs = require("fs");
const path = require("path");
const { ChatOpenAI } = require("@langchain/openai");
const { ChatXAI } = require("@langchain/xai");
const { ChatPromptTemplate, MessagesPlaceholder} = require("@langchain/core/prompts");
const { HumanMessage } = require("@langchain/core/messages");
const { StateGraph, START, END, MemorySaver, messagesStateReducer, Annotation } = require("@langchain/langgraph");

const memoryRules = fs.readFileSync(path.join(__dirname, "..", "..", "..", "memory_rules.txt"), "utf-8");

const systemPrompt = `
    ${process.env.INSTRUCTIONS}

    ${memoryRules}
`;

const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

const GraphAnnotation = Annotation.Root({
    input: Annotation(),
    imageUrl: Annotation(),
    chat_history: Annotation({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    answer: Annotation(),
});
  
async function chatWithHistory(state) {
    const trimmedChatHistory = state.chat_history.slice(-process.env.MAX_HISTORY_MESSAGES);
    let llm;
    if (process.env.MODEL.toLowerCase().includes("grok")) {
        llm = new ChatXAI({
            model: process.env.MODEL,
            temperature: parseFloat(process.env.TEMPERATURE) || 0,
            apiKey: process.env.API_KEY,
        });
    } else {
        llm = new ChatOpenAI({
            model: process.env.MODEL,
            temperature: parseFloat(process.env.TEMPERATURE),
            apiKey: process.env.API_KEY,
          });
    }

    let promptMessages;

    if (state.imageUrl) {
        promptMessages = [
            { role: "system", content: systemPrompt },
            ...trimmedChatHistory,
            { 
                role: "user", 
                content: [
                    { type: "text", text: state.input },
                    { type: "image_url", image_url: {url: state.imageUrl} }
                ] 
            },
        ];
    } else {
        promptMessages = await promptTemplate.formatMessages({
            input: state.input,
            chat_history: trimmedChatHistory,
        });
    }

    const response = await llm.invoke(promptMessages);

    return {
        chat_history: [
            ...state.chat_history,
            new HumanMessage(state.input),
            response,
        ],
        answer: response.content,
    };
}
  
const workflow = new StateGraph(GraphAnnotation)
    .addNode("model", chatWithHistory)
    .addEdge(START, "model")
    .addEdge("model", END);
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

module.exports = { app };
  