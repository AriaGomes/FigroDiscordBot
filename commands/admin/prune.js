const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 100 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to prune')),
	async execute(interaction) {
		if (interaction.user.id !== process.env.ADMIN_USER_ID) return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		const amount = interaction.options.getInteger('amount');

		if (amount < 1 || amount > 100) {
			return interaction.reply({ content: 'You need to input a number between 1 and 100.', ephemeral: true });
		}
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			interaction.reply({ content: 'There was an error trying to prune messages in this channel!', ephemeral: true });
		});

		return interaction.reply({ content: `Successfully pruned \`${amount}\` messages.`, ephemeral: true });
	},
};