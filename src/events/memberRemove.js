const { Events } = require("discord.js")
const { User } = require("../db/models")

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            if (member.user.bot) return;

            userId = member.user.id
            userName = member.user.username
            console.log(`User (${userName}) left the server.`);

            
            await User.destroy({
                where: { discordId: userId },
            });

            console.log(`Users deleted from DB`);
        } catch (error) {
            console.error("Error in GuildMemberRemove:", error);
        }    
    }
};