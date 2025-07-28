function handleTranscription(transcription, userName, requireMention) {
    if (!transcription || transcription.trim().split(/\s+/).length < 2) {
        return ["Skipping transcription, too short.", false];
    }
    const botNames = process.env.BOT_NAMES.split(',').map(name => name.trim().toLowerCase());
    resultWithoutPunctuationToLowerCase = transcription.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    if (requireMention){
        const mentioned = botNames.some(name => resultWithoutPunctuationToLowerCase.includes(name));
        if (!mentioned){
            return ["Bot not mentioned. Skipping response.", false];
        }
    }
    userPrompt = `User ${userName} said: ${resultWithoutPunctuationToLowerCase}`;
    console.log(userPrompt);
    return [userPrompt, true];
}

module.exports = { handleTranscription };