import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, bookPins } from '../../src/nido/cuentos/cuentos-data.js';
import { normalizeProgress, bookStatus, totals } from '../../src/nido/cuentos/cuentos-progress.js';
import { resumePage, searchBooks } from '../../src/nido/cuentos/collection-layout.js';

test('los filtros separan la voz de estudio de las 35 ediciones clásicas', () => {
  assert.equal(searchBooks(BOOKS, '', 'narrated').length, BOOKS.length);
  assert.equal(searchBooks(BOOKS, '', 'reading').length, 35);
  assert.equal(searchBooks(BOOKS, '', 'classic').length, 35);
  assert.equal(searchBooks(BOOKS, 'pulgarcito', 'reading').length, 1);
  assert.equal(searchBooks(BOOKS, 'PULGARCITO', 'narrated').length, 2);
  assert.equal(searchBooks(BOOKS, '  ALI  BABA ', 'reading')[0].id, 'clasico-alibaba');
});

test('seguir leyendo excluye cuentos nuevos y completados sin mutar el progreso', () => {
  const book = BOOKS[0];
  const entries = { [book.id]: { pages: [0, 2, 2, -1, 9999] } };
  const snapshot = JSON.stringify(entries);
  assert.deepEqual(searchBooks(BOOKS, '', 'started', entries).map(b => b.id), [book.id]);
  assert.equal(JSON.stringify(entries), snapshot);
  assert.equal(searchBooks(BOOKS, '', 'started').length, 0);
  assert.equal(searchBooks(BOOKS, '', 'started', { [book.id]: { pages: book.pages.map((_, i) => i) } }).length, 0);
});

test('el marcador reabre la página real, incluso después de saltar hacia atrás', () => {
  for (const book of BOOKS) {
    assert.equal(resumePage(book), 0, book.id);
    assert.equal(resumePage(book, { pages: [0], lastPage: 0 }), 0, book.id);
    assert.equal(resumePage(book, { pages: [0, book.pages.length - 1, 2], lastPage: 2 }), 2, book.id);
    assert.equal(resumePage(book, { pages: [0, 3, 1] }), 1, book.id);
    assert.equal(resumePage(book, { pages: [-1, 9999], lastPage: 9999 }), 0, book.id);
    assert.equal(resumePage(book, { pages: book.pages.map((_, i) => i), lastPage: 3 }), 0, book.id);
  }
});

test('la migración conserva el progreso válido y elimina duplicados y valores fuera del libro', () => {
  const book = BOOKS[0];
  const pin = bookPins(book)[0].id;
  const state = normalizeProgress({ v: 1, lastBook: book.id, books: { [book.id]: {
    pages: [0, 3, 1, 1, -1, 9999, '2'], pins: [pin, pin, 'desconocido'],
    quiz: [0, 0, -1, 9999], quizOk: 90, opened: true,
  } } });
  assert.deepEqual(state.books[book.id].pages, [0, 3, 1]);
  assert.deepEqual(state.books[book.id].pins, [pin]);
  assert.deepEqual(state.books[book.id].quiz, [0]);
  assert.equal(state.books[book.id].quizOk, 1);
  assert.equal(state.books[book.id].lastPage, 1);
  assert.equal(state.lastBook, book.id);
  assert.equal(bookStatus(state, book).pct, 30);
  assert.deepEqual(totals(state), { stars: 3, pins: 1, quiz: 1, finished: 0 });
});

test('los marcadores sobreviven al guardado sin añadir datos personales ni perder páginas', () => {
  const book = BOOKS[1];
  const initial = { v: 1, lastBook: book.id, books: { [book.id]: { pages: [0, 4, 2], lastPage: 2, opened: true } } };
  const first = normalizeProgress(initial);
  const restored = normalizeProgress(JSON.parse(JSON.stringify(first)));
  assert.deepEqual(restored, first);
  assert.equal(resumePage(book, restored.books[book.id]), 2);
  assert.equal(normalizeProgress({ lastBook: 'inexistente' }).lastBook, null);
  assert.equal(totals(normalizeProgress(null)).stars, 0);
});
