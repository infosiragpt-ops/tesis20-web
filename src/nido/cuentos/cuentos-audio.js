// Sonido de la biblioteca: música de fondo generada por Web Audio (sin
// archivos externos), efectos cortos y narración con la voz del navegador.

let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let musicTimer = null;
let nextNoteTime = 0;
let step = 0;
let muted = false;
let unlocked = false;

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(muted));
}

export function onMuteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isMuted() {
  return muted;
}

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);

  musicGain = ctx.createGain();
  musicGain.gain.value = 0.0001;
  sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.6;

  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.34;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2200;

  musicGain.connect(tone);
  tone.connect(master);
  musicGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);
  sfxGain.connect(master);
  return ctx;
}

/** Se llama en el primer gesto real del usuario (política de autoplay). */
export function unlockAudio() {
  const context = ensureContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  unlocked = true;
}

export function setMuted(next) {
  muted = next;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.12);
  }
  if (muted) stopSpeech();
  notify();
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

/* ------------------------------ música --------------------------- */

// Progresión suave en pentatónica: la misma sensación de nana en bucle.
const CHORDS = [
  { pad: [130.81, 196.0, 261.63], notes: [523.25, 587.33, 659.25, 783.99] },
  { pad: [146.83, 220.0, 293.66], notes: [587.33, 659.25, 880.0, 987.77] },
  { pad: [110.0, 164.81, 261.63], notes: [523.25, 659.25, 783.99, 880.0] },
  { pad: [174.61, 261.63, 349.23], notes: [523.25, 698.46, 880.0, 1046.5] },
];

function pluck(time, freq, gain = 0.1) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(gain, time + 0.04);
  env.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);
  osc.connect(env);
  env.connect(musicGain);
  osc.start(time);
  osc.stop(time + 2);
}

function pad(time, freqs, duration) {
  if (!ctx) return;
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = i === 0 ? "sine" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = i * 4 - 4;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.055, time + 1.2);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(env);
    env.connect(musicGain);
    osc.start(time);
    osc.stop(time + duration + 0.2);
  });
}

function scheduleMusic() {
  if (!ctx) return;
  const beat = 0.62;
  while (nextNoteTime < ctx.currentTime + 1.4) {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    if (step % 8 === 0) pad(nextNoteTime, chord.pad, 5.2);
    const pattern = [0, 2, 1, 3, 0, 3, 2, 1];
    const index = pattern[step % 8];
    if (step % 2 === 0 || index % 2 === 1) {
      pluck(nextNoteTime, chord.notes[index], step % 4 === 0 ? 0.12 : 0.075);
    }
    if (step % 16 === 12) pluck(nextNoteTime, chord.notes[3] * 2, 0.05);
    nextNoteTime += beat;
    step += 1;
  }
}

export function startMusic() {
  const context = ensureContext();
  if (!context || musicTimer) return;
  if (context.state === "suspended") context.resume();
  nextNoteTime = context.currentTime + 0.2;
  step = 0;
  musicGain.gain.cancelScheduledValues(context.currentTime);
  musicGain.gain.setValueAtTime(0.0001, context.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(0.5, context.currentTime + 3);
  scheduleMusic();
  musicTimer = window.setInterval(scheduleMusic, 350);
}

export function setMusicIntensity(level) {
  if (!ctx || !musicGain) return;
  musicGain.gain.setTargetAtTime(Math.max(0.0001, level), ctx.currentTime, 0.8);
}

export function stopMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicGain && ctx) {
    musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
  }
}

/* ------------------------------ efectos -------------------------- */

function blip({ freq = 880, type = "sine", dur = 0.25, gain = 0.22, slide = 0 }) {
  const context = ensureContext();
  if (!context || muted) return;
  if (context.state === "suspended") context.resume();
  const t = context.currentTime;
  const osc = context.createOscillator();
  const env = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env);
  env.connect(sfxGain);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noiseSweep({ dur = 0.5, from = 900, to = 2600, gain = 0.16 }) {
  const context = ensureContext();
  if (!context || muted) return;
  if (context.state === "suspended") context.resume();
  const t = context.currentTime;
  const frames = Math.floor(context.sampleRate * dur);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = context.createBufferSource();
  src.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const env = context.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(sfxGain);
  src.start(t);
  src.stop(t + dur);
}

export const sfx = {
  // "ten" corto al pasar por cada libro de la repisa.
  hover() {
    blip({ freq: 1318.51, type: "sine", dur: 0.3, gain: 0.13 });
    blip({ freq: 1975.53, type: "sine", dur: 0.22, gain: 0.05 });
  },
  // "tok" de madera + campanita al tocar una figura de la repisa.
  toy() {
    blip({ freq: 420, type: "triangle", dur: 0.09, gain: 0.16, slide: -180 });
    window.setTimeout(() => blip({ freq: 1567.98, type: "sine", dur: 0.26, gain: 0.08 }), 40);
  },
  land() {
    blip({ freq: 180, type: "triangle", dur: 0.16, gain: 0.18, slide: -90 });
    noiseSweep({ dur: 0.25, from: 600, to: 200, gain: 0.08 });
  },
  select() {
    blip({ freq: 659.25, dur: 0.16, gain: 0.16 });
    window.setTimeout(() => blip({ freq: 987.77, dur: 0.3, gain: 0.14 }), 90);
  },
  open() {
    noiseSweep({ dur: 0.62, from: 500, to: 2200, gain: 0.14 });
    window.setTimeout(() => blip({ freq: 523.25, dur: 0.5, gain: 0.12 }), 120);
  },
  page() {
    noiseSweep({ dur: 0.42, from: 1200, to: 400, gain: 0.17 });
  },
  star() {
    [1046.5, 1318.51, 1567.98].forEach((f, i) =>
      window.setTimeout(() => blip({ freq: f, dur: 0.34, gain: 0.13 }), i * 70),
    );
  },
  pin() {
    [1318.51, 1760, 2093].forEach((f, i) =>
      window.setTimeout(() => blip({ freq: f, dur: 0.28, gain: 0.12 }), i * 55),
    );
    noiseSweep({ dur: 0.5, from: 2600, to: 5200, gain: 0.06 });
  },
  right() {
    [659.25, 830.61, 1046.5, 1318.51].forEach((f, i) =>
      window.setTimeout(() => blip({ freq: f, dur: 0.3, gain: 0.12 }), i * 80),
    );
  },
  wrong() {
    blip({ freq: 300, type: "triangle", dur: 0.3, gain: 0.12, slide: -120 });
  },
  close() {
    noiseSweep({ dur: 0.5, from: 800, to: 260, gain: 0.14 });
  },
  cheer() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
      window.setTimeout(() => blip({ freq: f, dur: 0.44, gain: 0.13 }), i * 110),
    );
  },
};

/* ----------------------------- narración -------------------------- */

let currentUtterance = null;
let wordTimer = null;

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;
  const byLang = (tag) => voices.filter((v) => v.lang?.toLowerCase().startsWith(tag));
  const preferred = [
    ...byLang("es-pe"),
    ...byLang("es-419"),
    ...byLang("es-mx"),
    ...byLang("es-us"),
    ...byLang("es-cl"),
    ...byLang("es-co"),
    ...byLang("es"),
  ];
  const female = preferred.find((v) => /paulina|mónica|monica|luciana|sabina|helena|google/i.test(v.name));
  return female || preferred[0] || null;
}

export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech() {
  if (wordTimer) {
    window.clearInterval(wordTimer);
    wordTimer = null;
  }
  currentUtterance = null;
  if (speechAvailable()) window.speechSynthesis.cancel();
}

/**
 * Lee un texto en voz alta y va avisando qué palabra suena.
 * Usa los eventos `boundary` cuando el navegador los emite y, si no, avanza
 * con un temporizador calculado por número de sílabas.
 */
export function speak(text, { onWord, onEnd, rate = 0.86 } = {}) {
  if (!speechAvailable() || muted) {
    onEnd?.();
    return () => {};
  }
  stopSpeech();

  const words = text.split(/\s+/).filter(Boolean);
  const offsets = [];
  let cursor = 0;
  words.forEach((word) => {
    const at = text.indexOf(word, cursor);
    offsets.push(at);
    cursor = at + word.length;
  });

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "es-PE";
  utterance.rate = rate;
  utterance.pitch = 1.05;
  currentUtterance = utterance;

  let boundaryWorks = false;
  let index = 0;

  const advance = (next) => {
    index = next;
    onWord?.(next);
  };

  utterance.onboundary = (event) => {
    if (event.name && event.name !== "word") return;
    boundaryWorks = true;
    if (wordTimer) {
      window.clearInterval(wordTimer);
      wordTimer = null;
    }
    const at = event.charIndex;
    let found = 0;
    for (let i = 0; i < offsets.length; i += 1) {
      if (offsets[i] <= at) found = i;
      else break;
    }
    advance(found);
  };

  utterance.onend = () => {
    if (wordTimer) {
      window.clearInterval(wordTimer);
      wordTimer = null;
    }
    onWord?.(-1);
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = utterance.onend;

  // Reserva por si el navegador no emite `boundary` (pasa en varios Safari).
  const perWord = Math.max(230, (1000 / (rate * 3.1)) * 1.05);
  wordTimer = window.setInterval(() => {
    if (boundaryWorks) {
      window.clearInterval(wordTimer);
      wordTimer = null;
      return;
    }
    if (index + 1 >= words.length) return;
    advance(index + 1);
  }, perWord);

  advance(0);
  window.speechSynthesis.speak(utterance);

  return () => stopSpeech();
}

export function pauseSpeech() {
  if (!speechAvailable()) return;
  window.speechSynthesis.pause();
  if (wordTimer) {
    window.clearInterval(wordTimer);
    wordTimer = null;
  }
}

export function resumeSpeech() {
  if (!speechAvailable()) return;
  window.speechSynthesis.resume();
}

export function isSpeaking() {
  return speechAvailable() && window.speechSynthesis.speaking;
}

export function warmUpVoices() {
  if (!speechAvailable()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    window.speechSynthesis.getVoices();
  });
}

export function audioUnlocked() {
  return unlocked;
}
