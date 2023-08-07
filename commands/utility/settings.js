const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Change this bots settings if you are set as admin user')
		.addStringOption(option => option
			.setName('option').setDescription('option to change')
			.setRequired(false)),
	async execute(interaction) {

		async function showSettings(settings) {
			await interaction.reply('```'
                    + 'logChat: ' + settings.logChat + '\n'
                    + 'test: ' + settings.test + '\n'
                    + 'openAI: ' + settings.openAI + '\n'
                    + '```');
		}

		if (interaction.user.id !== process.env.ADMIN_USER_ID) {
			return interaction.reply('You are not set as the admin user');
		}

		let option = interaction.options.getString('option');

		mongoose.connect(process.env.MONGO_URL, {
			dbName: process.env.DB_NAME,
			useNewUrlParser: true,
		}).then(() => {
			console.log('Connected to mongo');
		}).catch((err) => console.log(err.message));

		const Settings = mongoose.model('settings');

		Settings.find({}, async function(err, settingsFound) {
			if (err) return console.log(err);

			if (settingsFound.length == 0) {
				const newSetting = new Settings({
					logChat: false,
					test: true,
					openAI: false,
				});

				newSetting.save((error) => {
					if (error) return console.log(error);
				});

				return await interaction.reply('No settings record, Created a new one ');
			}
			else {
				const settings = await Settings.findOne({});

				if (!option) {
					showSettings(settings);
				}
				else {
					// Take option and set opposite boolean value
					option = String(option).toLowerCase();
					switch (option) {
					case 'logchat':
						settings.logChat = !settings.logChat;
						await settings.save();
						break;
					case 'test':
						settings.test = !settings.test;
						await settings.save();
						break;
					case 'openai':
						settings.openAI = !settings.openAI;
						await settings.save();
						break;
					}
					showSettings(settings);
				}
			}
		});
	},
};