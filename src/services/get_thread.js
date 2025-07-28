const { v4:uuidv4 } = require("uuid");

const threadMap = new Map();
const vcThreadMap = new Map();

function getChatThreadId(userId) {
    let threadId = threadMap.get(userId);
    if (!threadId) {
        threadId = uuidv4();
        threadMap.set(userId, threadId);
    }
    return threadId;
}

function getVcThreadId(voiceChannelId) {
    let vcThreadId = vcThreadMap.get(voiceChannelId);
    if (!vcThreadId) {
        vcThreadId = uuidv4();
        vcThreadMap.set(voiceChannelId, vcThreadId);
    }
    return vcThreadId;
}

module.exports = { getChatThreadId, getVcThreadId };
