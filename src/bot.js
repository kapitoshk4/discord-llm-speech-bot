require('dotenv').config();

const { Client, IntentsBitField } = require("discord.js")

const client = new Client({
  intents: [ 
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers, 
    IntentsBitField.Flags.GuildMessages, 
    IntentsBitField.Flags.MessageContent 
]
});

const TOKEN = process.env.DISCORD_TOKEN;

client.on("ready", (с) => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.login(TOKEN);