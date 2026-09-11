import test from "node:test";
import assert from "node:assert/strict";
import { bookIndexAt, bookPositionAt, clampZoom, dragScale, settleBook } from "../../src/nido/cuentos/three/library-gestures.js";
import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { hasToy, buildToy, toyLabel } from "../../src/nido/cuentos/three/toys/index.js";

test("la biblioteca encaja todos los libros y no sale de sus extremos", () => {
  const count = BOOKS.length;
  for (let i = 0; i < count; i++) assert.equal(bookIndexAt(bookPositionAt(i, count, .82), count, .82), i);
  assert.equal(bookIndexAt(-100, count, .82), 0);
  assert.equal(bookIndexAt(100, count, .82), count - 1);
  assert.equal(bookPositionAt(-4, count, .82), bookPositionAt(0, count, .82));
});
test("la inercia avanza en ambas direcciones, limitada a un libro extra", () => {
  const x = bookPositionAt(3, 8, .82);
  assert.equal(settleBook(x, 0, 8, .82), 3);
  assert.equal(settleBook(x, .03, 8, .82), 4);
  assert.equal(settleBook(x, -.03, 8, .82), 2);
  assert.equal(settleBook(100, .03, 8, .82), 7);
});
test("pellizco y rueda comparten límites y escala proporcional al zoom", () => {
  assert.equal(clampZoom(.1), .8); assert.equal(clampZoom(8), 1.55);
  assert.equal(clampZoom(1.2), 1.2);
  const scale = dragScale(3.4, 36, 844, 1);
  assert.equal(dragScale(3.4, 36, 844, 2), scale / 2);
});
test("cada personaje del reparto tiene una figura volumétrica y nombre", () => {
  const cast = new Set(BOOKS.flatMap(book => book.pages.flatMap(page => page.cast || [])));
  for (const id of cast) {
    assert.ok(hasToy(id), `Falta figura 3D: ${id}`);
    assert.notEqual(toyLabel(id), "Figura mágica");
    const toy = buildToy(id); let meshes = 0;
    toy.traverse(obj => { if (obj.isMesh) meshes++; });
    assert.ok(meshes >= 4, `${id} debe tener volumen compuesto`);
  }
});

import { deskDragIntent, dragProgress, shouldCompleteDrag } from "../../src/nido/cuentos/three/library-gestures.js";

test("el arrastre en la mesa distingue abrir, devolver y toque", () => {
  assert.equal(deskDragIntent(-3, 2), null, "por debajo del umbral sigue siendo un toque");
  assert.equal(deskDragIntent(-60, 10), "open");
  assert.equal(deskDragIntent(-40, -30), "open", "diagonal hacia la izquierda abre");
  assert.equal(deskDragIntent(5, -70), "return");
  assert.equal(deskDragIntent(60, 0), "none", "hacia la derecha no hace nada en la mesa");
  assert.equal(deskDragIntent(0, 60), "none", "hacia abajo no hace nada");
});
test("en lectura, la tapa se cierra hacia la derecha y el libro vuelve hacia arriba", () => {
  assert.equal(deskDragIntent(60, 6, 8, "reading"), "close");
  assert.equal(deskDragIntent(-60, 6, 8, "reading"), "none", "hacia la izquierda no reabre");
  assert.equal(deskDragIntent(4, -70, 8, "reading"), "return");
  assert.equal(deskDragIntent(-4, 0, 8, "reading"), null, "un toque sigue siendo toque");
});
test("el progreso se acota al recorrido y se completa por distancia o por tirón", () => {
  assert.equal(dragProgress(-50, 200), 0);
  assert.equal(dragProgress(100, 200), 0.5);
  assert.equal(dragProgress(400, 200), 1);
  assert.equal(shouldCompleteDrag(0.3, 0.1), false, "un arrastre corto y lento se cancela");
  assert.equal(shouldCompleteDrag(0.5, 0), true);
  assert.equal(shouldCompleteDrag(0.2, 1.4), true, "un tirón rápido completa");
  assert.equal(shouldCompleteDrag(0.05, 3), false, "un tirón sin recorrido no");
});
