# Ember Pact — build report (best-card-game-20261122-1826)

## The game
**Ember Pact**, an original duel card battler. You vs the Ash Warden: 30 HP each,
mana growing 3 → 10, a 20-card deck built from 14 unique cards (attacks, guards,
heals, draw, burn). Click a card (or keys 1–7) to play it, Space to end the turn.
Armor soaks damage first; burn ticks at turn start; first to zero health loses.
Wins/losses persist in localStorage. Sound is a WebAudio synth — no audio files.

## Files (all written fresh in this session)
- `game/index.html`, `game/style.css` — DOM table, ember theme
- `game/src/random.js` — mulberry32 seeded RNG
- `game/src/cards.js` — 14-card catalogue + 20-card deck list
- `game/src/ai.js` — Warden heuristic (lethal check first, then value)
- `game/src/engine.js` — pure rules: draw, damage/armor/heal/burn, turns, win/lose
- `game/src/render.js` — DOM rendering (hands, bars, log, title/end overlays)
- `game/src/audio.js` — WebAudio synth sfx
- `game/src/shots.js` — deterministic `?shot=start|play|win|lose&seed=` staging
- `game/src/main.js` — bootstrap, keyboard, record, `window.__ember` test hook
- `main.ts` — hand-in: copies game/ + screenshots/, writes dossier.json via
  vendor buildDossier, plus its own validation block (dossier parses, index.html
  present, 3–4 screenshots within cap). Written in 2 messages.
- `serve.ts` (dev server), `shots.json`, `vendor/makefun-game.ts` (kit copy,
  unchanged), `LICENSE` (MIT + SPDX), `README.md` (3 live badges + referral).

## Verification (all run in this session)
- Engine sim (Node, greedy player vs AI): 10 games, **5W / 5L, avg 10.0 turns**,
  close finishes (loser at 1–4 HP) — balanced duel.
- Playwright browser test: real clicks — start, play cards, 2 end-turns advance
  turn 1 → 3, damage flows both ways; forced lethal strike → phase `win` +
  end screen visible. **0 console errors, 0 failed requests.**
- Screenshots: 4 × 1280×720 JPEG (75,732 / 109,658 / 76,294 / 74,605 B — all
  ≤ 256 KiB), visually inspected: title, mid-game table (both hands, HP/mana,
  armor, log, cards with readable costs/values/types), win, lose.
- `main.ts` run twice → **byte-identical output** (diff -r clean).
- Dossier 481,010 B ≤ 1.5 MiB; game/ 10 files; total /output 847,596 B ≤ 64 MiB.
- One balance bug found and fixed in-session: the Warden never regained mana
  (its maxMana was never grown) — fixed in endTurn, re-verified by the sim.

## Notes for the submitter (main session)
- Tree: ~/workspace/makefun/card-game-entry/ (git repo, commit on report).
- Kit: ~/workspace/makefun/kit-card-game/best-card-game-20261122-1826-kit/.
- Bundle route with this session; do NOT push/submit from this builder.
- Deadline: Mon 2026-11-23 13:26 WIB (06:26Z). Result due 2026-12-07 18:26 WIB.
