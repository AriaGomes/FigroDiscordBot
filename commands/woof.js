const { SlashCommandBuilder } = require('@discordjs/builders');
const XHTMLHttpRequest = require('xhr2');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('woof')
		.setDescription('Grabs random doogo photo!'),
	async execute(interaction) {
		const url = 'https://random.dog/woof.json';
		let woof;
		const xhr = new XHTMLHttpRequest();
		xhr.open('GET', url);

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				// console.log(jhr.responseText);
				woof = JSON.parse(xhr.responseText);
				interaction.reply(woof.url);
			}
		};

		xhr.send();
	},
};