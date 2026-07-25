import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATCH_AGE_PROFILES,
  catchDifficultyForRound,
  CATCH_ROUNDS,
  CATCH_THEMES,
  createCatchRound,
} from "../../src/nido/game/content/catch-mission.js";

test("cada ronda produce un objetivo válido dentro del tema", () => {
  for (const theme of CATCH_THEMES) {
    for (const ageId of Object.keys(CATCH_AGE_PROFILES)) {
      for (let roundIndex = 0; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
        const round = createCatchRound({ themeId: theme.id, ageId, roundIndex });
        assert.ok(theme.target.includes(round.target), `${round.target} no pertenece al tema`);
        assert.ok(round.count >= 1 && round.count <= 6);
        assert.ok(round.fallSpeed > 0);
        assert.ok(round.spawnGapMs > 0);
        assert.ok(round.decoyChance >= 0 && round.decoyChance <= 1);
        assert.ok(round.spokenText.length > 10);
      }
    }
  }
});

test("la generación es determinista", () => {
  const a = createCatchRound({ themeId: "granja", ageId: "6", roundIndex: 5 });
  const b = createCatchRound({ themeId: "granja", ageId: "6", roundIndex: 5 });
  assert.deepEqual(a, b);
});

test("2-3 años nunca pide más de 2 y 6 años puede pedir hasta 6", () => {
  for (let roundIndex = 0; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
    const round = createCatchRound({ themeId: "cielo", ageId: "2-3", roundIndex });
    assert.ok(round.count <= 2, "2-3 años no debe superar 2");
  }
  const sixCounts = new Set();
  for (let roundIndex = 0; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
    sixCounts.add(createCatchRound({ themeId: "cielo", ageId: "6", roundIndex }).count);
  }
  assert.ok([...sixCounts].some((count) => count >= 5), "6 años debe alcanzar metas altas");
});

test("catchDifficultyForRound sube velocidad y señuelos, baja el intervalo de caída", () => {
  for (const ageId of Object.keys(CATCH_AGE_PROFILES)) {
    const profile = CATCH_AGE_PROFILES[ageId];
    const first = catchDifficultyForRound(ageId, 0);
    const last = catchDifficultyForRound(ageId, CATCH_ROUNDS - 1);
    assert.equal(first.fallSpeed, profile.startFallSpeed);
    assert.equal(last.fallSpeed, profile.endFallSpeed);
    assert.equal(first.spawnGapMs, profile.startSpawnGapMs);
    assert.equal(last.spawnGapMs, profile.endSpawnGapMs);
    assert.equal(first.decoyChance, profile.startDecoyChance);
    assert.equal(last.decoyChance, profile.endDecoyChance);

    let previous = first;
    for (let roundIndex = 1; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
      const current = catchDifficultyForRound(ageId, roundIndex);
      assert.ok(current.fallSpeed >= previous.fallSpeed, `${ageId} r${roundIndex}: velocidad no baja`);
      assert.ok(current.spawnGapMs <= previous.spawnGapMs, `${ageId} r${roundIndex}: intervalo no sube`);
      assert.ok(current.decoyChance >= previous.decoyChance, `${ageId} r${roundIndex}: señuelos no bajan`);
      previous = current;
    }
  }
});

test("los temas tienen suficiente variedad de señuelos", () => {
  for (const theme of CATCH_THEMES) {
    assert.ok(theme.target.length >= 3);
    assert.ok(theme.decoy.length >= 3);
    const overlap = theme.target.filter((sticker) => theme.decoy.includes(sticker));
    assert.equal(overlap.length, 0, `${theme.id} tiene señuelos que coinciden con objetivos`);
  }
});
