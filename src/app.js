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

async function getOwnedChampionIds(summonerId) {
  return axios({
    method: 'get',
    url: `${process.env.HOST_PLATFORM}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`,
    headers: { 'X-Riot-Token': process.env.API_KEY }
  })
  .then((res) => res.data.map(e => e.championId))
  .catch((err) => console.error(err));
}

async function getFreeChampionIds(summonerLevel) {
  return axios({
    method: 'get',
    url: process.env.HOST_PLATFORM + '/lol/platform/v3/champion-rotations',
    headers: { 'X-Riot-Token': process.env.API_KEY }
  })
  .then((res) => (summonerLevel <= res.data.maxNewPlayerLevel) ? res.data.freeChampionIds.concat(res.data.freeChampionIdsForNewPlayers) : res.data.freeChampionIds)
  .catch((err) => console.error(err));
};

async function getLatestVersion() {
  return axios('https://ddragon.leagueoflegends.com/api/versions.json')
  .then((res) => res.data[0])
  .catch((err) => console.error(err));
};

async function getChampionNames(version) {
  return axios(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
  .then((res) => res.data.data)
  
  // Filters key (id) and name
  .then((map) => Object.entries(map).reduce((a,[k,v]) => {
    a.push({ id: v.key, name: v.name });
    return a;
  }, []))
  
  // Sorts dictionary by id
  .then((filteredObjects) => filteredObjects.sort((a,b) => a.id - b.id))
  
  // Returns an array of names where index is mapped to id
  .then((sortedObjects) => {
    let sortedArr = [];
    let i = 0;
    let id = 0;
    let idMax = sortedObjects[sortedObjects.length - 1].id;
    while (sortedArr.length <= idMax) {
      if (parseInt(sortedObjects[i].id) === id) {
        sortedArr.push(sortedObjects[i].name);
        i++;
      } else {
        sortedArr.push('');
      }
      id++;
    }

    /*for (let i=0; i < sortedObjects.length; i++) console.log(i, ":", sortedObjects[i]);
    console.log("sortedObjects.length:", sortedObjects.length);
    for (let i=0; i < sortedArr.length; i++) console.log(i, ":", sortedArr[i]); 
    console.log("sortedArr.length:", sortedArr.length);*/

    return sortedArr;
  })
  .catch((err) => console.error(err));
};

async function run() {
  const num = process.argv.length > 2 ? process.argv[2] : 1;

  const summoner = await getSummonerInfo(process.env.SUMMONER_NAME);

  const owned = await getOwnedChampionIds(summoner.id);
  const free = await getFreeChampionIds(summoner.summonerLevel);
  const playable = owned.concat(free);
  
  const version = await getLatestVersion();
  const names = await getChampionNames(version);

  for (let i=0; i < num; i++) {
    const index = Math.floor(Math.random() * playable.length);
    const id = playable[index];
    console.log("id:", id, ", name:", names[id]);
  }
};

run();

// Get version and champion names
// https://darkintaqt.com/blog/league-champ-id-list/
 
