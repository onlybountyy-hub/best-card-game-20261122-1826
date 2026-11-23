// Ash Warden's brain: a greedy heuristic with a lethal check first.
// It values a card by damage dealt (lethal is priceless), armor gained when hurt,
// healing when low, and card draw when the hand is thin.
import { CARDS } from './cards.js';

function cardValue(card, me, foe) {
  let v = 0;
  const hits = card.hits || 1;
  const dmg = (card.damage || 0) * hits;
  if (dmg >= foe.hp + foe.armor) return 1000 + dmg; // lethal
  v += dmg * 2;
  if (card.armor) v += me.hp < 15 ? card.armor * 2.2 : card.armor * 1.1;
  if (card.heal) v += me.hp < 18 ? card.heal * 2.4 : card.heal * 0.9;
  if (card.draw) v += me.hand.length <= 2 ? 6 : 2;
  if (card.mana) v += 3;
  if (card.burn) v += 4;
  return v;
}

// Returns the ordered list of card ids the AI will play this turn.
export function choosePlays(me, foe) {
  const plays = [];
  let mana = me.mana;
  const hand = me.hand.slice();
  while (true) {
    let best = null, bestV = 0;
    for (const id of hand) {
      const card = CARDS[id];
      if (!card || card.cost > mana) continue;
      const v = cardValue(card, { ...me, hand }, foe);
      if (v > bestV) { bestV = v; best = id; }
    }
    if (!best) break;
    plays.push(best);
    hand.splice(hand.indexOf(best), 1);
    mana -= CARDS[best].cost;
    // Lethal found: stop and swing.
    if (bestV >= 1000) break;
  }
  return plays;
}
