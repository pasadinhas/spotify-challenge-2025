import { Player1, Player2, Player3, PlayerAll } from './Players';
import PlayerRules from './rules.json'
import FixedDateRules from './shared_rules.json'

// let seed = 32;
let seed = Math.random() * 100000000;

function dayOfYearIndex(dateStr: string | undefined) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffInMillis = date.getTime() - startOfYear.getTime();
  return Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
}

function deterministicShuffle(array: typeof PlayerRules, seed: number) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  seed = seed || 1;
  let random = function() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function validateShuffle(shuffle: any) {
  return true;
}

function createShuffle() {
  const playerOneRules = deterministicShuffle([...PlayerRules], seed++)
  const playerTwoRules = deterministicShuffle([...PlayerRules], seed++)
  const playerThrRules = deterministicShuffle([...PlayerRules], seed++)

  let result = []
  for (let i = 0; i < playerOneRules.length; i++) { // we know all arrays have the same length
    result.push({...playerOneRules[i], player: Player1});
    result.push({...playerTwoRules[i], player: Player2});
    result.push({...playerThrRules[i], player: Player3});
  }

  for (const fixedDataRule of FixedDateRules) {
    result.splice(dayOfYearIndex(fixedDataRule.date), 0, {...fixedDataRule, player: PlayerAll})
  }

  // 1735689600000 is the timestamp for Jan 1st 2025
  return result.map((v, i) => ({...v, date: new Date(1735689600000 + 1000 * 60 * 60 * 24 * i)})); 
}

interface Rule {
  rule: string,
  description: string,
  player: string,
  date: Date
}

let validShuffle = false
let shuffle: Rule[] = []

while (!validShuffle) {
  shuffle = createShuffle()
  validShuffle = validateShuffle(shuffle)
}

export function today() {
  return shuffle[dayOfYearIndex(undefined)]
}

export const Schedule = shuffle;
