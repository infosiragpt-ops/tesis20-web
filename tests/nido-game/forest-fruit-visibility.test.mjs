import assert from "node:assert/strict";
import { test } from "node:test";
import { isFruitOnField } from "../../src/nido/game/bosque/forest-renderer.js";

test("las frutas del suelo se ven solo mientras no se hayan recogido", () => {
  assert.equal(isFruitOnField({ collected: false, held: false }), true);
  assert.equal(isFruitOnField({ collected: true, held: true }), false);
  assert.equal(isFruitOnField({ collected: true, held: false }), false);
  assert.equal(isFruitOnField(null), false);
  assert.equal(isFruitOnField(undefined), false);
});

test("entregar a la cesta deja la fruta fuera del campo (no reaparece en el árbol)", () => {
  const fruit = { x: 400, y: 444, collected: false, held: false };
  // Recoger
  fruit.collected = true;
  fruit.held = true;
  assert.equal(isFruitOnField(fruit), false);
  // Entregar: deja de estar en brazos, sigue recogida
  fruit.held = false;
  assert.equal(isFruitOnField(fruit), false);
});

test("soltar una fruta en brazos la devuelve al campo", () => {
  const fruit = { x: 200, y: 444, collected: true, held: true };
  fruit.collected = false;
  fruit.held = false;
  assert.equal(isFruitOnField(fruit), true);
});
