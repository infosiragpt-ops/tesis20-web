import test from "node:test";
import assert from "node:assert/strict";

import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { SCENERY, framingFor } from "../../src/nido/cuentos/three/backdrop.js";

// Los fondos pintados recortan zonas de paisaje de la portada (sin el
// protagonista, que ya está en 3D). El encuadre es determinista, cambia entre
// páginas y nunca se sale de la zona de paisaje.

test("cada libro tiene zonas de paisaje válidas en su portada", () => {
  for (const book of BOOKS) {
    const windows = SCENERY[book.id];
    assert.ok(windows === null || (windows && windows.length), `${book.id}: sin decisión sobre el fondo pintado.`);
    if (windows === null) continue;
    for (const [u0, v0, u1, v1] of windows) {
      assert.ok(u0 >= 0 && v0 >= 0 && u1 <= 1 && v1 <= 1 && u1 - u0 >= 0.2 && v1 - v0 >= 0.12, `${book.id}: zona ${[u0, v0, u1, v1]} inválida.`);
    }
  }
});

test("el encuadre del fondo es determinista, varía entre páginas y queda dentro del paisaje", () => {
  for (const book of BOOKS) {
    const windows = SCENERY[book.id];
    if (windows === null) continue;
    const frames = book.pages.map((unused, index) => framingFor(book, index, 1.5));
    frames.forEach((frame, index) => {
      assert.deepEqual(frame, framingFor(book, index, 1.5), `${book.id} página ${index + 1}: el encuadre debe ser determinista.`);
      const [u0, v0, u1, v1] = windows[index % windows.length];
      assert.ok(frame.x >= u0 - 1e-6 && frame.y >= v0 - 1e-6 && frame.x + frame.w <= u1 + 1e-6 && frame.y + frame.h <= v1 + 1e-6, `${book.id} página ${index + 1}: el recorte se sale de la zona de paisaje.`);
      assert.ok(frame.w > 0.05 && frame.h > 0.03, `${book.id} página ${index + 1}: recorte demasiado pequeño.`);
      assert.ok(Math.abs((frame.w * 1) / (frame.h * 1.5) - 1000 / 640) < 0.01, `${book.id} página ${index + 1}: el recorte no respeta la relación del fondo.`);
    });
    assert.equal(frames[0].zoom, 1, `${book.id}: la primera página es el plano general.`);
    const distinct = new Set(frames.map((frame) => `${frame.x}:${frame.y}:${frame.w}`));
    assert.ok(distinct.size >= 7, `${book.id}: sólo ${distinct.size} encuadres distintos en 10 páginas.`);
  }
});
