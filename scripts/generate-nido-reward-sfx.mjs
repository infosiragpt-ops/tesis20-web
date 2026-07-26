// Sintetiza los dos sonidos de recompensa de Nido y los deja en
// `public/assets/nido/audio`. No descarga nada: cada muestra sale de este
// archivo, así que el resultado es reproducible byte a byte y no depende de
// ninguna licencia ajena.
//
//   npm run audio:premios
//
// El efecto anterior (`success-tiriri-yupi-v1.mp3`) llevaba una voz diciendo
// «yupi» pegada al final del arpegio: se oía en los 31 740 retos del currículo
// y era lo último que sonaba al cerrar una ruta, porque la pantalla de premio
// no tenía sonido propio. Aquí se sustituye por un premio instrumental y se
// añade la fanfarria que faltaba para el final de partida.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "public", "assets", "nido", "audio");
const SAMPLE_RATE = 48_000;

// Notas por nombre para que las progresiones se lean como música y no como
// una lista de frecuencias sueltas.
const NOTE = Object.freeze({
  C3: 130.81, C4: 261.63, E4: 329.63, G4: 392.0,
  C5: 523.25, D5: 587.33, E5: 659.26, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.0,
  C7: 2093.0, D7: 2349.32, E7: 2637.02, G7: 3135.96, A7: 3520.0,
  C8: 4186.01,
});

// Generador congruencial: los adornos «al azar» tienen que caer siempre en el
// mismo sitio o cada regeneración daría un archivo distinto.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createBuffer(seconds, channels) {
  const length = Math.ceil(seconds * SAMPLE_RATE);
  return {
    channels,
    length,
    data: Array.from({ length: channels }, () => new Float64Array(length)),
  };
}

// Reparto de potencia constante: al mover un adorno a un lado no debe bajar el
// volumen percibido del conjunto.
function panGains(buffer, pan) {
  if (buffer.channels === 1) return [1];
  const angle = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

function addSample(buffer, index, value, gains) {
  if (index < 0 || index >= buffer.length) return;
  for (let channel = 0; channel < buffer.channels; channel += 1) {
    buffer.data[channel][index] += value * gains[channel];
  }
}

// Campana aditiva. Las parciales inarmónicas (4.2, 5.4) son lo que separa un
// «premio» de un pitido de interfaz, y las agudas se apagan antes que la
// fundamental porque así se comportan los cuerpos que resuenan de verdad.
const BELL_PARTIALS = Object.freeze([
  [1, 1], [2, 0.42], [3, 0.2], [4.2, 0.09], [5.4, 0.05],
]);

function bell(buffer, { at, freq, dur, amp, pan = 0 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  const attack = Math.max(1, Math.round(0.004 * SAMPLE_RATE));
  for (const [ratio, partialAmp] of BELL_PARTIALS) {
    const tau = (dur * 0.9) / Math.sqrt(ratio);
    const omega = 2 * Math.PI * freq * ratio;
    for (let n = 0; n < total; n += 1) {
      const t = n / SAMPLE_RATE;
      const attackGain = n < attack ? n / attack : 1;
      const value =
        Math.sin(omega * t) * Math.exp(-t / tau) * attackGain * amp * partialAmp;
      addSample(buffer, start + n, value, gains);
    }
  }
}

// Metal de fanfarria: armónicos 1..7 con caída 1/n^1.15 y un ataque corto pero
// no instantáneo, que es lo que da el empuje de trompeta sin sonar a sierra.
function brass(buffer, { at, freq, dur, amp, pan = 0, sustain = 0.35 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  const attack = Math.max(1, Math.round(0.018 * SAMPLE_RATE));
  const release = Math.max(1, Math.round(dur * (1 - sustain) * SAMPLE_RATE));
  const holdEnd = total - release;
  for (let n = 0; n < total; n += 1) {
    const t = n / SAMPLE_RATE;
    let envelope;
    if (n < attack) envelope = n / attack;
    else if (n < holdEnd) envelope = 1 - 0.25 * ((n - attack) / Math.max(1, holdEnd - attack));
    else envelope = 0.75 * Math.exp(-(n - holdEnd) / (release * 0.36));
    let value = 0;
    for (let harmonic = 1; harmonic <= 7; harmonic += 1) {
      // Un poco de vibrato en las parciales altas: sin él, el acorde sostenido
      // se congela y delata que es sintético.
      const detune = harmonic > 3 ? 1 + 0.0016 * Math.sin(2 * Math.PI * 5.2 * t) : 1;
      value +=
        Math.sin(2 * Math.PI * freq * harmonic * detune * t) /
        Math.pow(harmonic, 1.15);
    }
    addSample(buffer, start + n, value * 0.34 * envelope * amp, gains);
  }
}

function pad(buffer, { at, freq, dur, amp, pan = 0 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  const attack = Math.max(1, Math.round(0.05 * SAMPLE_RATE));
  const tau = dur * 0.45;
  for (let n = 0; n < total; n += 1) {
    const t = n / SAMPLE_RATE;
    const envelope = (n < attack ? n / attack : 1) * Math.exp(-t / tau);
    addSample(buffer, start + n, Math.sin(2 * Math.PI * freq * t) * envelope * amp, gains);
  }
}

// Ruido filtrado con corte móvil (un polo). Sirve para el barrido de subida y
// para el estallido: la misma herramienta, recorrida en sentidos opuestos.
function noiseSweep(buffer, { at, dur, amp, fromHz, toHz, shape = 1, random, pan = 0 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  let previous = 0;
  for (let n = 0; n < total; n += 1) {
    const progress = n / total;
    const cutoff = fromHz * Math.pow(toHz / fromHz, progress);
    const coefficient = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
    previous += coefficient * ((random() * 2 - 1) - previous);
    const envelope = Math.pow(progress, shape) * Math.pow(1 - progress, 0.25);
    addSample(buffer, start + n, previous * envelope * amp, gains);
  }
}

function noiseHit(buffer, { at, dur, amp, fromHz, toHz, decay = 5.5, random, pan = 0 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  let previous = 0;
  for (let n = 0; n < total; n += 1) {
    const progress = n / total;
    const cutoff = fromHz * Math.pow(toHz / fromHz, progress);
    const coefficient = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
    previous += coefficient * ((random() * 2 - 1) - previous);
    addSample(buffer, start + n, previous * Math.exp(-progress * decay) * amp, gains);
  }
}

function sineGlide(buffer, { at, dur, amp, fromHz, toHz, pan = 0 }) {
  const gains = panGains(buffer, pan);
  const start = Math.round(at * SAMPLE_RATE);
  const total = Math.round(dur * SAMPLE_RATE);
  let phase = 0;
  for (let n = 0; n < total; n += 1) {
    const progress = n / total;
    const freq = fromHz * Math.pow(toHz / fromHz, progress);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const envelope = Math.pow(progress, 1.6) * Math.pow(1 - progress, 0.4);
    addSample(buffer, start + n, Math.sin(phase) * envelope * amp, gains);
  }
}

// Nube de confeti: campanitas cortas repartidas por el estéreo. Es el adorno
// que convierte un acorde en una fiesta.
function sparkleCloud(buffer, { from, to, count, notes, amp, random, spread = 0.75 }) {
  for (let index = 0; index < count; index += 1) {
    const at = from + (to - from) * random();
    const progress = (at - from) / Math.max(0.001, to - from);
    bell(buffer, {
      at,
      freq: notes[Math.floor(random() * notes.length)],
      dur: 0.28,
      amp: amp * (1 - 0.55 * progress),
      pan: (random() * 2 - 1) * spread,
    });
  }
}

function fadeOut(buffer, seconds) {
  const total = Math.round(seconds * SAMPLE_RATE);
  for (let n = 0; n < total; n += 1) {
    const gain = 0.5 * (1 + Math.cos((Math.PI * n) / total));
    const index = buffer.length - total + n;
    for (let channel = 0; channel < buffer.channels; channel += 1) {
      buffer.data[channel][index] *= gain;
    }
  }
}

// Masterización: rodilla suave, filtro de brillo y pico común.
//
// El orden importa. Saturar antes de normalizar era el error de la primera
// versión: los picos del ruido llegaban muy por encima de 1, la `tanh` los
// aplastaba y la intermodulación resultante llenaba de siseo todo el espectro.
// Ahora se baja primero, la rodilla solo toca el tramo alto y un polo a 15 kHz
// se lleva el brillo que el mp3 pagaría caro sin que nadie lo oiga.
function finalize(buffer, peak = 0.89) {
  let maximum = 0;
  for (const channel of buffer.data) {
    for (const value of channel) maximum = Math.max(maximum, Math.abs(value));
  }
  if (maximum === 0) return;

  const preGain = 0.78 / maximum;
  const knee = 0.62;
  const coefficient = 1 - Math.exp((-2 * Math.PI * 15_000) / SAMPLE_RATE);
  let peaked = 0;
  for (const channel of buffer.data) {
    let previous = 0;
    for (let n = 0; n < channel.length; n += 1) {
      const value = channel[n] * preGain;
      const magnitude = Math.abs(value);
      const shaped =
        magnitude < knee
          ? value
          : Math.sign(value) *
            (knee + (1 - knee) * Math.tanh((magnitude - knee) / (1 - knee)));
      previous += coefficient * (shaped - previous);
      channel[n] = previous;
      peaked = Math.max(peaked, Math.abs(previous));
    }
  }

  const gain = peak / peaked;
  for (const channel of buffer.data) {
    for (let n = 0; n < channel.length; n += 1) channel[n] *= gain;
  }
}

function toWav(buffer) {
  const { channels, length } = buffer;
  const bytesPerSample = 2;
  const dataBytes = length * channels * bytesPerSample;
  const wav = Buffer.alloc(44 + dataBytes);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + dataBytes, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE * channels * bytesPerSample, 28);
  wav.writeUInt16LE(channels * bytesPerSample, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(dataBytes, 40);
  let offset = 44;
  for (let n = 0; n < length; n += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const value = Math.max(-1, Math.min(1, buffer.data[channel][n]));
      wav.writeInt16LE(Math.round(value * 32767), offset);
      offset += 2;
    }
  }
  return wav;
}

// ─────────────────────────────────────────────────────────────────────────────
// El premio de cada acierto: 1,1 s. Tiene que poder sonar cientos de veces
// seguidas sin cansar, así que es corto, sin voz y sin cola larga.
function buildRewardChime() {
  const random = createRandom(0x5eed_1a2b);
  const buffer = createBuffer(1.12, 1);

  const arpeggio = [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7];
  arpeggio.forEach((freq, index) => {
    bell(buffer, {
      at: index * 0.055,
      freq,
      dur: 0.72,
      amp: 0.3 - index * 0.018,
    });
  });

  // Cuerpo cálido bajo el arpegio: sin él la campana suena a notificación de
  // móvil; con él suena a algo ganado.
  for (const freq of [NOTE.C5, NOTE.E5, NOTE.G5]) {
    pad(buffer, { at: 0.17, freq, dur: 0.62, amp: 0.085 });
  }

  sparkleCloud(buffer, {
    from: 0.2,
    to: 0.86,
    count: 12,
    notes: [NOTE.C7, NOTE.D7, NOTE.E7, NOTE.G7, NOTE.A7, NOTE.C8],
    amp: 0.06,
    random,
  });

  fadeOut(buffer, 0.14);
  finalize(buffer, 0.86);
  return buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// El final de partida: 2,95 s. Subida, estallido, fanfarria I–V–I y confeti.
// Suena una sola vez por ruta, así que aquí sí cabe el despliegue completo.
function buildVictoryFanfare() {
  const random = createRandom(0x1337_c0de);
  const buffer = createBuffer(2.95, 2);

  // Subida: el estallido no emociona si no hay algo que lo anuncie. Va bajo y
  // corta en 7,5 kHz porque el barrido debe empujar a la fanfarria, no taparla;
  // con el nivel de la primera versión el ruido se comía los dos acordes.
  noiseSweep(buffer, {
    at: 0,
    dur: 0.62,
    amp: 0.075,
    fromHz: 300,
    toHz: 7500,
    shape: 3,
    random,
  });
  sineGlide(buffer, { at: 0.05, dur: 0.57, amp: 0.075, fromHz: 180, toHz: 760 });

  // Estallido de confeti + golpe grave que le da cuerpo.
  noiseHit(buffer, {
    at: 0.6,
    dur: 0.34,
    amp: 0.19,
    fromHz: 6000,
    toHz: 700,
    decay: 7,
    random,
  });
  pad(buffer, { at: 0.6, freq: 82.41, dur: 0.42, amp: 0.2 });

  const CHORDS = [
    { at: 0.62, dur: 0.28, notes: [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6] },
    { at: 0.9, dur: 0.28, notes: [NOTE.D5, NOTE.G5, NOTE.B5, NOTE.D6] },
    { at: 1.18, dur: 1.5, notes: [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6] },
  ];
  CHORDS.forEach((chord, chordIndex) => {
    chord.notes.forEach((freq, noteIndex) => {
      brass(buffer, {
        at: chord.at,
        freq,
        dur: chord.dur,
        amp: 0.2,
        sustain: chordIndex === 2 ? 0.2 : 0.4,
        // Abrir el acorde en el estéreo lo hace sonar a grupo, no a teclado.
        pan: ((noteIndex / Math.max(1, chord.notes.length - 1)) * 2 - 1) * 0.5,
      });
    });
  });

  // Brillo encima del acorde final y colchón debajo.
  [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7].forEach((freq, index) => {
    bell(buffer, { at: 1.18 + index * 0.03, freq, dur: 1.6, amp: 0.1, pan: index % 2 ? 0.4 : -0.4 });
  });
  for (const freq of [NOTE.C3, NOTE.C4, NOTE.G4]) {
    pad(buffer, { at: 1.18, freq, dur: 1.7, amp: 0.06 });
  }

  sparkleCloud(buffer, {
    from: 1.2,
    to: 2.65,
    count: 30,
    notes: [NOTE.A5, NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6, NOTE.A6, NOTE.C7, NOTE.E7, NOTE.G7],
    amp: 0.085,
    random,
  });

  fadeOut(buffer, 0.26);
  finalize(buffer, 0.9);
  return buffer;
}

// El objetivo en LUFS iguala lo que ya sonaba (-17,5 del efecto anterior) para
// que nadie tenga que tocar el volumen del dispositivo al actualizar.
function measureLoudness(file) {
  // ffmpeg escribe el informe de `ebur128` en stderr, no en stdout.
  const { stderr } = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const match = stderr?.match(/I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/g);
  if (!match) throw new Error(`ffmpeg no devolvió la sonoridad de ${file}`);
  return Number.parseFloat(match.at(-1).match(/(-?\d+(?:\.\d+)?)/)[1]);
}

async function render({ fileName, buffer, targetLufs }) {
  const workDir = await mkdtemp(path.join(tmpdir(), "nido-sfx-"));
  const wavPath = path.join(workDir, "source.wav");
  const outputPath = path.join(AUDIO_DIR, fileName);
  try {
    await writeFile(wavPath, toWav(buffer));
    // Ganancia estática a partir de la medición, no `loudnorm` dinámico: en
    // efectos de un segundo el compresor de loudnorm se oye bombear.
    const measured = measureLoudness(wavPath);
    const gain = (targetLufs - measured).toFixed(2);
    execFileSync(
      "ffmpeg",
      [
        "-hide_banner", "-loglevel", "error", "-y",
        "-i", wavPath,
        "-af", `volume=${gain}dB,alimiter=limit=0.891:level=disabled`,
        "-ar", String(SAMPLE_RATE),
        "-b:a", "128k",
        outputPath,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
    const finalLufs = measureLoudness(outputPath);
    return { outputPath, finalLufs };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

const TRACKS = [
  { fileName: "success-premio-v2.mp3", build: buildRewardChime, targetLufs: -17.5 },
  { fileName: "victory-fanfarria-v1.mp3", build: buildVictoryFanfare, targetLufs: -16 },
];

for (const track of TRACKS) {
  const { outputPath, finalLufs } = await render({
    fileName: track.fileName,
    buffer: track.build(),
    targetLufs: track.targetLufs,
  });
  const { size } = await import("node:fs").then(({ statSync }) => statSync(outputPath));
  console.log(
    `✓ ${track.fileName}  ${(size / 1024).toFixed(1)} KB  ${finalLufs.toFixed(1)} LUFS`,
  );
}
