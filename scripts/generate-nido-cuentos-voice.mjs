// Narración de la biblioteca de cuentos de /nido con ElevenLabs.
//
// Graba una locución por página (con marcas de tiempo por palabra para el
// subrayado del lector), una por pregunta y opción del quiz y una por palabra
// distinta, con la misma voz de estudio que ya narra los juegos («Jhenny»).
// Los mp3 se nombran por el hash de su contenido y ajustes, se nivelan a
// -16 LUFS con ffmpeg y se sirven como archivos estáticos: la clave de la API
// nunca llega al navegador. Comparte criterio con
// scripts/generate-nido-elevenlabs-voice.mjs, pero escribe un manifiesto
// aparte (cuentos-manifest.json) para no mezclar catálogos.
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { BOOKS } from "../src/nido/cuentos/cuentos-data.js";
import {
  enumerateCuentosVoicePlan,
  estimateWordStarts,
  wordStartsFromAlignment,
} from "../src/nido/cuentos/cuentos-voice-plan.js";

const ROOT = process.cwd();
const AUDIO_ROOT = path.join(ROOT, "public", "assets", "nido", "audio");
const OUTPUT_DIR = path.join(AUDIO_ROOT, "cuentos");
const MANIFEST_PATH = path.join(AUDIO_ROOT, "cuentos-manifest.json");
const PUBLIC_BASE = "/assets/nido/audio/cuentos/";
const PROVIDER = "elevenlabs";
const GENERATOR_VERSION = "nido-cuentos-v1";
const MODEL = process.env.NIDO_TTS_MODEL || "eleven_multilingual_v2";
// La misma voz que narra los juegos: los niños oyen una sola maestra en todo
// el Nido.
const VOICE = process.env.NIDO_TTS_VOICE || "EDitztUwd7lban76PAZs";
const VOICE_NAME = process.env.NIDO_TTS_VOICE_NAME || "Jhenny Cozy";
const CONCURRENCY = Math.max(1, Math.min(4, Number.parseInt(process.env.NIDO_TTS_CONCURRENCY || "3", 10)));
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504, 524, 529]);
const MAX_ATTEMPTS = 5;
const LOUDNESS_FILTER = "loudnorm=I=-16:TP=-1.5:LRA=11";
const OUTPUT_BITRATE = "64k";

// Los ajustes entran en el hash del archivo: cambiar un perfil regraba solo
// las locuciones de ese perfil, y nunca deja mp3 viejos dándose por buenos.
const PROFILES = Object.freeze({
  // Cuentacuentos: un punto más estable que la maestra de los juegos porque
  // son párrafos, no consignas, y a 0,9 para que los de tres años sigan el
  // subrayado.
  narracion: { speed: 0.9, stability: 0.45, similarityBoost: 0.75, style: 0.4 },
  pregunta: { speed: 0.92, stability: 0.5, similarityBoost: 0.75, style: 0.35 },
  // Palabra suelta: más lenta y con menos «actuación» para que se entienda
  // cada sílaba.
  palabra: { speed: 0.85, stability: 0.6, similarityBoost: 0.75, style: 0.25 },
});

function getApiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  if (process.platform === "darwin") {
    try {
      return execFileSync(
        "security",
        ["find-generic-password", "-a", process.env.USER, "-s", "tesis20-elevenlabs-api-key", "-w"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
    } catch {
      // Se informa abajo sin imprimir detalles del llavero.
    }
  }
  throw new Error("Falta ELEVENLABS_API_KEY o la entrada segura tesis20-elevenlabs-api-key del llavero.");
}

function getAudioHash(job) {
  const profile = PROFILES[job.profile];
  return createHash("sha256")
    .update([GENERATOR_VERSION, MODEL, VOICE, job.profile, JSON.stringify(profile), job.text].join("\n"), "utf8")
    .digest("hex")
    .slice(0, 28);
}

function getSeed(hash) {
  return Number.parseInt(hash.slice(0, 8), 16) % 4_294_967_295;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  const retryAfter = Number.parseFloat(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 30_000);
  return Math.min(1_000 * 2 ** (attempt - 1), 20_000);
}

async function isUsableAudio(filePath) {
  try {
    return (await stat(filePath)).size >= 1_000;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function probeDuration(filePath) {
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  );
  if (probe.error?.code === "ENOENT") {
    throw new Error("Falta ffprobe: es obligatorio para verificar las locuciones.");
  }
  if (probe.status !== 0) return null;
  const duration = Number.parseFloat(probe.stdout.trim());
  return Number.isFinite(duration) ? duration : null;
}

function normalizeLoudness(sourcePath, targetPath) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-v", "error", "-y", "-i", sourcePath,
      "-af", LOUDNESS_FILTER,
      "-ar", "44100", "-ac", "1",
      "-codec:a", "libmp3lame", "-b:a", OUTPUT_BITRATE,
      "-map_metadata", "-1",
      // El destino es «.mp3.part»: hay que declarar el formato.
      "-f", "mp3", targetPath,
    ],
    { encoding: "utf8" },
  );
  if (result.error?.code === "ENOENT") {
    throw new Error("Falta ffmpeg: es obligatorio para nivelar la sonoridad de las locuciones.");
  }
  if (result.status !== 0) {
    throw new Error(`ffmpeg no pudo normalizar ${path.basename(sourcePath)}: ${result.stderr.trim().slice(0, 200)}`);
  }
}

async function requestSpeech(apiKey, job, hash) {
  const profile = PROFILES[job.profile];
  const endpoint = job.timestamps
    ? `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`
    : `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          Accept: job.timestamps ? "application/json" : "audio/mpeg",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: job.text,
          model_id: MODEL,
          seed: getSeed(hash),
          voice_settings: {
            stability: profile.stability,
            similarity_boost: profile.similarityBoost,
            style: profile.style,
            use_speaker_boost: true,
            speed: profile.speed,
          },
        }),
        signal: AbortSignal.timeout(90_000),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`No se pudo conectar con ElevenLabs para ${job.key}: ${error.name}.`);
      await wait(Math.min(1_000 * 2 ** (attempt - 1), 20_000));
      continue;
    }
    if (!response.ok) {
      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_ATTEMPTS) {
        await wait(retryDelay(response, attempt));
        continue;
      }
      const detail = (await response.text()).slice(0, 200);
      throw new Error(`ElevenLabs rechazó ${job.key} con HTTP ${response.status}: ${detail}`);
    }
    if (job.timestamps) {
      const payload = await response.json();
      if (!payload?.audio_base64) throw new Error(`ElevenLabs no devolvió audio para ${job.key}.`);
      return { audio: Buffer.from(payload.audio_base64, "base64"), alignment: payload.alignment ?? null };
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("audio/")) throw new Error(`ElevenLabs no devolvió audio para ${job.key}.`);
    return { audio: Buffer.from(await response.arrayBuffer()), alignment: null };
  }
  throw new Error(`No se pudo generar ${job.key}.`);
}

/**
 * Deja en disco `<hash>.mp3` y, para las páginas, `<hash>.json` con el inicio
 * de cada palabra. Devuelve los metadatos que irán al manifiesto.
 */
async function synthesize(apiKey, job) {
  const hash = getAudioHash(job);
  const fileName = `${hash}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  const sidecarPath = path.join(OUTPUT_DIR, `${hash}.json`);

  if (await isUsableAudio(outputPath)) {
    const sidecar = job.timestamps ? await readJson(sidecarPath) : null;
    if (!job.timestamps || (sidecar && Array.isArray(sidecar.words) && Number.isFinite(sidecar.duration))) {
      return { status: "cached", hash, fileName, meta: sidecar };
    }
  }

  const { audio, alignment } = await requestSpeech(apiKey, job, hash);
  if (audio.length < 1_000) throw new Error(`ElevenLabs devolvió un audio vacío para ${job.key}.`);

  const rawPath = `${outputPath}.raw`;
  const temporaryPath = `${outputPath}.part`;
  await writeFile(rawPath, audio);
  let meta = null;
  try {
    normalizeLoudness(rawPath, temporaryPath);
    const duration = probeDuration(temporaryPath);
    const minimum = job.kind === "word" ? 0.25 : 0.6;
    if (duration === null || duration < minimum || duration > 90) {
      throw new Error(`ffprobe rechazó el audio generado para ${job.key} (${duration ?? "sin"} s).`);
    }
    if (job.timestamps) {
      let words = wordStartsFromAlignment(job.text, alignment);
      let source = "alignment";
      if (!words) {
        // Sin alineación fiable el subrayado se reparte por letras; queda
        // anotado para poder regrabar la página si se nota.
        words = estimateWordStarts(job.text, duration);
        source = "estimated";
      }
      meta = { duration: Math.round(duration * 100) / 100, words, source };
      await writeFile(sidecarPath, `${JSON.stringify(meta)}\n`);
    }
    await rename(temporaryPath, outputPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  } finally {
    await unlink(rawPath).catch(() => {});
  }
  return { status: "generated", hash, fileName, meta };
}

async function runPool(items, worker, concurrency) {
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

function buildManifest(results) {
  const books = {};
  const words = {};
  for (const { job, fileName, meta } of results) {
    if (job.kind === "word") {
      words[job.wordKey] = fileName;
      continue;
    }
    const book = (books[job.bookId] ??= { pages: [], quiz: [] });
    if (job.kind === "page") {
      book.pages[job.index] = { src: fileName, duration: meta.duration, words: meta.words };
    } else {
      const question = (book.quiz[job.index] ??= { q: null, a: [] });
      if (job.kind === "quiz-q") question.q = fileName;
      else question.a[job.optionIndex] = fileName;
    }
  }
  return {
    version: 1,
    provider: PROVIDER,
    model: MODEL,
    voiceId: VOICE,
    voiceName: VOICE_NAME,
    generatorVersion: GENERATOR_VERSION,
    generatedAt: new Date().toISOString(),
    delivery: "local-prerecorded",
    loudness: LOUDNESS_FILTER,
    fallbackProvider: "browser-speech-synthesis",
    profiles: PROFILES,
    base: PUBLIC_BASE,
    books,
    words,
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const jobs = enumerateCuentosVoicePlan(BOOKS);
  // Varias opciones del quiz repiten texto: se graban una vez y comparten mp3.
  const byHash = new Map();
  for (const job of jobs) {
    const hash = getAudioHash(job);
    if (!byHash.has(hash)) byHash.set(hash, { hash, job, ids: [] });
    byHash.get(hash).ids.push(job.key);
  }
  const unique = [...byHash.values()];
  const totalCharacters = unique.reduce((sum, item) => sum + item.job.text.length, 0);

  if (process.env.NIDO_TTS_PLAN_ONLY === "1") {
    const pending = [];
    for (const item of unique) {
      if (!(await isUsableAudio(path.join(OUTPUT_DIR, `${item.hash}.mp3`)))) pending.push(item);
    }
    const pendingCharacters = pending.reduce((sum, item) => sum + item.job.text.length, 0);
    console.log(
      `Plan: ${jobs.length} locuciones (${unique.length} únicas, ${totalCharacters} caracteres).\n` +
        `Pendientes de grabar: ${pending.length} audios, ${pendingCharacters} caracteres.`,
    );
    if (pending.length) console.log(`Ejemplo pendiente: «${pending[0].job.text}»`);
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY está vacía.");

  const limit = Number.parseInt(process.env.NIDO_TTS_LIMIT || "0", 10);
  const isRehearsal = Number.isFinite(limit) && limit > 0;
  const batch = isRehearsal ? unique.slice(0, limit) : unique;
  console.log(
    `Voz de cuentos (${VOICE_NAME}/${MODEL}): ${jobs.length} locuciones, ${batch.length} audios únicos, ${batch.reduce((sum, item) => sum + item.job.text.length, 0)} caracteres, concurrencia ${CONCURRENCY}.`,
  );

  const outcomes = new Map();
  const failures = [];
  let generated = 0;
  let cached = 0;
  await runPool(
    batch,
    async (item) => {
      try {
        const result = await synthesize(apiKey, item.job);
        outcomes.set(item.hash, result);
        if (result.status === "generated") generated += 1;
        else cached += 1;
        const done = generated + cached;
        if (done % 50 === 0 || done === batch.length) console.log(`[${done}/${batch.length}] ${item.job.key}`);
      } catch (error) {
        failures.push(`${item.job.key}: ${error.message}`);
        console.error(`fallo ${item.job.key}: ${error.message}`);
      }
    },
    CONCURRENCY,
  );

  if (failures.length) {
    throw new Error(
      `${failures.length} locuciones no se pudieron generar; el manifiesto no se ha tocado.\n${failures.slice(0, 5).join("\n")}`,
    );
  }
  if (isRehearsal) {
    console.log(`Ensayo de ${batch.length} locuciones terminado; el manifiesto queda intacto.`);
    return;
  }

  const results = [];
  for (const job of jobs) {
    const outcome = outcomes.get(getAudioHash(job));
    results.push({ job, fileName: outcome.fileName, meta: outcome.meta });
  }
  const manifest = buildManifest(results);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest)}\n`);

  const planned = new Set();
  for (const item of unique) {
    planned.add(`${item.hash}.mp3`);
    planned.add(`${item.hash}.json`);
  }
  const obsolete = (await readdir(OUTPUT_DIR)).filter((name) => /\.(?:mp3|json|part|raw)$/.test(name) && !planned.has(name));
  await Promise.all(obsolete.map((name) => unlink(path.join(OUTPUT_DIR, name))));

  const estimated = results.filter(({ meta }) => meta?.source === "estimated").map(({ job }) => job.key);
  console.log(
    `Manifiesto de cuentos actualizado: ${generated} generados, ${cached} reutilizados, ${obsolete.length} obsoletos retirados, ${Object.keys(manifest.books).length} libros y ${Object.keys(manifest.words).length} palabras.` +
      (estimated.length ? `\nSin alineación fiable (subrayado estimado): ${estimated.join(", ")}` : ""),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
