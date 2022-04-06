const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('showercheck')
		.setDescription('Replies with a random shower check')
		.addUserOption(options => options
			.setName('user')
			.setDescription('Enter a user to get data from')
			.setRequired(true)),

	async execute(interaction) {
		// pussy
		console.log(interaction.guild.channels);
	},
};