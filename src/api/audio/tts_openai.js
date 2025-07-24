const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function sendTextToTTS(text) {
    const response = await openai.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL,
        voice: process.env.OPENAI_TTS_VOICE,
        input: text,
        instructions: process.env.OPENAI_TTS_INSTRUCTIONS,
        response_format: "wav",
    });

    return response.body;
}

module.exports = { sendTextToTTS };