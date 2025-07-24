const { EndBehaviorType } = require("@discordjs/voice");
const prism = require("prism-media");
const ffmpeg = require("fluent-ffmpeg");
const { sendAudioToAPI } = require("../api/audio/sst_openai");
const { getOpenAiResponseForVoiceChannel } = require("../api/llm/openai_chat.js");
const { handleTranscription } = require("./transcription.js");
const { sendTextToTTS } = require("../api/audio/tts_openai.js");
const { playAudioBuffer } = require("./audio_player.js");

function handleRecording(connection, channel, requireMention = false) {
    const receiver = connection.receiver;
    receiver.speaking.on("start", (userId) => {
        const member = channel.members.get(userId);
        if (!member || member.user.bot) return;
        const userName = member.user.tag;

        console.log(`Started receiving audio from ${userName}`);

        const listenStream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 1000
            }
        });

        const opusDecoder = new prism.opus.Decoder({
            frameSize: 960,
            channels: 1,
            rate: 48000
        }); 

        const pcmStream = listenStream.pipe(opusDecoder);
        const ffmpegProcess = ffmpeg(pcmStream)
            .inputFormat("s16le")
            .audioChannels(1)
            .audioFrequency(48000)
            .format("wav")
            .on("error", (err) => {
                if (err.message !== "Output stream closed") {
                    console.error(`❌ FFmpeg error: ${err.message}`);
                }
            });

        const chunks = [];
        const ffmpegStdout = ffmpegProcess.pipe();

        ffmpegStdout.on("data", (chunk) => {
            chunks.push(chunk);
        });

        ffmpegStdout.on("end", () => {
            const wavBuffer = Buffer.concat(chunks);
            if (wavBuffer.length < 70000) {
                console.log(`⚠️ Audio from ${userName} is too short (${wavBuffer.length} bytes), skipping.`);
                return;
            }
            console.log(`📤 Sending audio to API (${wavBuffer.length} bytes)`);
            processAudioResponse(wavBuffer, userName, connection, requireMention);
        });
    });
}

async function processAudioResponse(buffer, userName, connection, requireMention) {
    const transcription = await sendAudioToAPI(buffer);
    const [userPrompt, status] = handleTranscription(transcription, userName, requireMention);
        if (!status) {
            console.log(userPrompt);
            return;
        }

    try {
        const response = await getOpenAiResponseForVoiceChannel(connection.joinConfig.channelId, userPrompt);

        const ttsBuffer = await sendTextToTTS(response);
        
        await playAudioBuffer(connection, ttsBuffer);
        console.log(`🎶 Playing TTS response in channel ${connection.joinConfig.channelId}`);

    } catch (err) {
        console.error("❌ Error getting AI response:", err);
    }
}

module.exports = { handleRecording };