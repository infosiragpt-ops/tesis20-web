import assert from "node:assert/strict";
import { test } from "node:test";
import {
  briefingKey,
  enumerateForestVoiceLines,
  missionCompleteKey,
  missionCompleteText,
  partialKey,
  partialText,
  successKey,
  successText,
  tryAgainKey,
  tryAgainText,
} from "../../src/nido/game/content/forest-voice-lines.js";

test("enumera líneas de voz sin claves duplicadas ni texto vacío", () => {
  const lines = enumerateForestVoiceLines();
  assert.ok(lines.length > 100, "debe cubrir un catálogo sustancial de líneas");

  const seen = new Set();
  for (const line of lines) {
    assert.ok(!seen.has(line.key), `clave duplicada: ${line.key}`);
    seen.add(line.key);
    assert.ok(line.text.trim().length > 5, `${line.key}: texto demasiado corto`);
    assert.ok(["2-3", "4-5", "6"].includes(line.ageId), `${line.key}: ageId inválido`);
  }
});

test("la enumeración es determinista", () => {
  const a = enumerateForestVoiceLines();
  const b = enumerateForestVoiceLines();
  assert.deepEqual(a, b);
});

test("las funciones de clave coinciden con las claves enumeradas", () => {
  const lines = enumerateForestVoiceLines();
  const keys = new Set(lines.map((line) => line.key));

  assert.ok(keys.has(briefingKey("2-3", 0, 0)));
  assert.ok(keys.has(briefingKey("6", 19, 2)));
  assert.ok(keys.has(successKey("4-5", true)));
  assert.ok(keys.has(successKey("4-5", false)));
  assert.ok(keys.has(missionCompleteKey("2-3")));
});

test("los textos parametrizados coinciden con su versión generadora", () => {
  assert.match(tryAgainText(1), /una fruta/);
  assert.match(tryAgainText(3), /tres frutas/);
  assert.match(partialText(1, 1), /Falta una fruta/);
  assert.match(partialText(2, 3), /Faltan tres frutas/);
  assert.equal(successText(false), "¡Muy bien! ¡Lo lograste!");
  assert.match(successText(true), /reto un poquito más grande/);
  assert.equal(missionCompleteText, "¡Misión del bosque completada! Eres increíble.");
});

test("cada edad cubre exactamente las metas alcanzables por su perfil", () => {
  const lines = enumerateForestVoiceLines();
  const tryAgainFor2to3 = lines
    .filter((line) => line.key.startsWith("bosque-tryagain-2-3-"))
    .map((line) => line.key);
  // Perfil 2-3: niveles con targets [1,2] y [2,3] -> unión {1,2,3}
  assert.equal(tryAgainFor2to3.length, 3);
  assert.ok(tryAgainFor2to3.includes(tryAgainKey("2-3", 1)));
  assert.ok(tryAgainFor2to3.includes(tryAgainKey("2-3", 2)));
  assert.ok(tryAgainFor2to3.includes(tryAgainKey("2-3", 3)));

  const partialForOne = lines.filter(
    (line) => line.key === partialKey("2-3", 1, 0),
  );
  assert.equal(partialForOne.length, 0, "meta 1 no admite entrega parcial");
});
