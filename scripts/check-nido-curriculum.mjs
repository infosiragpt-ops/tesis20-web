import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../src/nido/nido-curriculum.js";
import { enumerateForestVoiceLines } from "../src/nido/game/content/forest-voice-lines.js";

const EXPECTED_AREA_COUNT = 5;
const MIN_CATEGORIES_PER_AREA = 5;
const EXPECTED_GAME_COUNT = 20;
const ACTIVE_AGE_IDS = Object.freeze(["2-3", "4-5", "6"]);
const MAX_FAILURE_DETAILS = 100;
const AUDIO_MANIFEST_FILE = new URL(
  "../public/assets/nido/audio/manifest.json",
  import.meta.url,
);
const AUDIO_PUBLIC_ROOT = new URL("../public/", import.meta.url);
// La narración debe venir pregrabada de un generador de estudio; la síntesis
// del navegador solo es un respaldo cuando falta un archivo. Producción está en
// openrouter y migra a elevenlabs (voz Jhenny) cuando termine el lote.
const AUDIO_PROVIDERS = Object.freeze(["openrouter", "elevenlabs"]);
// Cuántas locuciones del catálogo generado hay ya grabadas. Lo actualiza el
// generador de voz tras cada lote; el verificador solo comprueba que no baje.
const AUDIO_COVERAGE_FILE = new URL(
  "./nido-audio-coverage.json",
  import.meta.url,
);

let audioManifest = {};
try {
  audioManifest = JSON.parse(readFileSync(AUDIO_MANIFEST_FILE, "utf8"));
} catch {
  // El control de existencia y formato se reporta con mensajes uniformes abajo.
}
const audioTracks =
  audioManifest?.tracks && typeof audioManifest.tracks === "object"
    ? audioManifest.tracks
    : {};

let audioCoverageFloor = 0;
try {
  const coverage = JSON.parse(readFileSync(AUDIO_COVERAGE_FILE, "utf8"));
  if (Number.isInteger(coverage?.generatedVoices)) {
    audioCoverageFloor = coverage.generatedVoices;
  }
} catch {
  // Sin archivo de cobertura el piso es cero: el catálogo generado aún no se
  // ha grabado nunca.
}

let assertionCount = 0;
let failureCount = 0;
const failureDetails = [];

function check(condition, message) {
  assertionCount += 1;
  if (condition) return;

  failureCount += 1;
  if (failureDetails.length < MAX_FAILURE_DETAILS) {
    failureDetails.push(message);
  }
}

function normalizedName(value) {
  return String(value ?? "").trim().toLocaleLowerCase("es-PE");
}

function checkUniqueStrings(values, label) {
  const seen = new Map();

  values.forEach((value, index) => {
    const normalized = normalizedName(value);
    check(Boolean(normalized), `${label}: el valor ${index + 1} está vacío.`);
    if (!normalized) return;

    const previousIndex = seen.get(normalized);
    check(
      previousIndex === undefined,
      `${label}: “${value}” se repite en las posiciones ${previousIndex + 1} y ${index + 1}.`,
    );
    if (previousIndex === undefined) {
      seen.set(normalized, index);
    }
  });
}

const areas = Array.isArray(NIDO_CURRICULUM) ? NIDO_CURRICULUM : [];
const ageGroups = Array.isArray(NIDO_AGE_GROUPS) ? NIDO_AGE_GROUPS : [];
const availableAgeIds = new Set(ageGroups.map((age) => age?.id));
const challengeIds = new Set();
const activityPayloadsByPosition = new Map();
const voicesByPosition = new Map();
let categoryCount = 0;
let combinationCount = 0;
let optionCount = 0;
let professionalAudioChallengeCount = 0;
let generatedCategoryCount = 0;
const professionalAudioFiles = new Set();
const spokenTextByAudioId = new Map();
const coveredGeneratedVoices = new Set();
const pendingGeneratedVoices = new Set();

check(
  NIDO_CURRICULUM_GAME_COUNT === EXPECTED_GAME_COUNT,
  `NIDO_CURRICULUM_GAME_COUNT debe ser ${EXPECTED_GAME_COUNT}; se recibió ${NIDO_CURRICULUM_GAME_COUNT}.`,
);
check(
  areas.length === EXPECTED_AREA_COUNT,
  `El currículo debe declarar exactamente ${EXPECTED_AREA_COUNT} áreas; se encontraron ${areas.length}.`,
);
checkUniqueStrings(
  areas.map((area) => area?.id),
  "IDs de áreas",
);
checkUniqueStrings(
  areas.map((area) => area?.name),
  "Nombres de áreas",
);

for (const ageId of ACTIVE_AGE_IDS) {
  check(
    availableAgeIds.has(ageId),
    `Falta el rango de edad activo “${ageId}” en NIDO_AGE_GROUPS.`,
  );
}

for (const area of areas) {
  const areaLabel = area?.name || area?.id || "(área sin nombre)";
  const categories = Array.isArray(area?.categories) ? area.categories : [];

  check(
    categories.length >= MIN_CATEGORIES_PER_AREA,
    `${areaLabel} debe tener al menos ${MIN_CATEGORIES_PER_AREA} subcategorías; tiene ${categories.length}.`,
  );
  checkUniqueStrings(
    categories.map((category) => category?.id),
    `IDs de subcategorías de ${areaLabel}`,
  );
  checkUniqueStrings(
    categories.map((category) => category?.name),
    `Nombres de subcategorías de ${areaLabel}`,
  );

  for (const category of categories) {
    categoryCount += 1;
    const categoryLabel = `${areaLabel} / ${category?.name || category?.id || "(sin nombre)"}`;
    const isGenerated = category?.strategy === "matrix";
    if (isGenerated) generatedCategoryCount += 1;

    check(
      category?.gameCount === EXPECTED_GAME_COUNT,
      `${categoryLabel} debe declarar gameCount === ${EXPECTED_GAME_COUNT}; se recibió ${category?.gameCount}.`,
    );

    for (const ageId of ACTIVE_AGE_IDS) {
      const scopeIds = new Set();

      for (let gameIndex = 0; gameIndex < EXPECTED_GAME_COUNT; gameIndex += 1) {
        const input = {
          areaId: area?.id,
          categoryId: category?.id,
          ageId,
          gameIndex,
        };
        const combinationLabel =
          `${categoryLabel} / edad ${ageId} / juego ${gameIndex + 1}`;
        let challenge;
        let repeatedChallenge;

        combinationCount += 1;

        try {
          challenge = buildCurriculumChallenge(input);
          repeatedChallenge = buildCurriculumChallenge(input);
        } catch (error) {
          check(
            false,
            `${combinationLabel} no pudo generarse: ${error instanceof Error ? error.message : String(error)}.`,
          );
          continue;
        }

        check(
          challenge && typeof challenge === "object",
          `${combinationLabel} debe producir un reto válido.`,
        );
        if (!challenge || typeof challenge !== "object") continue;

        let serializedChallenge;
        let serializedRepeat;
        try {
          serializedChallenge = JSON.stringify(challenge);
          serializedRepeat = JSON.stringify(repeatedChallenge);
          check(
            serializedChallenge === serializedRepeat,
            `${combinationLabel} no es determinista al serializarse como JSON.`,
          );
        } catch (error) {
          check(
            false,
            `${combinationLabel} no se puede serializar como JSON: ${error instanceof Error ? error.message : String(error)}.`,
          );
        }

        check(
          challenge.areaId === area?.id &&
            challenge.categoryId === category?.id &&
            challenge.ageId === ageId &&
            challenge.gameIndex === gameIndex,
          `${combinationLabel} devolvió metadatos que no coinciden con la combinación solicitada.`,
        );

        const positionId = `${area?.id}/${category?.id}/${gameIndex}`;
        const activityPayload = JSON.stringify({
          question: challenge.question,
          visual: challenge.visual,
          options: challenge.options.map((option) => ({
            label: option.label,
            iconName: option.iconName,
            tone: option.tone,
            meta: option.meta,
          })),
          answerLabel: challenge.options.find(
            (option) => option.id === challenge.answerId,
          )?.label,
        });
        if (!activityPayloadsByPosition.has(positionId)) {
          activityPayloadsByPosition.set(positionId, new Set());
          voicesByPosition.set(positionId, new Set());
        }
        activityPayloadsByPosition.get(positionId).add(activityPayload);
        voicesByPosition
          .get(positionId)
          .add(String(challenge.spokenInstruction ?? ""));
        check(
          challenge.totalGames === EXPECTED_GAME_COUNT,
          `${combinationLabel} debe declarar totalGames === ${EXPECTED_GAME_COUNT}; se recibió ${challenge.totalGames}.`,
        );
        const challengeId =
          typeof challenge.id === "string" ? challenge.id.trim() : "";
        check(Boolean(challengeId), `${combinationLabel} no tiene un ID de reto válido.`);
        if (challengeId) {
          check(
            !scopeIds.has(challengeId),
            `${combinationLabel} repite el ID “${challengeId}” dentro de la misma subcategoría y edad.`,
          );
          check(
            !challengeIds.has(challengeId),
            `${combinationLabel} repite globalmente el ID de reto “${challengeId}”.`,
          );
          scopeIds.add(challengeId);
          challengeIds.add(challengeId);
        }

        const audioId =
          typeof challenge.audioId === "string"
            ? challenge.audioId.trim()
            : "";
        const spokenText = String(
          challenge.spokenText ??
            challenge.spokenInstruction ??
            challenge.voice ??
            "",
        ).trim();
        // Los juegos escritos a mano graban una locución por reto; los generados
        // comparten locución cuando dicen exactamente lo mismo. En ambos casos
        // la clave de audio identifica un texto y solo uno.
        check(
          isGenerated ? audioId.startsWith("voz-") : audioId === challengeId,
          `${combinationLabel} usa un audioId inesperado: “${audioId}”.`,
        );
        const previousSpokenText = spokenTextByAudioId.get(audioId);
        check(
          previousSpokenText === undefined || previousSpokenText === spokenText,
          `El audioId “${audioId}” se reparte entre dos narraciones distintas.`,
        );
        spokenTextByAudioId.set(audioId, spokenText);

        const audioPublicPath = audioTracks[audioId];
        const hasProfessionalAudio =
          typeof audioPublicPath === "string" &&
          audioPublicPath.startsWith("/assets/nido/audio/generated/") &&
          audioPublicPath.endsWith(".mp3");
        // El catálogo escrito a mano ya está grabado entero y no puede
        // retroceder. El generado se graba por lotes: lo que aún no tiene voz
        // se cuenta y se reporta, y el mínimo cubierto lo fija el archivo de
        // cobertura, de modo que publicar nunca pueda perder audio existente.
        if (!isGenerated) {
          check(
            hasProfessionalAudio,
            `${combinationLabel} no está cubierto por el manifiesto profesional.`,
          );
        } else if (!hasProfessionalAudio) {
          pendingGeneratedVoices.add(audioId);
        }
        if (hasProfessionalAudio) {
          professionalAudioChallengeCount += 1;
          professionalAudioFiles.add(audioPublicPath);
          if (isGenerated) coveredGeneratedVoices.add(audioId);
          const expectedAudioHash = createHash("sha256")
            .update(
              [
                audioManifest.generatorVersion,
                audioManifest.model,
                audioManifest.voiceId,
                ageId,
                spokenText,
              ].join("\n"),
              "utf8",
            )
            .digest("hex")
            .slice(0, 28);
          check(
            audioPublicPath ===
              `/assets/nido/audio/generated/${expectedAudioHash}.mp3`,
            `${combinationLabel} apunta a una locución desactualizada.`,
          );
        }

        const options = Array.isArray(challenge.options)
          ? challenge.options
          : [];
        check(
          options.length >= 2,
          `${combinationLabel} debe tener al menos dos opciones de respuesta.`,
        );
        const maximumOptionsByAge = { "2-3": 2, "4-5": 3, 6: 4 };
        check(
          options.length <= maximumOptionsByAge[ageId],
          `${combinationLabel} supera el máximo de ${maximumOptionsByAge[ageId]} opciones para su edad.`,
        );
        optionCount += options.length;

        const optionIds = options.map((option) =>
          typeof option?.id === "string" ? option.id.trim() : "",
        );
        checkUniqueStrings(optionIds, `IDs de opciones de ${combinationLabel}`);

        const answerId =
          typeof challenge.answerId === "string"
            ? challenge.answerId.trim()
            : "";
        check(
          Boolean(answerId),
          `${combinationLabel} no tiene un answerId válido.`,
        );
        check(
          Boolean(answerId) && optionIds.includes(answerId),
          `${combinationLabel} tiene answerId “${challenge.answerId}” fuera de sus opciones.`,
        );
      }

      check(
        scopeIds.size === EXPECTED_GAME_COUNT,
        `${categoryLabel} / edad ${ageId} debe producir ${EXPECTED_GAME_COUNT} IDs de reto únicos; produjo ${scopeIds.size}.`,
      );
    }
  }
}

const expectedCombinations =
  categoryCount * ACTIVE_AGE_IDS.length * EXPECTED_GAME_COUNT;
check(
  combinationCount === expectedCombinations,
  `Se esperaban ${expectedCombinations} combinaciones activas y se recorrieron ${combinationCount}.`,
);
for (const [positionId, payloads] of activityPayloadsByPosition) {
  check(
    payloads.size === ACTIVE_AGE_IDS.length,
    `${positionId} debe producir una actividad distinta para cada edad; produjo ${payloads.size}.`,
  );
  check(
    voicesByPosition.get(positionId)?.size === ACTIVE_AGE_IDS.length,
    `${positionId} debe producir una narración distinta para cada edad.`,
  );
}
check(
  AUDIO_PROVIDERS.includes(audioManifest?.provider),
  `El manifiesto profesional debe declarar un proveedor de estudio (${AUDIO_PROVIDERS.join(", ")}); declara “${audioManifest?.provider}”.`,
);
// Piso de cobertura del catálogo generado: solo puede subir. Si un cambio
// dejara sin voz locuciones ya grabadas, este control lo detiene.
check(
  coveredGeneratedVoices.size >= audioCoverageFloor,
  `El catálogo generado tenía ${audioCoverageFloor} locuciones grabadas y ahora solo ${coveredGeneratedVoices.size}.`,
);
check(
  coveredGeneratedVoices.size + pendingGeneratedVoices.size > 0 ||
    generatedCategoryCount === 0,
  "El catálogo generado no produjo ninguna locución.",
);
for (const audioPublicPath of professionalAudioFiles) {
  const relativePath = audioPublicPath.replace(/^\/+/, "");
  const audioFilePath = path.join(AUDIO_PUBLIC_ROOT.pathname, relativePath);
  check(
    existsSync(audioFilePath),
    `No existe el archivo profesional ${audioPublicPath}.`,
  );
}

// Misión del Bosque: mismo contrato de narración profesional que el
// currículo clásico, pero con líneas enumerables (briefing + retroalimentación
// parametrizada) en vez de retos.
const bosqueTracks =
  audioManifest?.bosqueTracks && typeof audioManifest.bosqueTracks === "object"
    ? audioManifest.bosqueTracks
    : {};
const bosqueVoiceLines = enumerateForestVoiceLines();
const bosqueAudioFiles = new Set();

for (const line of bosqueVoiceLines) {
  const audioPublicPath = bosqueTracks[line.key];
  check(
    typeof audioPublicPath === "string" &&
      audioPublicPath.startsWith("/assets/nido/audio/generated/") &&
      audioPublicPath.endsWith(".mp3"),
    `Misión del Bosque: “${line.key}” no está cubierto por el manifiesto profesional.`,
  );
  if (typeof audioPublicPath !== "string") continue;
  bosqueAudioFiles.add(audioPublicPath);
  const expectedAudioHash = createHash("sha256")
    .update(
      [
        audioManifest.generatorVersion,
        audioManifest.model,
        audioManifest.voiceId,
        line.ageId,
        line.text,
      ].join("\n"),
      "utf8",
    )
    .digest("hex")
    .slice(0, 28);
  check(
    audioPublicPath === `/assets/nido/audio/generated/${expectedAudioHash}.mp3`,
    `Misión del Bosque: “${line.key}” apunta a una locución desactualizada.`,
  );
}
for (const audioPublicPath of bosqueAudioFiles) {
  const relativePath = audioPublicPath.replace(/^\/+/, "");
  const audioFilePath = path.join(AUDIO_PUBLIC_ROOT.pathname, relativePath);
  check(
    existsSync(audioFilePath),
    `No existe el archivo profesional del bosque ${audioPublicPath}.`,
  );
}

if (failureCount > 0) {
  console.error(
    `✗ Currículo Nido inválido: ${failureCount} de ${assertionCount} controles fallaron.`,
  );
  failureDetails.forEach((failure) => console.error(`- ${failure}`));
  if (failureCount > failureDetails.length) {
    console.error(
      `- … ${failureCount - failureDetails.length} fallos adicionales omitidos.`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(
    `✓ Currículo Nido válido: ${areas.length} áreas, ${categoryCount} juegos ` +
      `(${generatedCategoryCount} generados), ${combinationCount} retos activos ` +
      `y ${optionCount} opciones verificadas con ${professionalAudioFiles.size} audios profesionales, ` +
      `${bosqueVoiceLines.length} líneas de Misión del Bosque (${bosqueAudioFiles.size} audios) ` +
      `y ${assertionCount} controles.`,
  );
  if (pendingGeneratedVoices.size) {
    const pendingCharacters = [...pendingGeneratedVoices].reduce(
      (total, audioId) => total + (spokenTextByAudioId.get(audioId)?.length ?? 0),
      0,
    );
    console.log(
      `· Falta grabar ${pendingGeneratedVoices.size} locuciones del catálogo generado ` +
        `(${pendingCharacters} caracteres); esos juegos narran con la voz del dispositivo.`,
    );
  }
}
