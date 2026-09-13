import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import * as THREE from "three";
import { BOOKS, PIN_LABELS, bookPins } from "../../src/nido/cuentos/cuentos-data.js";
import { hasToy, buildToy, toyLabel } from "../../src/nido/cuentos/three/toys/index.js";
import { coverArtTexture } from "../../src/nido/cuentos/three/textures.js";

const book = BOOKS.find(book => book.id === "pulgarcito");
test("la portada exacta termina de cargar y se dibuja entera sin texto encima", { timeout: 1500 }, async () => {
  const previousDocument = globalThis.document, previousImage = globalThis.Image;
  const calls = [];
  const ctx = { fillRect() {}, drawImage(...args) { calls.push(args); } };
  globalThis.document = { createElement() { return { getContext() { return ctx; } }; } };
  globalThis.Image = class {
    naturalWidth = 640; naturalHeight = 960;
    set src(value) { assert.equal(value, book.cover.image); queueMicrotask(() => this.onload()); }
  };
  try {
    const texture = await coverArtTexture(book);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(1), [0, 0, 560, 840]);
    assert.ok(texture.version > 1);
    texture.dispose();
  } finally {
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousImage === undefined) delete globalThis.Image; else globalThis.Image = previousImage;
  }
});
test("Pulgarcito conserva su portada y completa las diez escenas, cinco hallazgos y cinco preguntas", async () => {
  assert.ok(book);
  assert.equal(book.cover.preserve, true); assert.equal(book.cover.titled, true);
  await access(new URL(`../../public${book.cover.image}`, import.meta.url));
  assert.equal(book.pages.length, 10); assert.equal(book.quiz.length, 5);
  const pins = bookPins(book); assert.equal(pins.length, 5); assert.equal(new Set(pins.map(pin => pin.id)).size, 5);
  for (const pin of pins) assert.ok(PIN_LABELS[pin.id]);
  for (const page of book.pages) { assert.ok(page.t && page.x); assert.ok(page.x.split(/\s+/).length <= 70); }
  for (const question of book.quiz) assert.equal(new Set(question.a).size, 3);
});
test("las aventuras de Pulgarcito tienen figuras 3D con dimensiones finitas", () => {
  const cast = new Set([...book.cameo, ...book.pages.flatMap(page => page.cast)]);
  for (const id of cast) {
    assert.ok(hasToy(id), id); assert.notEqual(toyLabel(id), "Figura mágica");
    const toy = buildToy(id), size = new THREE.Box3().setFromObject(toy).getSize(new THREE.Vector3());
    assert.ok(size.toArray().every(n => Number.isFinite(n) && n > 0), id);
    let meshes = 0; toy.traverse(obj => { if (obj.isMesh) { meshes++; obj.geometry.dispose(); const materials = Array.isArray(obj.material) ? obj.material : [obj.material]; materials.forEach(material => material.dispose()); } });
    assert.ok(meshes >= 4, id);
  }
});
