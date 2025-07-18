const { EndBehaviorType } = require("@discordjs/voice");
const prism = require("prism-media");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const { sendAudioToAPI } = require("../api/audio/sst_openai");
const { getOpenAiResponseForVoiceChannel } = require("../api/llm/openai_chat.js");
const { handleTranscription } = require("./transcription.js");
const { sendTextToTTS } = require("../api/audio/tts_openai.js");
const { playAudioBuffer } = require("./audio_player.js");

function handleRecording(connection, channel) {
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

        const ffmpegInput = new PassThrough();
        const ffmpegOutput = new PassThrough();

        pcmStream.pipe(ffmpegInput);

        ffmpeg(ffmpegInput)
            .inputFormat('s16le')
            .audioChannels(1)
            .audioFrequency(48000)
            .format('mp3')
            .on('error', (err) => {
                console.error(`FFmpeg error: ${err.message}`);
            })
            .on('end', () => {
                console.log(`Finished converting audio from ${userName}`);
            })
            .pipe(ffmpegOutput);

        const chunks = [];
        ffmpegOutput.on('data', (chunk) => {
            chunks.push(chunk);
        });

        ffmpegOutput.on('end', () => {
            const mp3Buffer = Buffer.concat(chunks);
            if (mp3Buffer.length < 6000) {
                console.log(`Audio from ${userName} is too short (${mp3Buffer.length} bytes), skipping.`);
                return;
            }
            console.log(`📤 Sending audio to API (${mp3Buffer.length} bytes)`);
            processAudioResponse(mp3Buffer, userName, connection);
        });
    });
}

async function processAudioResponse(buffer, userName, connection) {
    const transcription = await sendAudioToAPI(buffer);
    const [userPrompt, status] = handleTranscription(transcription, userName);
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