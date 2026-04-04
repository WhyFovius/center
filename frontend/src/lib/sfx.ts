// Simple sound effects using Web Audio API
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
};

const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) => {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  } catch {}
};

export const sfx = {
  click: () => { playTone(800, 0.08, 'sine', 0.1); },
  success: () => {
    playTone(523, 0.12, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 200);
  },
  fail: () => {
    playTone(200, 0.3, 'sawtooth', 0.15);
    setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.12), 150);
  },
  fatal: () => {
    playTone(100, 0.5, 'sawtooth', 0.2);
    setTimeout(() => playTone(80, 0.6, 'square', 0.15), 200);
    setTimeout(() => playTone(60, 0.8, 'sawtooth', 0.1), 400);
  },
  hover: () => { playTone(600, 0.05, 'sine', 0.05); },
  step: () => { playTone(400 + Math.random() * 200, 0.06, 'sine', 0.06); },
  encounter: () => {
    playTone(440, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(550, 0.15, 'sine', 0.1), 80);
  },
  cert: () => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.1), i * 120);
    });
  },
};
