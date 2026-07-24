import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createForestRound,
  FOREST_AGE_PROFILES,
  FOREST_ROUNDS,
  layoutForestRound,
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
