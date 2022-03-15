const { SlashCommandBuilder } = require('@discordjs/builders');
const XHTMLHttpRequest = require('xhr2');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ye')
		.setDescription('Random Kanye West quote'),
	async execute(interaction) {
		const url = 'https://api.kanye.rest/';
		let quote;
		const xhr = new XHTMLHttpRequest();
		xhr.open('GET', url);

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				// console.log(xhr.responseText);
				quote = JSON.parse(xhr.responseText);
				interaction.reply('*' + quote.quote + '*' + ' - Kanye West');
			}
		};

		xhr.send();
	},
};