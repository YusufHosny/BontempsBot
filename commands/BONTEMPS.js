const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bontemps')
		.setDescription('Replies with YA NOUR YA BONTEMPS!'),
	async execute(interaction) {
		await interaction.reply('YA NOUR YA BONTEMPS!');
	},
};  