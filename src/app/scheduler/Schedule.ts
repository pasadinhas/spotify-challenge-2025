import { Player1, Player2, Player3, PlayerAll } from "./Players";
import PlayerRules from "./rules.json";
import FixedDateRules from "./shared_rules.json";

// let seed = 32;
let seed = Math.random() * 100000000;

class SeededRandom {
  private seed: number;
  private a: number = 1664525;
  private c: number = 1013904223;
  private m: number = 2 ** 32;

  constructor(seed: number) {
      this.seed = seed;
  }

  // Generates a deterministic pseudo-random number
  next(): number {
      this.seed = (this.a * this.seed + this.c) % this.m;
      return this.seed / this.m;
  }
}

function deterministicShuffle<T>(array: T[], rng: SeededRandom): T[] {
  const result = [...array];  // Create a copy to avoid mutating the original array
  const n = result.length;

  // Fisher-Yates shuffle using the seeded random number generator
  for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1)); // Random index between 0 and i
      [result[i], result[j]] = [result[j], result[i]]; // Swap elements
  }

  return result;
}

function getDayOfYear(date: Date): number {
  // Array with the number of days in each month for a common year
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check if the year is a leap year
  const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
  };

  // Adjust for leap year by changing February to 29 days if necessary
  if (isLeapYear(date.getFullYear())) {
      daysInMonth[1] = 29;
  }

  // Get the year, month, and day of the given date
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based month index (0 = January)
  const day = date.getDate();

  // Sum the days in all the previous months of the given year
  let dayOfYear = daysInMonth.slice(0, month).reduce((acc, days) => acc + days, 0);

  // Add the days of the current month
  dayOfYear += day - 1;

  return dayOfYear;
}

function validateShuffle(shuffle: any) {
  return true;
}

function createShuffle(seed: number): Rule[] {
  const RNG = new SeededRandom(seed);

  const playerOneRules = deterministicShuffle([...PlayerRules], RNG);
  const playerTwoRules = deterministicShuffle([...PlayerRules], RNG);
  const playerThrRules = deterministicShuffle([...PlayerRules], RNG);

  let result = [];
  for (let i = 0; i < playerOneRules.length; i++) {
    // we know all arrays have the same length
    result.push({ ...playerOneRules[i], player: Player1 });
    result.push({ ...playerTwoRules[i], player: Player2 });
    result.push({ ...playerThrRules[i], player: Player3 });
  }

  for (const fixedDateRule of FixedDateRules) {
    result.splice(getDayOfYear(new Date(fixedDateRule.date)), 0, {
      ...fixedDateRule,
      player: PlayerAll,
    });
  }

  // 1735689600000 is the timestamp for Jan 1st 2025
  return result.map((v, i) => ({
    ...v,
    date: new Date(1735689600000 + 1000 * 60 * 60 * 24 * i),
  }));
}

interface Rule {
  rule: string;
  description: string;
  player: string;
  date: Date;
  notes?: string;
}

let validShuffle = false;
let shuffle: Rule[] = [];

let iterations = 0;
while (!validShuffle) {
  shuffle = createShuffle(seed++);
  validShuffle = validateShuffle(shuffle);
  iterations += 1;
}

console.log(`Valid shuffle after ${iterations} iterations.`)

export function getRules(date: Date) {
  return shuffle[getDayOfYear(date)];
}

export const Schedule = shuffle;
