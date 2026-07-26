// Narración profesional del Nido con ElevenLabs.
//
// Sustituye al generador de OpenRouter: misma planificación (un audio por
// texto+edad, nombre = hash del contenido) pero con una voz femenina peruana
// suave y educativa, y con normalización de sonoridad EBU R128 para que todas
// las locuciones suenen al mismo volumen y pesen la mitad.
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../src/nido/nido-curriculum.js";
import { enumerateForestVoiceLines } from "../src/nido/game/content/forest-voice-lines.js";
import {
  celebrationAudioKey,
  PERSISTENCE_CELEBRATION,
  STREAK_CELEBRATIONS,
  SUCCESS_CELEBRATIONS,
} from "../src/nido/game/content/celebration-feedback.js";

const ALL_CELEBRATIONS = [
  ...SUCCESS_CELEBRATIONS,
  ...STREAK_CELEBRATIONS,
  PERSISTENCE_CELEBRATION,
];

// Las celebraciones se graban una sola vez con el perfil intermedio: el mismo
// clip sirve a las tres edades porque es un festejo, no una instrucción.
const CELEBRATION_AGE_ID = "4-5";

const ROOT = process.cwd();
const AUDIO_ROOT = path.join(ROOT, "public", "assets", "nido", "audio");
const GENERATED_AUDIO_DIR = path.join(AUDIO_ROOT, "generated");
const MANIFEST_PATH = path.join(AUDIO_ROOT, "manifest.json");
const PROVIDER = "elevenlabs";
// El nombre del archivo se deriva de esta versión, así que cualquier cambio en
// AGE_PROFILES obliga a subirla: si no, los audios viejos se darían por buenos.
// La comprobación de huella de más abajo lo impide por si se olvida.
const GENERATOR_VERSION = "nido-teacher-v5";
const MODEL = process.env.NIDO_TTS_MODEL || "eleven_multilingual_v2";
// «Jhenny Cozy»: femenina, tierna y con la entonación más viva de las ocho
// candidatas medidas (variación de tono 0,29 y energía 0,63).
const VOICE = process.env.NIDO_TTS_VOICE || "EDitztUwd7lban76PAZs";
const VOICE_NAME = process.env.NIDO_TTS_VOICE_NAME || "Jhenny Cozy";
const CONCURRENCY = Math.max(
  1,
  Math.min(5, Number.parseInt(process.env.NIDO_TTS_CONCURRENCY || "4", 10)),
);
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504, 524, 529]);
const MAX_ATTEMPTS = 5;

// Sonoridad de destino: los navegadores móviles reproducen muy bajo, así que
// se fija un nivel constante en vez de dejarlo a merced de cada locución.
const LOUDNESS_FILTER = "loudnorm=I=-16:TP=-1.5:LRA=11";
const OUTPUT_BITRATE = "64k";

// stability baja + style alto = maestra entusiasmada en vez de narradora
// neutra. Se verificó que a estos valores la dicción sigue intacta.
const AGE_PROFILES = Object.freeze({
  "2-3": {
    speed: 0.82,
    stability: 0.4,
    similarityBoost: 0.75,
    style: 0.45,
    label: "tierna, pausada y muy clara",
  },
  "4-5": {
    speed: 0.94,
    stability: 0.4,
    similarityBoost: 0.75,
    style: 0.45,
    label: "tierna, entusiasmada y clara",
  },
  6: {
    speed: 0.99,
    stability: 0.4,
    similarityBoost: 0.75,
    style: 0.45,
    label: "tierna, animada y alentadora",
  },
});

// Huella de los ajustes: el hash del archivo no los incluye, así que sin este
// candado un retoque de estilo dejaría en producción audios con la voz vieja.
const AGE_PROFILES_FINGERPRINT = "925b3bafb954589c";

function getApiKey() {
  if (process.env.ELEVENLABS_API_KEY) {
    return process.env.ELEVENLABS_API_KEY.trim();
  }

  if (process.platform === "darwin") {
    try {
      return execFileSync(
        "security",
        [
          "find-generic-password",
          "-a",
          process.env.USER,
          "-s",
          "tesis20-elevenlabs-api-key",
          "-w",
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
    } catch {
      // Se informa abajo sin imprimir detalles del llavero.
    }
  }

  throw new Error(
    "Falta ELEVENLABS_API_KEY o la entrada segura tesis20-elevenlabs-api-key del llavero.",
  );
}

function getChallengeText(challenge) {
  return String(
    challenge.spokenText ?? challenge.spokenInstruction ?? challenge.voice ?? "",
  ).trim();
}

function getAudioHash({ ageId, text }) {
  return createHash("sha256")
    .update([GENERATOR_VERSION, MODEL, VOICE, ageId, text].join("\n"), "utf8")
    .digest("hex")
    .slice(0, 28);
}

// Semilla estable: regenerar el mismo texto devuelve la misma interpretación.
function getSeed(hash) {
  return Number.parseInt(hash.slice(0, 8), 16) % 4_294_967_295;
}

function addJob(jobsByHash, { key, ageId, text }, tracksTarget) {
  if (!text) throw new Error(`${key} no tiene texto narrable.`);
  const hash = getAudioHash({ ageId, text });
  const fileName = `${hash}.mp3`;
  tracksTarget[key] = `/assets/nido/audio/generated/${fileName}`;
  if (!jobsByHash.has(hash)) {
    jobsByHash.set(hash, { hash, fileName, text, ageId, ids: [key] });
  } else {
    jobsByHash.get(hash).ids.push(key);
  }
}

function enumerateAudioPlan() {
  const jobsByHash = new Map();
  const tracks = {};
  const bosqueTracks = {};

  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        for (
          let gameIndex = 0;
          gameIndex < NIDO_CURRICULUM_GAME_COUNT;
          gameIndex += 1
        ) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          // La clave del manifiesto es el audioId: en el catálogo escrito a
          // mano coincide con el id del reto, pero en los 500 juegos
          // generados (voz-<edad>-<hash del texto>) cientos de retos
          // comparten locución. Con la clave compartida el manifiesto queda
          // en ~2500 entradas en vez de 31 740.
          addJob(
            jobsByHash,
            {
              key: challenge.audioId ?? challenge.id,
              ageId: age.id,
              text: getChallengeText(challenge),
            },
            tracks,
          );
        }
      }
    }
  }

  for (const line of enumerateForestVoiceLines()) {
    addJob(
      jobsByHash,
      { key: line.key, ageId: line.ageId, text: line.text },
      bosqueTracks,
    );
  }

  // Frases de celebración: una sola versión (perfil 4-5) sirve a las tres
  // edades; el reproductor las busca por su id en `tracks`.
  for (const celebration of ALL_CELEBRATIONS) {
    addJob(
      jobsByHash,
      {
        key: celebrationAudioKey(celebration.id),
        ageId: CELEBRATION_AGE_ID,
        text: celebration.spokenText,
      },
      tracks,
    );
  }

  return { jobs: [...jobsByHash.values()], tracks, bosqueTracks };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  const retryAfter = Number.parseFloat(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 30_000);
  }
  return Math.min(1_000 * 2 ** (attempt - 1), 20_000);
}

async function isUsableAudio(filePath) {
  try {
    return (await stat(filePath)).size >= 1_500;
  } catch {
    return false;
  }
}

function probeAudio(filePath) {
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ],
    { encoding: "utf8" },
  );

  if (probe.error?.code === "ENOENT") return null;
  if (probe.status !== 0) return false;
  const duration = Number.parseFloat(probe.stdout.trim());
  return Number.isFinite(duration) && duration >= 0.6 && duration <= 60;
}

function normalizeLoudness(sourcePath, targetPath) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-y",
      "-i",
      sourcePath,
      "-af",
      LOUDNESS_FILTER,
      "-ar",
      "44100",
      "-ac",
      "1",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      OUTPUT_BITRATE,
      "-map_metadata",
      "-1",
      // El destino es «.mp3.part», así que hay que declarar el formato: ffmpeg
      // no puede deducirlo de esa extensión.
      "-f",
      "mp3",
      targetPath,
    ],
    { encoding: "utf8" },
  );
  if (result.error?.code === "ENOENT") {
    throw new Error(
      "Falta ffmpeg: es obligatorio para nivelar la sonoridad de las locuciones.",
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `ffmpeg no pudo normalizar ${path.basename(sourcePath)}: ${result.stderr.trim().slice(0, 200)}`,
    );
  }
}

async function synthesizeAudio(apiKey, job) {
  const outputPath = path.join(GENERATED_AUDIO_DIR, job.fileName);
  if (await isUsableAudio(outputPath)) return { status: "cached", outputPath };

  const profile = AGE_PROFILES[job.ageId];
  if (!profile) throw new Error(`No existe perfil de voz para ${job.ageId}.`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: job.text,
            model_id: MODEL,
            seed: getSeed(job.hash),
            voice_settings: {
              stability: profile.stability,
              similarity_boost: profile.similarityBoost,
              style: profile.style,
              use_speaker_boost: true,
              speed: profile.speed,
            },
          }),
          signal: AbortSignal.timeout(90_000),
        },
      );
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `No se pudo conectar con ElevenLabs para ${job.hash}: ${error.name}.`,
        );
      }
      await wait(Math.min(1_000 * 2 ** (attempt - 1), 20_000));
      continue;
    }

    if (!response.ok) {
      if (
        RETRYABLE_STATUS_CODES.has(response.status) &&
        attempt < MAX_ATTEMPTS
      ) {
        await wait(retryDelay(response, attempt));
        continue;
      }
      const detail = (await response.text()).slice(0, 200);
      throw new Error(
        `ElevenLabs rechazó ${job.hash} con HTTP ${response.status}: ${detail}`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("audio/")) {
      throw new Error(`ElevenLabs no devolvió audio para ${job.hash}.`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1_500) {
      throw new Error(`ElevenLabs devolvió un audio vacío para ${job.hash}.`);
    }

    const rawPath = `${outputPath}.raw`;
    const temporaryPath = `${outputPath}.part`;
    await writeFile(rawPath, audio);
    try {
      normalizeLoudness(rawPath, temporaryPath);
      const probeResult = probeAudio(temporaryPath);
      if (probeResult === false) {
        throw new Error(`ffprobe rechazó el audio generado para ${job.hash}.`);
      }
      await rename(temporaryPath, outputPath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => {});
      throw error;
    } finally {
      await unlink(rawPath).catch(() => {});
    }
    return { status: "generated", outputPath };
  }

  throw new Error(`No se pudo generar ${job.hash}.`);
}

async function runPool(items, worker, concurrency) {
  let nextIndex = 0;
  const results = new Array(items.length);

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await worker(items[index], index);
      }
    },
  );

  await Promise.all(runners);
  return results;
}

async function readCurrentManifest() {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return {};
  }
}

function assertProfilesMatchVersion() {
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(AGE_PROFILES), "utf8")
    .digest("hex")
    .slice(0, 16);
  if (fingerprint === AGE_PROFILES_FINGERPRINT) return;
  throw new Error(
    `Los perfiles de voz cambiaron (huella ${fingerprint}). Sube GENERATOR_VERSION y actualiza AGE_PROFILES_FINGERPRINT, o los audios antiguos se darían por válidos.`,
  );
}

async function main() {
  assertProfilesMatchVersion();
  await mkdir(GENERATED_AUDIO_DIR, { recursive: true });
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY está vacía.");

  const plan = enumerateAudioPlan();
  const { tracks, bosqueTracks } = plan;
  // Presupuesto sin gastar: imprime el plan y sale. Sirve para saber cuántos
  // caracteres costaría un cambio de guion antes de lanzar el lote.
  if (process.env.NIDO_TTS_PLAN_ONLY === "1") {
    const planCharacters = plan.jobs.reduce(
      (sum, job) => sum + job.text.length,
      0,
    );
    const pending = [];
    for (const job of plan.jobs) {
      if (!(await isUsableAudio(path.join(GENERATED_AUDIO_DIR, job.fileName)))) {
        pending.push(job);
      }
    }
    const pendingCharacters = pending.reduce(
      (sum, job) => sum + job.text.length,
      0,
    );
    console.log(
      `Plan: ${Object.keys(tracks).length} retos, ${plan.jobs.length} audios únicos, ${planCharacters} caracteres.\n` +
        `Pendientes de grabar: ${pending.length} audios, ${pendingCharacters} caracteres.`,
    );
    if (pending.length) console.log(`Ejemplo pendiente: «${pending[0].text}»`);
    return;
  }
  // Ensayo acotado antes de gastar el lote completo: genera solo las primeras
  // locuciones y no reescribe el manifiesto.
  const limit = Number.parseInt(process.env.NIDO_TTS_LIMIT || "0", 10);
  const isRehearsal = Number.isFinite(limit) && limit > 0;
  const jobs = isRehearsal ? plan.jobs.slice(0, limit) : plan.jobs;
  const totalCharacters = jobs.reduce((sum, job) => sum + job.text.length, 0);
  let generatedCount = 0;
  let cachedCount = 0;
  const failures = [];

  console.log(
    `Plan de voz (${VOICE_NAME}/${MODEL}): ${Object.keys(tracks).length} retos, ${Object.keys(bosqueTracks).length} líneas de Misión del Bosque, ${jobs.length} audios únicos, ${totalCharacters} caracteres, concurrencia ${CONCURRENCY}.`,
  );

  await runPool(
    jobs,
    async (job, index) => {
      let result;
      try {
        result = await synthesizeAudio(apiKey, job);
      } catch (error) {
        failures.push(`${job.hash}: ${error.message}`);
        console.error(`fallo ${job.hash}: ${error.message}`);
        return { status: "failed", index };
      }
      if (result.status === "generated") generatedCount += 1;
      else cachedCount += 1;
      const completed = generatedCount + cachedCount;
      if (completed % 25 === 0 || completed === jobs.length) {
        console.log(`[${completed}/${jobs.length}] ${job.hash}`);
      }
      return { ...result, index };
    },
    CONCURRENCY,
  );

  if (failures.length) {
    throw new Error(
      `${failures.length} locuciones no se pudieron generar; el manifiesto no se ha tocado.\n${failures.slice(0, 5).join("\n")}`,
    );
  }

  if (isRehearsal) {
    console.log(
      `Ensayo de ${jobs.length} locuciones terminado; el manifiesto y los audios antiguos quedan intactos.`,
    );
    return;
  }

  const currentManifest = await readCurrentManifest();
  const manifest = {
    version: 2,
    provider: PROVIDER,
    model: MODEL,
    voiceId: VOICE,
    voiceName: VOICE_NAME,
    generatorVersion: GENERATOR_VERSION,
    generatedAt: new Date().toISOString(),
    delivery: "local-prerecorded",
    loudness: LOUDNESS_FILTER,
    fallbackProvider: "browser-speech-synthesis",
    feedbackProvider: currentManifest.feedbackProvider ?? "local-prerecorded",
    feedbackFallback: currentManifest.feedbackFallback ?? "web-audio",
    feedbackTracks: currentManifest.feedbackTracks ?? {},
    ageProfiles: Object.fromEntries(
      Object.entries(AGE_PROFILES).map(([ageId, profile]) => [
        ageId,
        { speed: profile.speed, description: profile.label },
      ]),
    ),
    tracks,
    bosqueTracks,
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  // Piso de cobertura del catálogo generado: el verificador exige que este
  // número nunca baje, así que se actualiza aquí, cuando el lote completo ya
  // está en disco.
  const generatedVoiceCount = Object.keys(tracks).filter((key) =>
    key.startsWith("voz-"),
  ).length;
  const coveragePath = path.join(ROOT, "scripts", "nido-audio-coverage.json");
  await writeFile(
    coveragePath,
    `${JSON.stringify(
      {
        generatedVoices: generatedVoiceCount,
        pendingVoices: 0,
        pendingCharacters: 0,
        note: "Locuciones ya grabadas del catálogo generado (mecánica x tema). El verificador solo comprueba que este número nunca baje; el generador de voz lo sube tras cada lote.",
      },
      null,
      2,
    )}\n`,
  );

  const plannedFiles = new Set(jobs.map((job) => job.fileName));
  const obsoleteFiles = (await readdir(GENERATED_AUDIO_DIR)).filter(
    (fileName) =>
      (fileName.endsWith(".mp3") ||
        fileName.endsWith(".part") ||
        fileName.endsWith(".raw")) &&
      !plannedFiles.has(fileName),
  );
  await Promise.all(
    obsoleteFiles.map((fileName) =>
      unlink(path.join(GENERATED_AUDIO_DIR, fileName)),
    ),
  );
  // Este resumen sólo dice que el plan que este proceso enumeró quedó cubierto,
  // no que el plan fuera el vigente. Si el guion se edita mientras arranca, node
  // importa el módulo a medio escribir, enumera el catálogo anterior, encuentra
  // los mp3 viejos en caché y llega hasta aquí cantando victoria sin grabar
  // nada. Pasó el 2026-07-26. Por eso `npm run audio:nido` encadena
  // `check:nido`, que compara el manifiesto contra el currículo ya cargado del
  // todo, y `audio:nido:plan` permite ver el plan antes de gastar créditos.
  console.log(
    `Manifiesto actualizado: ${generatedCount} generados, ${cachedCount} reutilizados, ${obsoleteFiles.length} obsoletos retirados, ${Object.keys(tracks).length} retos y ${Object.keys(bosqueTracks).length} líneas del bosque cubiertos.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
