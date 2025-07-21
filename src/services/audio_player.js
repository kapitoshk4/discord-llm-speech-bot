const { 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState, 
    AudioPlayerStatus 
} = require("@discordjs/voice");

async function playAudioBuffer(connection, stream) {
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

        const resource = createAudioResource(stream, {
            inputType: "arbitrary",
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
