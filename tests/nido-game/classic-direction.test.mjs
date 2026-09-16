import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CLASSIC_COLLECTION } from '../../src/nido/cuentos/classic-collection.js';
import { hasToy, buildToy } from '../../src/nido/cuentos/three/toys/index.js';
import { ACT_NAMES } from '../../src/nido/cuentos/cuentos-acts.js';
import { dioramaLayout } from '../../src/nido/cuentos/three/diorama-layout.js';
import { directClassic } from '../../src/nido/cuentos/classic-direction.js';

test('reported nouns do not become swimming, flying or sewing actions', () => {
  const item={id:'perla-dragon',title:'Prueba'};
  const plain=directClassic(item,['El dragón vio que nadie estaba en las costas. Volvió a la cueva.']).pages[0];
  for(const word of ['nadie','costas','volvió']) assert.equal(plain.cues[word],undefined,word);
  const acting=directClassic(item,['El dragón nadó, voló y cosió.']).pages[0];
  assert.equal(acting.cues['nadó'].act.dragon,'swim');
  assert.equal(acting.cues['voló'].act.dragon,'fly');
  assert.equal(acting.cues['cosió'].act.dragon,'build');
});

test('dragon edition follows the cave, stolen pearl, voyage and imperial ending', () => {
  const pages=CLASSIC_COLLECTION.find(b=>b.id==='clasico-perla-dragon').pages;
  assert.deepEqual(pages[0].cast,['dragon']);
  assert.deepEqual(pages[0].props,['perla']);
  assert.equal(pages[0].set,'kinabalu');
  assert.deepEqual(pages[1].cast,['rey','principe']);
  assert.deepEqual(pages[3].props,['cometa','farol']);
  assert.equal(pages[4].acts.dragon,'sleep');
  assert.equal(pages[4].set,'dragon-cave');
  assert.equal(pages[5].light,'night');
  assert.ok(!pages[6].props.includes('perla'),'stolen pearl must not remain in the cave');
  assert.equal(pages[7].acts.dragon,'swim');
  assert.equal(pages[7].set,'ocean-day');
  assert.equal(pages[9].set,'palace');
  assert.ok(!pages[9].cast.includes('dragon'),'do not show the lost dragon dancing in the ending');
});

test('story animals retain their species rather than human or sheep substitutes',()=>{
  const bambi=CLASSIC_COLLECTION.find(b=>b.id==='clasico-bambi');
  assert.ok(bambi.pages.some(p=>p.cast.includes('cierva')));
  assert.ok(bambi.pages.every(p=>!p.cast.includes('campesina')));
  const heidi=CLASSIC_COLLECTION.find(b=>b.id==='clasico-heidi');
  assert.ok(heidi.pages.some(p=>p.cast.includes('cabra')));
  assert.ok(heidi.pages.every(p=>!p.cast.includes('oveja')));
  assert.equal(buildToy('cierva').userData.sculpted.species,'doe');
  assert.equal(buildToy('cabra').userData.sculpted.species,'goat');
  assert.equal(buildToy('gallina').userData.sculpted.species,'hen');
});

test('all 757 published classic pages have real actors, supported acting and actual props', () => {
  assert.equal(CLASSIC_COLLECTION.reduce((sum, b) => sum + b.pages.length, 0), 757);
  for (const book of CLASSIC_COLLECTION) for (const [i, page] of book.pages.entries()) {
    assert.ok(page.cast.length > 0 && page.cast.length <= 3, `${book.id}:${i} empty scene`);
    for (const id of [...page.cast, ...page.props.filter(hasToy)]) assert.ok(hasToy(id), id);
    assert.ok(page.props.some(hasToy), book.id);
    for (const id of page.cast) assert.ok(ACT_NAMES.has(page.acts[id]), `${book.id}:${i}:${id}`);
    for (const cue of Object.values(page.cues)) for (const id of Object.keys(cue.act || {})) assert.ok(page.cast.includes(id));
  }
});

test('los tres deseos sigue la llegada, la carta, las salchichas y el baile', () => {
  const pages = CLASSIC_COLLECTION.find(b => b.id === 'clasico-tres-deseos').pages;
  assert.equal(pages.length, 10);
  assert.deepEqual(pages[0].cast, ['campesino', 'campesina']);
  assert.equal(pages[0].light, 'night');
  assert.equal(pages[0].acts.campesino, 'walk');
  assert.equal(pages[0].acts.campesina, 'look');
  assert.equal(pages[0].enter.campesino, 'left');
  assert.equal(pages[0].enter.campesina, 'none');
  assert.ok(pages[0].props.includes('carta'));
  assert.equal(pages[0].cues.llegó.act.campesino, 'walk');
  assert.equal(pages[0].cues.malhumorado.act.campesino, 'think');
  assert.deepEqual(pages[1].cast, ['campesina', 'campesino', 'hada']);
  assert.equal(pages[1].acts.hada, 'fly');
  assert.ok(pages[4].cast.includes('hada'));
  assert.equal(pages[4].acts.hada, 'fly');
  assert.equal(pages[5].acts.campesino, 'shiver');
  assert.equal(pages[6].acts.campesino, 'shiver');
  assert.equal(pages[8].acts.hada, 'cheer');
  assert.equal(pages[9].acts.campesino, 'dance');
  assert.equal(pages[9].acts.campesina, 'dance');
  assert.ok(pages[9].cast.includes('hada'));
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
