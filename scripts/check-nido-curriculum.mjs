import { existsSync } from "node:fs";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../src/nido/nido-curriculum.js";

const EXPECTED_AREA_COUNT = 5;
const MIN_CATEGORIES_PER_AREA = 5;
const EXPECTED_GAME_COUNT = 20;
const ACTIVE_AGE_IDS = Object.freeze(["2-3", "4-5", "6"]);
const MAX_FAILURE_DETAILS = 100;
const FEATURED_AUDIO_ID = "attention-2-3-level-1";
const FEATURED_AUDIO_FILE = new URL(
  "../public/assets/nido/audio/attention-2-3-level-1-v1.mp3",
  import.meta.url,
);

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
let categoryCount = 0;
let combinationCount = 0;
let optionCount = 0;
let featuredAudioChallengeCount = 0;

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
        check(
          challenge.totalGames === EXPECTED_GAME_COUNT,
          `${combinationLabel} debe declarar totalGames === ${EXPECTED_GAME_COUNT}; se recibió ${challenge.totalGames}.`,
        );
        if (challenge.audioId) {
          check(
            typeof challenge.audioId === "string",
            `${combinationLabel} tiene un audioId inválido.`,
          );
          if (challenge.audioId === FEATURED_AUDIO_ID) {
            featuredAudioChallengeCount += 1;
          }
        }

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

        const options = Array.isArray(challenge.options)
          ? challenge.options
          : [];
        check(
          options.length > 0,
          `${combinationLabel} debe tener al menos una opción de respuesta.`,
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
check(
  featuredAudioChallengeCount === 1,
  `El audio profesional ${FEATURED_AUDIO_ID} debe estar conectado a un reto; se encontraron ${featuredAudioChallengeCount}.`,
);
check(
  existsSync(FEATURED_AUDIO_FILE),
  `No existe el archivo de audio profesional ${FEATURED_AUDIO_FILE.pathname}.`,
);

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
    `✓ Currículo Nido válido: ${areas.length} áreas, ${categoryCount} subcategorías, ` +
      `${combinationCount} retos activos y ${optionCount} opciones verificadas ` +
      `con ${assertionCount} controles.`,
  );
}
