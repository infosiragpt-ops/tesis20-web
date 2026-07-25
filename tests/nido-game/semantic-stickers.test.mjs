import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  NIDO_AGE_GROUPS,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";

const EXPECTED_SEMANTIC_STICKERS = Object.freeze({
  tortuga: "Turtle",
  turtle: "Turtle",
  león: "Lion",
  lion: "Lion",
  oveja: "Sheep",
  cordero: "Sheep",
  panda: "Panda",
  mono: "Monkey",
  ardilla: "Squirrel",
  rana: "Frog",
  "oso polar": "PolarBear",
  unicornio: "Unicorn",
  dragón: "Dragon",
  pato: "Duck",
  duck: "Duck",
  "león con alas": "WingedLion",
  "ave de tres cabezas": "ThreeHeadedBird",
});

const SEMANTIC_ROUTES = Object.freeze([
  ["logica", "que-es-real"],
  ["atencion", "quien-esta-aqui"],
  ["habla", "encuentra-a-la-cria"],
  ["habla", "quien-come-que-cosa"],
  ["habla", "quien-vive-aqui"],
  ["ingles", "animales"],
]);

const FAMILY_STICKERS = Object.freeze([
  "FamilyMother",
  "FamilyFather",
  "FamilySister",
  "FamilyBrother",
  "FamilyGrandmother",
  "FamilyGrandfather",
  "FamilyAunt",
  "FamilyUncle",
  "FamilyCousin",
]);

function collectSemanticIcons(value, result) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSemanticIcons(item, result));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (typeof value.iconName === "string") {
    for (const field of ["id", "label", "spanish", "english", "animal", "adult", "young"]) {
      if (typeof value[field] !== "string") continue;
      const concept = value[field].trim().toLocaleLowerCase("es-PE");
      if (!EXPECTED_SEMANTIC_STICKERS[concept]) continue;
      const icons = result.get(concept) ?? new Set();
      icons.add(value.iconName);
      result.set(concept, icons);
    }
  }

  Object.values(value).forEach((item) => collectSemanticIcons(item, result));
}

test("los animales del currículo nunca vuelven a iconos genéricos", () => {
  const semanticIcons = new Map();

  for (const [areaId, categoryId] of SEMANTIC_ROUTES) {
    for (const { id: ageId } of NIDO_AGE_GROUPS) {
      for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
        for (let round = 0; round < 10; round += 1) {
          collectSemanticIcons(
            buildCurriculumChallenge({
              areaId,
              categoryId,
              ageId,
              gameIndex,
              round,
            }),
            semanticIcons,
          );
        }
      }
    }
  }

  for (const [concept, expectedIcon] of Object.entries(
    EXPECTED_SEMANTIC_STICKERS,
  )) {
    assert.deepEqual(
      [...(semanticIcons.get(concept) ?? [])],
      [expectedIcon],
      `“${concept}” debe usar exclusivamente el sticker ${expectedIcon}`,
    );
  }
});

test("todos los nombres semánticos están conectados al registro de stickers", async () => {
  const [registrySource, stickerSource] = await Promise.all([
    readFile(
      new URL("../../src/nido/stickers/sticker-registry.jsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../../src/nido/stickers/sticker-animals-extended.jsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(
    registrySource,
    /\.\.\.EXTENDED_ANIMAL_STICKERS/,
    "el registro debe incluir el catálogo de animales extendido",
  );

  for (const stickerName of new Set(
    Object.values(EXPECTED_SEMANTIC_STICKERS),
  )) {
    assert.match(
      stickerSource,
      new RegExp(`\\b${stickerName}: ${stickerName}Sticker\\b`),
      `falta registrar el sticker ${stickerName}`,
    );
  }
});

test("la familia en inglés usa retratos distinguibles y no una persona genérica", async () => {
  const foundIcons = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    if (typeof value.iconName === "string") foundIcons.add(value.iconName);
    Object.values(value).forEach(visit);
  };

  for (const { id: ageId } of NIDO_AGE_GROUPS) {
    for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
      visit(
        buildCurriculumChallenge({
          areaId: "ingles",
          categoryId: "familia",
          ageId,
          gameIndex,
          round: 0,
        }),
      );
    }
  }

  assert.equal(foundIcons.has("Person"), false);
  for (const iconName of FAMILY_STICKERS) {
    assert.equal(foundIcons.has(iconName), true, `falta usar ${iconName}`);
  }

  const peopleStickerSource = await readFile(
    new URL("../../src/nido/stickers/sticker-people.jsx", import.meta.url),
    "utf8",
  );
  for (const iconName of FAMILY_STICKERS) {
    assert.match(
      peopleStickerSource,
      new RegExp(`\\b${iconName}:`),
      `falta registrar el retrato ${iconName}`,
    );
  }
});
