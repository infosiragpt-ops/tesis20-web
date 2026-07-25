import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createForestRound,
  FOREST_AGE_PROFILES,
  FOREST_ROUNDS,
  layoutForestRound,
  roundDifficultyFloor,
} from "../../src/nido/game/content/forest-mission.js";

const WORLD = { width: 1900, groundY: 470 };

test("genera 20 rondas válidas para cada edad y nivel", () => {
  for (const ageId of Object.keys(FOREST_AGE_PROFILES)) {
    const profile = FOREST_AGE_PROFILES[ageId];
    for (let level = 0; level <= profile.maxLevel; level += 1) {
      for (let roundIndex = 0; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
        const round = createForestRound({ ageId, roundIndex, level });
        assert.ok(round.target >= 1 && round.target <= 10, `${ageId} target`);
        assert.ok(
          round.fruitCount >= round.target,
          `${ageId} r${roundIndex}: frutas suficientes (${round.fruitCount} >= ${round.target})`,
        );
        assert.ok(round.instructionText.length > 0);
        assert.ok(round.spokenText.length > 10);
        if (round.operation === "sum") {
          assert.equal(round.parts[0] + round.parts[1], round.target);
        }
        if (round.operation === "sub") {
          assert.equal(round.parts[0] - round.parts[1], round.target);
        }
      }
    }
  }
});

test("la generación es determinista", () => {
  const a = createForestRound({ ageId: "4-5", roundIndex: 7, level: 1 });
  const b = createForestRound({ ageId: "4-5", roundIndex: 7, level: 1 });
  assert.deepEqual(a, b);
});

test("2-3 años nunca recibe sumas ni restas y siempre tiene ayuda", () => {
  for (let roundIndex = 0; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
    const round = createForestRound({ ageId: "2-3", roundIndex, level: 1 });
    assert.equal(round.operation, "count");
    assert.ok(round.target <= 3);
    assert.equal(round.helpAlways, true);
  }
});

test("roundDifficultyFloor reparte las bandas de nivel a lo largo de las 20 rondas", () => {
  assert.equal(roundDifficultyFloor(0, 0), 0);
  assert.equal(roundDifficultyFloor(19, 0), 0);

  // maxLevel 1 ("2-3"): dos bandas de 10 rondas.
  assert.equal(roundDifficultyFloor(0, 1), 0);
  assert.equal(roundDifficultyFloor(9, 1), 0);
  assert.equal(roundDifficultyFloor(10, 1), 1);
  assert.equal(roundDifficultyFloor(19, 1), 1);

  // maxLevel 2 ("4-5" y "6"): tres bandas de ~6-7 rondas.
  assert.equal(roundDifficultyFloor(0, 2), 0);
  assert.equal(roundDifficultyFloor(6, 2), 0);
  assert.equal(roundDifficultyFloor(7, 2), 1);
  assert.equal(roundDifficultyFloor(13, 2), 1);
  assert.equal(roundDifficultyFloor(14, 2), 2);
  assert.equal(roundDifficultyFloor(19, 2), 2);

  for (const profile of Object.values(FOREST_AGE_PROFILES)) {
    let previous = 0;
    for (let roundIndex = 0; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
      const floor = roundDifficultyFloor(roundIndex, profile.maxLevel);
      assert.ok(floor >= previous, "el piso nunca baja al avanzar de ronda");
      assert.ok(floor <= profile.maxLevel, "el piso nunca supera el nivel máximo");
      previous = floor;
    }
    assert.equal(previous, profile.maxLevel, "la última ronda alcanza el nivel máximo");
  }
});

test("las rondas avanzadas añaden más obstáculos y plataformas que las iniciales", () => {
  for (const ageId of Object.keys(FOREST_AGE_PROFILES)) {
    const profile = FOREST_AGE_PROFILES[ageId];
    const level = profile.maxLevel;
    const first = createForestRound({ ageId, roundIndex: 0, level });
    const midway = createForestRound({ ageId, roundIndex: 7, level });
    const last = createForestRound({ ageId, roundIndex: FOREST_ROUNDS - 1, level });

    assert.equal(midway.obstacleCount - first.obstacleCount, 1, `${ageId} ronda 7 suma un obstáculo`);
    assert.ok(last.obstacleCount >= midway.obstacleCount, `${ageId} la última ronda no tiene menos obstáculos`);
    assert.ok(last.platformCount >= first.platformCount, `${ageId} la última ronda no tiene menos plataformas`);

    let previousObstacles = first.obstacleCount;
    let previousPlatforms = first.platformCount;
    for (let roundIndex = 1; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
      const round = createForestRound({ ageId, roundIndex, level });
      assert.ok(round.obstacleCount >= previousObstacles, `${ageId} r${roundIndex}: obstáculos no bajan`);
      assert.ok(round.platformCount >= previousPlatforms, `${ageId} r${roundIndex}: plataformas no bajan`);
      previousObstacles = round.obstacleCount;
      previousPlatforms = round.platformCount;
    }
  }
});

test("el layout coloca todo dentro del mundo jugable", () => {
  for (const ageId of ["2-3", "4-5", "6"]) {
    for (let roundIndex = 0; roundIndex < FOREST_ROUNDS; roundIndex += 1) {
      const round = createForestRound({ ageId, roundIndex, level: 2 });
      const layout = layoutForestRound(round, WORLD, roundIndex);
      assert.equal(layout.fruits.length, round.fruitCount);
      for (const fruit of layout.fruits) {
        assert.ok(fruit.x > 0 && fruit.x < WORLD.width, "fruta dentro del mundo");
        assert.ok(fruit.y < WORLD.groundY, "fruta sobre el suelo");
      }
      for (const platform of layout.platforms) {
        assert.ok(platform.x + platform.w < WORLD.width - 200, "plataforma lejos de la cesta");
      }
    }
  }
});
