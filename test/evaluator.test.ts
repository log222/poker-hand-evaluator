import { describe, expect, it } from "vitest";
import { parseCards } from "../src/cards";
import { HandCategory, categoryOf, evaluate5, evaluateBest } from "../src/evaluator";

const score = (text: string) => evaluate5(parseCards(text));

describe("evaluate5 - categories", () => {
  it("recognizes every category", () => {
    expect(categoryOf(score("Ah Kd 9c 5s 2d"))).toBe(HandCategory.HighCard);
    expect(categoryOf(score("Ah Ad 9c 5s 2d"))).toBe(HandCategory.Pair);
    expect(categoryOf(score("Ah Ad 9c 9s 2d"))).toBe(HandCategory.TwoPair);
    expect(categoryOf(score("Ah Ad Ac 5s 2d"))).toBe(HandCategory.ThreeOfAKind);
    expect(categoryOf(score("5h 6d 7c 8s 9d"))).toBe(HandCategory.Straight);
    expect(categoryOf(score("Ah Kh 9h 5h 2h"))).toBe(HandCategory.Flush);
    expect(categoryOf(score("Ah Ad Ac 5s 5d"))).toBe(HandCategory.FullHouse);
    expect(categoryOf(score("Ah Ad Ac As 2d"))).toBe(HandCategory.FourOfAKind);
    expect(categoryOf(score("5h 6h 7h 8h 9h"))).toBe(HandCategory.StraightFlush);
  });

  it("A-2-3-4-5 is the lowest straight", () => {
    const wheel = score("Ah 2d 3c 4s 5d");
    expect(categoryOf(wheel)).toBe(HandCategory.Straight);
    expect(wheel).toBeLessThan(score("2h 3d 4c 5s 6d"));
  });

  it("ace-high straight beats king-high straight", () => {
    expect(score("Th Jd Qc Ks Ad")).toBeGreaterThan(score("9h Td Jc Qs Kd"));
  });

  it("suited A-2-3-4-5 is a five-high straight flush", () => {
    const sf = score("Ah 2h 3h 4h 5h");
    expect(categoryOf(sf)).toBe(HandCategory.StraightFlush);
    expect(sf).toBeLessThan(score("2h 3h 4h 5h 6h"));
  });
});

describe("evaluate5 - tie-breaks", () => {
  it("kicker decides between equal pairs", () => {
    expect(score("Ah Ad Kc 5s 2d")).toBeGreaterThan(score("Ac As Qc 5d 2h"));
  });

  it("two pair compares the higher pair, then the lower pair, then the kicker", () => {
    expect(score("Ah Ad 9c 9s 2d")).toBeGreaterThan(score("Kh Kd Qc Qs Ad"));
    expect(score("Kh Kd Qc Qs 3d")).toBeGreaterThan(score("Kc Ks Jc Jd Ah"));
    expect(score("Kh Kd Qc Qs 3d")).toBeGreaterThan(score("Kc Ks Qh Qd 2h"));
  });

  it("full house compares the trips first", () => {
    expect(score("3h 3d 3c 2s 2d")).toBeGreaterThan(score("2h 2d 2c As Ad"));
  });

  it("hands of identical value tie", () => {
    expect(score("Ah Kd 9c 5s 2d")).toBe(score("As Kc 9d 5h 2c"));
  });
});

describe("evaluateBest", () => {
  it("picks the best combination out of 7 cards", () => {
    const best = evaluateBest(parseCards("Ah Ad 2c 2s 9d 9h Kc"));
    expect(best).toBe(score("Ah Ad 9d 9h Kc")); // two pair, aces and nines, king kicker
  });

  it("uses the whole board when it is the best hand (board plays)", () => {
    const a = evaluateBest(parseCards("2c 3d Th Jh Qs Ks As"));
    const b = evaluateBest(parseCards("4c 5d Th Jh Qs Ks As"));
    expect(a).toBe(b);
    expect(categoryOf(a)).toBe(HandCategory.Straight);
  });

  it("detects a flush among 7 cards", () => {
    expect(categoryOf(evaluateBest(parseCards("Ah 9h 5h 2h Kh Kd Kc")))).toBe(HandCategory.Flush);
  });
});
