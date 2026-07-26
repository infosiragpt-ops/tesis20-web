import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";

// Existía un solo glifo de cifra, «NumberCircleOne», y se le asignaba a todos
// los números: la ficha guía enseñaba un «1» aunque el reto fuera del seis. Y en
// los juegos de inglés el cartel grande era la palabra española mientras la
// inglesa —lo que se está aprendiendo— quedaba de subtítulo gris.

async function glifosDisponibles() {
  const source = await readFile(
    new URL("../../src/nido/nido-ui-glyphs.jsx", import.meta.url),
    "utf8",
  );
  const nombres = new Set(
    [...source.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*):\s/gm)].map((m) => m[1]),
  );
  // La familia de cifras se genera en bucle, no aparece literal en el fichero.
  const rango = source.match(/Array\.from\(\{ length: (\d+) \}/);
  if (rango) {
    for (let value = 0; value < Number(rango[1]); value += 1) {
      nombres.add(`NumberCircle${value}`);
    }
  }
  return nombres;
}

test("cada cifra del currículo tiene su propio glifo, no el del uno", async () => {
  const glifos = await glifosDisponibles();
  const faltan = new Set();
  const repetidos = [];

  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        for (let gameIndex = 0; gameIndex < NIDO_CURRICULUM_GAME_COUNT; gameIndex += 1) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          for (const option of challenge.options ?? []) {
            const icono = option.iconName;
            if (!icono?.startsWith("NumberCircle")) continue;
            if (!glifos.has(icono)) faltan.add(icono);
            const valor = option.meta?.numericValue ?? option.value;
            // Un icono que no coincide con su número es el bug original.
            if (
              Number.isInteger(valor) &&
              icono !== `NumberCircle${valor}` &&
              repetidos.length < 5
            ) {
              repetidos.push(`${area.id}/${category.id}: valor ${valor} usa ${icono}`);
            }
          }
        }
      }
    }
  }

  assert.deepEqual(
    [...faltan],
    [],
    `Estos glifos de cifra no existen en nido-ui-glyphs.jsx: ${[...faltan].join(", ")}.`,
  );
  assert.deepEqual(
    repetidos,
    [],
    `Hay cifras dibujadas con el glifo de otro número:\n  ${repetidos.join("\n  ")}`,
  );
});

test("en inglés manda la palabra que se aprende, no el andamio", () => {
  let revisados = 0;
  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      if (area.id !== "ingles") continue;
      for (const category of area.categories) {
        for (let gameIndex = 0; gameIndex < NIDO_CURRICULUM_GAME_COUNT; gameIndex += 1) {
          const { visual } = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          if (!visual || visual.word === undefined) continue;
          if (visual.word === null) continue;
          revisados += 1;
          // El apoyo en español nunca puede ocupar el sitio de la palabra grande.
          assert.notEqual(
            visual.word,
            visual.supportWord,
            `${area.id}/${category.id}/${age.id}: la palabra grande y el apoyo son la misma.`,
          );
          if (visual.supportWord) {
            assert.notEqual(
              visual.supportWord,
              visual.repeatWord,
              `${category.id}: el apoyo repite la palabra a aprender.`,
            );
          }
        }
      }
    }
  }
  assert.ok(revisados > 500, `Sólo se revisaron ${revisados} retos de inglés.`);
});
