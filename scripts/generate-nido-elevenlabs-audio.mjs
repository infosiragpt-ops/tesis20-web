import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "public", "assets", "nido", "audio");
const MANIFEST_PATH = path.join(AUDIO_DIR, "manifest.json");
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const TRACKS = [
  {
    id: "attention-2-3-level-1",
    fileName: "attention-2-3-level-1-v1.mp3",
    text: "Escucha con atención. Selecciona al osito que tiene un moño. Muy bien, tú puedes.",
  },
];

function getApiKey() {
  if (process.env.ELEVENLABS_API_KEY) {
    return process.env.ELEVENLABS_API_KEY;
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
      // Se informa abajo sin mostrar datos del llavero.
    }
  }

  throw new Error(
    "Falta ELEVENLABS_API_KEY o la entrada segura tesis20-elevenlabs-api-key del llavero.",
  );
}

async function backupIfNeeded(filePath) {
  if (!existsSync(filePath)) return;
  const backupDir = path.join(AUDIO_DIR, "backups");
  const stamp = new Date().toISOString().replaceAll(":", "-");
  await mkdir(backupDir, { recursive: true });
  await copyFile(filePath, path.join(backupDir, `${path.basename(filePath)}.${stamp}.bak`));
}

async function generateTrack(apiKey, track) {
  const endpoint = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
  );
  endpoint.searchParams.set("output_format", OUTPUT_FORMAT);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: track.text,
      model_id: MODEL_ID,
      seed: 20260723,
      voice_settings: {
        stability: 0.68,
        similarity_boost: 0.8,
        style: 0.16,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      detail = payload?.detail?.message ?? payload?.detail?.status ?? detail;
    } catch {
      // No se imprime el cuerpo completo para evitar datos innecesarios.
    }
    throw new Error(`ElevenLabs rechazó ${track.id}: ${detail}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    throw new Error(`ElevenLabs no devolvió audio para ${track.id}.`);
  }

  const outputPath = path.join(AUDIO_DIR, track.fileName);
  await backupIfNeeded(outputPath);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  return `/assets/nido/audio/${track.fileName}`;
}

async function main() {
  await mkdir(AUDIO_DIR, { recursive: true });
  const apiKey = getApiKey();
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const nextTracks = { ...manifest.tracks };

  for (const track of TRACKS) {
    nextTracks[track.id] = await generateTrack(apiKey, track);
    console.log(`Audio generado: ${track.id}`);
  }

  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(
      {
        ...manifest,
        provider: "elevenlabs",
        model: MODEL_ID,
        voiceId: VOICE_ID,
        generatedAt: new Date().toISOString(),
        tracks: nextTracks,
      },
      null,
      2,
    )}\n`,
  );
  console.log("Manifiesto de audio actualizado sin guardar la clave.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
