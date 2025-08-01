const axios = require("axios");
const FormData = require("form-data");
const { Readable } = require("stream");

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

async function sendAudioToAPI(buffer) {
    const form = new FormData();

    form.append("file", bufferToStream(buffer), {
        filename: `audio.wav`,
        contentType: "audio/wav"
    });

    form.append("model", process.env.OPENAI_TRANSCRIPTION_MODEL);

    try {
        const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                ...form.getHeaders()
            }
        });
        return response.data.text;

    } catch (error) {
        console.error("Error transcribing audio:", error?.response?.data || error.message);
    }
}



module.exports = { sendAudioToAPI };