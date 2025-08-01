const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Bot leaves the voice channel."),
    async execute(interaction) {
        let connection = getVoiceConnection(interaction.guild.id)
        if (!connection) {
            return await interaction.reply({
                content: "I'm not in a voice channel!",
                ephemeral: true
            });
        }
        connection.destroy();
        await interaction.reply({
            content: "I have left the voice channel.",
            ephemeral: true,
        });
    }
}