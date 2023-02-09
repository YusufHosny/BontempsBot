const { Events, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { puuids } = require('./leagueTrackerConfig.json')
const { apiKey } = require('../config.json')


function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
  }




async function getLeagueInfoPuuid(puuid) {

        // Get summoner id from puuid
        const summonerResult = await request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`);
        const summoner = await summonerResult.body.json();

        return await getLeagueInfoSid(summoner.id);
}



async function getLeagueInfoSid(summonerid) {
    // Get player league info
    const leagueInfoResult = await request(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerid}?api_key=${apiKey}`);
    const leagueInfoList = await leagueInfoResult.body.json();

    // If the list of league infos has entries, find the solo duo entry and return it
    if(leagueInfoList.length) 
    {
        const leagueInfo = leagueInfoList.find(leagueInfo => leagueInfo.queueType === "RANKED_SOLO_5x5");
        if(typeof leagueInfo !== 'undefined') return leagueInfo;
    }

    return null;
}



// Pushes a win/loss embed to a specified channel for a specific match participant
async function pushLeagueEmbed(participant, leagueInfo, channel) {

    // Create and format embed
    const embed = new EmbedBuilder();

    embed.setColor(participant.win ? "#10b529" : "#990c0c")
        .setTitle(`${participant.summonerName} ${participant.win ? "Won" : "Lost"}!`)
        .setDescription(participant.win ? "What a fucking legend." :  "What a fucking Loser.")
        .setImage(`https://static.bigbrain.gg/assets/lol/riot_static/13.1.1/img/champion/${participant.championName}.png`)
        .setFields(
            { name: 'K/D/A', value: `${participant.kills}/${participant.deaths}/${participant.assists}`, inline: true },
        );
    

    if(leagueInfo !== null)
    {
        embed.addFields({ name: 'Rank:', value: `${leagueInfo.tier} ${leagueInfo.rank} ${leagueInfo.leaguePoints} LP`, inline: true},)
        .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`)
    }
    
    channel.send({ embeds: [embed] });

}

// Pushes a demotion/promotion embed to a specified channel for a specific match participant
async function pushDemotionEmbed(participant, leagueInfo, channel) {

    // Create and format embed
    const embed = new EmbedBuilder();

    embed.setColor(participant.win ? "#10b529" : "#990c0c")
        .setTitle(`${participant.summonerName} ${participant.win ? "PROMOTED" : "DEMOTED"}!`)
        .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`)
        .setDescription(participant.win ? `CONGRATS!!! BROTHER PROMOTED TO ${leagueInfo.tier} ${leagueInfo.rank}!` :  `BOO HOO. THIS KID DEMOTED TO ${leagueInfo.tier} ${leagueInfo.rank}.`)
    
    channel.send({ embeds: [embed] });

}

module.exports = {
	name: Events.ClientReady,
    once: true,
	async execute(client) {
        // Create and fill list of ranks for puuids
        const rankList = [];
        
        for (let i = 0; i < puuids.length; i++) {
            const leagueInfo = await getLeagueInfoPuuid(puuids[i]);
            if (leagueInfo !== null) rankList.push(leagueInfo.tier + leagueInfo.rank); 
            else  rankList.push("None"); 
        }

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

                    // Get participant league info
                    const leagueInfo = await getLeagueInfoSid(participant.summonerId);
                    if(leagueInfo !== null)
                    {   
                        // If the rank changed
                        if((leagueInfo.tier + leagueInfo.rank) !== rankList[index])
                        {
                            pushDemotionEmbed(participant, leagueInfo, channel);
                        }
                    }

                    pushLeagueEmbed(participant, leagueInfo, channel);

                    // Check for a duo
                    const duo = match.info.participants.find(participant => puuids.includes(participant.puuid) && participant.puuid != puuids[index]);

                    // If there is a duo push embed
                    if(typeof duo !== 'undefined')
                    {
                        const duoleagueInfo = await getLeagueInfoSid(duo.summonerId);
                        pushLeagueEmbed(duo, duoleagueInfo, channel);

                        if(duoleagueInfo !== null)
                        {   
                            // If the rank changed
                            if((duoleagueInfo.tier + leagueInfo.rank) !== rankList[puuids.indexOf(duo.puuid)])
                            {
                                pushDemotionEmbed(duo, duoleagueInfo, channel);
                            }
                        }
                    }

                    // Set time stamp to current time
                    timestamp = Math.floor(Date.now() / 1000);
                }

            } catch (error) {
                console.error(error);
            }

            
            // Wait 2 seconds and increment index
            await sleep(2);
            index++;
        }
	},
};