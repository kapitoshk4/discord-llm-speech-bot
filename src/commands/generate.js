const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { openaiGenerateImage } = require("../api/vision/generate_openai");
const { handleLimit } = require("../services/limit_handler");
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
        
        const userId = interaction.user.id

        const allowed = await handleLimit(userId);

        if (!allowed) {
            await interaction.editReply("You have reached your weekly usage limit");
            return;
        }

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
