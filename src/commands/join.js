const { SlashCommandBuilder } = require("discord.js"); 

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

        if (mode === "mention") {
            await interaction.reply(`You asked me to join the voice channel when you mention me.`);
        } else {
            await interaction.reply("You asked me to join the voice channel.");
        }
    }
};