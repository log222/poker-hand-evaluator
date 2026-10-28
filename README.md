# poker-hand-evaluator

A small, dependency-free Texas Hold'em hand evaluator written in TypeScript.
Extracted from the rules engine of [Texas Poker](https://loja.texaspoker.com.br), a multiplayer 3D card game I built.

- Scores exactly 5 cards (`evaluate5`) or the best 5-card hand out of 5 to 7 cards (`evaluateBest`)
- A score is a single number: **higher score = better hand**, so comparing hands is `a > b`
- Handles the wheel straight (A-2-3-4-5) and kickers
- Ships with unit tests

```ts
import { parseCards } from "./src/cards";
import { evaluateBest, categoryName } from "./src/evaluator";

const hero = evaluateBest(parseCards("As Ks Qs Js Ts 2d 3c"));
const villain = evaluateBest(parseCards("9h 9d 9c 4s 4d 2d 3c"));

console.log(categoryName(hero));    // "Straight flush"
console.log(categoryName(villain)); // "Full house"
console.log(hero > villain);        // true
```

Card notation: rank `23456789TJQKA` followed by suit `c`, `d`, `h`, `s`.

## Run the tests

```bash
npm install
npm test
```

## License

MIT, see [LICENSE](LICENSE).

---

**PT-BR:** avaliador de mãos de Texas Hold'em, pequeno e sem dependências, extraído do motor de regras do Texas Poker. Maior pontuação = mão melhor; aceita de 5 a 7 cartas.
