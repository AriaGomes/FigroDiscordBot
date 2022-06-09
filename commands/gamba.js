const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamba')
		.setDescription('Gamble your points')
		.addStringOption(option => option
			.setName('bet').setDescription('Enter bet amount')
			.setRequired(true)),
	async execute(interaction) {
		const bet = interaction.options.getString('bet');
		const userId = interaction.user.id;
		const userPoints = require(`../points/${userId}.json`);

		if (bet > userPoints.points) {
			console.log('broke');
			return interaction.reply('You do not have enough points to bet that amount!');
		}

		const random = Math.floor(Math.random() * 100);

		if (random > 50) {
			console.log('won');
			userPoints.points += parseInt(bet);
			fs.writeFileSync(`../points/${userId}.json`, JSON.stringify(userPoints));
			return interaction.reply('You won! You now have ' + userPoints.points + ' points!');
		}
		else {
			console.log('lost');
			userPoints.points -= parseInt(bet);
			fs.writeFileSync(`../points/${userId}.json`, JSON.stringify(userPoints));
			return interaction.reply('You lost! You now have ' + userPoints.points + ' points!');
		}
	},
};