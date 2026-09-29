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
  const hugging=directClassic(item,['El príncipe abrazó al dragón con alegría.']).pages[0];
  assert.equal(hugging.cues['abrazó'].act.principe,'hug');
});

test('nouns and look-alike words no longer trigger actions; real verbs keep theirs', () => {
  const item={id:'perla-dragon',title:'Prueba'};
  const quiet=directClassic(item,['El dragón no dijo nada entre los árboles del camino y entregó la perla. La cantidad de oro era grande. Se levantaba temprano en su dormitorio.']).pages[0];
  for(const word of ['nada','entre','camino','entregó','levantaba','dormitorio','cantidad']) assert.equal(quiet.cues[word],undefined,word);
  const acting=directClassic(item,['El dragón nadó, voló y cosió. Luego caminó, saltó, cantaba y durmió.']).pages[0];
  assert.equal(acting.cues['nadó'].act.dragon,'swim');
  assert.equal(acting.cues['voló'].act.dragon,'fly');
  assert.equal(acting.cues['cosió'].act.dragon,'build');
  assert.equal(acting.cues['caminó'].act.dragon,'walk');
  assert.equal(acting.cues['saltó'].act.dragon,'jump');
  assert.equal(acting.cues['cantaba'].act.dragon,'sing');
  assert.equal(acting.cues['durmió'].act.dragon,'sleep');
  const hugging=directClassic(item,['El príncipe abrazó al dragón.']).pages[0];
  assert.equal(hugging.cues['abrazó'].act.principe,'hug');
});

test('every sleeping form keeps its sleep act; only «dormitorio» is a room', () => {
  const item={id:'perla-dragon',title:'Prueba'};
  for (const word of ['dormida','dormidos','dormidas','dormitaba','dormirse','dormiré','dormía','durmió']) {
    const page=directClassic(item,[`El dragón ${word} bajo el árbol.`]).pages[0];
    assert.equal(page.cues[word]?.act?.dragon,'sleep',word);
  }
  for (const word of ['dormitorio','dormitorios']) {
    const page=directClassic(item,[`El dragón entró al ${word} grande.`]).pages[0];
    assert.equal(page.cues[word],undefined,word);
  }
});

test('a two-word name («Barba Azul») nods once', () => {
  const page=directClassic({id:'barba-azul',title:'Prueba'},['Había una vez un hombre muy rico al que todos llamaban Barba Azul por el color de su barba.']).pages[0];
  const nods=Object.entries(page.cues).filter(([,cue])=>cue.act?.['barba-azul']==='nod');
  assert.deepEqual(nods.map(([word])=>word),['barba']);
  assert.equal(page.cues.azul,undefined);
});

test('no published classic page swims on «nada»', () => {
  let nada=0;
  for (const book of CLASSIC_COLLECTION) for (const page of book.pages) {
    if (!/\bnada\b/i.test(page.x)) continue;
    nada += 1;
    assert.equal(page.cues.nada,undefined,`${book.id}: «nada» still acts`);
  }
  assert.ok(nada >= 20, `expected the «nada» pages, found ${nada}`);
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

test('all 690 published classic pages have real actors, supported acting and actual props', () => {
  assert.equal(CLASSIC_COLLECTION.reduce((sum, b) => sum + b.pages.length, 0), 690);
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

test('las figuras del desplegable no se pisan: los objetos grandes se achican y se apartan', async () => {
  const THREE = await import('three');
  const { TOY_SCALE } = await import('../../src/nido/cuentos/three/toys/index.js');
  const { fitDioramaSlots } = await import('../../src/nido/cuentos/three/diorama-layout.js');
  const { BOOKS } = await import('../../src/nido/cuentos/cuentos-data.js');
  const box = new THREE.Box3();
  const size = new THREE.Vector3();
  const cache = new Map();
  const width = id => {
    if (!cache.has(id)) {
      const toy = buildToy(id);
      toy.updateMatrixWorld(true);
      cache.set(id, box.setFromObject(toy).getSize(size).x * (TOY_SCALE[id] || 1));
    }
    return cache.get(id);
  };
  const toyFor = { paja: 'casa', madera: 'casa', ladrillos: 'casa', cuarto: 'farol' };
  const sky = new Set(['luna', 'estrellas', 'estrella', 'sol', 'nubes', 'niebla', 'viento', 'nieve']);
  for (const book of BOOKS) for (const [index, page] of book.pages.entries()) {
    const cast = (page.cast || []).map(id => hasToy(id) ? id : toyFor[id]).filter((id, i, list) => id && hasToy(id) && list.indexOf(id) === i).slice(0, 3);
    const props = [...(page.props || [])].sort((a, b) => Number(sky.has(a)) - Number(sky.has(b)))
      .map(id => hasToy(id) ? id : toyFor[id]).filter((id, i, list) => id && hasToy(id) && !cast.includes(id) && list.indexOf(id) === i)
      .slice(0, cast.length >= 3 ? 1 : 2);
    const ids = [...cast, ...props];
    const widths = ids.map(width);
    const slots = fitDioramaSlots(dioramaLayout(cast.length, props.length), widths, cast.length);
    const spans = slots.map((slot, i) => [slot.x - widths[i] * slot.scale / 2, slot.x + widths[i] * slot.scale / 2, ids[i]]).sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < spans.length; i++) {
      assert.ok(spans[i][0] >= spans[i - 1][1] - 1e-9, `${book.id} p${index + 1}: ${spans[i - 1][2]} pisa a ${spans[i][2]}`);
    }
    for (const [i, slot] of slots.entries()) if (i >= cast.length) assert.ok(widths[i] * slot.scale <= 0.15 + 1e-9, `${book.id} p${index + 1}: ${ids[i]} demasiado grande`);
  }
});
