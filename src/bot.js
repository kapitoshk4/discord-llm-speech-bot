require("dotenv").config();

const path = require("node:path");
const fs = require("node:fs");
const { Client, IntentsBitField, Events } = require("discord.js")

const client = new Client({
  intents: [ 
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers, 
    IntentsBitField.Flags.GuildMessages, 
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates, 
]
});

const TOKEN = process.env.DISCORD_TOKEN;

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    if (!client.commands) client.commands = new Map();
    client.commands.set(command.data.name, command);
  } else {
    console.log(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(TOKEN);