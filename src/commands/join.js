const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice"); 

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
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        const voiceChannel = member?.voice?.channel;

        if (!voiceChannel) {
            return interaction.reply("You need to be in a voice channel for me to join.");
        }
        try {
            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            if (mode === "mention") {
                await interaction.reply(`You asked me to join the voice channel when you mention me.`);
            } else {
                await interaction.reply("You asked me to join the voice channel.");
            }
        } catch (error) {
            console.error("Error joining voice channel:", error);
        }
    }
};