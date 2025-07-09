const { Events } = require("discord.js");
const { openaiApiRequest } = require("../api/openai/openai_api_chat_request");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const botId = message.client.user.id;

        const isMentioned = message.mentions.has(botId);
        const isReply = message.reference && message.reference.messageId;

       if (isMentioned || isReply) {

        const prompt = message.content
        console.log(`Received message: ${prompt}`);

        const response = await openaiApiRequest(prompt);

        await message.reply(response);
       }
    },
};