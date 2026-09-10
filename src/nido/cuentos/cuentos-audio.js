// Sonido de la biblioteca: música de fondo generada por Web Audio (sin
// archivos externos), efectos cortos y narración con la voz de estudio grabada
// para el Nido (mp3 pregrabados con ElevenLabs; ver
// scripts/generate-nido-cuentos-voice.mjs). Si un clip no existe o no se
// puede descargar, se cae a la voz del navegador para no dejar mudo al lector.

import { wordIndexAt, wordKey } from "./cuentos-voice-plan.js";

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
  unlockNarrator();
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
  hover(key = "") {
    const color = [...String(key)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 7;
    const base = [880, 987.77, 1046.5, 1174.66, 1318.51, 1396.91, 1567.98][color];
    blip({ freq: base, type: "sine", dur: 0.28, gain: 0.12 });
    blip({ freq: base * 1.5, type: "sine", dur: 0.2, gain: 0.045 });
  },
  // "tok" de madera + campanita al tocar una figura de la repisa.
  toy(key = "") {
    const color = [...String(key)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
    const chime = [1174.66, 1318.51, 1396.91, 1567.98, 1760, 1975.53][color];
    blip({ freq: 380 + color * 34, type: "triangle", dur: 0.09, gain: 0.15, slide: -160 });
    window.setTimeout(() => blip({ freq: chime, type: "sine", dur: 0.26, gain: 0.075 }), 40);
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
//
// Dos capas. Primero la voz de estudio: un mp3 por página, pregunta, opción y
// palabra, servido como archivo estático y descrito en cuentos-manifest.json
// (las páginas traen el segundo en que empieza cada palabra, para subrayarla
// al ritmo real de la voz). Si el manifiesto no llegó, el clip no existe o
// no se puede descargar, se usa la voz del navegador de siempre. Las dos
// avisan qué palabra suena con onWord(índice) y terminan con onEnd().

const MANIFEST_URL = "/assets/nido/audio/cuentos-manifest.json";
const CLIP_CACHE_LIMIT = 16;
// Pequeño adelanto para que el subrayado no llegue tarde a la palabra.
const HIGHLIGHT_LEAD = 0.06;

let manifest = null;
let manifestPending = null;
let narrator = null;
let narratorUnlocked = false;
let silentClipUrl = null;
let frameTimer = 0;
let sequenceTimer = 0;
let resumeTick = null;
// Cada reproducción recibe un número; stopSpeech() lo sube y así los
// callbacks de una descarga o un clip anterior dejan de tener efecto.
let session = 0;
const clipCache = new Map();
const clipPending = new Map();

let currentUtterance = null;
let wordTimer = null;

/** Descarga el manifiesto una sola vez por sesión. Nunca rechaza. */
export function loadCuentosVoices() {
  if (manifest) return Promise.resolve(manifest);
  if (manifestPending) return manifestPending;
  if (typeof fetch !== "function") return Promise.resolve(null);
  manifestPending = fetch(MANIFEST_URL, { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      manifest = data && typeof data === "object" && data.books ? data : null;
      return manifest;
    })
    .catch(() => {
      // Sin red no se cachea el fallo: la próxima llamada vuelve a intentarlo.
      manifestPending = null;
      return null;
    });
  return manifestPending;
}

function trackUrl(fileName) {
  return fileName ? `${manifest?.base || ""}${fileName}` : null;
}

/** Clip de una página, con los tiempos de sus palabras. */
export function pageTrack(bookId, pageIndex) {
  const page = manifest?.books?.[bookId]?.pages?.[pageIndex];
  if (!page?.src) return null;
  return { src: trackUrl(page.src), words: Array.isArray(page.words) ? page.words : null, duration: page.duration };
}

/** Clip de una palabra suelta tocada en la página. */
export function wordTrack(token) {
  const key = wordKey(token);
  const fileName = key ? manifest?.words?.[key] : null;
  return fileName ? { src: trackUrl(fileName) } : null;
}

/**
 * Clips de una pregunta del quiz seguidos de sus opciones en el orden en que
 * se muestran (`optionOrder` trae los índices originales ya barajados).
 */
export function quizTracks(bookId, questionIndex, optionOrder = []) {
  const question = manifest?.books?.[bookId]?.quiz?.[questionIndex];
  if (!question) return [];
  const list = [];
  if (question.q) list.push({ src: trackUrl(question.q) });
  for (const index of optionOrder) {
    const fileName = question.a?.[index];
    if (fileName) list.push({ src: trackUrl(fileName) });
  }
  return list;
}

function ensureNarrator() {
  if (narrator) return narrator;
  if (typeof window === "undefined" || typeof window.Audio !== "function") return null;
  narrator = new window.Audio();
  narrator.preload = "auto";
  narrator.setAttribute("playsinline", "");
  return narrator;
}

// WAV mudo de 10 ms como blob (la CSP no admite data:). Reproducirlo dentro
// del primer gesto deja al elemento autorizado en iOS para los clips que
// lleguen después de una descarga.
function getSilentClipUrl() {
  if (silentClipUrl) return silentClipUrl;
  const sampleRate = 8000;
  const samples = 80;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const ascii = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, samples * 2, true);
  silentClipUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  return silentClipUrl;
}

function unlockNarrator() {
  const element = ensureNarrator();
  if (!element || narratorUnlocked) return;
  narratorUnlocked = true;
  try {
    element.src = getSilentClipUrl();
    const playing = element.play();
    if (playing?.then) playing.then(() => element.pause()).catch(() => {});
  } catch {
    // Sin permiso todavía: el primer clip real lo pedirá dentro de su gesto.
  }
}

function rememberClip(src, url) {
  clipCache.delete(src);
  clipCache.set(src, url);
  while (clipCache.size > CLIP_CACHE_LIMIT) {
    const [oldestSrc, oldestUrl] = clipCache.entries().next().value;
    clipCache.delete(oldestSrc);
    if (!narrator || narrator.src !== oldestUrl) URL.revokeObjectURL(oldestUrl);
  }
}

// Los clips se descargan enteros y se reproducen desde un blob: así Safari no
// pide rangos a medias y la página siguiente ya está lista al pasar de hoja.
function fetchClip(src) {
  if (clipCache.has(src)) {
    const url = clipCache.get(src);
    rememberClip(src, url);
    return Promise.resolve(url);
  }
  if (clipPending.has(src)) return clipPending.get(src);
  const pending = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      rememberClip(src, url);
      return url;
    })
    .finally(() => clipPending.delete(src));
  clipPending.set(src, pending);
  return pending;
}

/** Adelanta la descarga de clips (página actual y siguiente, quiz). */
export function prefetchTracks(tracks) {
  if (typeof fetch !== "function") return;
  for (const track of tracks || []) {
    if (track?.src) fetchClip(track.src).catch(() => {});
  }
}

function stopFrameLoop() {
  if (frameTimer) {
    window.cancelAnimationFrame(frameTimer);
    frameTimer = 0;
  }
  resumeTick = null;
}

function playRecorded(track, { onWord, onEnd }, mySession) {
  const element = ensureNarrator();
  if (!element) return Promise.reject(new Error("sin reproductor"));
  return fetchClip(track.src).then((url) => {
    if (mySession !== session) return;
    const starts = Array.isArray(track.words) && track.words.length ? track.words : null;
    element.onended = null;
    element.onerror = null;
    element.src = url;
    element.playbackRate = 1;
    element.currentTime = 0;

    let index = -1;
    const tick = () => {
      if (mySession !== session) return;
      if (starts && onWord) {
        const next = wordIndexAt(starts, element.currentTime + HIGHLIGHT_LEAD);
        if (next !== index) {
          index = next;
          onWord(next);
        }
      }
      frameTimer = window.requestAnimationFrame(tick);
    };
    const finish = () => {
      if (mySession !== session) return;
      stopFrameLoop();
      element.onended = null;
      element.onerror = null;
      onWord?.(-1);
      onEnd?.();
    };

    // Hasta que play() resuelva, un fallo (clip ilegible, autoplay bloqueado)
    // llega como rechazo y quien llama decide el respaldo; los manejadores se
    // enganchan después para no acabar la lectura dos veces.
    return Promise.resolve(element.play()).then(() => {
      if (mySession !== session) return;
      element.onended = finish;
      element.onerror = finish;
      if (element.ended) {
        finish();
        return;
      }
      if (starts && onWord) {
        resumeTick = tick;
        tick();
      }
    });
  });
}

function browserSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Hay alguna voz: la de estudio (cualquier navegador con <audio>) o la del sistema. */
export function speechAvailable() {
  return typeof window !== "undefined" && (typeof window.Audio === "function" || browserSpeechAvailable());
}

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

export function stopSpeech() {
  session += 1;
  if (wordTimer) {
    window.clearInterval(wordTimer);
    wordTimer = null;
  }
  if (sequenceTimer) {
    window.clearTimeout(sequenceTimer);
    sequenceTimer = 0;
  }
  if (typeof window !== "undefined") stopFrameLoop();
  currentUtterance = null;
  if (narrator) {
    narrator.onended = null;
    narrator.onerror = null;
    if (!narrator.paused) narrator.pause();
  }
  if (browserSpeechAvailable()) window.speechSynthesis.cancel();
}

/**
 * Respaldo con la voz del navegador. Va avisando qué palabra suena con los
 * eventos `boundary` cuando el navegador los emite y, si no, con un
 * temporizador calculado por número de sílabas.
 */
function speakWithBrowser(text, { onWord, onEnd, rate = 0.86 }, mySession) {
  if (!browserSpeechAvailable()) {
    onEnd?.();
    return;
  }

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
    if (mySession !== session) return;
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
    if (mySession !== session) return;
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
}

/**
 * Lee un texto en voz alta. Con `track` (ver pageTrack / wordTrack) suena el
 * clip de estudio y el subrayado sigue sus marcas de tiempo; sin él, o si el
 * clip falla, habla el navegador. Devuelve una función para detenerlo.
 */
export function speak(text, { track = null, onWord, onEnd, rate = 0.86 } = {}) {
  if (typeof window === "undefined" || muted) {
    onEnd?.();
    return () => {};
  }
  stopSpeech();
  const mySession = session;
  if (track?.src && ensureNarrator()) {
    playRecorded(track, { onWord, onEnd }, mySession).catch(() => {
      if (mySession !== session) return;
      speakWithBrowser(text, { onWord, onEnd, rate }, mySession);
    });
  } else {
    speakWithBrowser(text, { onWord, onEnd, rate }, mySession);
  }
  return () => {
    if (mySession === session) stopSpeech();
  };
}

/**
 * Encadena varios clips de estudio con una pausa corta entre ellos (la
 * pregunta del quiz y sus opciones). Un clip que falle se salta.
 */
export function speakSequence(tracks, { onEnd, gap = 420 } = {}) {
  const list = (tracks || []).filter((track) => track?.src);
  if (typeof window === "undefined" || muted || !list.length || !ensureNarrator()) {
    onEnd?.();
    return () => {};
  }
  stopSpeech();
  const mySession = session;
  prefetchTracks(list.slice(1));
  const playAt = (position) => {
    if (mySession !== session) return;
    if (position >= list.length) {
      onEnd?.();
      return;
    }
    const next = () => {
      if (mySession !== session) return;
      sequenceTimer = window.setTimeout(() => playAt(position + 1), gap);
    };
    playRecorded(list[position], { onEnd: next }, mySession).catch(next);
  };
  playAt(0);
  return () => {
    if (mySession === session) stopSpeech();
  };
}

export function pauseSpeech() {
  if (typeof window === "undefined") return;
  if (narrator && !narrator.paused) narrator.pause();
  if (frameTimer) {
    window.cancelAnimationFrame(frameTimer);
    frameTimer = 0;
  }
  if (browserSpeechAvailable()) window.speechSynthesis.pause();
  if (wordTimer) {
    window.clearInterval(wordTimer);
    wordTimer = null;
  }
}

export function resumeSpeech() {
  if (typeof window === "undefined") return;
  if (narrator && narrator.paused && narrator.src && !narrator.ended && narrator.currentTime > 0) {
    const playing = narrator.play();
    if (playing?.catch) playing.catch(() => {});
    if (resumeTick && !frameTimer) resumeTick();
  }
  if (browserSpeechAvailable()) window.speechSynthesis.resume();
}

export function isSpeaking() {
  const recorded = Boolean(narrator && narrator.src && !narrator.paused && !narrator.ended);
  return recorded || (browserSpeechAvailable() && window.speechSynthesis.speaking);
}

export function warmUpVoices() {
  loadCuentosVoices();
  if (!browserSpeechAvailable()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    window.speechSynthesis.getVoices();
  });
}

export function audioUnlocked() {
  return unlocked;
}
