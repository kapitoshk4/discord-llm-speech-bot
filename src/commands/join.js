const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const { handleRecording } = require("../services/voice_handler.js"); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("Bot joins the voice channel you are in.")
        .addStringOption(option => 
            option.setName("mode")
                .setDescription("Bot join the voice channel and speak when mentioned")
                .setRequired(false)),
    async execute(interaction) {
        const mode = interaction.options.getString("mode");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: "You need to be in a voice channel for me to join.",
                ephemeral: true
            });
        }
        try {
            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            if (mode === "mention") {
                await interaction.reply({
                    content: "You asked me to join the voice channel when you mention me.",
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "You asked me to join the voice channel.",
                    ephemeral: true
                });
            }
            handleRecording(connection, voiceChannel, mode === "mention");
        } catch (error) {
            console.error("Error joining voice channel:", error);
        }
    }
};