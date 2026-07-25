import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createMemoryBoard,
  MEMORY_AGE_PROFILES,
  memoryDifficultyForRound,
  MEMORY_ROUNDS,
  MEMORY_THEMES,
} from "../../src/nido/game/content/memory-mission.js";

test("cada tema tiene stickers suficientes para el mazo más grande", () => {
  const maxPairs = Math.max(...Object.values(MEMORY_AGE_PROFILES).map((p) => p.maxPairCount));
  for (const theme of MEMORY_THEMES) {
    assert.ok(theme.stickers.length >= maxPairs, `${theme.id} necesita ${maxPairs} stickers`);
  }
});

test("el tablero tiene exactamente pairCount*2 cartas balanceadas para cada ronda", () => {
  for (const theme of MEMORY_THEMES) {
    for (const ageId of Object.keys(MEMORY_AGE_PROFILES)) {
      for (const roundIndex of [0, 9, MEMORY_ROUNDS - 1]) {
        const { pairCount } = memoryDifficultyForRound(ageId, roundIndex);
        const board = createMemoryBoard({ themeId: theme.id, ageId, roundIndex });
        assert.equal(board.length, pairCount * 2);
        const counts = new Map();
        for (const card of board) {
          counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1);
        }
        for (const count of counts.values()) assert.equal(count, 2);
      }
    }
  }
});

test("memoryDifficultyForRound sube parejas y baja tiempos a lo largo de las 20 rondas", () => {
  for (const ageId of Object.keys(MEMORY_AGE_PROFILES)) {
    const profile = MEMORY_AGE_PROFILES[ageId];
    const first = memoryDifficultyForRound(ageId, 0);
    const last = memoryDifficultyForRound(ageId, MEMORY_ROUNDS - 1);
    assert.equal(first.pairCount, profile.minPairCount);
    assert.equal(last.pairCount, profile.maxPairCount);
    assert.equal(first.previewMs, profile.startPreviewMs);
    assert.equal(last.previewMs, profile.endPreviewMs);
    assert.equal(first.mismatchMs, profile.startMismatchMs);
    assert.equal(last.mismatchMs, profile.endMismatchMs);

    let previous = first;
    for (let roundIndex = 1; roundIndex < MEMORY_ROUNDS; roundIndex += 1) {
      const current = memoryDifficultyForRound(ageId, roundIndex);
      assert.ok(current.pairCount >= previous.pairCount, `${ageId} r${roundIndex}: parejas no bajan`);
      assert.ok(current.previewMs <= previous.previewMs, `${ageId} r${roundIndex}: preview no sube`);
      assert.ok(current.mismatchMs <= previous.mismatchMs, `${ageId} r${roundIndex}: mismatch no sube`);
      previous = current;
    }
  }
});

test("la generación es determinista y varía por ronda", () => {
  const a = createMemoryBoard({ themeId: "bosque", ageId: "4-5", roundIndex: 3 });
  const b = createMemoryBoard({ themeId: "bosque", ageId: "4-5", roundIndex: 3 });
  assert.deepEqual(a, b);

  const c = createMemoryBoard({ themeId: "bosque", ageId: "4-5", roundIndex: 4 });
  assert.notDeepEqual(a.map((card) => card.sticker), c.map((card) => card.sticker));
});

test("cubre las 20 rondas para cada tema y edad sin lanzar errores", () => {
  for (const theme of MEMORY_THEMES) {
    for (const ageId of Object.keys(MEMORY_AGE_PROFILES)) {
      for (let roundIndex = 0; roundIndex < MEMORY_ROUNDS; roundIndex += 1) {
        assert.doesNotThrow(() =>
          createMemoryBoard({ themeId: theme.id, ageId, roundIndex }),
        );
      }
    }
  }
});
