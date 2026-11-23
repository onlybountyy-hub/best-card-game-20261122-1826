// Ember Pact bootstrap: wires the engine to the DOM, keyboard, record and
// the deterministic ?shot= modes the screenshots are taken from.
import { newGame, applyCard, endTurn } from './engine.js';
import { render, showTitle, hideTitle, showEnd, hideEnd } from './render.js';
import { stageFor } from './shots.js';
import { sfx } from './audio.js';

const RECORD_KEY = 'ember-pact-record-v1';

function loadRecord() {
  try {
    const r = JSON.parse(localStorage.getItem(RECORD_KEY) || '{}');
    return { wins: r.wins | 0, losses: r.losses | 0 };
  } catch { return { wins: 0, losses: 0 }; }
}

function saveRecord(r) {
  try { localStorage.setItem(RECORD_KEY, JSON.stringify(r)); } catch { /* private mode */ }
}

let state = null;
let record = loadRecord();
let phaseSeen = 'title';

function draw() {
  render(state, { record });
  if (state.phase === 'win' || state.phase === 'lose') {
    if (phaseSeen !== state.phase) {
      phaseSeen = state.phase;
      if (state.phase === 'win') { record.wins += 1; sfx.win(); }
      else { record.losses += 1; sfx.lose(); }
      saveRecord(record);
      render(state, { record });
    }
    showEnd(state, record);
  } else {
    hideEnd();
  }
}

function startGame(seed) {
  state = newGame(seed === undefined ? (Date.now() % 100000) : seed);
  phaseSeen = 'play';
  hideTitle();
  hideEnd();
  draw();
}

function playCard(id) {
  if (!state || state.phase !== 'play') return;
  const before = state.enemy.hp;
  const r = applyCard(state, 'player', id);
  if (!r.ok) return;
  if (state.enemy.hp < before) sfx.hurt(); else sfx.play();
  draw();
}

function onEndTurn() {
  if (!state || state.phase !== 'play') return;
  sfx.click();
  endTurn(state);
  draw();
}

function init() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1') || 1;

  document.getElementById('startBtn').addEventListener('click', () => { sfx.click(); startGame(); });
  document.getElementById('againBtn').addEventListener('click', () => { sfx.click(); startGame(); });
  document.getElementById('newGameBtn').addEventListener('click', () => { sfx.click(); startGame(); });
  document.getElementById('endTurnBtn').addEventListener('click', onEndTurn);
  document.getElementById('playerHand').addEventListener('click', (ev) => {
    const card = ev.target.closest('.card');
    if (card && card.dataset.card) playCard(card.dataset.card);
  });
  document.addEventListener('keydown', (ev) => {
    if (!state) return;
    if (ev.key >= '1' && ev.key <= '7') {
      const idx = Number(ev.key) - 1;
      if (state.player.hand[idx]) playCard(state.player.hand[idx]);
    } else if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault(); onEndTurn();
    } else if (ev.key === 'n' || ev.key === 'N') {
      startGame();
    }
  });

  if (shot) {
    // Deterministic staged table for screenshots: a real render of the game.
    if (shot === 'start') {
      state = newGame(seed);
      state.phase = 'title';
      render(state, { record });
      showTitle(record);
    } else {
      state = stageFor(shot, seed);
      phaseSeen = state.phase;
      hideTitle();
      render(state, { record });
      if (state.phase === 'win' || state.phase === 'lose') showEnd(state, record);
    }
  } else {
    state = newGame(1);
    state.phase = 'title';
    render(state, { record });
    showTitle(record);
  }

  // Test hook for the maker: window.__ember exposes state + actions.
  window.__ember = {
    state: () => state,
    record: () => record,
    start: startGame,
    play: playCard,
    endTurn: onEndTurn,
    redraw: () => draw(),
  };
}

init();
