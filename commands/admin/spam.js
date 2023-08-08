const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spam')
		.setDescription('Spam up to 100 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to spam').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('Message to spam').setRequired(true)),
	async execute(interaction) {
		if (interaction.user.id !== process.env.ADMIN_USER_ID) return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		const amount = interaction.options.getInteger('amount');
		const message = interaction.options.getString('message');

		if (amount < 1 || amount > 100) {
			return interaction.reply({ content: 'You need to input a number between 1 and 100.', ephemeral: true });
		}
		else if (message.length > 2000) {
			return interaction.reply({ content: 'You need to input a message less than 2000 characters.', ephemeral: true });
		}
		else {
			interaction.reply({ content: 'Spamming...', ephemeral: true });
		}


		for (let i = 0; i < amount; i++) {
			await interaction.channel.send(message).catch(error => {
				console.error(error);
				interaction.editReply({ content: 'There was an error trying to spam messages in this channel!', ephemeral: true });
			});
		}


		return interaction.editReply({ content: `Successfully spammed \`${amount}\` messages.`, ephemeral: true });
	},
};