import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATCH_ADVANCED_ROUND_INDEX,
  CATCH_AGE_PROFILES,
  catchDifficultyForRound,
  CATCH_EXPERT_ROUND_INDEX,
  CATCH_ROUNDS,
  CATCH_SHAPE_SIDES,
  CATCH_THEMES,
  cieloSecondaryTarget,
  createCatchRound,
  formasAttributeTargets,
  huertoTargetSwitch,
} from "../../src/nido/game/content/catch-mission.js";

const findTheme = (id) => CATCH_THEMES.find((item) => item.id === id);

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

test("Atrapa en el Huerto cambia de objetivo solo en nivel experto", () => {
  const theme = findTheme("huerto");
  for (let roundIndex = 0; roundIndex < CATCH_EXPERT_ROUND_INDEX; roundIndex += 1) {
    assert.equal(huertoTargetSwitch({ themeId: "huerto", theme, roundIndex, currentTarget: theme.target[0] }), null);
  }
  for (let roundIndex = CATCH_EXPERT_ROUND_INDEX; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
    for (const current of theme.target) {
      const next = huertoTargetSwitch({ themeId: "huerto", theme, roundIndex, currentTarget: current });
      assert.ok(theme.target.includes(next), "el nuevo objetivo pertenece al tema");
      assert.notEqual(next, current, "el objetivo debe cambiar de verdad");
    }
  }
  // Otros mundos nunca activan este cambio.
  for (const theme2 of CATCH_THEMES) {
    if (theme2.id === "huerto") continue;
    assert.equal(
      huertoTargetSwitch({ themeId: theme2.id, theme: theme2, roundIndex: 19, currentTarget: theme2.target[0] }),
      null,
    );
  }
});

test("Atrapa en el Cielo da un segundo objetivo con doble puntaje solo en nivel avanzado y con meta >= 2", () => {
  const theme = findTheme("cielo");
  for (let roundIndex = 0; roundIndex < CATCH_ADVANCED_ROUND_INDEX; roundIndex += 1) {
    assert.equal(cieloSecondaryTarget({ themeId: "cielo", theme, roundIndex, target: theme.target[0], count: 4 }), null);
  }
  for (let roundIndex = CATCH_ADVANCED_ROUND_INDEX; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
    assert.equal(
      cieloSecondaryTarget({ themeId: "cielo", theme, roundIndex, target: theme.target[0], count: 1 }),
      null,
      "con meta 1 no debe activarse (no alcanzaría ni para un solo objetivo doble)",
    );
    const secondary = cieloSecondaryTarget({ themeId: "cielo", theme, roundIndex, target: theme.target[0], count: 3 });
    assert.ok(theme.target.includes(secondary));
    assert.notEqual(secondary, theme.target[0], "el segundo objetivo debe ser distinto del primero");
  }
});

test("Atrapa Formas define objetivo por número de lados solo en avanzado/experto, sin ambigüedad", () => {
  const theme = findTheme("formas");
  for (let roundIndex = 0; roundIndex < CATCH_ADVANCED_ROUND_INDEX; roundIndex += 1) {
    assert.equal(formasAttributeTargets({ themeId: "formas", theme, roundIndex, target: "Square" }), null);
  }
  for (let roundIndex = CATCH_ADVANCED_ROUND_INDEX; roundIndex < CATCH_ROUNDS; roundIndex += 1) {
    for (const target of theme.target) {
      const result = formasAttributeTargets({ themeId: "formas", theme, roundIndex, target });
      assert.ok(result, `${target} debe producir un modo por atributo válido`);
      assert.ok(result.validTargets.length >= 1, "siempre hay al menos un sticker válido");
      for (const sticker of result.validTargets) {
        assert.equal(
          CATCH_SHAPE_SIDES[sticker],
          result.sides,
          `${sticker} debe compartir exactamente el número de lados anunciado`,
        );
      }
      // Verificación paso a paso de que ningún sticker fuera de validTargets
      // comparte el mismo número de lados (si lo hiciera, sería ambiguo
      // dejarlo fuera).
      const allShapeStickers = [...new Set([...theme.target, ...theme.decoy])];
      for (const sticker of allShapeStickers) {
        if (CATCH_SHAPE_SIDES[sticker] === result.sides) {
          assert.ok(result.validTargets.includes(sticker), `${sticker} comparte lados y debía incluirse`);
        }
      }
    }
  }
  // "Square" es el único caso con más de un sticker válido (Square + Rectangle).
  const squareCase = formasAttributeTargets({ themeId: "formas", theme, roundIndex: CATCH_ADVANCED_ROUND_INDEX, target: "Square" });
  assert.deepEqual([...squareCase.validTargets].sort(), ["Rectangle", "Square"]);
});

test("los temas tienen suficiente variedad de señuelos", () => {
  for (const theme of CATCH_THEMES) {
    assert.ok(theme.target.length >= 3);
    assert.ok(theme.decoy.length >= 3);
    const overlap = theme.target.filter((sticker) => theme.decoy.includes(sticker));
    assert.equal(overlap.length, 0, `${theme.id} tiene señuelos que coinciden con objetivos`);
  }
});
