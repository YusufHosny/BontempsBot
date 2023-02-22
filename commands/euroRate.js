const { SlashCommandBuilder } = require('discord.js');
const { getRates } = require('../rates.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('euro')
		.setDescription('Sends euro rate'),
	async execute(interaction) {
		const listRates = await getRates();
		const EUR = listRates[0];
		await interaction.reply('1 EURO TO EGP: ' +  EUR);
	},
};  