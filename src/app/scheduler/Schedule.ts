import FixedDateRules from "../../data/shared_rules.json";
import { createShuffle } from "./Shuffle";
import Time from "./Time";
import { Rule, ScheduleDay } from "./types";

// let seed = 32;
let seed = Math.random() * 100000000;

function validateShuffle(shuffle: any) {
  return true;
}

let validShuffle = false;
let shuffle: Rule[] = [];
let iterations = 0;

while (!validShuffle) {
  shuffle = createShuffle(seed++);
  validShuffle = validateShuffle(shuffle);
  iterations += 1;
}

console.log(`Valid shuffle after ${iterations} iterations.`);

export function getRules(date: Date) {
  return shuffle[Time.getDayOfYear(date)];
}

let playlistIndex = 0;
const dayIndicesWithMultipleSongs = FixedDateRules.map((fixedDateRule) =>
  Time.getDayOfYear(new Date(fixedDateRule.date))
);
const PlaylistIndicesByDate = Array.from(
  { length: 365 },
  (_, index) => index
).reduce((dictionary, dayIndex) => {
  const date = new Date(2025, 0, 0);
  date.setDate(date.getDate() + 1 + dayIndex);
  const dateStr = formatDate(date)
  if (dayIndicesWithMultipleSongs.includes(dayIndex)) {
    dictionary[dateStr] = [
      playlistIndex++,
      playlistIndex++,
      playlistIndex++,
    ];
  } else {
    dictionary[dateStr] = [playlistIndex++];
  }
  return dictionary;
}, {} as { [key: string]: number[] });

export function getPlaylistIndices(date: Date) {
  return PlaylistIndicesByDate[formatDate(date)]
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-CA')
}

class Schedule {
  private rules: Rule[];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  on(date: Date): ScheduleDay {
    const rule = this.rules[Time.getDayOfYear(date)]
    const allRules = this.rules.filter((r) => r.rule === rule.rule);
    const sharedDay = allRules.length == 1;
    const playlistIndices = sharedDay
      ? getPlaylistIndices(date)
      : allRules.map(rule => rule.date).flatMap(getPlaylistIndices)

    return { date, sharedDay, rule, allRules, playlistIndices }
  }
}

export default new Schedule(shuffle);
