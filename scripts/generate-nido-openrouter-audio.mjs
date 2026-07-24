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

const ROOT = process.cwd();
const AUDIO_ROOT = path.join(ROOT, "public", "assets", "nido", "audio");
const GENERATED_AUDIO_DIR = path.join(AUDIO_ROOT, "generated");
const MANIFEST_PATH = path.join(AUDIO_ROOT, "manifest.json");
const ENDPOINT = "https://openrouter.ai/api/v1/audio/speech";
const GENERATOR_VERSION = "nido-teacher-v2";
const MODEL =
  process.env.OPENROUTER_TTS_MODEL || "x-ai/grok-voice-tts-1.0";
const VOICE = process.env.OPENROUTER_TTS_VOICE || "ara";
const CONCURRENCY = Math.max(
  1,
  Math.min(5, Number.parseInt(process.env.NIDO_TTS_CONCURRENCY || "3", 10)),
);
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504, 524, 529]);
const MAX_ATTEMPTS = 5;

const AGE_PROFILES = Object.freeze({
  "2-3": {
    speed: 0.87,
    style: "cheerful",
    styleDegree: 1.08,
    label: "cálida, pausada y muy clara",
  },
  "4-5": {
    speed: 0.94,
    style: "cheerful",
    styleDegree: 1.04,
    label: "guiada, expresiva y clara",
  },
  6: {
    speed: 0.99,
    style: "cheerful",
    styleDegree: 1,
    label: "fluida, directa y alentadora",
  },
});

function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY.trim();
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
          "tesis20-openrouter-api-key",
          "-w",
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
    } catch {
      // Se informa abajo sin imprimir detalles del llavero.
    }
  }

  throw new Error(
    "Falta OPENROUTER_API_KEY o la entrada segura tesis20-openrouter-api-key del llavero.",
  );
}

function getChallengeText(challenge) {
  return String(
    challenge.spokenText ?? challenge.spokenInstruction ?? challenge.voice ?? "",
  ).trim();
}

function getAudioHash({ ageId, text }) {
  return createHash("sha256")
    .update(
      [GENERATOR_VERSION, MODEL, VOICE, ageId, text].join("\n"),
      "utf8",
    )
    .digest("hex")
    .slice(0, 28);
}

function enumerateAudioPlan() {
  const jobsByHash = new Map();
  const tracks = {};

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
          const text = getChallengeText(challenge);
          if (!text) {
            throw new Error(`El reto ${challenge.id} no tiene texto narrable.`);
          }
          const hash = getAudioHash({ ageId: age.id, text });
          const fileName = `${hash}.mp3`;
          tracks[challenge.id] = `/assets/nido/audio/generated/${fileName}`;
          if (!jobsByHash.has(hash)) {
            jobsByHash.set(hash, {
              hash,
              fileName,
              text,
              ageId: age.id,
              challengeIds: [challenge.id],
            });
          } else {
            jobsByHash.get(hash).challengeIds.push(challenge.id);
          }
        }
      }
    }
  }

  return {
    jobs: [...jobsByHash.values()],
    tracks,
  };
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

function providerOptions(profile) {
  if (!MODEL.startsWith("microsoft/")) return undefined;
  return {
    options: {
      azure: {
        style: profile.style,
        styledegree: profile.styleDegree,
      },
    },
  };
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

async function synthesizeAudio(apiKey, job) {
  const outputPath = path.join(GENERATED_AUDIO_DIR, job.fileName);
  if (await isUsableAudio(outputPath)) return { status: "cached", outputPath };

  const profile = AGE_PROFILES[job.ageId];
  if (!profile) throw new Error(`No existe perfil de voz para ${job.ageId}.`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.tesis20.com/nido",
          "X-OpenRouter-Title": "Tesis20 Nido",
        },
        body: JSON.stringify({
          model: MODEL,
          input: job.text,
          voice: VOICE,
          response_format: "mp3",
          speed: profile.speed,
          provider: providerOptions(profile),
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `No se pudo conectar con OpenRouter para ${job.hash}: ${error.name}.`,
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
      throw new Error(
        `OpenRouter rechazó ${job.hash} con HTTP ${response.status}.`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("audio/")) {
      throw new Error(`OpenRouter no devolvió audio para ${job.hash}.`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1_500) {
      throw new Error(`OpenRouter devolvió un audio vacío para ${job.hash}.`);
    }

    const temporaryPath = `${outputPath}.part`;
    await writeFile(temporaryPath, audio);
    const probeResult = probeAudio(temporaryPath);
    if (probeResult === false) {
      await unlink(temporaryPath).catch(() => {});
      throw new Error(`ffprobe rechazó el audio generado para ${job.hash}.`);
    }
    await rename(temporaryPath, outputPath);
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

async function main() {
  await mkdir(GENERATED_AUDIO_DIR, { recursive: true });
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY está vacía.");

  const { jobs, tracks } = enumerateAudioPlan();
  let generatedCount = 0;
  let cachedCount = 0;

  console.log(
    `Plan de voz: ${Object.keys(tracks).length} retos, ${jobs.length} audios únicos, concurrencia ${CONCURRENCY}.`,
  );

  await runPool(
    jobs,
    async (job, index) => {
      const result = await synthesizeAudio(apiKey, job);
      if (result.status === "generated") generatedCount += 1;
      else cachedCount += 1;
      const completed = generatedCount + cachedCount;
      if (
        result.status === "generated" ||
        completed === jobs.length ||
        completed % 25 === 0
      ) {
        console.log(
          `[${completed}/${jobs.length}] ${result.status === "generated" ? "generado" : "en caché"} ${job.hash}`,
        );
      }
      return { ...result, index };
    },
    CONCURRENCY,
  );

  const currentManifest = await readCurrentManifest();
  const manifest = {
    version: 2,
    provider: "openrouter",
    model: MODEL,
    voiceId: VOICE,
    generatorVersion: GENERATOR_VERSION,
    generatedAt: new Date().toISOString(),
    delivery: "local-prerecorded",
    fallbackProvider: "browser-speech-synthesis",
    feedbackProvider:
      currentManifest.feedbackProvider ?? "local-prerecorded",
    feedbackFallback: currentManifest.feedbackFallback ?? "web-audio",
    feedbackTracks: currentManifest.feedbackTracks ?? {},
    ageProfiles: Object.fromEntries(
      Object.entries(AGE_PROFILES).map(([ageId, profile]) => [
        ageId,
        { speed: profile.speed, description: profile.label },
      ]),
    ),
    tracks,
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  const plannedFiles = new Set(jobs.map((job) => job.fileName));
  const obsoleteFiles = (await readdir(GENERATED_AUDIO_DIR)).filter(
    (fileName) => fileName.endsWith(".mp3") && !plannedFiles.has(fileName),
  );
  await Promise.all(
    obsoleteFiles.map((fileName) =>
      unlink(path.join(GENERATED_AUDIO_DIR, fileName)),
    ),
  );
  console.log(
    `Manifiesto actualizado: ${generatedCount} generados, ${cachedCount} reutilizados, ${obsoleteFiles.length} obsoletos retirados y ${Object.keys(tracks).length} retos cubiertos.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
