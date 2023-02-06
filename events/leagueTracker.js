const { Events, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { puuids } = require('./leagueTrackerConfig.json')
const { apiKey } = require('../config.json')

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
  }

module.exports = {
	name: Events.ClientReady,
    once: true,
	async execute(client) {

        // Fetch bontempsbot channel
        const channel = await client.channels.fetch("1071137172196958239");

        // Create and format embed
        const embed = new EmbedBuilder();

        let index = 0;
        let timestamp = Math.floor(Date.now() / 1000);
        while(true)
        {
            if(index == puuids.length) index = 0;
            
            try {
            const matchListResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuids[index]}/ids?startTime=${timestamp}&type=ranked&start=0&count=2&api_key=${apiKey}`);
            const matchList =  await matchListResult.body.json();
            } catch (error) {
                console.error(error);
            }


            if(matchList.length)
            {
                const matchId = matchList[0];

                const matchResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`);
                const match = await matchResult.body.json();

                const participant = match.info.participants.find(participant => participant.puuid == puuids[index]);

                embed.setColor(participant.win ? "#10b529" : "#990c0c")
                    .setTitle(`${participant.summonerName} ${participant.win ? "Won" : "Lost"}!`)
                    .setDescription(participant.win ? "What a fucking legend." :  "What a fucking Loser.")
                    .setImage(`https://static.bigbrain.gg/assets/lol/riot_static/13.1.1/img/champion/${participant.championName}.png`)
                    .setFields(
                        { name: 'K/D/A', value: `${participant.kills}/${participant.deaths}/${participant.assists}` }
                    );
                

                // Send embed 
                channel.send({ embeds: [embed] });

                timestamp = Math.floor(Date.now() / 1000);
            }

            
            
            await sleep(1);
            index++;
        }
	},
};