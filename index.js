const fs = require('node:fs');
// Require the necessary discord.js classes
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const mongoose = require('mongoose');
require('dotenv').config();


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// DB Connect
mongoose.connect(process.env.MONGO_URL, {
	dbName: process.env.DB_NAME,
	useNewUrlParser: true,
}).then(() => {
	console.log('Connected to mongo');
}).catch((err) => console.log(err.message));

const userSchema = new mongoose.Schema({
	id: String,
	username: String,
	points: Number,
});
const settingsSchema = new mongoose.Schema({
	logChat: Boolean,
	test: Boolean,
	openAI: Boolean,
});

const Settings = mongoose.model('settings', settingsSchema);
const User = mongoose.model('user', userSchema);

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// On user message sent
client.on('messageCreate', async (message) => {
	// if (message.author.bot) return;

	const points = message.content.length;
	const userId = message.author.id;

	Settings.findOne({}, async function(err, settingsFound) {
		if (err) return console.log(err);
		if (!settingsFound) {
			if (message.author.bot) return;
			const newSetting = new Settings({
				logChat: false,
				test: true,
			});

			newSetting.save((error) => {
				if (error) return console.log(error);
			});

			console.log('No settings record, Created a new one ');
		}
		else if (settingsFound.logChat) {
			const date = new Date();
			const dir = `./logs/${date.getFullYear().toString()}/${(date.getMonth() + 1).toString()}/${(date.getDay() + 1).toString()}`;
			const timestamp = `${date.getHours().toString()}:${date.getMinutes().toString()}:${date.getSeconds().toString()} - `;
			const author = `${message.author.id} - ${message.author.username}: `;
			// Log Chat
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}

			if (message.content.length <= 0) {
				fs.appendFileSync(dir + '/log.txt', timestamp + author + ` in #${message.channel.name}: ` + '<embed> or not plain text' + '\n', { recursive: true }, function(err) {
					if (err) {console.log(err); }
				});
			}
			else {
				fs.appendFileSync(dir + '/log.txt', timestamp + author + ` in #${message.channel.name}: ` + message.content + '\n', { recursive: true }, function(err) {
					if (err) {console.log(err); }
				});
			}

		}
	});

	const settings = await Settings.findOne({ });

	if (message.channel.name === 'open-ai') {
		if (message.author.bot) return;
		if (!settings.openAI) return await message.reply('Disabled. An admin needs to enable this in settings');
		const configuration = new Configuration({
			apiKey: process.env.OPEN_AI_KEY,
		});
		const openai = new OpenAIApi(configuration);
		const response = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: message.content,
			temperature: 0.9,
			max_tokens: 150,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0.6,
			stop: [' Human:', ' AI:'],
		});
		await message.reply(response.data.choices[0].text);
	}


	User.find({ id: userId }, async function(err, userFound) {
		if (err) return console.log(err);
		if (message.author.bot) return;

		// If user is not in DB add a new entry
		if (userFound.length == 0) {
			const newUser = new User({
				id: userId,
				username: message.author.username,
				points: points,
			});

			newUser.save((error) => {
				if (error) return console.log(error);
			});
		}
		else {
			// Add points and save to db
			const user = await User.findOne({ id: userId });
			user.points += points;
			await user.save();
		}
	});
});


// On slash command sent
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);