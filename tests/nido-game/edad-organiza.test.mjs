import assert from "node:assert/strict";
import test from "node:test";

import {
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";

const AGES = ["2-3", "4-5", "6"];

// La sala de juegos era idéntica para un niño de dos años y para uno de seis:
// los 540 juegos salían en el mismo orden y con el mismo texto, y sólo cambiaba
// el contador de progreso. El ajuste por edad sí existía por dentro, pero era
// invisible. La ficha muestra ahora entre cuántas opciones tendrá que elegir, y
// las rutas se ordenan por esa exigencia. Estos tests protegen ese dato.

function demandaPorRuta(ageId) {
  const demanda = new Map();
  for (const area of NIDO_CURRICULUM) {
    for (const category of area.categories) {
      let options = 0;
      for (const gameIndex of [0, 9, 19]) {
        const challenge = buildCurriculumChallenge({
          areaId: area.id,
          categoryId: category.id,
          ageId,
          gameIndex,
        });
        options = Math.max(options, challenge?.options?.length ?? 0);
      }
      demanda.set(`${area.id}|${category.id}`, options);
    }
  }
  return demanda;
}

test("la exigencia sube con la edad y ninguna ruta se queda plana", () => {
  const porEdad = AGES.map((ageId) => demandaPorRuta(ageId));
  const media = porEdad.map((mapa) => {
    const valores = [...mapa.values()];
    return valores.reduce((sum, value) => sum + value, 0) / valores.length;
  });

  assert.ok(
    media[0] < media[1] && media[1] < media[2],
    `La media de opciones no crece con la edad: ${media.map((m) => m.toFixed(2)).join(" / ")}.`,
  );

  // A los 2–3 años, elegir entre dos es lo correcto: más opciones saturan. Lo
  // que no puede pasar es que un niño de seis se quede también con dos en todo
  // el catálogo, porque acertar a ciegas le saldría la mitad de las veces.
  const seis = [...porEdad[2].values()];
  const conMasDeDos = seis.filter((n) => n > 2).length;
  assert.ok(
    conMasDeDos / seis.length >= 0.5,
    `Sólo el ${((conMasDeDos / seis.length) * 100).toFixed(0)}% de las rutas exige más de dos opciones a los 6 años.`,
  );
});

test("cada ruta declara una exigencia utilizable para ordenar la sala", () => {
  for (const ageId of AGES) {
    for (const [ruta, options] of demandaPorRuta(ageId)) {
      assert.ok(
        options >= 2 && options <= 6,
        `${ruta} ofrece ${options} opciones a los ${ageId}: fuera del rango jugable.`,
      );
    }
  }
});

test("cambiar de edad cambia de verdad la consigna hablada", () => {
  let iguales = 0;
  let total = 0;
  for (const area of NIDO_CURRICULUM) {
    for (const category of area.categories) {
      for (let gameIndex = 0; gameIndex < NIDO_CURRICULUM_GAME_COUNT; gameIndex += 1) {
        const textos = AGES.map((ageId) => {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId,
            gameIndex,
          });
          return String(challenge.spokenText ?? challenge.spokenInstruction ?? "");
        });
        if (!textos[0]) continue;
        total += 1;
        if (new Set(textos).size === 1) iguales += 1;
      }
    }
  }
  assert.ok(total > 10_000, `Sólo se recorrieron ${total} combinaciones.`);
  assert.ok(
    iguales / total <= 0.05,
    `El ${((iguales / total) * 100).toFixed(1)}% de los retos dice lo mismo en las tres edades.`,
  );
});
