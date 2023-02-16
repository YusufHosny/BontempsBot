const { SlashCommandBuilder } = require('discord.js');
const { getUserList } = require('../events/lastSeenInitializer.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('lastseen')
		.setDescription('Replies with the last seen time for the specified user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user whos last seen is to be searched for')
                .setRequired(true)),

	async execute(interaction) {
        // Get list of users
        userList = getUserList();
        // Get target user
        const target = interaction.options.getUser('target');

        // Find target in userlist
        user = userList.find(user => user.id === target.id);

        // Send last seen message
        await interaction.reply(`${target.username}#${target.discriminator} was last online at ${user.lastSeen}`);
	},
};  