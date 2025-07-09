const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function openaiApiRequest(prompt) {
  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL,
      instructions: process.env.OPENAI_INSTRUCTIONS,
      input: prompt,
    });
    console.log(`OpenAI API response: ${response.output_text}`);
    
    return response.output_text;
  } catch (error) {
    console.error("Error in OpenAI API request:", error);
    throw error;
  }
}
module.exports = { openaiApiRequest };