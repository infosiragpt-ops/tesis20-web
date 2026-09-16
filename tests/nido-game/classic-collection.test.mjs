import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { BOOKS, NARRATED_BOOKS, TOTAL_STARS } from '../../src/nido/cuentos/cuentos-data.js';
import { CLASSIC_COLLECTION } from '../../src/nido/cuentos/classic-collection.js';
import { paginateStory, pageWindow, searchBooks } from '../../src/nido/cuentos/collection-layout.js';
import { enumerateCuentosVoicePlan } from '../../src/nido/cuentos/cuentos-voice-plan.js';

test('las 35 ediciones conservan cada palabra del texto autorizado', () => {
  assert.equal(CLASSIC_COLLECTION.length, 35);
  assert.equal(BOOKS.length, NARRATED_BOOKS.length + 35);
  assert.equal(new Set(BOOKS.map(b => b.id)).size, BOOKS.length);
  assert.equal(new Set(CLASSIC_COLLECTION.map(b => b.source.url)).size, 35);
  for (const book of CLASSIC_COLLECTION) {
    assert.equal(createHash('sha256').update(book.pages.map(p => p.x).join(' ')).digest('hex'), book.source.sha256, book.title);
    assert.ok(book.pages.length > 0);
    for (const page of book.pages) assert.ok(page.x.split(/\s+/).length <= 65, book.title);
    assert.ok(book.source.permission.includes('autorizada'));
    assert.equal(book.quiz.length, 0);
    assert.equal(book.narration, 'device');
  }
  assert.equal(TOTAL_STARS, BOOKS.reduce((total, b) => total + b.pages.length, 0));
});

test('la paginación no pierde palabras ni deja páginas vacías', () => {
  assert.deepEqual(paginateStory(['uno dos tres cuatro cinco', 'seis', '', 'siete ocho'], 3), ['uno dos tres', 'cuatro cinco seis', 'siete ocho']);
  assert.throws(() => paginateStory(['uno'], 0), RangeError);
  for (let page = 0; page < 72; page++) {
    const window = pageWindow(page, 72);
    assert.equal(window.length, 7); assert.ok(window.includes(page));
    assert.ok(window.every(i => i >= 0 && i < 72));
  }
});

test('el buscador ignora acentos y distingue las dos ediciones existentes', () => {
  assert.equal(searchBooks(BOOKS, 'ALI BABA')[0].id, 'clasico-alibaba');
  assert.equal(searchBooks(BOOKS, 'guisante').length, 1);
  assert.equal(searchBooks(BOOKS, 'pulgarcito').length, 2);
  assert.equal(searchBooks(BOOKS, 'zz-nunca-zz').length, 0);
  assert.equal(searchBooks(BOOKS, '').length, BOOKS.length);
});

test('las voces de dispositivo no generan trabajos de narración de pago', () => {
  assert.deepEqual(enumerateCuentosVoicePlan(BOOKS), enumerateCuentosVoicePlan(NARRATED_BOOKS));
  assert.equal(NARRATED_BOOKS.find(b => b.id === 'pulgarcito').pages.length, 10);
  assert.equal(CLASSIC_COLLECTION.find(b => b.id === 'clasico-pulgarcito').cover.image, NARRATED_BOOKS.find(b => b.id === 'pulgarcito').cover.image);
  assert.match(CLASSIC_COLLECTION.find(b => b.id === 'clasico-heidi').tagline, /Capítulo 1/);
});

test('las portadas locales nuevas tienen licencia y procedencia verificables', async () => {
  for (const book of CLASSIC_COLLECTION) {
    await access(new URL(`../../public${book.cover.image}`, import.meta.url));
    if (book.cover.layout === 'heritage') {
      assert.match(book.cover.credit?.license || '', /Public domain|CC0/);
      assert.ok(book.cover.credit.url.startsWith('https://'));
      assert.ok(book.cover.credit.artist);
    }
  }
});

test('las portadas originales conservan toda la imagen y su procedencia sin duplicar el título', async () => {
  const manifestPath = '/assets/nido/cuentos/covers/original-covers-20260916.json';
  const manifest = JSON.parse(await readFile(new URL(`../../public${manifestPath}`, import.meta.url), 'utf8'));
  assert.equal(manifest.covers.length, 12);
  assert.equal(new Set(manifest.covers.map(cover => cover.id)).size, manifest.covers.length);
  for (const asset of manifest.covers) {
    const book = CLASSIC_COLLECTION.find(item => item.id === `clasico-${asset.id}`);
    assert.ok(book, asset.id);
    assert.equal(book.cover.image, asset.image, book.title);
    assert.equal(book.cover.titled, true, book.title);
    assert.equal(book.cover.preserve, true, book.title);
    assert.equal(book.cover.layout, undefined, book.title);
    assert.equal(book.cover.generation.prompts, manifestPath, book.title);
    assert.match(asset.prompt, /illustration-story/);
    assert.ok(asset.prompt.includes(book.title), book.title);
    const bytes = await readFile(new URL(`../../public${asset.image}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
    assert.equal(bytes.toString('ascii', 8, 12), 'avif');
    const dimensions = bytes.indexOf(Buffer.from('ispe'));
    assert.ok(dimensions > 0, book.title);
    assert.equal(bytes.readUInt32BE(dimensions + 8), 840, book.title);
    assert.equal(bytes.readUInt32BE(dimensions + 12), 1260, book.title);
    assert.ok(bytes.length < 400000, book.title);
  }
});
