const { v4:uuidv4 } = require("uuid");

const threadMap = new Map();

function getThreadId(userId) {
    let threadId = threadMap.get(userId);
    if (!threadId) {
        threadId = uuidv4();
        threadMap.set(userId, threadId);
    }
    return threadId;
}

module.exports = { getThreadId };
