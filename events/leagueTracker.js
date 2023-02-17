const { Events } = require('discord.js');
const { request } = require('undici');
const { puuids } = require('./leagueTrackerConfig.json')
const { apiKey } = require('../config.json')
const { getLeagueInfoPuuid, getLeagueInfoSid, pushLeagueEmbed, pushDemotionEmbed } = require('../modules/league.js');
const { sleep } = require('../modules/general.js');


module.exports = {
	name: Events.ClientReady,
    once: true,
	async execute(client) {
        // Create and fill list of ranks for puuids
        const rankList = [];
        
        // Fill list of all initial ranks
        for (let i = 0; i < puuids.length; i++) {
            const leagueInfo = await getLeagueInfoPuuid(puuids[i]);
            
            await sleep(100);

            if (leagueInfo !== null) rankList.push(leagueInfo.tier + leagueInfo.rank); 
            else  rankList.push("None"); 
        }

        // Create and fill list of latest matches
        const latestMatchList = [];

        // Fill list of latest match for each puuid
        for (let i = 0; i < puuids.length; i++) {
            // Get list with the latest ranked match for this puuid
            const matchListResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuids[i]}/ids?startTime=0&type=ranked&start=0&count=1&api_key=${apiKey}`);
            const matchList =  await matchListResult.body.json();

            // Get the match
            const matchId = matchList[0];
            // Add matchId to latest match list
            latestMatchList.push(matchId);
        }

        // Fetch bontempsbot channel
        const channel = await client.channels.fetch("1071137172196958239");


        // Continuously poll for matches and push embeds accordingly
        while(true)
        {
            // Wait 60 seconds
            await sleep(60 * 1000);
            
            // Iterate over all puuids
            for(let index = 0; index < puuids.length; index++)
            {         
                try {
                    // Get list of ranked matches since timestamp for this puuid
                    const matchListResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuids[index]}/ids?startTime=0&type=ranked&start=0&count=2&api_key=${apiKey}`);
                    const matchList =  await matchListResult.body.json();
                
                    // Get the match
                    const matchId = matchList[0];

                    if(matchId !== latestMatchList[index]) {
                        latestMatchList[index] = matchId;
                        // Pull match data from riot API
                        const matchResult = await request(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`);
                        const match = await matchResult.body.json();

                        // Get the participant we want to display and push the embed
                        const participant = match.info.participants.find(participant => participant.puuid == puuids[index]);

                        // Get participant league info
                        const leagueInfo = await getLeagueInfoSid(participant.summonerId);
                        pushLeagueEmbed(participant, leagueInfo, channel);

                        // Check if demoted/promoted and push embed
                        if(leagueInfo !== null)
                        {   
                            // If the rank changed
                            if((leagueInfo.tier + leagueInfo.rank) !== rankList[index])
                            {
                                // Update rank list
                                rankList[index] = leagueInfo.tier + leagueInfo.rank;
                                pushDemotionEmbed(participant, leagueInfo, channel);
                            }
                        }

                    }
                    

                    // Wait 0.075 seconds and increment index
                    await sleep(75);

                } catch (error) {
                    console.error(error);
                }
            }       
        }
	},
};