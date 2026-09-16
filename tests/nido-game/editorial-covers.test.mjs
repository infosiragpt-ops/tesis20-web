import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CLASSIC_COLLECTION } from '../../src/nido/cuentos/classic-collection.js';
import { coverArtTexture } from '../../src/nido/cuentos/three/textures.js';

const books = CLASSIC_COLLECTION.filter(book => book.cover.generation);

test('las portadas editoriales tienen procedencia, título único y encuadre completo', async () => {
  assert.ok(books.length > 0);
  for (const book of books) {
    const { cover } = book;
    assert.equal(cover.titled, true, book.id);
    assert.equal(cover.preserve, true, book.id);
    assert.notEqual(cover.layout, 'heritage', book.id);
    if (cover.generation.tool === 'ChatGPT Imágenes (web)') {
      assert.match(cover.generation.conversation, /^https:\/\/chatgpt\.com\/c\/[a-z0-9-]+$/);
    } else {
      assert.equal(cover.generation.tool, 'Generación de imágenes integrada de ChatGPT');
      assert.equal(cover.generation.prompts, '/assets/nido/cuentos/covers/original-covers-20260916.json');
      const manifest = JSON.parse(await readFile(new URL(`../../public${cover.generation.prompts}`, import.meta.url), 'utf8'));
      const provenance = manifest.covers.find(asset => asset.image === cover.image);
      assert.ok(provenance?.prompt.includes(book.title), book.id);
    }
    assert.equal(cover.credit, undefined, 'No atribuir arte nuevo a una ilustración histórica');
    const bytes = await readFile(new URL(`../../public${cover.image}`, import.meta.url));
    assert.ok(bytes.length > 20000 && bytes.length <= 250 * 1024, book.id);
    assert.equal(bytes.toString('ascii', 4, 8), 'ftyp', book.id);
    assert.ok(bytes.subarray(8, 40).includes(Buffer.from('avif')), book.id);
    const sizeBox = bytes.indexOf(Buffer.from('ispe'));
    assert.ok(sizeBox >= 0, book.id);
    assert.equal(bytes.readUInt32BE(sizeBox + 8), 840, book.id);
    assert.equal(bytes.readUInt32BE(sizeBox + 12), 1260, book.id);
  }
});

test('cada portada generada carga completa en la textura 3D sin añadir otro título', async () => {
  const previousDocument = globalThis.document, previousImage = globalThis.Image;
  let expectedImage;
  const calls = [];
  const ctx = { fillRect() {}, drawImage(...args) { calls.push(args); } };
  globalThis.document = { createElement() { return { getContext() { return ctx; } }; } };
  globalThis.Image = class {
    naturalWidth = 840; naturalHeight = 1260;
    set src(value) { assert.equal(value, expectedImage); queueMicrotask(() => this.onload()); }
  };
  try {
    for (const book of books) {
      expectedImage = book.cover.image;
      calls.length = 0;
      const texture = await coverArtTexture(book);
      assert.equal(calls.length, 1, book.id);
      assert.deepEqual(calls[0].slice(1), [0, 0, 560, 840], book.id);
      texture.dispose();
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousImage === undefined) delete globalThis.Image; else globalThis.Image = previousImage;
  }
});
