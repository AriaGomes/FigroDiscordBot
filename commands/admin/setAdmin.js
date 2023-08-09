const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setadmin')
		.setDescription('Set an admin role that can use this bots admin commands')
		.addRoleOption(option => option
			.setName('role').setDescription('Enter a role\'s @mention')
			.setRequired(true)),
	async execute(interaction) {


		const option = interaction.options.getRole('role');

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
					adminRole: option.id,
					adminUser: process.env.ADMIN_USER_ID,
				});

				newSetting.save((error) => {
					if (error) return console.log(error);
				});

				return await interaction.reply('No settings record, Created a new one and set admin role to ' + '<@' + option.id + '>' + '. This role can now use admin commands');
			}
			else {
				const settings = await Settings.findOne({});


				if (interaction.user.id !== process.env.ADMIN_USER_ID && !interaction.member.roles.cache.has(settings.adminRole)) {
					return interaction.reply('You are not set as the admin user');
				}

				settings.adminRole = option.id;
				settings.save((error) => {
					if (error) return interaction.reply('Error saving settings');
					else return interaction.reply('Admin role set to ' + '<@' + option.id + '>' + '. This role can now use admin commands');
				},
				);
			}
		});
	},
};