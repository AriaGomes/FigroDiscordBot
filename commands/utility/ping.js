const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Shard hearbeat response time'),
	async execute(interaction) {

		await interaction.reply(`🏓 ${Math.round(interaction.client.ws.ping)}ms`);
	},
};