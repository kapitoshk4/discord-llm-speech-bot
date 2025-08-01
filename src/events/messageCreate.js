const { Events } = require("discord.js");
const { getResponseForUser } = require("../api/llm/llm_chat");
const { handleImageRecognitionLimit } = require("../services/limit_handler.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const botId = message.client.user.id;
        const userId = message.author.id

        const isMentioned = message.mentions.has(botId);
        const isReply = message.reference && message.reference.messageId;

       if (isMentioned || isReply) {

        const prompt = message.content.replace(`<@${botId}>`, "").trim();
        const imageAttachment = message.attachments.first();
        const type = await handleImageRecognitionLimit(imageAttachment, userId);
        if (type === "budget") {
          await message.reply("You can't use image recognition at your current level");
          return
        }
        const imageUrl = imageAttachment ? imageAttachment.url : null;
        console.log(`Processing message: ${prompt}, Image URL: ${imageUrl}`);
        if (!prompt) {
            await message.reply("Please provide a message to process!");
            return;
          }
        console.log(`Received message: ${prompt}`);

        const response = await getResponseForUser(userId, prompt, imageUrl);

        await message.reply(response);
       }
    },
};
