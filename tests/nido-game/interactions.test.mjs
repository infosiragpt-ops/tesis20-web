import assert from "node:assert/strict";
import test from "node:test";

import {
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";
import {
  NIDO_ROUTE_INTERACTIONS,
  buildInitialOrder,
  buildNidoPathLayout,
  getCorrectOrderLabels,
  getNidoInteractionType,
  isNidoPathMoveAllowed,
  normalizeOrderLabel,
} from "../../src/nido/nido-interaction-model.js";

test("las 29 rutas curriculares tienen una mecánica explícita", () => {
  const routes = NIDO_CURRICULUM.flatMap((area) =>
    area.categories.map((category) => `${area.id}:${category.id}`),
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
        assert.equal(
          getNidoInteractionType(challenge),
          NIDO_ROUTE_INTERACTIONS[`${area.id}:${category.id}`],
        );
      }
    }
  }
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
