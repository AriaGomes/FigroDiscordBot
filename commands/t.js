const { SlashCommandBuilder } = require('@discordjs/builders');
const child = require('child_process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t')
		.setDescription('Linux terminal inside Discord')
		.addStringOption(option => option.setName('command').setDescription('Enter a linux command')),
	async execute(interaction) {
		const command = interaction.options.getString('command');

		if (!command) {
			return interaction.reply('Please specify a linux command to execute');
		}

		child.exec(command, (err, res) => {
			if (err) {interaction.reply('```' + err + '```');}
			else if (!res) {interaction.reply('```' + 'Command done, returned nothing' + '```');}
			else {interaction.reply('```' + res.slice(0, 1994) + '```');}
		});
	},
};