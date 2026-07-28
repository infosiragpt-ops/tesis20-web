import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isFruitOnField,
  normalizeFruitPlace,
  setFruitPlace,
} from "../../src/nido/game/bosque/forest-renderer.js";
import { layoutForestRound, createForestRound } from "../../src/nido/game/content/forest-mission.js";

test("las frutas del suelo se ven solo en place=field", () => {
  assert.equal(isFruitOnField({ place: "field", collected: false, held: false }), true);
  assert.equal(isFruitOnField({ place: "held", collected: true, held: true }), false);
  assert.equal(isFruitOnField({ place: "basket", collected: true, held: false }), false);
  assert.equal(isFruitOnField(null), false);
});

test("compatibilidad: collected/held antiguos se normalizan", () => {
  assert.equal(normalizeFruitPlace({ collected: false }), "field");
  assert.equal(normalizeFruitPlace({ collected: true, held: true }), "held");
  assert.equal(normalizeFruitPlace({ collected: true, held: false }), "basket");
});

test("recoger → held; entregar → basket; soltar → field", () => {
  const fruit = { x: 400, y: 444, place: "field", collected: false, held: false };
  setFruitPlace(fruit, "held");
  assert.equal(fruit.place, "held");
  assert.equal(fruit.held, true);
  assert.equal(fruit.collected, true);
  assert.equal(isFruitOnField(fruit), false);

  setFruitPlace(fruit, "basket");
  assert.equal(fruit.place, "basket");
  assert.equal(fruit.held, false);
  assert.equal(fruit.collected, true);
  assert.equal(isFruitOnField(fruit), false);

  setFruitPlace(fruit, "field");
  assert.equal(isFruitOnField(fruit), true);
  assert.equal(fruit.collected, false);
});

test("el layout genera todas las frutas en el campo", () => {
  const round = createForestRound({ ageId: "4-5", roundIndex: 3, level: 1 });
  const layout = layoutForestRound(round, { width: 1900, groundY: 470 }, 3);
  assert.ok(layout.fruits.length >= round.target);
  for (const fruit of layout.fruits) {
    assert.equal(fruit.place, "field");
    assert.equal(fruit.collected, false);
    assert.equal(fruit.held, false);
    assert.equal(isFruitOnField(fruit), true);
  }
});
