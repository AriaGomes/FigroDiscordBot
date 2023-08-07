const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('View your own or another user\'s points')
		.addUserOption(option => option
			.setName('user').setDescription('Enter a user\'s @mention')
			.setRequired(false)),
	async execute(interaction) {
		const userId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : interaction.user.id;

		mongoose.connect(process.env.MONGO_URL, {
			dbName: process.env.DB_NAME,
			useNewUrlParser: true,
		}).then(() => {
			console.log('Connected to mongo');
		}).catch((err) => console.log(err.message));


		const User = mongoose.model('user');


		// TODO add try catch for if the file doesn't exist
		if (userId) {

			const user = await User.findOne({ id: userId });
			if (user === null) return interaction.reply('This user has no record yet');

			interaction.reply(`${user.points} points`);
		}
		else {
			const user = await User.findOne({ id: interaction.user.id });
			if (user === null) return interaction.reply('You have no record yet try typing in the server');

			interaction.reply(`${user.points} points`);
		}
	},
};