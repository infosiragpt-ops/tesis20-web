// Líneas de voz de "Misión del Bosque" que son enumerables (finitas y
// deterministas), aptas para narración profesional pregrabada — mismo
// patrón que el currículo clásico: la ronda base usa audio pregrabado, lo
// imprevisible (nunca ocurre aquí, todo es enumerable) caería en la voz del
// dispositivo como respaldo.

import {
  createForestRound,
  FOREST_AGE_PROFILES,
  FOREST_ROUNDS,
} from "./forest-mission.js";

export const NUMBER_WORDS = Object.freeze([
  "cero",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
]);

export const briefingKey = (ageId, roundIndex, level) =>
  `bosque-brief-${ageId}-${roundIndex}-${level}`;

export const successKey = (ageId, levelUp) =>
  `bosque-success-${ageId}-${levelUp ? "levelup" : "plain"}`;

export const missionCompleteKey = (ageId) => `bosque-complete-${ageId}`;

export const tryAgainKey = (ageId, target) =>
  `bosque-tryagain-${ageId}-${target}`;

export const partialKey = (ageId, delivered, missing) =>
  `bosque-partial-${ageId}-${delivered}-${missing}`;

export const successText = (levelUp) =>
  levelUp
    ? "¡Lo lograste! Ahora vamos a un reto un poquito más grande."
    : "¡Muy bien! ¡Lo lograste!";

export const missionCompleteText =
  "¡Misión del bosque completada! Eres increíble.";

export const tryAgainText = (target) =>
  `Casi. Contemos juntos: necesitamos ${NUMBER_WORDS[target]} ${target === 1 ? "fruta" : "frutas"}. Inténtalo otra vez.`;

export const partialText = (delivered, missing) =>
  `Ya llevas ${NUMBER_WORDS[delivered]}. ${missing === 1 ? "Falta una fruta" : `Faltan ${NUMBER_WORDS[missing]} frutas`}.`;

function achievableTargets(profile) {
  const targets = new Set();
  for (const level of profile.levels) {
    for (const target of level.targets) targets.add(target);
  }
  return [...targets].sort((a, b) => a - b);
}

/**
 * Enumera todas las líneas de voz de Misión del Bosque para las 3 bandas de
 * edad: cada una queda identificada por una `key` estable (usada como ID de
 * audio pregrabado) y trae su `ageId` (perfil de velocidad/tono) y `text`.
 *
 * @returns {{ key: string, ageId: string, text: string }[]}
 */
export function enumerateForestVoiceLines() {
  const lines = [];

  for (const ageId of Object.keys(FOREST_AGE_PROFILES)) {
    const profile = FOREST_AGE_PROFILES[ageId];

    for (let level = 0; level <= profile.maxLevel; level += 1) {
      for (let roundIndex = 0; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
        const round = createForestRound({ ageId, roundIndex, level });
        lines.push({
          key: briefingKey(ageId, roundIndex, level),
          ageId,
          text: round.spokenText,
        });
      }
    }

    lines.push({ key: successKey(ageId, false), ageId, text: successText(false) });
    lines.push({ key: successKey(ageId, true), ageId, text: successText(true) });
    lines.push({
      key: missionCompleteKey(ageId),
      ageId,
      text: missionCompleteText,
    });

    for (const target of achievableTargets(profile)) {
      lines.push({
        key: tryAgainKey(ageId, target),
        ageId,
        text: tryAgainText(target),
      });
      for (let delivered = 1; delivered < target; delivered += 1) {
        lines.push({
          key: partialKey(ageId, delivered, target - delivered),
          ageId,
          text: partialText(delivered, target - delivered),
        });
      }
    }
  }

  return lines;
}
