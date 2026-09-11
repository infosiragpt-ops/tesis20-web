import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { splitWords, wordKey } from "../../src/nido/cuentos/cuentos-voice-plan.js";
import { TOY_SOUND_ALIAS } from "../../src/nido/cuentos/cuentos-audio.js";

// Las páginas pueden pedir efectos (`sfx`, `cues`) y acciones del escenario
// (`acts`). Estos tests impiden referenciar un efecto que no está grabado, una
// acción que el escenario no conoce, un actor que no está en la página o una
// palabra que la narración nunca pronuncia (el disparo quedaría mudo).

const MANIFEST_URL = new URL("../../public/assets/nido/audio/cuentos-sound.json", import.meta.url);
const AUDIO_DIR = new URL("../../public/assets/nido/audio/sonido/", import.meta.url);
const ACTS = new Set(["blow", "howl", "shiver", "run", "build", "cheer", "sleep"]);

test("música y efectos del manifiesto existen en disco", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, "utf8"));
  assert.equal(manifest.provider, "elevenlabs");
  assert.ok(manifest.music?.biblioteca?.src && manifest.music?.lectura?.src, "Faltan las dos pistas de música.");
  for (const entry of [...Object.values(manifest.music), ...Object.values(manifest.sfx)]) {
    await access(new URL(entry.src, AUDIO_DIR));
    assert.ok(entry.seconds > 0.5);
  }
  assert.ok(Object.values(manifest.music).every((entry) => entry.seconds >= 30), "La música debe durar al menos 30 s para el bucle.");
});

test("cada sfx, cue y act de las páginas es válido", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, "utf8"));
  for (const book of BOOKS) {
    book.pages.forEach((page, index) => {
      const where = `${book.id} página ${index + 1}`;
      const cast = new Set(page.cast || []);
      for (const key of [...(page.sfx || []), ...(page.sfxEnd || [])]) assert.ok(manifest.sfx[key], `${where}: sfx «${key}» no grabado.`);
      for (const [actor, act] of Object.entries(page.acts || {})) {
        assert.ok(cast.has(actor), `${where}: act para «${actor}», que no está en la página.`);
        assert.ok(ACTS.has(act), `${where}: acción desconocida «${act}».`);
      }
      const spoken = new Set(splitWords(page.x).words.map(wordKey));
      for (const [word, cue] of Object.entries(page.cues || {})) {
        assert.equal(word, wordKey(word), `${where}: la clave «${word}» debe ir en minúsculas sin puntuación.`);
        assert.ok(spoken.has(word), `${where}: la narración nunca dice «${word}».`);
        if (cue.sfx) assert.ok(manifest.sfx[cue.sfx], `${where}: sfx «${cue.sfx}» no grabado.`);
        for (const [actor, act] of Object.entries(cue.act || {})) {
          assert.ok(cast.has(actor), `${where}: cue «${word}» apunta a «${actor}», que no está en la página.`);
          assert.ok(ACTS.has(act), `${where}: acción desconocida «${act}».`);
        }
      }
    });
  }
});

test("cada escenario tiene su ambiente en bucle y cada figura del reparto tiene voz", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, "utf8"));
  for (const book of BOOKS) {
    const ambient = manifest.ambient?.[book.set];
    assert.ok(ambient?.src, `${book.id}: falta el ambiente del escenario «${book.set}».`);
    assert.ok(ambient.seconds >= 6, `${book.id}: el ambiente «${book.set}» es demasiado corto para un bucle.`);
    await access(new URL(ambient.src, AUDIO_DIR));
  }
  const cast = new Set(BOOKS.flatMap((book) => book.pages.flatMap((page) => page.cast || [])));
  for (const id of cast) {
    const key = TOY_SOUND_ALIAS[id] || `toy-${id}`;
    assert.ok(manifest.sfx?.[key], `La figura «${id}» no tiene sonido (${key}); sonaría el «tok» sintetizado al tocarla.`);
  }
  for (const name of ["page", "open", "close", "land", "select", "pin", "star", "right", "wrong", "cheer"]) {
    assert.ok(manifest.sfx?.[`ui-${name}`], `Falta el efecto de interfaz ui-${name}.`);
  }
});
