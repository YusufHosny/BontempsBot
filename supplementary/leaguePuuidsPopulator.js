const { request } = require('undici');
const fs = require('node:fs');
const { apiKey } = require('../config.json');
const { names } = require('./trackedLeagueNames.json');

const leagueTrackerConfig = { 
    'puuids': [] 
};

async function populateFile(){
    for(let i = 0; i < names.length; i++) {
        const summonerResult = await request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${names[i]}?api_key=${apiKey}`);
        const summoner = await summonerResult.body.json();

        leagueTrackerConfig.puuids.push(summoner.puuid);
    }
    
    const jsonFile = JSON.stringify(leagueTrackerConfig);
    
    fs.writeFile('./events/leagueTrackerConfig.json', jsonFile, (error) => console.error(error));
}


populateFile();