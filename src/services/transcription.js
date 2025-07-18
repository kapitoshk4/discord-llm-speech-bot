function handleTranscription(transcription, userName) {
    if (transcription.length < 2) {
        return ["Skipping transcription, too short.", false];
    }
    resultWithoutPunctuationToLowerCase = transcription.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    userPrompt = `User ${userName} said: ${resultWithoutPunctuationToLowerCase}`;
    console.log(userPrompt);
    return [userPrompt, true];
}

module.exports = { handleTranscription };