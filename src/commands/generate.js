const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { openaiGenerateImage } = require("../api/vision/generate_openai");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("generate")
        .setDescription("Generate image from input.")
        .addStringOption(option => 
            option.setName("input")
                .setDescription("Your input for image generation")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const userInput = interaction.options.getString("input");
        console.log(`User input for image generation: ${userInput}`);
        try {
            const { buffer, name } = await openaiGenerateImage(userInput);

            const attachment = new AttachmentBuilder(buffer, { name });
            
            await interaction.editReply({
                files: [attachment]
            });
            console.log(`Image generated and sent: ${name}`);
        } catch (error) {
            await interaction.editReply("An error occurred while generating the image.");
        }
    }
}
