import { getNidoInteractionType } from "./nido-interaction-model.js";

export const DIRECT_TAP_KINDS = new Set([
  "detective-clues",
  "odd-one-out",
  "real-or-imaginary",
  "camouflage",
  "shape-properties",
  "hidden-character",
  "character-clue",
  "spoken-question",
  "emotion-scene",
]);

export const DIRECT_SCENE_KINDS = new Set([
  ...DIRECT_TAP_KINDS,
  "number-pattern",
  "drawing-detail",
  "difference",
]);

export function usesDirectTapActivity(challenge) {
  return (
    getNidoInteractionType(challenge) !== "path" &&
    DIRECT_TAP_KINDS.has(challenge.visual.kind)
  );
}

export function usesDirectSceneActivity(challenge) {
  return (
    getNidoInteractionType(challenge) !== "path" &&
    DIRECT_SCENE_KINDS.has(challenge.visual.kind)
  );
}
