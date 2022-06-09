const fs = require('fs');
// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Reads all command files under Commands/ directory and sets them to commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// On user message sent
client.on('messageCreate', (message) => {
	if (message.author.bot) return;

	const points = message.content.length;
	const userId = message.author.id;

	// If the user has a points file, add the points to their points
	if (fs.existsSync(`./points/${userId}.json`)) {
		const pointsFile = require(`./points/${userId}.json`);
		pointsFile.points += points;
		fs.writeFileSync(`./points/${userId}.json`, JSON.stringify(pointsFile));
	}
	else {
		// If the user doesn't have a points file, create one with the points
		fs.writeFileSync(`./points/${userId}.json`, JSON.stringify({ points: points }));
	}
});


// On slash command sent
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		// Invoke Command
		await command.execute(interaction);
	}
	catch (error) {
		// Should not get here
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);