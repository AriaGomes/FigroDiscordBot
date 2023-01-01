//Busted
const mongoose = require('mongoose');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mongoURL, dbName } = require('../config.json');
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

		mongoose.connect(mongoURL, {
			dbName: dbName,
			useNewUrlParser: true,
		}).then(() => {
			console.log("Connected to mongo")
		}).catch((err) => console.log(err.message))



		var User = mongoose.model('user');
		const user = await User.findOne({ id: userId })
		if (user === null) return interaction.reply('You have no record yet try typing in the server');
		const random = Math.floor(Math.random() * 100);

		if (bet > user.points) {
			console.log('broke');
			return interaction.reply('You do not have enough points to bet that amount!');
		}

		if (random > 50) {
			console.log('won');
			const user = await User.findOne({ id: userId });
			Number(user.points += Number(bet));
			await user.save();
			return interaction.reply('You Won! You now have ' + await user.points + ' points!');
		}
		else {
			console.log('lost');
			const user = await User.findOne({ id: userId });
			Number(user.points -= Number(bet));
			await user.save();
			return interaction.reply('You Lost! You now have ' + await user.points + ' points!');
		}
	},
};