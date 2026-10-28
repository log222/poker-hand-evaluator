import { Card } from "./cards";

export const HandCategory = {
  HighCard: 0,
  Pair: 1,
  TwoPair: 2,
  ThreeOfAKind: 3,
  Straight: 4,
  Flush: 5,
  FullHouse: 6,
  FourOfAKind: 7,
  StraightFlush: 8,
} as const;

const CATEGORY_NAMES = [
  "High card",
  "Pair",
  "Two pair",
  "Three of a kind",
  "Straight",
  "Flush",
  "Full house",
  "Four of a kind",
  "Straight flush",
];

const BASE = 15;
const CATEGORY_WEIGHT = BASE * BASE * BASE * BASE * BASE;

export function categoryOf(score: number): number {
  return Math.floor(score / CATEGORY_WEIGHT);
}

/** Rank of the most important tie-break card (e.g. the pair, the trips or the high card). */
export function primaryRank(score: number): number {
  return Math.floor((score % CATEGORY_WEIGHT) / (BASE * BASE * BASE * BASE));
}

export function categoryName(score: number): string {
  return CATEGORY_NAMES[categoryOf(score)];
}

function encode(category: number, kickers: number[]): number {
  let score = category;
  for (let i = 0; i < 5; i++) {
    score = score * BASE + (kickers[i] || 0);
  }
  return score;
}

/** Score of exactly 5 cards. Higher score = better hand. */
export function evaluate5(cards: Card[]): number {
  if (cards.length !== 5) throw new Error("evaluate5 needs 5 cards");

  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const isFlush = cards.every((c) => c.suit === cards[0].suit);

  const counts: { [rank: number]: number } = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;

  // Groups sorted by count, then by rank.
  const groups = Object.keys(counts)
    .map((k) => ({ rank: Number(k), count: counts[Number(k)] }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  const pattern = groups.map((g) => g.count).join("");
  const groupRanks = groups.map((g) => g.rank);

  let straightHigh = 0;
  if (groups.length === 5) {
    if (ranks[0] - ranks[4] === 4) straightHigh = ranks[0];
    else if (ranks[0] === 14 && ranks[1] === 5 && ranks[4] === 2) straightHigh = 5; // A-2-3-4-5
  }

  if (straightHigh && isFlush) return encode(HandCategory.StraightFlush, [straightHigh]);
  if (pattern === "41") return encode(HandCategory.FourOfAKind, groupRanks);
  if (pattern === "32") return encode(HandCategory.FullHouse, groupRanks);
  if (isFlush) return encode(HandCategory.Flush, ranks);
  if (straightHigh) return encode(HandCategory.Straight, [straightHigh]);
  if (pattern === "311") return encode(HandCategory.ThreeOfAKind, groupRanks);
  if (pattern === "221") return encode(HandCategory.TwoPair, groupRanks);
  if (pattern === "2111") return encode(HandCategory.Pair, groupRanks);
  return encode(HandCategory.HighCard, ranks);
}

/** Best 5-card hand out of 5 to 7 cards. */
export function evaluateBest(cards: Card[]): number {
  const n = cards.length;
  if (n < 5 || n > 7) throw new Error("evaluateBest needs 5 to 7 cards");

  let best = -1;
  const pick: Card[] = [];
  const walk = (start: number): void => {
    if (pick.length === 5) {
      const score = evaluate5(pick);
      if (score > best) best = score;
      return;
    }
    for (let i = start; i < n; i++) {
      pick.push(cards[i]);
      walk(i + 1);
      pick.pop();
    }
  };
  walk(0);
  return best;
}
