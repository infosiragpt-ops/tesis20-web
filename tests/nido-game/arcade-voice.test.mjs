import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ARCADE_AGE_IDS,
  enumerateArcadeVoiceLines,
} from "../../src/nido/game/content/arcade-voice-lines.js";
import {
  PERSISTENCE_CELEBRATION,
  STREAK_CELEBRATIONS,
  SUCCESS_CELEBRATIONS,
  celebrationAudioKey,
} from "../../src/nido/game/content/celebration-feedback.js";

const RUNTIMES = [
  "src/nido/game/memoria/MemoriaGame.jsx",
  "src/nido/game/catch/CatchGame.jsx",
];

// Memoria Mágica y Atrapa y Cuenta narraban íntegramente con la voz sintética
// del sistema: llamaban a speak() con la frase suelta y audioDirector, al no
// recibir audioSrc, caía al respaldo del dispositivo. Diez de los 540 juegos
// sonaban a robot mientras el resto usaba a la maestra de estudio. Estos tests
// impiden que vuelva a colarse una frase sin grabar.

test("ningún runtime del arcade habla sin pedir un clip grabado", async () => {
  for (const path of RUNTIMES) {
    const source = await readFile(new URL(`../../${path}`, import.meta.url), "utf8");
    // La única invocación suelta admisible es la que hace narrate() al delegar;
    // `audioRef.current?.speak(...)` no cuenta porque lleva punto delante.
    // Cualquier otra es una frase que sonaría con voz de robot.
    const llamadas = [...source.matchAll(/(?<![.\w])speak\(/g)].length;
    assert.equal(
      llamadas,
      1,
      `${path} llama a speak() ${llamadas} veces fuera de narrate(); toda frase debe pasar por narrate(texto, clave) para sonar con la maestra de estudio.`,
    );
    assert.match(
      source,
      /audioSrc: key \? tracksRef\.current\[key\]/,
      `${path} no resuelve la clave contra el manifiesto.`,
    );
  }
});

test("cada clave que usan los runtimes existe en el manifiesto grabado", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../../public/assets/nido/audio/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const faltan = [];
  for (const line of enumerateArcadeVoiceLines()) {
    if (!manifest.tracks?.[line.key]) faltan.push(line.key);
  }
  assert.deepEqual(
    faltan,
    [],
    `${faltan.length} locuciones del arcade no están grabadas; corre \`npm run audio:nido\`.`,
  );
});

test("las celebraciones que encadena el arcade están grabadas", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../../public/assets/nido/audio/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const todas = [
    ...SUCCESS_CELEBRATIONS,
    ...STREAK_CELEBRATIONS,
    PERSISTENCE_CELEBRATION,
  ].filter(Boolean);
  for (const celebration of todas) {
    const key = celebrationAudioKey(celebration.id);
    assert.ok(
      manifest.tracks?.[key],
      `La celebración «${celebration.headline}» (${key}) no tiene mp3: sonaría con voz de robot.`,
    );
  }
});

test("hay una locución por edad y ninguna se construye al vuelo", () => {
  const lines = enumerateArcadeVoiceLines();
  assert.ok(lines.length > 40, `Sólo ${lines.length} locuciones de arcade.`);
  const porEdad = new Map();
  for (const line of lines) {
    assert.ok(
      ARCADE_AGE_IDS.includes(line.ageId),
      `La clave ${line.key} declara la edad ${line.ageId}.`,
    );
    // Un texto interpolado no se puede grabar: su hash cambia con el valor.
    assert.ok(!line.text.includes("${"), `${line.key} interpola una variable.`);
    assert.ok(line.text.trim().length > 10, `${line.key} tiene un texto vacío.`);
    porEdad.set(line.ageId, (porEdad.get(line.ageId) ?? 0) + 1);
  }
  for (const ageId of ARCADE_AGE_IDS) {
    assert.ok(
      porEdad.get(ageId) > 10,
      `La edad ${ageId} sólo tiene ${porEdad.get(ageId) ?? 0} locuciones de arcade.`,
    );
  }
});
