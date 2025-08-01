const { Events } = require("discord.js")
const { User, Permission } = require("../db/models")

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild) {
        try {
            console.log(`Joined guild: ${guild.name}`)

            const normalPermission = await Permission.findOne({ where: { name: "normal" } });
            const adminPermission = await Permission.findOne({ where: { name: "admin" } });

            const owner = await guild.fetchOwner();
            const members = await guild.members.fetch();

            for (const member of members.values()) {
                if (member.user.bot) continue;

                const permission = member.user.id === owner.id ? adminPermission : normalPermission;

                await User.findOrCreate({
                    where: { discordId: member.user.id },
                    defaults: {
                        username: member.user.username,
                        PermissionId: permission.id
                    }
                });
            }

            console.log(`Users added to DB for guild "${guild.name}"`);
        } catch (error) {
            console.error("Error in guildCreate:", error);
        }
    }
};