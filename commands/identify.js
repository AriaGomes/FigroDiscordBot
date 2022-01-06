const { SlashCommandBuilder } = require('@discordjs/builders');
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');
const fetch = require('node-fetch');

// Download image
async function downloadImage(url) {
	const response = await fetch(url);
	const buffer = await response.buffer();
	fs.writeFileSync('testimg.jpg', buffer);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('identify')
		.setDescription('Takes an image and identifies what it is')
		.addStringOption(options => options.setName('image').setDescription('Enter URL of image to identify')),
	async execute(interaction) {
		const imageURL = interaction.options.getString('image');
		let predictions = null;
		if (!imageURL) {
			await interaction.reply('Please enter a valid image URL');
		}
		else {
			await downloadImage(imageURL);
			const image = fs.readFileSync('testimg.jpg');
			const decodedImage = tfnode.node.decodeImage(image, 3);
			const model = await mobilenet.load();
			predictions = await model.classify(decodedImage);
			// console.log('predictions:', predictions);
		}
		await interaction.reply(`I think this is a ${predictions[0].className} (${predictions[0].probability * 100}%)`);
	},
};