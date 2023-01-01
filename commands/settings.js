const { SlashCommandBuilder } = require('@discordjs/builders');
const { mongoURL, dbName, adminUserID } = require('../config.json');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Change this bots settings if you are set as admin user')
        .addStringOption(option => option
			.setName('option').setDescription('option to change')
			.setRequired(false)),
	async execute(interaction) {

        async function showSettings(settings)
        {
            await interaction.reply('```' 
                    + 'logChat: ' + settings.logChat + '\n' 
                    + 'test: ' + settings.test + '\n' 
                    + 'openAI: ' + settings.openAI + '\n' 
                    +'```' )
        }

        if(interaction.user.id !== adminUserID)
        {
            return interaction.reply('You are not set as the admin user')
        }

        var option = interaction.options.getString('option');

        mongoose.connect(mongoURL, {
			dbName: dbName,
			useNewUrlParser: true,
		}).then(() => {
			console.log("Connected to mongo")
		}).catch((err) => console.log(err.message))
        
        var Settings = mongoose.model('settings');

        Settings.find({}, async function (err, settingsFound){
            if (err) return console.log(err);

            if (settingsFound.length == 0) {
                var newSetting = new Settings({
                    logChat: false,
                    test: true,
                    openAI: false,
                });
    
                newSetting.save((error, data) => {
                    if (error) return console.log(error);
                });

                return await interaction.reply("No settings record, Created a new one ")
            }
            else {
                const settings = await Settings.findOne({});

                if(!option)
                {
                    showSettings(settings)
                }
                else{
                    // Take option and set opposite boolean value
                    option = String(option).toLowerCase()
                    switch(option)
                    {
                        case 'logchat':
			                settings.logChat = !settings.logChat;
			                await settings.save();
                            break;
                        case 'test':
                            settings.test = !settings.test;
			                await settings.save();
                            break;
                        case 'openai':
                            settings.openAI = !settings.openAI;
			                await settings.save();
                            break;
                    }
                    showSettings(settings)
                }
            }
        })
	},
};