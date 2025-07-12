const { app } = require("../llm/langgraph_config.js");
const { getThreadId } = require("../llm/memory.js");

async function openaiApiRequest(userId, prompt) {
  try {
    const threadId = getThreadId(userId);
    const config = { configurable: { thread_id: threadId } };
    const result = await app.invoke({ input: prompt }, config);
    console.log(`LangChain response: ${result.answer}`);
    return result.answer;
  } catch (error) {
    console.error("Error in LangChain API request:", error);
    throw error;
  }
}
module.exports = { openaiApiRequest };
