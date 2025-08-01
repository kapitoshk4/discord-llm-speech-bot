const { User, Permission, CommandUsage } = require("../db/models");
const { Op } = require("@sequelize/core");

async function handleLimit(userId) {
    const user = await User.findOne({
        where: { discordId: userId },
        include: Permission
    });
    
    if (user.Permission.name != "normal") {
        return true;
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const usageCount = await CommandUsage.count({
        where: {
            userId: userId,
            createdAt: { [Op.gte]: oneWeekAgo }
        }
    });

    if (usageCount >= process.env.MAX_GENERATIONS_PER_WEEK) {
        return false;
    }

    await CommandUsage.create({
        userId: userId
    });
    
    return true;
}

async function handleImageRecognitionLimit(imageAttachment, userId) {
    const user = await User.findOne({
        where: { discordId: userId },
        include: Permission 
      });
    console.log(`User: ${user} wants to use image`)
    const permission = user?.Permission?.name;
    console.log(`Permission of this user ${permission}`)
    if (imageAttachment && permission === "normal") {
        return "budget";
    }
    return "pro";
}

module.exports = { handleLimit, handleImageRecognitionLimit }