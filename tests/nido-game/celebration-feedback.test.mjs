import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  celebrationAudioKey,
  PERSISTENCE_CELEBRATION,
  STREAK_CELEBRATIONS,
  SUCCESS_CELEBRATIONS,
  getCelebrationVoiceProfile,
  pickStreakCelebration,
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

// Un festejo con el texto interpolado (“¡3 respuestas seguidas!”) no se puede
// grabar en estudio y volvería a sonar con la voz sintética del navegador justo
// en el momento más emocionante. Todo lo que el niño pueda oír tiene que salir
// de un catálogo cerrado y estar en el manifiesto profesional.
test("cada festejo que el niño puede oír está grabado con la maestra", () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../../public/assets/nido/audio/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const recorded = [
    ...SUCCESS_CELEBRATIONS,
    ...STREAK_CELEBRATIONS,
    PERSISTENCE_CELEBRATION,
  ];

  for (const celebration of recorded) {
    assert.ok(
      manifest.tracks[celebrationAudioKey(celebration.id)],
      `La celebración “${celebration.id}” no tiene locución grabada.`,
    );
  }

  const spokenById = new Map(
    recorded.map((celebration) => [celebration.id, celebration.spokenText]),
  );
  for (let streak = 3; streak <= 30; streak += 1) {
    for (let seed = 0; seed < 12; seed += 1) {
      const streakCelebration = pickStreakCelebration(`reto-${seed}`, streak);
      assert.equal(
        streakCelebration.spokenText,
        spokenById.get(streakCelebration.id),
        `La racha de ${streak} habla un texto que nadie grabó.`,
      );
      assert.equal(streakCelebration.headline, `¡${streak} seguidas!`);
    }
  }
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
