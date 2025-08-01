const { Events } = require("discord.js")
const { User, Permission } = require("../db/models")

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            if (member.user.bot) return;

            userId = member.user.id
            userName = member.user.username
            console.log(`User (${userName}) join the server.`);

            const normalPermission = await Permission.findOne({ where: { name: "normal" } });
            
            await User.findOrCreate({
                where: { discordId: userId },
                defaults: {
                    username: userName,
                    PermissionId: normalPermission.id
                }
            });

            console.log(`Users added to DB`);
        } catch (error) {
            console.error("Error in GuildMemberAdd:", error);
        }    
    }
};