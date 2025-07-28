const { app } = require("../llm/langgraph_config.js");
const { getChatThreadId, getVcThreadId } = require("../../services/get_thread.js");

async function invokeWithThread(getIdFn, id, prompt, imageUrl = null) {
  try {
    const threadId = getIdFn(id);
    const config = { configurable: { thread_id: threadId } };
    const input = { input: prompt };

    if (imageUrl) {
      input.imageUrl = imageUrl;
    }

    const result = await app.invoke(input, config);
    console.log(`LangChain response: ${result.answer}`);
    return result.answer;
  } catch (error) {
    console.error("Error in LangChain API request:", error);
    throw error;
  }
}

const getOpenAiResponseForUser = (userId, prompt, imageUrl = null) =>
  invokeWithThread(getChatThreadId, userId, prompt, imageUrl);

const getOpenAiResponseForVoiceChannel = (channelId, prompt) =>
  invokeWithThread(getVcThreadId, channelId, prompt);

module.exports = { getOpenAiResponseForUser, getOpenAiResponseForVoiceChannel };
