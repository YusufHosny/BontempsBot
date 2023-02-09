const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { apiKey } = require('../config.json')

module.exports = {
    // Sleep for ms miliseconds
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Get League Info from API using PUUID
    async getLeagueInfoPuuid(puuid) {

        // Get summoner id from puuid
        const summonerResult = await request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`);
        const summoner = await summonerResult.body.json();

        // Get player league info
        const leagueInfoResult = await request(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}?api_key=${apiKey}`);
        const leagueInfoList = await leagueInfoResult.body.json();

        // If the list of league infos has entries, find the solo duo entry and return it
        if(leagueInfoList.length) 
        {
            const leagueInfo = leagueInfoList.find(leagueInfo => leagueInfo.queueType === "RANKED_SOLO_5x5");
            if(typeof leagueInfo !== 'undefined') return leagueInfo;
        }

        return null;
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
        

        if(leagueInfo !== null) {
            embed.addFields({ name: 'Rank:', value: `${leagueInfo.tier} ${leagueInfo.rank} ${leagueInfo.leaguePoints} LP`, inline: true},)
            .setThumbnail(`https://static.bigbrain.gg/assets/lol/s12_rank_icons/${leagueInfo.tier.toLowerCase()}.png`)
        }
        else {
            embed.addFields({ name: 'Rank:', value: "UNRANKED", inline: true},)
        }
        
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