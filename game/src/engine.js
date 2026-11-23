// The duel engine: pure rules, no DOM. A state is plain JSON so the
// screenshot stager can build one by hand and the UI can render it.
import { CARDS, buildDeck } from './cards.js';
import { shuffle } from './random.js';
import { choosePlays } from './ai.js';

export const MAX_HP = 30;
export const MAX_MANA = 10;
export const HAND_LIMIT = 7;

export function newFighter(rand) {
  return {
    hp: MAX_HP, maxHp: MAX_HP, armor: 0, burn: 0, burnTurns: 0,
    mana: 3, maxMana: 3, hand: [], deck: shuffle(buildDeck(), rand), discard: [],
  };
}

export function newGame(seed) {
  const rng = seedRand(seed);
  const s = {
    seed, turn: 1, phase: 'play', winner: null,
    player: newFighter(rng), enemy: newFighter(rng),
    log: [],
  };
  drawCards(s.player, 5);
  drawCards(s.enemy, 5);
  s.log.push('The duel begins. <b>You</b> hold the first ember.');
  return s;
}

// Deterministic RNG for a seed (mulberry32), imported lazily to keep this
// module free of load-order surprises.
import { mulberry32 } from './random.js';
function seedRand(seed) { return mulberry32(seed >>> 0 || 1); }

export function drawCards(f, n) {
  for (let i = 0; i < n; i++) {
    if (f.hand.length >= HAND_LIMIT) break;
    if (f.deck.length === 0) {
      if (f.discard.length === 0) break;
      f.deck = shuffle(f.discard, Math.random);
      f.discard = [];
    }
    f.hand.push(f.deck.shift());
  }
}

function dealDamage(target, amount) {
  let left = amount;
  if (target.armor > 0) {
    const soaked = Math.min(target.armor, left);
    target.armor -= soaked;
    left -= soaked;
  }
  target.hp = Math.max(0, target.hp - left);
  return left;
}

export function applyCard(state, who, cardId) {
  const card = CARDS[cardId];
  if (!card) return { ok: false, why: 'no such card' };
  const me = state[who];
  const foe = state[who === 'player' ? 'enemy' : 'player'];
  const idx = me.hand.indexOf(cardId);
  if (idx === -1) return { ok: false, why: 'not in hand' };
  if (card.cost > me.mana) return { ok: false, why: 'not enough mana' };
  me.hand.splice(idx, 1);
  me.discard.push(cardId);
  me.mana -= card.cost;
  const whoName = who === 'player' ? '<b>You</b>' : '<b>Ash Warden</b>';
  const lines = [];
  const hits = card.hits || 1;
  for (let h = 0; h < hits; h++) {
    if (card.damage) {
      const dealt = dealDamage(foe, card.damage);
      lines.push(`<span class="dmg">${dealt} damage</span>`);
    }
  }
  if (card.armor) { me.armor += card.armor; lines.push(`<span class="guard">+${card.armor} armor</span>`); }
  if (card.heal) {
    const healed = Math.min(card.heal, me.maxHp - me.hp);
    me.hp += healed;
    lines.push(`<span class="heal">+${healed} health</span>`);
  }
  if (card.draw) { drawCards(me, card.draw); lines.push(`drew ${card.draw}`); }
  if (card.mana) { me.mana += card.mana; lines.push(`+${card.mana} mana`); }
  if (card.burn) {
    foe.burn = card.burn; foe.burnTurns = card.burnTurns || 2;
    lines.push(`<span class="dmg">burn ${card.burn}/turn</span>`);
  }
  state.log.push(`${whoName} played <b>${card.name}</b> — ${lines.join(', ') || 'nothing happens'}.`);
  checkEnd(state);
  return { ok: true };
}

function checkEnd(state) {
  if (state.phase !== 'play') return;
  if (state.enemy.hp <= 0) { state.phase = 'win'; state.winner = 'player'; }
  else if (state.player.hp <= 0) { state.phase = 'lose'; state.winner = 'enemy'; }
}

function tickBurn(state, who) {
  const f = state[who];
  if (f.burn > 0 && f.burnTurns > 0) {
    const dealt = dealDamage(f, f.burn);
    state.log.push(`<span class="dmg">Burn ticks for ${dealt} on ${who === 'player' ? '<b>you</b>' : '<b>Ash Warden</b>'}.</span>`);
    f.burnTurns -= 1;
    if (f.burnTurns === 0) f.burn = 0;
  }
}

export function endTurn(state) {
  if (state.phase !== 'play') return;
  // Enemy acts.
  tickBurn(state, 'enemy');
  if (state.phase !== 'play') return;
  const plays = choosePlays(state.enemy, state.player);
  for (const id of plays) {
    applyCard(state, 'enemy', id);
    if (state.phase !== 'play') return;
  }
  if (plays.length === 0) state.log.push('<b>Ash Warden</b> holds its cards.');
  // New player turn.
  state.turn += 1;
  const p = state.player;
  p.maxMana = Math.min(MAX_MANA, p.maxMana + 1);
  p.mana = p.maxMana;
  // The rival's mana grows in step, and it draws a card each round too.
  const e = state.enemy;
  e.maxMana = Math.min(MAX_MANA, e.maxMana + 1);
  e.mana = e.maxMana;
  tickBurn(state, 'player');
  if (state.phase !== 'play') return;
  drawCards(p, 1);
  drawCards(e, 1);
  state.log.push(`Turn ${state.turn} — mana refilled to <b>${p.mana}</b>, drew a card.`);
}
