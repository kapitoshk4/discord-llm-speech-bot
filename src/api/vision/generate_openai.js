const { OpenAI } = require("openai");
const axios = require("axios");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function openaiGenerateImage(prompt) {
    try {
        const result = await openai.images.generate({
            model: process.env.OPENAI_IMAGE_MODEL,
            prompt: `generate ${prompt}`,
            size: process.env.IMAGE_SIZE,
            n: parseInt(process.env.IMAGE_COUNT),
        });
        const imageUrl = result.data[0].url;
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data);

        return {
            buffer: imageBuffer,
            name: `generated_image_${Date.now()}.png`
        }
    } catch (error) {
        if (error.code === "content_policy_violation") {
            throw new Error("Content policy violation: Please modify your input and try again.");
        }
        console.error("Error generating image:", error);
        throw error;
    }
}

module.exports = { openaiGenerateImage };