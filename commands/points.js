const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('View your own or another user\'s points')
		.addUserOption(option => option
			.setName('user').setDescription('Enter a user\'s @mention')
			.setRequired(false)),
	async execute(interaction) {
		const userId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : interaction.user.id;
		let userPoints;

		// TODO add try catch for if the file doesn't exist
		if (userId) {
			userPoints = require(`../points/${userId}.json`);
		}
		else {
			userPoints = require(`../points/${interaction.user.id}.json`);
		}

		interaction.reply(`${userPoints.points} points`);

	},
};