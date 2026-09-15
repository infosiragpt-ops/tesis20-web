import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CLASSIC_COLLECTION } from '../../src/nido/cuentos/classic-collection.js';
import { hasToy, buildToy } from '../../src/nido/cuentos/three/toys/index.js';
import { ACT_NAMES } from '../../src/nido/cuentos/cuentos-acts.js';
import { dioramaLayout } from '../../src/nido/cuentos/three/diorama-layout.js';

test('all 812 classic pages have real actors, supported acting and actual props', () => {
  assert.equal(CLASSIC_COLLECTION.reduce((sum, b) => sum + b.pages.length, 0), 812);
  for (const book of CLASSIC_COLLECTION) for (const [i, page] of book.pages.entries()) {
    assert.ok(page.cast.length > 0 && page.cast.length <= 3, `${book.id}:${i} empty scene`);
    for (const id of [...page.cast, ...page.props.filter(hasToy)]) assert.ok(hasToy(id), id);
    assert.ok(page.props.some(hasToy), book.id);
    for (const id of page.cast) assert.ok(ACT_NAMES.has(page.acts[id]), `${book.id}:${i}:${id}`);
    for (const cue of Object.values(page.cues)) for (const id of Object.keys(cue.act || {})) assert.ok(page.cast.includes(id));
  }
});

test('princess screenshot scene has royal characters, not the generic tree', () => {
  const book = CLASSIC_COLLECTION.find(b => b.id === 'clasico-princesa-guisante');
  assert.ok(book.pages[2].cast.some(id => ['principe','princesa'].includes(id)));
  assert.ok(book.pages[2].props.includes('castillo'));
  assert.ok(book.pages.some(p => /colch|guisante/i.test(p.x) && p.props[0] === 'cama-guisante'));
});

test('all new stage objects have finite geometry and rest on the page', () => {
  const ids = new Set(CLASSIC_COLLECTION.flatMap(b => b.pages.flatMap(p => p.props)).filter(hasToy));
  for (const id of ids) {
    const toy = buildToy(id), bounds = new THREE.Box3().setFromObject(toy);
    assert.ok(Number.isFinite(bounds.max.y) && Math.abs(bounds.min.y) < .002, id);
    toy.traverse(obj => { if (obj.isMesh) assert.ok(obj.geometry.attributes.position.count > 0, id); });
  }
});

test('props are in front of the opaque popup, never behind the story image', () => {
  for (let cast = 0; cast <= 3; cast++) for (let props = 1; props <= 2; props++) {
    const slots = dioramaLayout(cast, props);
    assert.equal(slots.length, cast + props);
    for (const slot of slots.slice(cast)) assert.ok(slot.z >= .04, `hidden prop with ${cast} actors`);
  }
});
