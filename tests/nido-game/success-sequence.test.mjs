import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../../src/nido/nido-games.jsx", import.meta.url),
  "utf8",
);

test("la celebración completa audio, elogio y pausa antes de avanzar", () => {
  const feedback = source.indexOf('await playFeedbackSound("success")');
  const praise = source.indexOf("await speakCelebrationPraise(", feedback);
  const dwell = source.indexOf("CELEBRATION_DWELL_MS", praise);
  const finish = source.indexOf("finishSuccessCelebration(", dwell);

  assert.ok(feedback >= 0, "falta esperar el sonido de éxito");
  assert.ok(praise > feedback, "el elogio debe empezar después del sonido");
  assert.ok(dwell > praise, "la pausa visual debe empezar después del elogio");
  assert.ok(finish > dwell, "el avance debe ocurrir al terminar la secuencia");
  assert.doesNotMatch(source, /AUTO_ADVANCE_MS/);
  assert.match(source, /feedbackAudio\.onended\s*=\s*\(\)\s*=>\s*settle\(true\)/);
});

test("el respaldo global no puede cortar los watchdogs internos", () => {
  const failsafe = Number(
    source.match(/CELEBRATION_FAILSAFE_MS\s*=\s*(\d+)/)?.[1],
  );
  const dwell = Number(
    source.match(/CELEBRATION_DWELL_MS\s*=\s*(\d+)/)?.[1],
  );

  assert.ok(failsafe >= 4_000 + 7_500 + dwell + 1_000);
  assert.match(source, /voiceschanged/);
});
