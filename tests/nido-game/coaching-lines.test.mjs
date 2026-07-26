import assert from "node:assert/strict";
import test from "node:test";

import {
  AGE_COACHING_LINES,
  NIDO_AGE_GROUPS,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
  buildCurriculumChallenge,
} from "../../src/nido/nido-curriculum.js";

const AGES = ["2-3", "4-5", "6"];

// Palabras que describirían a quien juega marcando género. La mitad del alumnado
// del Nido son niñas: un «¡muy listo!» las deja fuera cada vez que suena. No se
// listan aquí sustantivos que acompañan a otra cosa («ojos de águila», «mente
// sabia»), solo los que calificarían al niño directamente.
const GENDERED = [
  "listo", "lista", "campeón", "campeona", "tranquilo", "tranquila",
  "atento", "atenta", "solito", "solita", "experto", "experta",
  "explorador", "exploradora", "travieso", "traviesa", "bueno", "buena",
];

test("hay repertorio suficiente y sin repeticiones", () => {
  const all = [];
  for (const age of AGES) {
    const lines = AGE_COACHING_LINES[age];
    assert.ok(lines, `Falta el repertorio de ${age}.`);
    assert.ok(
      lines.length >= 12,
      `La edad ${age} solo tiene ${lines.length} cierres: con pocos, el niño oye siempre el mismo.`,
    );
    assert.equal(new Set(lines).size, lines.length, `${age} repite un cierre.`);
    all.push(...lines);
  }
  assert.equal(new Set(all).size, all.length, "Dos edades comparten el mismo cierre.");
});

test("ningún cierre marca género ni se construye al vuelo", () => {
  for (const age of AGES) {
    for (const line of AGE_COACHING_LINES[age]) {
      // Un texto interpolado no se puede grabar en estudio: el hash del audio
      // sale del texto exacto, así que caería en la voz sintética del navegador.
      assert.ok(!line.includes("${"), `«${line}» interpola una variable.`);
      const words = line.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
      for (const forbidden of GENDERED) {
        assert.ok(
          !words.includes(forbidden),
          `«${line}» (${age}) usa «${forbidden}», que marca género.`,
        );
      }
      assert.match(line, /[!?][\s]*$|!$/, `«${line}» no termina animando.`);
      const count = words.length;
      assert.ok(
        count >= 4 && count <= 14,
        `«${line}» tiene ${count} palabras; se añade a miles de locuciones.`,
      );
    }
  }
});

// El motivo real del cambio: con tres cierres por edad, «¡Confío en ti!» sonaba
// en el 24% de las 2460 locuciones y la narración se volvía un runrún. Este test
// mide la repetición sobre el catálogo entero para que no vuelva a subir.
test("ninguna despedida domina el catálogo hablado", () => {
  const tailsByAge = new Map();
  const seen = new Set();
  let bespoke = 0;

  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        for (let gameIndex = 0; gameIndex < NIDO_CURRICULUM_GAME_COUNT; gameIndex += 1) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          const key = challenge.audioId ?? challenge.id;
          if (seen.has(key)) continue;
          seen.add(key);
          const spoken = String(challenge.spokenText ?? challenge.spokenInstruction ?? "");
          const line = AGE_COACHING_LINES[age.id].find((candidate) =>
            spoken.endsWith(candidate),
          );
          // Alguna consigna escrita a mano trae su propio remate y no usa el
          // repertorio; se cuentan aparte para que no falseen la proporción.
          if (!line) {
            bespoke += 1;
            continue;
          }
          const counts = tailsByAge.get(age.id) ?? new Map();
          counts.set(line, (counts.get(line) ?? 0) + 1);
          tailsByAge.set(age.id, counts);
        }
      }
    }
  }

  assert.ok(
    bespoke <= seen.size * 0.01,
    `${bespoke} consignas se saltan el repertorio de cierres; deberían ser una rareza.`,
  );

  for (const [ageId, counts] of tailsByAge) {
    const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
    const top = Math.max(...counts.values());
    assert.ok(
      counts.size >= 12,
      `La edad ${ageId} solo usa ${counts.size} cierres distintos en todo el catálogo.`,
    );
    assert.ok(
      top / total <= 0.18,
      `En ${ageId} un mismo cierre suena en el ${((top / total) * 100).toFixed(1)}% de las locuciones.`,
    );
  }
});

// Cada reto con la misma consigna base debe recibir el mismo cierre: si no,
// dejarían de compartir mp3 y el catálogo grabado se multiplicaría por su cuenta.
test("los retos que comparten locución comparten cierre", () => {
  const textByVoiceKey = new Map();
  for (const age of NIDO_AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        for (let gameIndex = 0; gameIndex < NIDO_CURRICULUM_GAME_COUNT; gameIndex += 1) {
          const challenge = buildCurriculumChallenge({
            areaId: area.id,
            categoryId: category.id,
            ageId: age.id,
            gameIndex,
          });
          const key = challenge.audioId;
          if (!key || !String(key).startsWith("voz-")) continue;
          const spoken = String(challenge.spokenText ?? challenge.spokenInstruction ?? "");
          const previous = textByVoiceKey.get(key);
          if (previous === undefined) textByVoiceKey.set(key, spoken);
          else assert.equal(previous, spoken, `La clave de audio ${key} tiene dos textos distintos.`);
        }
      }
    }
  }
  assert.ok(textByVoiceKey.size > 0, "No se encontró ninguna locución compartida.");
});
