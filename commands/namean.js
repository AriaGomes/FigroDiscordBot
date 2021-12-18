const { SlashCommandBuilder } = require('@discordjs/builders');
const XHTMLHttpRequest = require('xhr2');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('namean')
		.setDescription('Tells you what nationality a name is from')
		.addStringOption(option => option.setName('name').setDescription('Enter a name')),
	async execute(interaction) {
		const url = 'https://api.nationalize.io/?name=' + interaction.options.getString('name');
		const xhr = new XHTMLHttpRequest();
		xhr.open('GET', url);

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				const data = JSON.parse(xhr.responseText);
				const embed = new MessageEmbed()
					.setColor('#EFFF00')
					.setTitle(data.name)
					.addFields(
						{ name: (data.country[0].country_id).toString(), value: (data.country[0].probability).toString() },
						{ name: (data.country[1].country_id).toString(), value: (data.country[1].probability).toString() },
						{ name: (data.country[2].country_id).toString(), value: (data.country[2].probability).toString() },
					);
				console.log(data.name);
				console.log(embed);
				interaction.reply({ embeds: [embed] });

			}
		};
		xhr.send();
	},
};