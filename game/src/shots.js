// Deterministic screenshot staging: ?shot=start|play|win|lose&seed=N builds a
// fixed, readable table so the screenshots are real renders of the game code.
import { newGame, applyCard, MAX_HP } from './engine.js';
import { CARDS } from './cards.js';

// A mid-duel table: turn 4, both fighters bloodied, full hands, log alive.
export function stagePlay(seed) {
  const s = newGame(seed);
  s.turn = 4;
  s.player.hp = 24; s.player.maxHp = MAX_HP;
  s.player.armor = 4; s.player.mana = 5; s.player.maxMana = 6;
  s.player.hand = ['fireball', 'guard', 'strike', 'drain', 'draw'];
  s.player.deck = Array(11).fill('strike');
  s.player.discard = ['heavy', 'wall'];
  s.enemy.hp = 19; s.enemy.maxHp = MAX_HP;
  s.enemy.armor = 2; s.enemy.mana = 4; s.enemy.maxMana = 6;
  s.enemy.hand = ['strike', 'guard', 'frost', 'heavy', 'mend'];
  s.enemy.deck = Array(11).fill('strike');
  s.enemy.discard = ['twin'];
  s.log = [
    '<b>Ash Warden</b> played <b>Cinder Guard</b> — <span class="guard">+6 armor</span>.',
    'Turn 2 — <b>You</b> played <b>Heavy Blow</b> — <span class="dmg">6 damage</span>.',
    '<b>Ash Warden</b> played <b>Frost Shard</b> — <span class="dmg">4 damage</span>.',
    'Turn 3 — <b>You</b> played <b>Mending Flame</b> — <span class="heal">+5 health</span>.',
    'Turn 4 — mana refilled to <b>6</b>, drew a card. Your move, Emberbound.',
  ];
  return s;
}

export function stageWin(seed) {
  const s = stagePlay(seed);
  s.phase = 'win'; s.winner = 'player';
  s.enemy.hp = 0; s.enemy.armor = 0;
  s.player.hp = 11;
  s.log.push('<b>You</b> played <b>Fireball</b> — <span class="dmg">8 damage</span>.');
  s.log.push('The Ash Warden falls. The pact is yours.');
  return s;
}

export function stageLose(seed) {
  const s = stagePlay(seed);
  s.phase = 'lose'; s.winner = 'enemy';
  s.player.hp = 0; s.player.armor = 0;
  s.enemy.hp = 9;
  s.log.push('<b>Ash Warden</b> played <b>Heavy Blow</b> — <span class="dmg">6 damage</span>.');
  s.log.push('The last ember dies. The Warden stands.');
  return s;
}

export function stageFor(shot, seed) {
  if (shot === 'play') return stagePlay(seed);
  if (shot === 'win') return stageWin(seed);
  if (shot === 'lose') return stageLose(seed);
  return null;
}

// Keep the import honest: applyCard/CARDS are the staging tools above.
export const _stagingUses = [applyCard, CARDS];
