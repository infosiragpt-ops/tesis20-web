#!/usr/bin/env node
// Mide el coste de cada figura del reparto antes y después del horneado
// (toys/bake.js): triángulos, llamadas de dibujo, dibujos en la pasada de
// sombra y materiales distintos. Es para las descripciones de PR, no para CI.
//
//   node scripts/measure-nido-cast.mjs            tabla completa
//   node scripts/measure-nido-cast.mjs --summary  solo mediana/máximo
//   node scripts/measure-nido-cast.mjs --json     datos en JSON
import { BOOKS } from '../src/nido/cuentos/cuentos-data.js';
import { buildToy } from '../src/nido/cuentos/three/toys/index.js';
import { releaseResources } from '../src/nido/cuentos/three/toys/bake.js';

const args = new Set(process.argv.slice(2));
const cast = [...new Set(BOOKS.flatMap((book) => book.pages.flatMap((page) => page.cast || [])))].sort();

function measure(toy) {
  let triangles = 0;
  let draws = 0;
  let shadowDraws = 0;
  const materials = new Set();
  toy.traverse((obj) => {
    if (!obj.isMesh || !obj.visible) return;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    const calls = Array.isArray(obj.material) ? Math.max(1, obj.geometry.groups.length) : 1;
    draws += calls;
    if (obj.castShadow) shadowDraws += calls;
    list.forEach((material) => materials.add(material));
    const count = obj.geometry.index?.count ?? obj.geometry.attributes.position.count;
    triangles += (count / 3) * (obj.isInstancedMesh ? obj.count : 1);
  });
  return { triangles: Math.round(triangles), draws, shadowDraws, materials: materials.size };
}

const rows = cast.map((id) => {
  const rawToy = buildToy(id, { bake: false });
  const before = measure(rawToy);
  releaseResources(rawToy);
  const bakedToy = buildToy(id);
  const after = measure(bakedToy);
  releaseResources(bakedToy);
  return { id, before, after };
});

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const stat = (key, phase) => {
  const values = rows.map((row) => row[phase][key]);
  const top = rows.reduce((best, row) => (row[phase][key] > best[phase][key] ? row : best), rows[0]);
  return { median: median(values), max: top[phase][key], maxId: top.id, total: values.reduce((a, b) => a + b, 0) };
};
const summary = {
  figures: rows.length,
  draws: { before: stat('draws', 'before'), after: stat('draws', 'after') },
  shadowDraws: { before: stat('shadowDraws', 'before'), after: stat('shadowDraws', 'after') },
  materials: { before: stat('materials', 'before'), after: stat('materials', 'after') },
  triangles: { before: stat('triangles', 'before'), after: stat('triangles', 'after') },
};

if (args.has('--json')) {
  console.log(JSON.stringify({ rows, summary }, null, 2));
} else {
  if (!args.has('--summary')) {
    const pad = (value, width) => String(value).padStart(width);
    console.log(`| id | triangles | draws before | draws after | shadow draws before → after | materials before → after |`);
    console.log(`|---|---:|---:|---:|---:|---:|`);
    for (const { id, before, after } of rows) {
      const tri = before.triangles === after.triangles ? pad(after.triangles, 6) : `${before.triangles} → ${after.triangles} (!)`;
      console.log(`| ${id} | ${tri} | ${before.draws} | ${after.draws} | ${before.shadowDraws} → ${after.shadowDraws} | ${before.materials} → ${after.materials} |`);
    }
    console.log('');
  }
  const line = (label, s) => `| ${label} | ${s.before.median} | ${s.after.median} | ${s.before.max} (${s.before.maxId}) | ${s.after.max} (${s.after.maxId}) | ${s.before.total} | ${s.after.total} |`;
  console.log(`Figuras del reparto: ${summary.figures}`);
  console.log('| per figure | median before | median after | max before | max after | total before | total after |');
  console.log('|---|---:|---:|---:|---:|---:|---:|');
  console.log(line('draws', summary.draws));
  console.log(line('shadow draws', summary.shadowDraws));
  console.log(line('materials', summary.materials));
  console.log(line('triangles', summary.triangles));
}
