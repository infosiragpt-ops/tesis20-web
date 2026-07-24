import assert from "node:assert/strict";
import { test } from "node:test";
import { createDifficultyAdapter } from "../../src/nido/game/learning/difficulty.js";

test("tres aciertos seguidos suben un nivel hasta el máximo", () => {
  const adapter = createDifficultyAdapter({ maxLevel: 2 });
  assert.equal(adapter.level(), 0);
  adapter.recordSuccess();
  adapter.recordSuccess();
  assert.equal(adapter.recordSuccess().levelUp, true);
  assert.equal(adapter.level(), 1);
  adapter.recordSuccess();
  adapter.recordSuccess();
  adapter.recordSuccess();
  assert.equal(adapter.level(), 2);
  adapter.recordSuccess();
  adapter.recordSuccess();
  assert.equal(adapter.recordSuccess().levelUp, false, "tope respetado");
});

test("dos errores activan ayuda y tres bajan el nivel", () => {
  const adapter = createDifficultyAdapter({ maxLevel: 2 });
  adapter.recordSuccess();
  adapter.recordSuccess();
  adapter.recordSuccess();
  assert.equal(adapter.level(), 1);
  assert.equal(adapter.recordError().help, false);
  const second = adapter.recordError();
  assert.equal(second.help, true, "segunda falla → ayuda");
  assert.equal(adapter.helpActive(), true);
  const third = adapter.recordError();
  assert.equal(third.levelDown, true, "tercera falla → baja nivel");
  assert.equal(adapter.level(), 0);
});

test("un acierto limpia la racha de errores y la ayuda", () => {
  const adapter = createDifficultyAdapter({ maxLevel: 2 });
  adapter.recordError();
  adapter.recordError();
  assert.equal(adapter.helpActive(), true);
  adapter.recordSuccess();
  assert.equal(adapter.helpActive(), false);
  const summary = adapter.summary();
  assert.equal(summary.attempts, 3);
  assert.equal(summary.errors, 2);
  assert.equal(summary.helps, 1);
});
