const { SlashCommandBuilder } = require('discord.js');
const { request } = require('undici');
const { getLeagueInfoSid, pushRankEmbed } = require('../modules/league.js');
const { apiKey } = require('../config.json'); 
const league = require('../modules/league.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Gets the rank of a player in the euw region')
        .addStringOption(option =>
            option.setName('target')
                .setDescription('The name of the player')
                .setRequired(true)),

	async execute(interaction) {
        // Get target
        const target = interaction.options.getString('target');

        // Get summoner id
        const summonerResult = await request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${target}?api_key=${apiKey}`);
        const summoner = (await summonerResult.body.json());

        // Get league info
        const leagueInfo = await getLeagueInfoSid(summoner.id);

        // If the league info exists send the rank
        if(leagueInfo !== null) {
            // Send rank
           // await interaction.reply(`${summoner.name} is currently ${leagueInfo.tier} ${leagueInfo.tier === 'MASTER' ? '' : leagueInfo.rank} ${leagueInfo.leaguePoints} LP`);
            pushRankEmbed(summoner, leagueInfo, interaction.channel);
        }
        else {
            // Send not found message
            await interaction.reply(`The player ${target} either doesn't exist or is currently unranked.`);
        }
	},
};  