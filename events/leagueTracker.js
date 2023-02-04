const { Events, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { puuids } = require('./leagueTrackerConfig.json')



module.exports = {
	name: Events.ClientReady,
    once: true,
	async execute(client) {
        const matchResult = await request("https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_6255692648?api_key=RGAPI-5ca39e81-6b11-4dd8-ad5a-6d368b1432ee");
        const match = await matchResult.body.json();

        // Get correct participant
        const participant = match.info.participants.find(participant => participant.puuid == puuids[0]);


        // Create and format embed
        const embed = new EmbedBuilder()
        .setColor(participant.win ? "#10b529" : "#990c0c")
        .setTitle(`${participant.summonerName} ${participant.win ? "Won" : "Lost"}!`)
        .setDescription(participant.win ? "What a fucking legend." :  "What a fucking Loser.")
        .addFields(
            { name: 'K/D/A', value: `${participant.kills}/${participant.deaths}/${participant.assists}` }
        );
        
        // Fetch bontempsbot channel
        const channel = await client.channels.fetch("1071137172196958239");

        // Send embed 
        channel.send({ embeds: [embed] });
	},
};