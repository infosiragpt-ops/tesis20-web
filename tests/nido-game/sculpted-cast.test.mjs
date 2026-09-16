import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOOKS } from '../../src/nido/cuentos/cuentos-data.js';
import { buildToy } from '../../src/nido/cuentos/three/toys/index.js';

const cast=[...new Set(BOOKS.flatMap(book=>book.pages.flatMap(page=>page.cast||[])))];
function tagged(root,key) { const result=[];root.traverse(obj=>{if(obj.userData[key])result.push(obj);});return result; }
function dispose(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(obj=>{if(!obj.isMesh)return;geometries.add(obj.geometry);for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture&&!value.userData?.nidoSharedSurface)textures.add(value);}});
  geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());
}

test('los 44 libros usan modelos articulados registrados (no valida fidelidad artística)',()=>{
  for(const id of cast) {
    if(id==='concha-caracol')continue; // Empty shell is a prop, not a character.
    const toy=buildToy(id);
    assert.equal(toy.userData.sculpted?.revision,1,`${id}: falta el modelo revisado`);
    assert.equal(tagged(toy,'head').length,1,`${id}: una cabeza articulada`);
    assert.equal(tagged(toy,'eye').length,2,`${id}: dos pivotes de parpadeo, no duplicados`);
    dispose(toy);
  }
  for(const book of BOOKS)assert.ok(book.pages.some(page=>(page.cast||[]).some(id=>id!=='concha-caracol')),`${book.id}: sin reparto`);
});

test('la anatomía conserva cuatro patas, seis patas de insecto o dos alas según la especie',()=>{
  for(const id of cast) {
    const toy=buildToy(id),anatomy=toy.userData.sculpted;
    if(anatomy?.legs) assert.equal(tagged(toy,'leg').length,anatomy.legs,`${id}: patas`);
    if(anatomy?.wings) assert.equal(tagged(toy,'wing').length,anatomy.wings,`${id}: alas`);
    if(anatomy?.family==='insect')assert.equal(tagged(toy,'leg').length,6,`${id}: insecto`);
    dispose(toy);
  }
});

test('todas las geometrías son finitas y el reparto respeta el presupuesto móvil',()=>{
  const costs=new Map();
  for(const id of cast) {
    const toy=buildToy(id);let triangles=0,draws=0;
    toy.traverse(obj=>{
      if(!obj.isMesh)return;
      draws++;
      triangles+=(obj.geometry.index?.count??obj.geometry.attributes.position.count)/3*(obj.isInstancedMesh?obj.count:1);
      for(const key of ['position','normal'])for(const value of obj.geometry.attributes[key].array)assert.ok(Number.isFinite(value),`${id}: ${key} no finito`);
    });
    assert.ok(triangles<40000,`${id}: ${triangles} triángulos`);
    assert.ok(draws<=100,`${id}: ${draws} llamadas de dibujo`);
    const box=new THREE.Box3().setFromObject(toy);
    assert.ok(Math.abs(box.min.y)<.002,`${id}: apoyo en el suelo`);
    costs.set(id,{triangles,draws});dispose(toy);
  }
  for(const book of BOOKS)for(const page of book.pages) {
    const total=(page.cast||[]).reduce((sum,id)=>sum+(costs.get(id)?.triangles||0),0);
    assert.ok(total<110000,`${book.id}: reparto demasiado pesado (${total})`);
  }
});

test('los pivotes conservan transformaciones válidas al caminar y mirar',()=>{
  for(const id of cast) {
    const toy=buildToy(id);
    for(const [key,axis] of [['leg','x'],['head','y'],['wing','z'],['tail','y'],['arm','x']]) {
      for(const joint of tagged(toy,key)) joint.rotation[axis]+=.22;
    }
    toy.updateMatrixWorld(true);
    toy.traverse(obj=>assert.ok(obj.matrixWorld.elements.every(Number.isFinite),`${id}: transformación inválida`));
    dispose(toy);
  }
});

test('los ojos vivos tienen blanco y brillo, no discos negros vacíos',()=>{
  for(const id of cast) {
    if(id==='concha-caracol')continue;
    const toy=buildToy(id);
    for(const eye of tagged(toy,'eye')) {
      let bright=0;
      eye.traverse(obj=>{
        if(!obj.isMesh||!obj.material?.color)return;
        const {r,g,b}=obj.material.color;
        if((r+g+b)/3>0.55)bright+=1;
      });
      assert.ok(bright>=1,`${id}: ojo sin blanco o brillo (riesgo de mirada vacía)`);
    }
    dispose(toy);
  }
});

test('el relieve privado del dragón se libera una sola vez al retirar su material',()=>{
  const toy=buildToy('dragon');let skin;
  toy.traverse(obj=>{if(obj.material?.bumpMap)skin=obj.material;});
  assert.ok(skin?.bumpMap,'falta el relieve de escamas');
  let released=0;skin.bumpMap.addEventListener('dispose',()=>released++);
  skin.dispose();skin.dispose();
  assert.equal(released,1,'el relieve no debe retener memoria entre páginas');
});

function scleraLuminance(toy) {
  const eye=tagged(toy,'eye')[0];
  let mesh;
  eye.traverse(obj=>{if(!mesh&&obj.isMesh)mesh=obj;});
  const {r,g,b}=mesh.material.color;
  return r+g+b;
}

test('sirena es una sirenita articulada amable, no un cono con ojos vacíos',()=>{
  const toy=buildToy('sirena');
  assert.equal(tagged(toy,'head').length,1);
  assert.equal(tagged(toy,'eye').length,2);
  assert.equal(tagged(toy,'arm').length,2);
  assert.ok(tagged(toy,'tail').length>=1,'cola articulada para las acciones');
  assert.ok(scleraLuminance(toy)>1.6,'la esclerótica debe ser clara y amable, no un hueco oscuro');
  let cones=0;
  toy.traverse(obj=>{if(obj.geometry?.type==='ConeGeometry')cones++;});
  assert.equal(cones,0,'la cola no puede ser un cono rígido');
  dispose(toy);
});

test('los rostros humanos clásicos comparten ojos claros y amables',()=>{
  for(const id of ['nino-clasico','campesino','princesa','heidi']) {
    const toy=buildToy(id);
    assert.ok(scleraLuminance(toy)>1.6,`${id}: ojos oscuros de aspecto vacío`);
    dispose(toy);
  }
});
