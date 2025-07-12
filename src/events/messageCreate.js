const { Events } = require("discord.js");
const { openaiApiRequest } = require("../api/llm/openai_chat");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const botId = message.client.user.id;

        const isMentioned = message.mentions.has(botId);
        const isReply = message.reference && message.reference.messageId;

       if (isMentioned || isReply) {

        const prompt = message.content.replace(`<@${botId}>`, "").trim();
        if (!prompt) {
            await message.reply("Please provide a message to process!");
            return;
          }
        console.log(`Received message: ${prompt}`);

        const response = await openaiApiRequest(message.author.id, prompt);

        await message.reply(response);
       }
    },
};
