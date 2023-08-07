const { SlashCommandBuilder } = require('@discordjs/builders');
const child = require('child_process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t')
		.setDescription('Linux terminal inside Discord')
		.addStringOption(option => option
			.setName('command').setDescription('Enter a linux command')
			.setRequired(true)),
	async execute(interaction) {
		const command = interaction.options.getString('command');

		child.exec(command, (error, stdout, stderr) => {
			if (error) {
				return interaction.reply(`Error: ${error}`);
			}

			if (stderr) {
				return interaction.reply('```' + ` ${stderr} ` + '```');
			}

			if (stdout.length > 1994) {
				interaction.reply('```' + `${stdout.slice(0, 1977)}` + '```' + '\nmessage too long');
			}
			else {
				interaction.reply('```' + `${stdout.slice(0, 1994)}` + '```');
			}
		});
	},
};