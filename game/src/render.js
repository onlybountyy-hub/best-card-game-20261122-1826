// DOM rendering: draws a whole duel state into the page. Pure view code —
// the engine owns the rules, this file only turns state into HTML.
import { CARDS } from './cards.js';

const $ = (id) => document.getElementById(id);

function setBar(fillId, textId, cur, max) {
  $(fillId).style.width = `${Math.max(0, Math.min(100, (cur / max) * 100))}%`;
  $(textId).textContent = `${cur} / ${max}`;
}

function cardEl(id, playable) {
  const c = CARDS[id];
  const el = document.createElement('div');
  el.className = `card ${c.type}${playable === false ? ' unaffordable' : ''}`;
  el.dataset.card = id;
  el.innerHTML =
    `<div class="cost">${c.cost}</div>` +
    `<div class="cname">${c.name}</div>` +
    `<div class="cicon">${c.icon}</div>` +
    `<div class="ceffect">${c.text}</div>` +
    `<div class="ctype">${c.type}</div>`;
  return el;
}

export function render(state, opts = {}) {
  const p = state.player, e = state.enemy;
  $('turnLabel').textContent = `Turn ${state.turn}`;
  setBar('playerHpFill', 'playerHpText', p.hp, p.maxHp);
  setBar('enemyHpFill', 'enemyHpText', e.hp, e.maxHp);
  setBar('playerManaFill', 'playerManaText', p.mana, p.maxMana);
  setBar('enemyManaFill', 'enemyManaText', e.mana, e.maxMana);
  $('playerArmor').textContent = `Armor ${p.armor}${p.burn > 0 ? ` · Burn ${p.burn}` : ''}`;
  $('enemyArmor').textContent = `Armor ${e.armor}${e.burn > 0 ? ` · Burn ${e.burn}` : ''}`;
  $('playerDeck').textContent = `Deck ${p.deck.length}`;
  $('enemyDeck').textContent = `Deck ${e.deck.length}`;
  $('playerDiscard').textContent = `Discard ${p.discard.length}`;

  // Player hand, face up, in hand order.
  const ph = $('playerHand');
  ph.innerHTML = '';
  p.hand.forEach((id) => ph.appendChild(cardEl(id, CARDS[id].cost <= p.mana)));

  // Opponent hand: card backs, count shown — the rival's cards stay hidden.
  const eh = $('enemyHand');
  eh.innerHTML = '';
  e.hand.forEach(() => {
    const back = document.createElement('div');
    back.className = 'card back';
    back.innerHTML = '<div class="backmark">✦</div>';
    eh.appendChild(back);
  });
  const count = document.createElement('div');
  count.className = 'hand-count';
  count.textContent = `${e.hand.length} cards in hand`;
  eh.appendChild(count);

  // Log, newest at the bottom.
  const log = $('log');
  log.innerHTML = state.log.slice(-30).map((l) => `<div>${l}</div>`).join('');
  log.scrollTop = log.scrollHeight;

  $('endTurnBtn').disabled = state.phase !== 'play';
  if (opts.record) {
    $('recordLabel').textContent = `Wins ${opts.record.wins} · Losses ${opts.record.losses}`;
  }
}

export function showTitle(record) {
  $('titleScreen').classList.remove('hidden');
  $('endScreen').classList.add('hidden');
  $('titleRecord').textContent = record && (record.wins + record.losses) > 0
    ? `Your record: ${record.wins} wins · ${record.losses} losses`
    : 'First duel? The Warden is waiting.';
}

export function hideTitle() {
  $('titleScreen').classList.add('hidden');
}

export function showEnd(state, record) {
  const win = state.phase === 'win';
  $('endKicker').textContent = win ? 'VICTORY' : 'DEFEAT';
  $('endTitle').textContent = win ? 'THE WARDEN FALLS' : 'THE EMBER DIES';
  $('endSub').textContent = win
    ? 'The Ash Warden bows. The pact is yours — the cinders remember your name.'
    : 'The Ash Warden stands over the last ember. Shuffle up and take the rematch.';
  $('endStats').innerHTML =
    `Turns played: <b>${state.turn}</b><br>` +
    `Your health: <b>${state.player.hp} / ${state.player.maxHp}</b> &nbsp;·&nbsp; Warden: <b>${state.enemy.hp} / ${state.enemy.maxHp}</b><br>` +
    `Record: <b>${record.wins} wins · ${record.losses} losses</b>`;
  $('endScreen').classList.remove('hidden');
}

export function hideEnd() {
  $('endScreen').classList.add('hidden');
}
