import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOOK_W, BOOK_H } from '../../src/nido/cuentos/three/book3d.js';
import { createWordHighlight, wordBoxToPlane, readBoxToPlane, pageShadeMaterial, HIGHLIGHT } from '../../src/nido/cuentos/three/word-highlight.js';

// Hoja de texto como la de book3d.js y cajas de palabra como las de
// textures.js (lienzo de 1024×1448, texto dentro del marco 54..970 × 54..1394).
const CANVAS_W = 1024;
const CANVAS_H = 1448;
const PLANE_W = BOOK_W * 0.94;
const PLANE_H = BOOK_H * 0.95;
// Igual que storyMat en book3d.js.
const storyPage = () => new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), new THREE.MeshStandardMaterial({
  color: '#fffaf0', roughness: 0.92, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1,
}));
const words = Array.from({ length: 24 }, (_, i) => ({ x: 116 + (i % 6) * 130, y: 520 + Math.floor(i / 6) * 69, w: 110, h: 59 }));

test('las cajas de las esquinas del texto caen dentro de la hoja y sin espejo', () => {
  const corners = [
    { x: 70, y: 70, w: 90, h: 59 },
    { x: 954 - 90, y: 70, w: 90, h: 59 },
    { x: 70, y: 1378 - 59, w: 90, h: 59 },
    { x: 954 - 90, y: 1378 - 59, w: 90, h: 59 },
  ];
  for (const box of corners) {
    for (const rect of [wordBoxToPlane(box, CANVAS_W, CANVAS_H, PLANE_W, PLANE_H), readBoxToPlane(box, CANVAS_W, CANVAS_H, PLANE_W, PLANE_H)]) {
      assert.ok(rect.x - rect.w / 2 >= -PLANE_W / 2 && rect.x + rect.w / 2 <= PLANE_W / 2, `x fuera de la hoja: ${JSON.stringify(rect)}`);
      assert.ok(rect.y - rect.h / 2 >= -PLANE_H / 2 && rect.y + rect.h / 2 <= PLANE_H / 2, `y fuera de la hoja: ${JSON.stringify(rect)}`);
    }
  }
  const [topLeft, topRight, bottomLeft] = corners.map((box) => wordBoxToPlane(box, CANVAS_W, CANVAS_H, PLANE_W, PLANE_H));
  assert.ok(topLeft.x < 0 && topRight.x > 0, 'la izquierda del lienzo queda a la izquierda de la hoja');
  assert.ok(topLeft.y > 0 && bottomLeft.y < 0, 'el renglón de arriba queda arriba');
  // Mismas medidas que el roundRect(x-10, y, w+20, h) del lienzo.
  const rect = wordBoxToPlane({ x: 512 - 50, y: 724 - 30, w: 100, h: 60 }, CANVAS_W, CANVAS_H, PLANE_W, PLANE_H);
  assert.ok(Math.abs(rect.x) < 1e-12 && Math.abs(rect.y) < 1e-12);
  assert.ok(Math.abs(rect.w - (120 / CANVAS_W) * PLANE_W) < 1e-12 && Math.abs(rect.h - (60 / CANVAS_H) * PLANE_H) < 1e-12);
  // Y el fillRect(x-3, y+.2h, w+6, .72h) de las palabras leídas.
  const readRect = readBoxToPlane({ x: 512 - 50, y: 724 - 30, w: 100, h: 60 }, CANVAS_W, CANVAS_H, PLANE_W, PLANE_H);
  assert.ok(Math.abs(readRect.w - (106 / CANVAS_W) * PLANE_W) < 1e-12 && Math.abs(readRect.h - (43.2 / CANVAS_H) * PLANE_H) < 1e-12);
  assert.ok(Math.abs(readRect.y - (0.5 - (694 + 33.6) / CANVAS_H) * PLANE_H) < 1e-12);
});

test('índice −1 lo oculta todo; setIndex(n) muestra n leídas y la palabra activa', () => {
  const page = storyPage();
  const highlight = createWordHighlight(page, { now: () => 0 });
  const { group, read, active } = highlight.meshes;
  assert.equal(group.parent, page, 'el resaltado vive sobre la hoja');
  assert.ok(group.position.z > 0, 'hacia la cara que se lee');
  highlight.setWords(words, CANVAS_W, CANVAS_H);
  assert.equal(read.visible, false);
  assert.equal(active.visible, false);
  const uploads = read.instanceMatrix.version;
  highlight.setIndex(0);
  assert.equal(read.visible, false, 'ninguna leída todavía');
  assert.equal(active.visible, true);
  for (const n of [1, 5, 17, 23]) {
    highlight.setIndex(n);
    assert.equal(read.count, n);
    assert.equal(read.visible, true);
    assert.equal(active.visible, true);
  }
  highlight.setIndex(24);
  assert.equal(read.count, 24, 'la última palabra ya leída');
  assert.equal(active.visible, false, 'no hay palabra 24');
  highlight.setIndex(-1);
  assert.equal(read.visible, false);
  assert.equal(active.visible, false);
  assert.equal(read.instanceMatrix.version, uploads, 'cambiar de palabra no sube datos a la GPU');
  highlight.dispose();
  assert.equal(group.parent, null);
});

test('el rectángulo activo se desliza en 90 ms, o salta con movimiento reducido', () => {
  let clock = 0;
  let reduced = false;
  const highlight = createWordHighlight(storyPage(), { now: () => clock, reduceMotion: () => reduced });
  const { active } = highlight.meshes;
  highlight.setWords(words, CANVAS_W, CANVAS_H);
  highlight.setIndex(0);
  const first = wordBoxToPlane(words[0], CANVAS_W, CANVAS_H, PLANE_W, PLANE_H);
  const second = wordBoxToPlane(words[1], CANVAS_W, CANVAS_H, PLANE_W, PLANE_H);
  assert.ok(Math.abs(highlight.activeRect.x - first.x) < 1e-12, 'la primera palabra aparece en su sitio');
  highlight.setIndex(1);
  highlight.update();
  assert.ok(Math.abs(highlight.activeRect.x - first.x) < 1e-12, 'empieza donde estaba');
  clock = 45;
  highlight.update();
  assert.ok(highlight.activeRect.x > first.x && highlight.activeRect.x < second.x, 'a mitad de camino');
  clock = HIGHLIGHT.easeMs;
  highlight.update();
  assert.ok(Math.abs(highlight.activeRect.x - second.x) < 1e-12, 'llega en 90 ms');
  reduced = true;
  highlight.setIndex(2);
  const third = wordBoxToPlane(words[2], CANVAS_W, CANVAS_H, PLANE_W, PLANE_H);
  assert.ok(Math.abs(highlight.activeRect.x - third.x) < 1e-12, 'con movimiento reducido salta sin animar');
  // Vértices en coordenadas de la hoja: bordes del rectángulo y esquinas de
  // 14 px del lienzo, también en palabras largas.
  const position = active.geometry.attributes.position;
  assert.ok(Math.abs(position.getX(0) - (third.x - third.w / 2)) < 1e-6 && Math.abs(position.getX(3) - (third.x + third.w / 2)) < 1e-6);
  assert.ok(Math.abs(position.getY(0) - (third.y + third.h / 2)) < 1e-6 && Math.abs(position.getY(15) - (third.y - third.h / 2)) < 1e-6);
  assert.ok(Math.abs(position.getX(1) - position.getX(0) - (HIGHLIGHT.cornerPx / CANVAS_W) * PLANE_W) < 1e-6);
  assert.ok(Math.abs(position.getY(0) - position.getY(4) - (HIGHLIGHT.cornerPx / CANVAS_H) * PLANE_H) < 1e-6);
  highlight.dispose();
});

test('se ve como el lienzo multiplicado: la misma hoja, iluminada igual, con el tinte', () => {
  const page = storyPage();
  const texture = new THREE.Texture();
  page.material.map = texture;
  const highlight = createWordHighlight(page);
  const { read, active } = highlight.meshes;
  highlight.setWords(words, CANVAS_W, CANVAS_H);
  const paper = new THREE.Color('#fffaf0');
  for (const [mesh, tint] of [[read, HIGHLIGHT.readColor], [active, HIGHLIGHT.activeColor]]) {
    const material = mesh.material;
    assert.equal(material.type, page.material.type, 'mismo modelo de luz que la hoja');
    assert.equal(material.map, texture, 'lee la textura ya subida de la página');
    assert.equal(material.roughness, page.material.roughness);
    assert.ok(material.color.equals(paper.clone().multiply(tint)), 'color de la hoja × tinte (antes de luz y tono)');
    assert.ok(material.polygonOffset && material.polygonOffsetFactor <= -2, 'por delante de la hoja');
    assert.equal(mesh.receiveShadow, true, 'recibe las mismas sombras que la hoja');
    assert.equal(mesh.castShadow, false);
  }
  assert.equal(HIGHLIGHT.readColor.getHexString(THREE.SRGBColorSpace), 'efdfb9', 'blanco llevado un 55 % hacia #e2c480');
  assert.equal(HIGHLIGHT.activeColor.getHexString(THREE.SRGBColorSpace), 'f4c95d');
  // Una página nueva cambia la textura que leen los dos dibujos.
  const next = new THREE.Texture();
  page.material.map = next;
  highlight.setWords(words.slice(0, 3), CANVAS_W, CANVAS_H);
  assert.equal(read.material.map, next);
  assert.equal(active.material.map, next);
  assert.equal(page.material.map, next, 'la hoja no se toca');
  highlight.dispose();
});

test('el sombreado toma la coordenada de textura de la posición sobre la hoja', () => {
  const material = pageShadeMaterial(storyPage().material, HIGHLIGHT.activeColor, { value: new THREE.Vector2(PLANE_W, PLANE_H) });
  const shader = { uniforms: {}, vertexShader: '#include <common>\nvoid main() {\n#include <uv_vertex>\n#include <begin_vertex>\n}', fragmentShader: '' };
  material.onBeforeCompile(shader);
  assert.ok(shader.uniforms.hlPlaneSize.value.x === PLANE_W, 'tamaño de la hoja como uniforme');
  assert.match(shader.vertexShader, /uniform vec2 hlPlaneSize;/);
  assert.match(shader.vertexShader, /instanceMatrix \* vec4\( transformed, 1\.0 \)/);
  assert.match(shader.vertexShader, /vMapUv = \( mapTransform \* vec3\( hlPagePos \/ hlPlaneSize \+ 0\.5, 1\.0 \) \)\.xy;/);
  assert.ok(shader.vertexShader.indexOf('#include <begin_vertex>') < shader.vertexShader.indexOf('vMapUv ='), 'se calcula después de <uv_vertex>/<begin_vertex>');
});
