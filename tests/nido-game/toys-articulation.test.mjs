import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";

import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { ACT_NAMES } from "../../src/nido/cuentos/cuentos-acts.js";
import { buildToy, hasToy } from "../../src/nido/cuentos/three/toys/index.js";
import { WORK_TASKS, buildWorkPieces, buildWorkPile } from "../../src/nido/cuentos/three/work-pieces.js";

// Las figuras del reparto se animan con la narración (stage.applyAct): cada
// una declara en userData qué partes tiene (cabeza, ojos, brazos, alas, cola,
// patas). Estos tests impiden que una figura nueva llegue sin articular o que
// un cuento se quede quieto y mudo.

function parts(group, key) {
  const list = [];
  group.traverse((obj) => {
    if (obj.userData[key]) list.push(obj);
  });
  return list;
}

test("cada figura del reparto está articulada: cabeza, ojos que parpadean y tamaño de repisa", () => {
  const cast = new Set(BOOKS.flatMap((book) => book.pages.flatMap((page) => page.cast || [])));
  for (const id of cast) {
    assert.ok(hasToy(id), `${id}: sin figura.`);
    const toy = buildToy(id);
    const box = new THREE.Box3().setFromObject(toy);
    const size = box.getSize(new THREE.Vector3());
    assert.ok(size.y > 0.26 && size.y < 0.34, `${id}: altura ${size.y.toFixed(3)} fuera de la medida de la repisa.`);
    assert.ok(Math.abs(box.min.y) < 0.002, `${id}: no apoya en el suelo (min y ${box.min.y.toFixed(3)}).`);
    assert.ok(parts(toy, "head").length >= 1, `${id}: sin cabeza articulada (userData.head).`);
    assert.ok(parts(toy, "eye").length >= 2, `${id}: sin ojos marcados para el parpadeo (userData.eye).`);
  }
});

test("las figuras que vuelan, nadan, corren o trabajan declaran alas, cola, patas o brazos", () => {
  const expected = {
    buho: "wing", pelicano: "wing", carpintero: "wing", picaflor: "wing", mariposa: "flutter",
    bufeo: "tail", ballena: "tail", pez: "tail", zorro: "tail",
    vicuna: "leg", oveja: "leg", nina: "leg", nino: "leg", nina2: "leg", maquinista: "leg",
    oso: "arm", pipo: "arm", lolo: "arm", tito: "arm",
  };
  for (const [id, key] of Object.entries(expected)) {
    assert.ok(parts(buildToy(id), key).length >= 1, `${id}: falta la parte «${key}».`);
  }
});

test("cada cuento mueve a sus personajes y suena con la narración", () => {
  for (const book of BOOKS) {
    const acted = book.pages.filter((page) => Object.keys(page.acts || {}).length || Object.values(page.cues || {}).some((cue) => cue.act)).length;
    assert.ok(acted >= 6, `${book.id}: sólo ${acted} páginas con acción; el cuento debe moverse con la narración.`);
    const sounded = book.pages.filter((page) => (page.sfx || []).length || (page.sfxEnd || []).length || Object.values(page.cues || {}).some((cue) => cue.sfx)).length;
    assert.ok(sounded >= 4, `${book.id}: sólo ${sounded} páginas con efectos de sonido.`);
    for (const page of book.pages) {
      for (const act of [...Object.values(page.acts || {}), ...Object.values(page.cues || {}).flatMap((cue) => Object.values(cue.act || {}))]) {
        assert.ok(ACT_NAMES.has(act), `${book.id}: acción desconocida «${act}».`);
      }
    }
  }
});

test("los personajes entran y se desplazan por la escena cuando el texto lo dice", () => {
  let entrances = 0;
  let moves = 0;
  for (const book of BOOKS) {
    for (const page of book.pages) {
      entrances += Object.keys(page.enter || {}).length;
      moves += Object.values(page.cues || {}).reduce((sum, cue) => sum + Object.keys(cue.move || {}).length, 0);
    }
  }
  assert.ok(entrances >= 20, `sólo ${entrances} entradas en escena en toda la biblioteca.`);
  assert.ok(moves >= 12, `sólo ${moves} desplazamientos por palabra en toda la biblioteca.`);
});

test("cada obra tiene piezas con destino y los cerditos construyen sus tres casas", () => {
  for (const [task, spec] of Object.entries(WORK_TASKS)) {
    const pieces = buildWorkPieces(task);
    assert.ok(pieces.length >= 6 && pieces.length <= 16, `${task}: ${pieces.length} piezas, fuera de lo animable en una página.`);
    pieces.forEach((piece) => assert.ok(piece.object && piece.pos.length === 3 && piece.rot.length === 3, `${task}: pieza sin destino.`));
    if (!spec.gather) assert.ok(buildWorkPile(task), `${task}: sin pila de material.`);
  }
  const cerditos = BOOKS.find((book) => book.id === "cerditos");
  const built = cerditos.pages.filter((page) => page.work?.actor).map((page) => page.work.task);
  assert.deepEqual(built.slice(0, 3), ["paja", "madera", "ladrillos"], "los cerditos deben construir paja, madera y ladrillos, en ese orden.");
  const events = cerditos.pages.flatMap((page) => Object.values(page.cues || {}).map((cue) => cue.scene).filter(Boolean));
  assert.deepEqual(events, ["scatter", "collapse"], "la casa de paja vuela y la de madera se derrumba.");
});
