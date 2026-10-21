import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { BOOKS, NARRATED_BOOKS, TOTAL_STARS } from '../../src/nido/cuentos/cuentos-data.js';
import { CLASSIC_COLLECTION } from '../../src/nido/cuentos/classic-collection.js';
import { fixedRanges, paginateStory, pageWindow, searchBooks, sentenceRanges, storyTokens } from '../../src/nido/cuentos/collection-layout.js';
import { enumerateCuentosVoicePlan, pageSpeechText, recordedPages, splitWords } from '../../src/nido/cuentos/cuentos-voice-plan.js';
import { composeTrack } from '../../src/nido/cuentos/cuentos-audio.js';

test('las 33 ediciones publicadas conservan cada palabra del texto autorizado', () => {
  assert.equal(CLASSIC_COLLECTION.length, 33);
  assert.equal(BOOKS.length, NARRATED_BOOKS.length + 33);
  assert.equal(new Set(BOOKS.map(b => b.id)).size, BOOKS.length);
  assert.equal(new Set(CLASSIC_COLLECTION.map(b => b.source.url)).size, 33);
  assert.ok(!CLASSIC_COLLECTION.some(book => book.id === 'clasico-pulgarcito' || book.id === 'clasico-caperucita-original'));
  assert.equal(BOOKS.filter(book => book.id === 'caperucita' || book.id === 'clasico-caperucita-original').length, 1);
  assert.equal(BOOKS.filter(book => book.id === 'pulgarcito' || book.id === 'clasico-pulgarcito').length, 1);
  assert.equal(BOOKS.find(book => book.id === 'caperucita')?.title, 'Caperucita Roja');
  assert.equal(BOOKS.find(book => book.id === 'pulgarcito')?.title, 'Pulgarcito');
  for (const book of CLASSIC_COLLECTION) {
    assert.equal(createHash('sha256').update(book.pages.map(p => p.x).join(' ')).digest('hex'), book.source.sha256, book.title);
    assert.ok(book.pages.length > 0);
    for (const page of recordedPages(book)) assert.ok(page.x.split(/\s+/).length <= 65, book.title);
    assert.equal(recordedPages(book).map(p => p.x).join(' '), book.pages.map(p => p.x).join(' '), book.title);
    assert.ok(book.source.permission.includes('autorizada'));
    assert.equal(book.quiz.length, 5, book.title);
    assert.equal(book.narration, undefined);
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

test('cada clásico trae quiz y souvenirs nombrados en su propio texto, con dibujo y figura', async () => {
  const { CLASSIC_PINS, pinArt } = await import('../../src/nido/cuentos/classic-souvenirs.js');
  const { PIN_LABELS, bookPins } = await import('../../src/nido/cuentos/cuentos-data.js');
  const source = async file => readFile(new URL(`../../src/nido/cuentos/${file}`, import.meta.url), 'utf8');
  const keys = (text, from) => new Set([...text.slice(text.indexOf(from)).matchAll(/^ {2}"?([a-z-]+)"?: [(<{]/gm)].map(m => m[1]));
  const drawn = new Set([
    ...keys(await source('cuentos-art-props.jsx'), 'const EMBLEMS = {'),
    ...keys(await source('cuentos-art-props.jsx'), 'const PULGARCITO_EMBLEMS = {'),
    ...keys(await source('cuentos-art-classic-emblems.jsx'), 'export const CLASSIC_EMBLEMS = {'),
    ...keys(await source('cuentos-art-cast.jsx'), 'export const CAST = {'),
  ]);
  let pins = 0;
  for (const book of CLASSIC_COLLECTION) {
    const id = book.id.replace('clasico-', '');
    const placed = bookPins(book);
    assert.equal(placed.length, CLASSIC_PINS[id].length, `${book.title}: un souvenir no encontró su frase`);
    assert.ok(placed.length >= 2 && placed.length <= 5, book.title);
    assert.equal(new Set(placed.map(pin => pin.page)).size, placed.length, book.title);
    for (const pin of placed) {
      assert.ok(PIN_LABELS[pin.id], pin.id);
      assert.ok(drawn.has(pinArt(pin.id)), `${pin.id}: sin dibujo «${pinArt(pin.id)}»`);
    }
    for (const question of book.quiz) {
      assert.match(question.q, /^¿.+\?$/);
      assert.equal(question.a.length, 3);
      assert.equal(new Set(question.a).size, 3);
    }
    pins += placed.length;
  }
  assert.equal(new Set(CLASSIC_COLLECTION.flatMap(book => bookPins(book).map(pin => pin.id))).size, pins);
  assert.ok(pins >= 150, `${pins} souvenirs`);
});

test('los clásicos se reparten por frases, sin hojas sueltas de dos palabras', () => {
  const fixed = new Set(['clasico-perla-dragon', 'clasico-tres-deseos', 'clasico-princesa-guisante']);
  let midSentence = 0;
  for (const book of CLASSIC_COLLECTION) {
    assert.equal(book.pages[0].t, book.title);
    for (const [index, page] of book.pages.entries()) {
      const count = page.x.split(/\s+/).length;
      if (index) assert.equal(page.t, '', `${book.title} ${index + 1} conserva «Parte N»`);
      if (fixed.has(book.id)) continue;
      assert.ok(count >= 25 && count <= 90, `${book.title} ${index + 1}: ${count} palabras`);
      if (/^[-—]?\p{Ll}/u.test(page.x)) midSentence += 1;
    }
    if (fixed.has(book.id)) assert.deepEqual(book.pages.map(p => p.x), recordedPages(book).map(p => p.x), book.title);
  }
  // Sólo oraciones larguísimas de la fuente se parten, y siempre en una coma.
  assert.ok(midSentence <= 6, `${midSentence} páginas empiezan a media frase`);
  const sentence = n => `Una${' palabra'.repeat(n - 2)} fin.`;
  const story = [
    Array.from({ length: 5 }, () => sentence(10)).join(' '),
    `${sentence(8)} —¡Hola! —dijo el gato, y siguió su camino. ${sentence(40)}`,
    Array.from({ length: 4 }, () => sentence(12)).join(' '),
  ];
  const { tokens } = storyTokens(story);
  const ranges = sentenceRanges(story);
  assert.ok(ranges.length > 1);
  assert.equal(ranges[0][0], 0);
  assert.equal(ranges.at(-1)[1], tokens.length);
  ranges.slice(1).forEach(([start], i) => assert.equal(start, ranges[i][1]));
  for (const [start, end] of ranges) {
    assert.match(tokens[end - 1], /[.!?]$/, `corte a media frase: …${tokens.slice(end - 3, end + 2).join(' ')}`);
    assert.doesNotMatch(tokens[start], /^—?\p{Ll}/u);
    assert.ok(end - start >= 25);
  }
  assert.deepEqual(fixedRanges(['uno dos tres cuatro cinco', 'seis', '', 'siete ocho'], 3), [[0, 3], [3, 6], [6, 8]]);
});

test('cada hoja de un clásico suena con tramos de su voz de estudio, palabra por palabra', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../public/assets/nido/audio/cuentos-manifest.json', import.meta.url), 'utf8'));
  for (const book of CLASSIC_COLLECTION) {
    const clips = manifest.books?.[book.id]?.pages;
    assert.equal(clips?.length, recordedPages(book).length, book.title);
    let heard = [];
    for (const [index, page] of book.pages.entries()) {
      heard = heard.concat(page.voice.map(v => `${v.clip}:${v.from}-${v.to}`));
      const track = composeTrack(clips, page.voice);
      // Un clip que no llegó a grabarse (cuota agotada) deja la hoja entera
      // con la voz del dispositivo, como antes; nunca una lectura a medias.
      if (page.voice.some(v => !clips[v.clip]?.src)) {
        assert.equal(track, null, `${book.title} ${index + 1}`);
        continue;
      }
      assert.ok(track, `${book.title} ${index + 1} sin audio`);
      assert.equal(track.words.length, splitWords(pageSpeechText(page)).words.length, `${book.title} ${index + 1}`);
      for (let i = 1; i < track.words.length; i += 1) assert.ok(track.words[i] >= track.words[i - 1], `${book.title} ${index + 1}: marca ${i} retrocede`);
      assert.ok(track.duration > track.words.at(-1), `${book.title} ${index + 1}`);
      for (const segment of track.segments) assert.ok(segment.end > segment.start);
    }
    // Todo el texto grabado suena una sola vez y en orden; el rótulo
    // «Parte N» de las grabaciones ya no se oye.
    const expected = recordedPages(book).flatMap((p, clip) => {
      const lead = clip ? p.t.split(/\s+/).length : 0;
      return [`${clip}:${lead}`, `${clip}:${splitWords(pageSpeechText(p)).words.length}`];
    });
    const covered = [];
    for (const part of heard) {
      const [clip, span] = part.split(':');
      const [from, to] = span.split('-');
      if (covered.at(-1)?.startsWith(`${clip}:`) && covered.at(-1) === `${clip}:${from}`) covered.pop(); else covered.push(`${clip}:${from}`);
      covered.push(`${clip}:${to}`);
    }
    assert.deepEqual(covered, expected, book.title);
  }
});

test('una hoja hecha de tramos rehace las marcas sobre su propia línea de tiempo', () => {
  const clips = [
    { src: 'a.mp3', duration: 4, words: [0, 0.5, 1, 2, 3] },
    { src: 'b.mp3', duration: 3, words: [0, 0.4, 1, 2] },
  ];
  const track = composeTrack(clips, [{ clip: 0, from: 3, to: 5 }, { clip: 1, from: 2, to: 3 }]);
  assert.deepEqual(track.segments.map(s => [s.src, s.start, +s.end.toFixed(2), s.toEnd]), [['a.mp3', 1.98, 4, true], ['b.mp3', 0.98, 1.96, false]]);
  assert.deepEqual(track.words.map(t => +t.toFixed(2)), [0.02, 1.02, 2.04]);
  assert.equal(+track.duration.toFixed(2), 3);
  assert.equal(composeTrack(clips, [{ clip: 2, from: 0, to: 1 }]), null);
  assert.equal(composeTrack(clips, [{ clip: 0, from: 3, to: 9 }]), null);
});

test('el progreso guardado con el reparto anterior sigue en la misma parte del cuento', async () => {
  const { normalizeProgress } = await import('../../src/nido/cuentos/cuentos-progress.js');
  const book = CLASSIC_COLLECTION.find(b => b.id === 'clasico-patito-feo');
  const legacyLast = recordedPages(book).length - 1;
  const state = normalizeProgress({ v: 1, books: { [book.id]: { pages: [0, 1, 2, legacyLast], lastPage: legacyLast } } });
  assert.equal(state.v, 2);
  assert.equal(state.books[book.id].lastPage, book.legacyPageMap[legacyLast]);
  assert.ok(state.books[book.id].lastPage >= book.pages.length - 2);
  assert.deepEqual(state.books[book.id].pages, [...new Set([0, 1, 2, legacyLast].map(i => book.legacyPageMap[i]))]);
  const again = normalizeProgress(state);
  assert.deepEqual(again.books[book.id], state.books[book.id]);
  const original = normalizeProgress({ v: 1, books: { kusi: { pages: [0, 9], lastPage: 9 } } });
  assert.deepEqual(original.books.kusi.pages, [0, 9]);
});

test('el buscador ignora acentos y no duplica Caperucita ni Pulgarcito', () => {
  assert.equal(searchBooks(BOOKS, 'ALI BABA')[0].id, 'clasico-alibaba');
  assert.equal(searchBooks(BOOKS, 'guisante').length, 1);
  assert.equal(searchBooks(BOOKS, 'pulgarcito').length, 1);
  assert.equal(searchBooks(BOOKS, 'caperucita').length, 1);
  assert.equal(searchBooks(BOOKS, 'caperucita')[0].id, 'caperucita');
  assert.equal(searchBooks(BOOKS, 'zz-nunca-zz').length, 0);
  assert.equal(searchBooks(BOOKS, '').length, BOOKS.length);
});

test('clasico-tres-deseos tiene narración de estudio en las 10 páginas', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../public/assets/nido/audio/cuentos-manifest.json', import.meta.url), 'utf8'));
  const book = CLASSIC_COLLECTION.find(b => b.id === 'clasico-tres-deseos');
  const pages = manifest.books?.['clasico-tres-deseos']?.pages;
  assert.equal(pages?.length, book.pages.length);
  for (const [index, page] of book.pages.entries()) {
    assert.ok(pages[index]?.src, `página ${index + 1} sin audio`);
    assert.ok(pages[index].duration > 0);
    assert.ok(Array.isArray(pages[index].words) && pages[index].words.length > 0);
    await access(new URL(`../../public/assets/nido/audio/cuentos/${pages[index].src}`, import.meta.url));
  }
});

test('los clásicos entran en el plan de voz de estudio', () => {
  const all = enumerateCuentosVoicePlan(BOOKS);
  const originals = enumerateCuentosVoicePlan(NARRATED_BOOKS);
  assert.ok(all.length > originals.length);
  assert.ok(all.some(job => job.bookId === 'clasico-tres-deseos' && job.kind === 'page'));
  assert.equal(all.filter(job => job.bookId === 'clasico-tres-deseos' && job.kind === 'page').length, 10);
  assert.equal(NARRATED_BOOKS.find(b => b.id === 'pulgarcito').pages.length, 10);
  assert.equal(CLASSIC_COLLECTION.find(b => b.id === 'clasico-pulgarcito'), undefined);
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
