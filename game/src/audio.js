// Tiny WebAudio synth: no sound files, everything is an oscillator.
// Fails silently when audio is unavailable (headless screenshots).
let ctx = null;

function ac() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = AC ? new AC() : null;
  } catch { ctx = null; }
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.08, when = 0) {
  const c = ac();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + when);
    o.stop(c.currentTime + when + dur + 0.02);
  } catch { /* audio is decoration */ }
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.05); },
  play() { tone(392, 0.12, 'sawtooth', 0.05); tone(523, 0.14, 'sawtooth', 0.04, 0.06); },
  hurt() { tone(110, 0.25, 'square', 0.07); },
  heal() { tone(523, 0.18, 'sine', 0.06); tone(784, 0.22, 'sine', 0.05, 0.08); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.07, i * 0.12)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sine', 0.06, i * 0.14)); },
};
