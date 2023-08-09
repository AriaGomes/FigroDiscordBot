const { Events } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();


const userSchema = new mongoose.Schema({
	id: String,
	username: String,
	points: Number,
});
const settingsSchema = new mongoose.Schema({
	logChat: Boolean,
	openAI: Boolean,
	adminRole: String,
	adminUser: String,
});

const Settings = mongoose.model('settings', settingsSchema);
const User = mongoose.model('user', userSchema);

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {

		if (message.author.bot) return;

		const points = message.content.length;
		const userId = message.author.id;

		Settings.findOne({}, async function(err, settingsFound) {
			if (err) return console.log(err);
			if (!settingsFound) {
				if (message.author.bot) return;
				const newSetting = new Settings({
					logChat: false,
					adminUser: process.env.ADMIN_USER_ID,
					adminRole: 'no role defined',
					openAI: false,
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
					fs.appendFileSync(dir + '/log.txt', timestamp + author + ` in #${message.channel.name}: ` + '<embed> or not plain text' + '\n', { flag: 'a', recursive: true }, function(err) {
						if (err) {console.log(err); }
					});
				}
				else {
					fs.appendFileSync(dir + '/log.txt', timestamp + author + ` in #${message.channel.name}: ` + message.content + '\n', { flag: 'a', recursive: true }, function(err) {
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
	},
};