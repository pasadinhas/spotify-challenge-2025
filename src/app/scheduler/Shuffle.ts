import PlayerRules from "../../data/rules.json";
import FixedDateRules from "../../data/shared_rules.json";
import { Player1, Player2, Player3, PlayerAll } from "./Players";
import Time from "./Time";
import { Rule } from "./types";

export class SeededRandom {
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
  const result = [...array]; // Create a copy to avoid mutating the original array
  const n = result.length;

  // Fisher-Yates shuffle using the seeded random number generator
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1)); // Random index between 0 and i
    [result[i], result[j]] = [result[j], result[i]]; // Swap elements
  }

  return result;
}


export function createShuffle(seed: number): Rule[] {
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
    result.splice(Time.getDayOfYear(new Date(fixedDateRule.date)), 0, {
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