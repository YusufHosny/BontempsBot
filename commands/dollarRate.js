const { SlashCommandBuilder } = require('discord.js');
const { getRates } = require('../rates.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('dollar')
		.setDescription('Sends dollar rate'),
	async execute(interaction) {
		const listRates = await getRates();
		const USD = listRates[1];
		await interaction.reply('1 USD TO EGP: ' +  USD);
	},
};  