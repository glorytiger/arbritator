//src\app.js

require('dotenv').config({ path: '../.env' });
const axios = require('axios');

async function getSummonerInfo(summonerName) {
  return axios({
    method: 'get',
    url: `${process.env.HOST_PLATFORM}/tft/summoner/v1/summoners/by-name/${summonerName}`,
    headers: { 'X-Riot-Token': process.env.API_KEY }
  })
  .then((res) => res.data)
  .catch((err) => console.error(err));
};

async function getOwnedChampions(summonerId) {
  return axios({
    method: 'get',
    url: `${process.env.HOST_PLATFORM}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`,
    headers: { 'X-Riot-Token': process.env.API_KEY }
  })
  .then((res) => res.data.map(e => e.championId))
  .catch((err) => console.error(err));
}

async function getFreeChampions(summonerLevel) {
  return axios({
    method: 'get',
    url: process.env.HOST_PLATFORM + '/lol/platform/v3/champion-rotations',
    headers: { 'X-Riot-Token': process.env.API_KEY }
  })
  .then((res) => (summonerLevel <= res.data.maxNewPlayerLevel) ? res.data.freeChampionIds.concat(res.data.freeChampionIdsForNewPlayers) : res.data.freeChampionIds)
  .catch((err) => console.error(err));
};

async function run() {
  
  const summoner = await getSummonerInfo(process.env.SUMMONER_NAME);

  const owned = await getOwnedChampions(summoner.id);
  const free = await getFreeChampions(summoner.summonerLevel);
  const playable = owned.concat(free);
  
  console.log(playable);
};

run();

