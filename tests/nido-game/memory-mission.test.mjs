import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createMemoryBoard,
  MEMORY_AGE_PROFILES,
  MEMORY_ROUNDS,
  MEMORY_THEMES,
} from "../../src/nido/game/content/memory-mission.js";

test("cada tema tiene stickers suficientes para el mazo más grande", () => {
  const maxPairs = Math.max(...Object.values(MEMORY_AGE_PROFILES).map((p) => p.pairCount));
  for (const theme of MEMORY_THEMES) {
    assert.ok(theme.stickers.length >= maxPairs, `${theme.id} necesita ${maxPairs} stickers`);
  }
});

test("el tablero tiene exactamente pairCount*2 cartas balanceadas", () => {
  for (const theme of MEMORY_THEMES) {
    for (const ageId of Object.keys(MEMORY_AGE_PROFILES)) {
      const profile = MEMORY_AGE_PROFILES[ageId];
      const board = createMemoryBoard({ themeId: theme.id, ageId, roundIndex: 0 });
      assert.equal(board.length, profile.pairCount * 2);
      const counts = new Map();
      for (const card of board) {
        counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1);
      }
      for (const count of counts.values()) assert.equal(count, 2);
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
