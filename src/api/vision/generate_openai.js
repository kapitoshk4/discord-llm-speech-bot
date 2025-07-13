const { OpenAI } = require("openai");
const axios = require("axios");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function openaiGenerateImage(prompt) {
    try {
        const isGptImage1 = process.env.OPENAI_IMAGE_MODEL === "gpt-image-1";
        
        const requestPayload = {
            model: process.env.OPENAI_IMAGE_MODEL,
            prompt: `generate ${prompt}`,
        };

        if (isGptImage1) {
            requestPayload.size = process.env.IMAGE_SIZE;
            requestPayload.n = parseInt(process.env.IMAGE_COUNT);
            requestPayload.quality = process.env.IMAGE_QUALITY;
            requestPayload.moderation = process.env.IMAGE_MODERATION;
        } else {
            requestPayload.size = "1024x1024";
        }

        const result = await openai.images.generate(requestPayload);

        const [imageData] = result.data;

        const buffer = isGptImage1
            ? Buffer.from(imageData.b64_json, "base64")
            : Buffer.from(
                (await axios.get(imageData.url, { responseType: "arraybuffer" })).data
              );

        return {
            buffer,
            name: `generated_image_${Date.now()}.png`,
        };
    } catch (error) {
        if (error.code === "content_policy_violation") {
            throw new Error("Content policy violation: Please modify your input and try again.");
        }
        console.error("Error generating image:", error);
        throw error;
    }
}

module.exports = { openaiGenerateImage };