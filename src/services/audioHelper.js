const { EndBehaviorType } = require("@discordjs/voice");
const fs = require("node:fs");
const prism = require("prism-media");

function handleRecording(connection, channel) {
    const receiver = connection.receiver;
    receiver.speaking.on("start", (userId) => {
        const member = channel.members.get(userId);
        if (!member || member.user.bot) return;
        const filePath = `./src/services/recordings/${userId}.pcm`;
        const writeStream = fs.createWriteStream(filePath);

        console.log(`🎙️ Started receiving audio from ${member.user.tag}`);

        const listenStream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 1000
            }
        });

        const opusDecoder = new prism.opus.Decoder({
            frameSize: 960,
            channels: 2,
            rate: 48000
        }); 

        listenStream.on("data", (chunk) => {
            console.log(`📦 ${member.user.tag}: ${chunk.length} bytes`);
        });

        listenStream.pipe(opusDecoder).pipe(writeStream);

        writeStream.on("finish", () => {
            console.log(`Received audio from ${member.user.tag}`);
        });

        writeStream.on("error", (error) => {
            console.error(`Error receiving audio from ${member.user.tag}:`, error);
        });
    }
    );
}

module.exports = { handleRecording };