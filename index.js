const fs = require('fs');
// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { token, openAIToken, mongoURL, dbName } = require('./config.json');
const { Configuration, OpenAIApi } = require("openai");
const mongoose = require('mongoose');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
//DB Connect
mongoose.connect(mongoURL, {
	dbName: dbName,
	useNewUrlParser: true,
}).then(() => {
	console.log("Connected to mongo")
}).catch((err) => console.log(err.message))

var userSchema = new mongoose.Schema({
	id: String,
	username: String,
	points: Number
});

var User = mongoose.model('user', userSchema);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Reads all command files under Commands/ directory and sets them to commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// On user message sent
client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	const points = message.content.length;
	const userId = message.author.id;

	console.log(userId)

	if (message.channel.name === "open-ai") {
		const configuration = new Configuration({
			apiKey: openAIToken,
		});
		const openai = new OpenAIApi(configuration);

		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: message.content,
			temperature: 0.9,
			max_tokens: 150,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0.6,
			stop: [" Human:", " AI:"],
		});
		message.reply(response.data.choices[0].text)
	}


	User.find({ id: userId }, async function (err, userFound) {
		if (err) return console.log(err);

		//If user is not in DB add a new entry
		if (userFound.length == 0) {
			var newUser = new User({
				id: userId,
				username: message.author.username,
				points: points
			});

			newUser.save((error, data) => {
				if (error) return console.log(error);
			});
		}
		else {
			//Add points and save to db
			const user = await User.findOne({ id: userId });
			user.points += points;
			await user.save();
		}
	})
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