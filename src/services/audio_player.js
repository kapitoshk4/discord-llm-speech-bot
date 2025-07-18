const { createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } = require("@discordjs/voice");
const { Readable } = require("stream");

function bufferToStream(buffer) {
    const stream = new Readable();
    stream._read = () => {};
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

async function playAudioBuffer(connection, buffer) {
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

        const resource = createAudioResource(bufferToStream(buffer), {
        inputType: "ogg/opus",
        });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
        console.log("✅ Finished playing.");
        });

        player.on("error", (err) => {
        console.error("❌ Playback error:", err);
        });
    } catch (error) {
        console.error("❌ Voice connection error:", error);
    }
}

module.exports = { playAudioBuffer };
