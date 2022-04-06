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

function validURL(str) {
	// protocols
	const pattern = new RegExp('^(https?:\\/\\/)?' +
	// domain name
 '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
 // OR ip (v4) address
 '((\\d{1,3}\\.){3}\\d{1,3}))' +
 // port and path
 '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
 // query string
 '(\\?[;&a-z\\d%_.~+=-]*)?' +
// fragment locator
'(\\#[-a-z\\d_]*)?$', 'i');
	return !!pattern.test(str);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('identify')
		.setDescription('Takes an image and identifies what it is')
		.addStringOption(options => options
			.setName('image')
			.setDescription('Enter URL of image to identify')
			.setRequired(true)),
	async execute(interaction) {
		const imageURL = interaction.options.getString('image');
		let predictions = null;

		if (validURL(imageURL)) {
			try {
				await interaction.reply('Working on it...');
				await downloadImage(imageURL);
				const image = fs.readFileSync('testimg.jpg');
				const decodedImage = tfnode.node.decodeImage(image, 3);
				const model = await mobilenet.load();
				predictions = await model.classify(decodedImage);
				fs.unlink('./testimg.jpg', (err) => {
					if (err) throw err;
				});
			}
			catch (err) {
				await interaction.editReply('Unable to pull image from URL');
				console.log(err);
			}

			if (predictions) {
				let message = 'I think this is: \n';
				for (let i = 0; i < predictions.length; i++) {
					message += `${predictions[i].className}: ${predictions[i].probability.toFixed(4) * 100}%\n`;
				}
				await interaction.editReply(message);
			}
			// console.log('predictions:', predictions);
		}
		else {
			await interaction.reply('Please enter a valid URL');
		}
	},
};