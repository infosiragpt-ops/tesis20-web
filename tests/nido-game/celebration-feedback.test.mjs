import assert from "node:assert/strict";
import test from "node:test";

import {
  SUCCESS_CELEBRATIONS,
  getCelebrationVoiceProfile,
  pickSuccessCelebration,
} from "../../src/nido/game/content/celebration-feedback.js";

test("ofrece refuerzos positivos variados y completos", () => {
  assert.ok(SUCCESS_CELEBRATIONS.length >= 10);
  assert.equal(
    new Set(SUCCESS_CELEBRATIONS.map((item) => item.id)).size,
    SUCCESS_CELEBRATIONS.length,
  );
  for (const item of SUCCESS_CELEBRATIONS) {
    assert.match(item.headline, /^¡/);
    assert.match(item.spokenText, /^¡/);
    assert.ok(item.caption.length >= 20);
    assert.ok(item.burst);
  }
});

test("la elección es estable y varía a lo largo de las rondas", () => {
  const first = pickSuccessCelebration("logica:detective:1", 1);
  assert.deepEqual(
    pickSuccessCelebration("logica:detective:1", 1),
    first,
  );

  const ids = new Set(
    Array.from({ length: 40 }, (_, index) =>
      pickSuccessCelebration(`reto-${index}`, index % 6).id,
    ),
  );
  assert.ok(ids.size >= 8);
});

test("la voz mantiene ritmos infantiles seguros por edad", () => {
  const sample = SUCCESS_CELEBRATIONS[0];
  const toddler = getCelebrationVoiceProfile("2-3", sample);
  const older = getCelebrationVoiceProfile("6", sample);
  assert.ok(toddler.rate < older.rate);
  for (const ageId of ["2-3", "4-5", "6"]) {
    const profile = getCelebrationVoiceProfile(ageId, sample);
    assert.ok(profile.rate >= 0.76 && profile.rate <= 1.04);
    assert.ok(profile.pitch >= 0.96 && profile.pitch <= 1.28);
  }
});
