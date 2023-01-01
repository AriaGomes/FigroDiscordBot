//Busted

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

		const random = Math.floor(Math.random() * 100);

		if (random > 50) {
			console.log('won');
				if (fs.existsSync(`./points/${userId}.json`)) {
					const pointsFile = require(`../points/${userId}.json`);
					if (bet > pointsFile.points) {
						console.log('broke');
						return interaction.reply('You do not have enough points to bet that amount!');
					}
					Number(pointsFile.points += bet);
					fs.writeFileSync(`./points/${userId}.json`, JSON.stringify(pointsFile));
					return interaction.reply('You Won! You now have ' + pointsFile.points + ' points!');
				}
			
		}
		else {
			console.log('lost');
				if (fs.existsSync(`./points/${userId}.json`)) {
					const pointsFile = require(`../points/${userId}.json`);
					if (bet > pointsFile.points) {
						console.log('broke');
						return interaction.reply('You do not have enough points to bet that amount!');
					}
					Number(pointsFile.points -= bet);
					fs.writeFileSync(`./points/${userId}.json`, JSON.stringify(pointsFile));
					return interaction.reply('You lost! You now have ' + pointsFile.points + ' points!');
				}
			
		}
	},
};