const { Events, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { puuids } = require('./leagueTrackerConfig.json')
const { apiKey } = require('../config.json')


function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
  }


// Pushes a win/loss embed to a specified channel for a specific match participant
async function pushLeagueEmbed(participant, channel) {
    // Create and format embed
    const embed = new EmbedBuilder();

    embed.setColor(participant.win ? "#10b529" : "#990c0c")
        .setTitle(`${participant.summonerName} ${participant.win ? "Won" : "Lost"}!`)
        .setDescription(participant.win ? "What a fucking legend." :  "What a fucking Loser.")
        .setImage(`https://static.bigbrain.gg/assets/lol/riot_static/13.1.1/img/champion/${participant.championName}.png`)
        .setFields(
            { name: 'K/D/A', value: `${participant.kills}/${participant.deaths}/${participant.assists}` }
        );
    
    channel.send({ embeds: [embed] });

}

module.exports = {
	name: Events.ClientReady,
    once: true,
	async execute(client) {
        // Fetch bontempsbot channel
        const channel = await client.channels.fetch("1071137172196958239");

        // Index for iterating over puuid list
        let index = 0;
        // Timestamp to start polling matches from, defaults to time where bot is run
        let timestamp = Math.floor(Date.now() / 1000);

        // Continuously poll for matches and push embeds accordingly
        while(true)
        {
            // Restart list of puuids if it reached the last one
            if(index == puuids.length) index = 0;
            
            
            try {
                // Get list of ranked matches since timestamp for this puuid
                const matchListResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuids[index]}/ids?startTime=${timestamp}&type=ranked&start=0&count=2&api_key=${apiKey}`);
                const matchList =  await matchListResult.body.json();
            
                // If there are matches since timestamp
                if(matchList.length)
                {
                    // Get the match
                    const matchId = matchList[0];

                    // Pull match data from riot API
                    const matchResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`);
                    const match = await matchResult.body.json();

                    // Get the participant we want to display and push the embed
                    const participant = match.info.participants.find(participant => participant.puuid == puuids[index]);

                    pushLeagueEmbed(participant, channel);

                    // Check for a duo
                    const Duo = match.info.participants.find(participant => puuids.includes(participant.puuid) && participant.puuid != puuids[index]);

                    // If there is a duo push embed
                    if(Duo !== undefined)
                    {
                        pushLeagueEmbed(Duo, channel);
                    }

                    // Set time stamp to current time
                    timestamp = Math.floor(Date.now() / 1000);
                }

            } catch (error) {
                console.error(error);
            }

            
            // Wait 1 second and increment index
            await sleep(1);
            index++;
        }
	},
};