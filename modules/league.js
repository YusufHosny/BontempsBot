const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { apiKey } = require('../config.json')

// Congratulate player for hitting masters
function congratulateMasters() {
    channel.send('HE FUCKONG MADE IT TO MASTERES WTFFF I CANT HANDLE IT IM SCREAMINGNGGGG OMG PLEASE AUTOGRAPHHH');

    for(let i = 0; i < 10; i++){
        channel.send('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    }
}

module.exports = {
    // Get League Info from API using PUUID
    async getLeagueInfoPuuid(puuid) {

        // Get summoner id from puuid
        const summonerResult = await request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`);
        const summoner = await summonerResult.body.json();

        this.getLeagueInfoSid(summoner.id);
    },

    // Get League Info from API using Summoner ID
    async getLeagueInfoSid(summonerid) {
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
    },

    // Pushes a win/loss embed to a specified channel for a specific match participant
    async pushLeagueEmbed(participant, leagueInfo, channel) {

        // Create and format embed
        const embed = new EmbedBuilder();

        embed.setColor(participant.win ? "#10b529" : "#990c0c")
            .setTitle(`${participant.summonerName} ${participant.win ? "Won" : "Lost"}!`)
            .setDescription(participant.win ? "What a fucking legend." :  "What a fucking Loser.")
            .setImage(`https://static.bigbrain.gg/assets/lol/riot_static/13.1.1/img/champion/${participant.championName}.png`)
            .setFields(
                { name: 'K/D/A', value: `${participant.kills}/${participant.deaths}/${participant.assists}`, inline: true },
            );
        
        // If theres League info
        if(leagueInfo !== null) {
            // If the player is diamond 1 100 lp
            if(leagueInfo.tier + leagueInfo.rank + leagueInfo.leaguePoints === 'DIAMONDI100') {
                // Get all masters in euw
                const mastersResult = await request(`https://euw1.api.riotgames.com/lol/league/v4/masterleagues/by-queue/RANKED_SOLO_5x5?api_key=${apiKey}}`);
                const masterTier = await mastersResult.body.json();
                const masters = masterTier.entries;
                
                // Check if there is a master player with this id
                const master = masters.find(master => master.summonerId == participant.summonerId);

                // If the player exists return true
                const isMasters = !(typeof master === 'undefined');

                // If the player is masters display the masters rank
                if(isMasters){
                    embed.addFields({ name: 'Rank:', value: `MASTERS ${master.leaguePoints} LP`, inline: true},)
                        .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/master.png`)

                    // Send masters congratulations
                    congratulateMasters();
                } else {
                    // Display diamond 1 100 lp
                    embed.addFields({ name: 'Rank:', value: `${leagueInfo.tier} ${leagueInfo.rank} ${leagueInfo.leaguePoints} LP`, inline: true},)
                        .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`)
                }
            } else {
                // Display rank
                embed.addFields({ name: 'Rank:', value: `${leagueInfo.tier} ${leagueInfo.rank} ${leagueInfo.leaguePoints} LP`, inline: true},)
                    .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`) 
            }
        } else {
            // Display unranked
            embed.addFields({ name: 'Rank:', value: "UNRANKED", inline: true},)
        }
        
        // Send embed
        channel.send({ embeds: [embed] });

    },

    // Pushes a demotion/promotion embed to a specified channel for a specific match participant
    async pushDemotionEmbed(participant, leagueInfo, channel) {

        // Create and format embed
        const embed = new EmbedBuilder();

        embed.setColor(participant.win ? "#10b529" : "#990c0c")
            .setTitle(`${participant.summonerName} ${participant.win ? "PROMOTED" : "DEMOTED"}!`)
            .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`)
            .setDescription(participant.win ? `CONGRATS!!! BROTHER PROMOTED TO ${leagueInfo.tier} ${leagueInfo.rank}!` :  `BOO HOO. THIS KID DEMOTED TO ${leagueInfo.tier} ${leagueInfo.rank}.`)
        
        channel.send({ embeds: [embed] });

    },
}