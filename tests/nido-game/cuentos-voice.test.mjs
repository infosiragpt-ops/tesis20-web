import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import {
  enumerateCuentosVoicePlan,
  estimateWordStarts,
  optionSpeechText,
  pageSpeechText,
  splitWords,
  wordIndexAt,
  wordKey,
  wordStartsFromAlignment,
} from "../../src/nido/cuentos/cuentos-voice-plan.js";

// La biblioteca de cuentos narraba con la voz sintética del navegador. Desde
// que existe cuentos-manifest.json cada página, pregunta, opción y palabra
// suena con la voz de estudio; estos tests impiden que un cuento nuevo o un
// texto editado vuelva a sonar a robot sin que nadie lo note.

const MANIFEST_URL = new URL("../../public/assets/nido/audio/cuentos-manifest.json", import.meta.url);
const AUDIO_DIR = new URL("../../public/assets/nido/audio/cuentos/", import.meta.url);

async function readManifest() {
  return JSON.parse(await readFile(MANIFEST_URL, "utf8"));
}

test("las claves de palabra ignoran puntuación y mayúsculas", () => {
  assert.equal(wordKey("—¿Dónde"), "dónde");
  assert.equal(wordKey("dónde?"), "dónde");
  assert.equal(wordKey("Kusi."), "kusi");
  assert.equal(wordKey("—"), null);
  assert.equal(optionSpeechText("Un zorro"), "Un zorro.");
  assert.equal(optionSpeechText("¿Qué animal es Kusi?"), "¿Qué animal es Kusi?");
});

test("el reparto de palabras coincide con el del lector", () => {
  const text = pageSpeechText({ t: "La cima", x: "Al final llegó.  Y ya." });
  const { words, offsets } = splitWords(text);
  assert.deepEqual(words, ["La", "cima.", "Al", "final", "llegó.", "Y", "ya."]);
  assert.deepEqual(
    offsets.map((at, i) => text.slice(at, at + words[i].length)),
    words,
  );
});

test("las marcas de tiempo salen de la alineación por carácter", () => {
  const text = "Hola mundo";
  const alignment = {
    characters: text.split(""),
    character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
  };
  assert.deepEqual(wordStartsFromAlignment(text, alignment), [0, 0.5]);
  assert.equal(wordStartsFromAlignment("Otro texto", alignment), null);
  assert.deepEqual(estimateWordStarts("ab cd", 2), [0, 1]);
  assert.equal(wordIndexAt([0, 0.5], 0.3), 0);
  assert.equal(wordIndexAt([0, 0.5], 0.5), 1);
  assert.equal(wordIndexAt([0.5, 0.6], 0.1), -1);
  assert.equal(wordIndexAt([], 1), -1);
});

test("el plan cubre cada página, pregunta, opción y palabra de los ocho cuentos", () => {
  const jobs = enumerateCuentosVoicePlan(BOOKS);
  const kinds = new Map();
  for (const job of jobs) kinds.set(job.kind, (kinds.get(job.kind) ?? 0) + 1);
  const pages = BOOKS.reduce((sum, book) => sum + book.pages.length, 0);
  const questions = BOOKS.reduce((sum, book) => sum + book.quiz.length, 0);
  assert.equal(kinds.get("page"), pages);
  assert.equal(kinds.get("quiz-q"), questions);
  assert.equal(kinds.get("quiz-a"), questions * 3);
  assert.ok(kinds.get("word") > 400, `Sólo ${kinds.get("word")} palabras distintas.`);
  for (const job of jobs) assert.ok(job.text.trim(), `${job.key} no tiene texto narrable.`);
});

test("cada locución del plan está grabada y su mp3 existe", async () => {
  const manifest = await readManifest();
  assert.equal(manifest.provider, "elevenlabs");
  assert.equal(manifest.delivery, "local-prerecorded");
  const faltan = [];
  const archivos = new Set();
  for (const job of enumerateCuentosVoicePlan(BOOKS)) {
    let fileName = null;
    if (job.kind === "page") fileName = manifest.books?.[job.bookId]?.pages?.[job.index]?.src;
    else if (job.kind === "quiz-q") fileName = manifest.books?.[job.bookId]?.quiz?.[job.index]?.q;
    else if (job.kind === "quiz-a") fileName = manifest.books?.[job.bookId]?.quiz?.[job.index]?.a?.[job.optionIndex];
    else fileName = manifest.words?.[job.wordKey];
    if (!fileName) faltan.push(job.key);
    else archivos.add(fileName);
  }
  assert.deepEqual(faltan, [], `${faltan.length} locuciones de cuentos no están grabadas; corre \`npm run audio:cuentos\`.`);
  const perdidos = [];
  for (const fileName of archivos) {
    try {
      await access(new URL(fileName, AUDIO_DIR));
    } catch {
      perdidos.push(fileName);
    }
  }
  assert.deepEqual(perdidos, [], `${perdidos.length} mp3 del manifiesto no existen en disco.`);
});

test("cada página trae una marca de tiempo por palabra y en orden", async () => {
  const manifest = await readManifest();
  for (const book of BOOKS) {
    book.pages.forEach((page, index) => {
      const entry = manifest.books?.[book.id]?.pages?.[index];
      assert.ok(entry, `${book.id} página ${index + 1} sin entrada.`);
      const { words } = splitWords(pageSpeechText(page));
      assert.equal(entry.words.length, words.length, `${book.id} página ${index + 1}: ${entry.words.length} marcas para ${words.length} palabras.`);
      for (let i = 1; i < entry.words.length; i += 1) {
        assert.ok(entry.words[i] >= entry.words[i - 1], `${book.id} página ${index + 1}: marca ${i} retrocede.`);
      }
      assert.ok(entry.duration > entry.words.at(-1), `${book.id} página ${index + 1}: la última palabra empieza después del final.`);
    });
  }
});
