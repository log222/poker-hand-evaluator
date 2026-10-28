// Cards and deck. rank: 2..14 (14 = Ace). suit: 0..3 (c, d, h, s).

export type Suit = 0 | 1 | 2 | 3;

export interface Card {
  rank: number;
  suit: Suit;
}

/** Random number generator in [0, 1). In a real server, inject a secure source. */
export type Rng = () => number;

const RANK_CHARS = "23456789TJQKA";
const SUIT_CHARS = "cdhs";

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({ rank, suit: suit as Suit });
    }
  }
  return deck;
}

/** Fisher-Yates; returns a shuffled copy. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function cardToString(card: Card): string {
  return RANK_CHARS.charAt(card.rank - 2) + SUIT_CHARS.charAt(card.suit);
}

/** "As" -> Ace of spades. Handy in tests. */
export function parseCard(text: string): Card {
  const rank = RANK_CHARS.indexOf(text.charAt(0)) + 2;
  const suit = SUIT_CHARS.indexOf(text.charAt(1));
  if (rank < 2 || suit < 0 || text.length !== 2) {
    throw new Error("Invalid card: " + text);
  }
  return { rank, suit: suit as Suit };
}

export function parseCards(text: string): Card[] {
  return text.split(/\s+/).filter(Boolean).map(parseCard);
}
