// Música de fondo y efectos de sonido de la biblioteca de cuentos, generados
// con ElevenLabs (Eleven Music y Sound Effects) y servidos como mp3 estáticos.
//
// Misma disciplina que el generador de voz: nombre = hash de la receta, sólo
// se genera lo que falta, ffmpeg nivela la sonoridad y el manifiesto
// cuentos-sound.json enlaza cada pista por su clave. El reproductor cae a la
// música sintetizada y a los efectos de Web Audio si un archivo no llega.
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const AUDIO_ROOT = path.join(ROOT, "public", "assets", "nido", "audio");
const OUTPUT_DIR = path.join(AUDIO_ROOT, "sonido");
const MANIFEST_PATH = path.join(AUDIO_ROOT, "cuentos-sound.json");
const PUBLIC_BASE = "/assets/nido/audio/sonido/";
const GENERATOR_VERSION = "nido-sound-v1";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504, 524, 529]);
const MAX_ATTEMPTS = 4;

// Música: dos pistas en bucle. La API entrega un tema completo; el
// reproductor lo repite con un fundido corto en los extremos (ffmpeg).
// Recetas según lo que funciona en apps de cuentos para niños de 3 a 6 años:
// acústico y juguetón (ukelele, xilófono y glockenspiel, piano de juguete,
// palmas y shaker suaves), tonalidad mayor, frases cortas que hacen bucle y
// sin efectos estridentes. Repisa: 104 BPM, alegre. Lectura: lento y escaso,
// para que la narradora tenga aire (la música va por debajo de la voz).
const MUSIC = {
  biblioteca: {
    prompt:
      "Playful, cheerful children's storybook background music: bright ukulele strumming, xylophone and glockenspiel melody, toy piano, pizzicato strings, soft hand claps and shaker, light acoustic percussion, major key, 104 BPM, warm and friendly, whimsical but gentle, short catchy phrases that loop seamlessly, instrumental only, no vocals, no heavy drums, no brass",
    seconds: 64,
    loudness: "loudnorm=I=-19:TP=-2:LRA=8",
  },
  lectura: {
    prompt:
      "Soft, gentle background music for reading a children's story aloud: sparse music box and xylophone notes, warm ukulele plucks, light glockenspiel, slow rocking tempo around 76 BPM, major key, calm and cozy, leaves space for a narrator's voice, loops seamlessly, instrumental only, no vocals, no drums",
    seconds: 64,
    loudness: "loudnorm=I=-22:TP=-2:LRA=7",
  },
};

// Efectos: cada clave se dispara desde una página o desde una palabra de la
// narración (ver `cues` en cuentos-data.js).
const SFX = {
  "lobo-aullido": { text: "Cartoon wolf howling awoo at the moon, playful and friendly, for a childrens story", seconds: 3 },
  "lobo-soplido": { text: "Cartoon character takes a huge deep breath and blows a giant gust of wind, big whoosh, comedic", seconds: 3 },
  "lobo-ay": { text: "Cartoon wolf yelps ouch in surprise and runs away fast with quick footsteps fading, comedic", seconds: 3 },
  "lobo-ronquido": { text: "Loud comedic cartoon snoring, slow rhythm, funny", seconds: 3 },
  "casa-paja": { text: "Straw and hay scattering and flying away in a strong gust of wind, rustling, cartoon", seconds: 3 },
  "casa-madera": { text: "Wooden planks creaking and then collapsing into a pile, cartoon, dry wood clatter", seconds: 3 },
  "toc-toc": { text: "Knocking three times on a wooden door", seconds: 2 },
  "olla-plaf": { text: "Big comedic splash into a large pot of soup with a cartoon boing", seconds: 2 },
  "cerditos-alegres": { text: "Three happy cartoon piglets giggling and cheering hooray", seconds: 3 },
  pajaros: { text: "Small birds chirping happily in a sunny forest, gentle, close", seconds: 4 },
  "pasos-bosque": { text: "Light footsteps of a child walking on a forest path with leaves, calm", seconds: 3 },
  "abuelita-abrazo": { text: "Warm soft cartoon hug sound with a gentle sparkle chime, cozy", seconds: 2 },
};

function getApiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  if (process.platform === "darwin") {
    try {
      return execFileSync("security", ["find-generic-password", "-a", process.env.USER, "-s", "tesis20-elevenlabs-api-key", "-w"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      // Se informa abajo sin imprimir detalles del llavero.
    }
  }
  throw new Error("Falta ELEVENLABS_API_KEY o la entrada segura tesis20-elevenlabs-api-key del llavero.");
}

function hashOf(kind, key, recipe) {
  return createHash("sha256").update([GENERATOR_VERSION, kind, key, JSON.stringify(recipe)].join("\n"), "utf8").digest("hex").slice(0, 28);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isUsable(filePath) {
  try {
    return (await stat(filePath)).size >= 4_000;
  } catch {
    return false;
  }
}

function run(bin, args, label) {
  const result = spawnSync(bin, args, { encoding: "utf8" });
  if (result.error?.code === "ENOENT") throw new Error(`Falta ${bin}: es obligatorio para ${label}.`);
  if (result.status !== 0) throw new Error(`${bin} falló en ${label}: ${result.stderr.trim().slice(0, 200)}`);
  return result.stdout;
}

function normalize(sourcePath, targetPath, { loudness, stereo, loop, bitrate }) {
  const args = ["-v", "error", "-y", "-i", sourcePath];
  if (loop) {
    // Bucle sin costura: se descarta la cola de silencio con la que la API
    // cierra el tema y los últimos `loop` segundos se funden con los primeros
    // `loop` segundos. El archivo empieza en el segundo `loop` y termina
    // exactamente donde empieza, así el reproductor lo repite sin clic ni
    // hueco (los fundidos a cero dejaban un silencio audible en cada vuelta).
    const end = trailingSilenceStart(sourcePath);
    args.push(
      "-filter_complex",
      `[0:a]atrim=0:${loop},asetpts=N/SR/TB[head];[0:a]atrim=${loop}:${end.toFixed(2)},asetpts=N/SR/TB[body];[body][head]acrossfade=d=${loop}:c1=tri:c2=tri,${loudness}[out]`,
      "-map", "[out]",
    );
  } else {
    args.push("-af", loudness);
  }
  args.push("-ar", "44100", "-ac", stereo ? "2" : "1", "-codec:a", "libmp3lame", "-b:a", bitrate, "-map_metadata", "-1", "-f", "mp3", targetPath);
  run("ffmpeg", args, `normalizar ${path.basename(sourcePath)}`);
}

// Segundo en que empieza la cola de silencio con la que la API cierra cada
// tema (si la hay en los últimos 10 s): el bucle debe cortarse antes.
function trailingSilenceStart(filePath) {
  const result = spawnSync("ffmpeg", ["-i", filePath, "-af", "silencedetect=noise=-38dB:d=0.4", "-f", "null", "-"], { encoding: "utf8" });
  const total = duration(filePath);
  const starts = [...(result.stderr || "").matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number.parseFloat(m[1]));
  const tail = starts.filter((t) => t > total - 10).sort((a, b) => a - b)[0];
  return Number.isFinite(tail) ? Math.max(loopMinimum(total), tail - 0.15) : total;
}
function loopMinimum(total) {
  return Math.max(20, total * 0.6);
}

function duration(filePath) {
  const out = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath], "medir duración");
  return Number.parseFloat(out.trim());
}

async function request(apiKey, url, body, label) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(240_000),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`No se pudo conectar con ElevenLabs para ${label}: ${error.name}.`);
      await wait(2_000 * attempt);
      continue;
    }
    if (!response.ok) {
      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_ATTEMPTS) {
        await wait(3_000 * attempt);
        continue;
      }
      throw new Error(`ElevenLabs rechazó ${label} con HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 4_000) throw new Error(`ElevenLabs devolvió un audio vacío para ${label}.`);
    return audio;
  }
  throw new Error(`No se pudo generar ${label}.`);
}

async function produce(apiKey, kind, key, recipe) {
  const hash = hashOf(kind, key, recipe);
  const fileName = `${hash}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  if (await isUsable(outputPath)) return { status: "cached", fileName, seconds: duration(outputPath) };

  const label = `${kind}:${key}`;
  // NIDO_SOUND_FROM_DIR=<carpeta>: si existe <carpeta>/<kind>-<key>.mp3 se usa
  // ese audio (elegido tras una audición de candidatos) en vez de generarlo.
  const chosen = process.env.NIDO_SOUND_FROM_DIR ? path.join(process.env.NIDO_SOUND_FROM_DIR, `${kind}-${key}.mp3`) : null;
  const audio = chosen && (await isUsable(chosen))
    ? await readFile(chosen)
    : kind === "music"
      ? await request(apiKey, "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", { prompt: recipe.prompt, music_length_ms: recipe.seconds * 1000, force_instrumental: true }, label)
      : await request(apiKey, "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", { text: recipe.text, duration_seconds: recipe.seconds, prompt_influence: 0.4 }, label);

  const rawPath = `${outputPath}.raw`;
  const temporaryPath = `${outputPath}.part`;
  await writeFile(rawPath, audio);
  try {
    if (kind === "music") {
      normalize(rawPath, temporaryPath, { loudness: recipe.loudness, stereo: true, bitrate: "96k", loop: 2 });
    } else {
      normalize(rawPath, temporaryPath, { loudness: "loudnorm=I=-16:TP=-1.5:LRA=11", stereo: false, bitrate: "64k", loop: 0 });
    }
    const seconds = duration(temporaryPath);
    if (!Number.isFinite(seconds) || seconds < 0.5) throw new Error(`ffprobe rechazó ${label} (${seconds} s).`);
    await rename(temporaryPath, outputPath);
    return { status: "generated", fileName, seconds };
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  } finally {
    await unlink(rawPath).catch(() => {});
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const jobs = [
    ...Object.entries(MUSIC).map(([key, recipe]) => ({ kind: "music", key, recipe })),
    ...Object.entries(SFX).map(([key, recipe]) => ({ kind: "sfx", key, recipe })),
  ];
  if (process.env.NIDO_SOUND_PLAN_ONLY === "1") {
    let pending = 0;
    for (const job of jobs) if (!(await isUsable(path.join(OUTPUT_DIR, `${hashOf(job.kind, job.key, job.recipe)}.mp3`)))) pending += 1;
    console.log(`Plan: ${Object.keys(MUSIC).length} pistas de música y ${Object.keys(SFX).length} efectos; pendientes: ${pending}.`);
    return;
  }
  const apiKey = getApiKey();
  const manifest = { version: 1, provider: "elevenlabs", generatorVersion: GENERATOR_VERSION, generatedAt: new Date().toISOString(), base: PUBLIC_BASE, music: {}, sfx: {} };
  const failures = [];
  let generated = 0;
  for (const job of jobs) {
    try {
      const result = await produce(apiKey, job.kind, job.key, job.recipe);
      if (result.status === "generated") generated += 1;
      manifest[job.kind][job.key] = { src: result.fileName, seconds: Math.round(result.seconds * 100) / 100 };
      console.log(`${result.status === "generated" ? "generado" : "en caché"} ${job.kind}:${job.key} (${result.seconds.toFixed(1)} s)`);
    } catch (error) {
      failures.push(`${job.kind}:${job.key}: ${error.message}`);
      console.error(`fallo ${job.kind}:${job.key}: ${error.message}`);
    }
  }
  if (failures.length) throw new Error(`${failures.length} pistas no se pudieron generar; el manifiesto no se ha tocado.\n${failures.join("\n")}`);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest)}\n`);
  const planned = new Set(jobs.map((job) => `${hashOf(job.kind, job.key, job.recipe)}.mp3`));
  const obsolete = (await readdir(OUTPUT_DIR)).filter((name) => /\.(?:mp3|part|raw)$/.test(name) && !planned.has(name));
  await Promise.all(obsolete.map((name) => unlink(path.join(OUTPUT_DIR, name))));
  console.log(`Manifiesto de sonido actualizado: ${generated} generados, ${jobs.length - generated} reutilizados, ${obsolete.length} obsoletos retirados.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
