import assert from "node:assert/strict";
import test from "node:test";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";
import {
  NIDO_INTERACTION_META,
  NIDO_ROUTE_INTERACTIONS,
  buildInitialOrder,
  buildNidoPathLayout,
  getCorrectOrderLabels,
  getNidoInteractionType,
  isNidoPathMoveAllowed,
  normalizeOrderLabel,
} from "../../src/nido/nido-interaction-model.js";
import {
  usesDirectSceneActivity,
  usesDirectTapActivity,
} from "../../src/nido/nido-activity-routing.js";

test("las 29 rutas curriculares tienen una mecánica explícita", () => {
  const routes = NIDO_CURRICULUM.flatMap((area) =>
    area.categories
      .filter((category) => !category.strategy || category.strategy !== "matrix")
      .map((category) => `${area.id}:${category.id}`),
  );
  assert.equal(routes.length, 29);
  assert.deepEqual(
    [...Object.keys(NIDO_ROUTE_INTERACTIONS)].sort(),
    [...routes].sort(),
  );

  const counts = Object.values(NIDO_ROUTE_INTERACTIONS).reduce(
    (current, interaction) => ({
      ...current,
      [interaction]: (current[interaction] ?? 0) + 1,
    }),
    {},
  );
  assert.deepEqual(counts, {
    tap: 11,
    drag: 5,
    order: 2,
    match: 8,
    path: 3,
  });
});

test("cada edad recibe la mecánica definida para todas las rutas", () => {
  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        const challenge = buildCurriculumChallenge({
          areaId: area.id,
          categoryId: category.id,
          ageId: age.id,
          gameIndex: 0,
        });
        // Las rutas escritas a mano la toman del mapa; las generadas la
        // declaran en la propia categoría.
        assert.equal(
          getNidoInteractionType(challenge),
          category.interaction ??
            NIDO_ROUTE_INTERACTIONS[`${area.id}:${category.id}`],
        );
      }
    }
  }
});

test("cada juego generado declara una mecánica que sabe jugarse", () => {
  const generated = NIDO_CURRICULUM.flatMap((area) =>
    area.categories
      .filter((category) => category.strategy === "matrix")
      .map((category) => ({ area, category })),
  );
  assert.equal(generated.length, 500);

  const seen = new Map();
  for (const { area, category } of generated) {
    assert.ok(
      NIDO_INTERACTION_META[category.interaction],
      `${area.id}:${category.id} declara una mecánica desconocida.`,
    );
    seen.set(
      category.interaction,
      (seen.get(category.interaction) ?? 0) + 1,
    );
  }

  // Los quinientos juegos nuevos no pueden ser todos de tocar: el catálogo
  // escrito a mano ya es interactivo y estos irían un paso por detrás.
  assert.deepEqual(seen, new Map([
    ["match", 140],
    ["tap", 220],
    ["drag", 90],
    ["path", 40],
    ["order", 10],
  ]));
});

test("las mecánicas generadas reciben los datos que necesitan", () => {
  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        if (category.strategy !== "matrix") continue;
        for (const gameIndex of [0, 9, 19]) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          const where = `${area.id}:${category.id}/${age.id}/${gameIndex}`;
          const interaction = getNidoInteractionType(challenge);
          const visual = challenge.visual;

          if (interaction === "match") {
            // Sin tarjeta guía, MatchActivity cae en un comodín "?" rotulado
            // con la pregunta entera: ilegible para un niño de tres años.
            assert.ok(
              visual.model ?? visual.subject ?? visual.adult ?? visual.word,
              `${where}: empareja sin tarjeta guía.`,
            );
          }

          if (interaction === "order") {
            assert.equal(visual.kind, "size-order", `${where}: orden sin piezas.`);
            const correct = getCorrectOrderLabels(challenge);
            assert.ok(correct.length >= 3, `${where}: orden sin secuencia.`);
            assert.equal(
              correct.length,
              visual.items.length,
              `${where}: la secuencia no coincide con las piezas.`,
            );
            const initial = buildInitialOrder(challenge).map((item) =>
              normalizeOrderLabel(item.label ?? item.value),
            );
            assert.notDeepEqual(
              initial,
              correct.map(normalizeOrderLabel),
              `${where}: el orden empieza ya resuelto.`,
            );
          }

          if (interaction === "path") {
            const layout = buildNidoPathLayout(challenge);
            assert.equal(
              layout.targets.length,
              challenge.options.length,
              `${where}: faltan destinos en el tablero.`,
            );
            assert.equal(
              new Set(
                layout.targets.map((target) => `${target.row}:${target.column}`),
              ).size,
              challenge.options.length,
              `${where}: dos respuestas caen en la misma casilla.`,
            );
          }

          if (interaction === "drag") {
            assert.ok(
              challenge.options.length >= 2,
              `${where}: arrastrar necesita al menos dos piezas.`,
            );
          }
        }
      }
    }
  }
});

test("cada una de las 29 rutas conserva una identidad visual propia", () => {
  const visualKinds = [];
  for (const area of NIDO_CURRICULUM) {
    for (const category of area.categories) {
      if (category.strategy === "matrix") continue;
      visualKinds.push(
        buildCurriculumChallenge({
          areaId: area.id,
          categoryId: category.id,
          ageId: "4-5",
          gameIndex: 1,
        }).visual.kind,
      );
    }
  }

  assert.equal(visualKinds.length, 29);
  assert.equal(new Set(visualKinds).size, 29);
});

test("los recorridos crecen por edad y todos sus destinos son únicos", () => {
  const expected = {
    "2-3": { size: 3, obstacles: 0 },
    "4-5": { size: 4, obstacles: 1 },
    6: { size: 5, obstacles: 2 },
  };

  const pathRoutes = Object.entries(NIDO_ROUTE_INTERACTIONS)
    .filter(([, interaction]) => interaction === "path")
    .map(([route]) => route.split(":"));

  for (const age of NIDO_AGE_GROUPS) {
    for (const [areaId, categoryId] of pathRoutes) {
      for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
        for (let round = 0; round < 10; round += 1) {
          const challenge = buildCurriculumChallenge({
            areaId,
            categoryId,
            ageId: age.id,
            gameIndex,
            round,
          });
          const layout = buildNidoPathLayout(challenge);
          assert.equal(layout.size, expected[age.id].size);
          assert.equal(layout.obstacles.length, expected[age.id].obstacles);
          assert.equal(layout.targets.length, challenge.options.length);
          assert.equal(
            new Set(
              layout.targets.map((target) => `${target.row}:${target.column}`),
            ).size,
            challenge.options.length,
          );
          assert.ok(
            isNidoPathMoveAllowed(layout, layout.start.row, layout.start.column),
          );
        }
      }
    }
  }
});

test("todos los destinos del recorrido son alcanzables", () => {
  const pathRoutes = Object.entries(NIDO_ROUTE_INTERACTIONS)
    .filter(([, interaction]) => interaction === "path")
    .map(([route]) => route.split(":"));

  for (const age of NIDO_AGE_GROUPS) {
    for (const [areaId, categoryId] of pathRoutes) {
      for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
        for (let round = 0; round < 10; round += 1) {
          const challenge = buildCurriculumChallenge({
            areaId,
            categoryId,
            ageId: age.id,
            gameIndex,
            round,
          });
          const layout = buildNidoPathLayout(challenge);

          for (const target of layout.targets) {
            const blockedTargets = new Set(
              layout.targets
                .filter((item) => item.optionId !== target.optionId)
                .map((item) => `${item.row}:${item.column}`),
            );
            const queue = [layout.start];
            const visited = new Set([
              `${layout.start.row}:${layout.start.column}`,
            ]);

            while (queue.length) {
              const current = queue.shift();
              for (const [rowDelta, columnDelta] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
              ]) {
                const row = current.row + rowDelta;
                const column = current.column + columnDelta;
                const key = `${row}:${column}`;
                if (
                  visited.has(key) ||
                  blockedTargets.has(key) ||
                  !isNidoPathMoveAllowed(layout, row, column)
                ) {
                  continue;
                }
                visited.add(key);
                queue.push({ row, column });
              }
            }

            assert.ok(visited.has(`${target.row}:${target.column}`));
          }
        }
      }
    }
  }
});

test("ordenar por tamaño nunca comienza ya resuelto", () => {
  for (const age of NIDO_AGE_GROUPS) {
    for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
      const challenge = buildCurriculumChallenge({
        areaId: "matematicas",
        categoryId: "ordena-por-tamano",
        ageId: age.id,
        gameIndex,
      });
      const initial = buildInitialOrder(challenge).map((item) =>
        normalizeOrderLabel(item.label ?? item.value),
      );
      const correct = getCorrectOrderLabels(challenge).map(normalizeOrderLabel);
      assert.equal(initial.length, correct.length);
      assert.notDeepEqual(initial, correct);
    }
  }
});

test("las 11 rutas de tocar responden dentro de su propia escena", () => {
  const tapRoutes = Object.entries(NIDO_ROUTE_INTERACTIONS).filter(
    ([, interaction]) => interaction === "tap",
  );

  assert.equal(tapRoutes.length, 11);
  for (const [route] of tapRoutes) {
    const [areaId, categoryId] = route.split(":");
    const challenge = buildCurriculumChallenge({
      areaId,
      categoryId,
      ageId: "4-5",
      gameIndex: 0,
    });
    assert.equal(
      usesDirectSceneActivity(challenge) ||
        usesDirectTapActivity(challenge),
      true,
      `${route} debe ser tocable dentro de su escena`,
    );
  }
});

test("las rutas de camino generadas siempre montan el tablero de recorrido", () => {
  let pathChallenges = 0;

  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        if (
          category.strategy !== "matrix" ||
          category.interaction !== "path"
        ) {
          continue;
        }
        for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          pathChallenges += 1;
          assert.equal(
            usesDirectSceneActivity(challenge),
            false,
            `${challenge.id} no debe saltarse PathActivity.`,
          );
        }
      }
    }
  }

  assert.equal(pathChallenges, 2400);
});

test("las opciones de gemelos describen la figura sin revelar la respuesta", () => {
  for (const age of NIDO_AGE_GROUPS) {
    for (let gameIndex = 0; gameIndex < 20; gameIndex += 1) {
      const challenge = buildCurriculumChallenge({
        areaId: "atencion",
        categoryId: "encuentra-al-gemelo",
        ageId: age.id,
        gameIndex,
      });
      for (const option of challenge.options) {
        assert.doesNotMatch(option.label, /exacto|cambia/i);
      }
    }
  }
});
