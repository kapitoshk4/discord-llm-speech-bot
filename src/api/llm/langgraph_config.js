const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate, MessagesPlaceholder} = require("@langchain/core/prompts");
const { HumanMessage } = require("@langchain/core/messages");
const { StateGraph, START, END, MemorySaver, messagesStateReducer, Annotation } = require("@langchain/langgraph");

const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    temperature: parseFloat(process.env.TEMPERATURE),
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", process.env.OPENAI_INSTRUCTIONS],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

const GraphAnnotation = Annotation.Root({
    input: Annotation(),
    chat_history: Annotation({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    answer: Annotation(),
});
  
async function chatWithHistory(state) {
    const trimmedChatHistory = state.chat_history.slice(-process.env.MAX_HISTORY_MESSAGES);

    const promptMessages = await promptTemplate.formatMessages({
        input: state.input,
        chat_history: trimmedChatHistory,
    });

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
  