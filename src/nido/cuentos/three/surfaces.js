// Microdetalle de las figuras: mapas de normales procedurales (pelaje, lana,
// tela, piel, plumas) generados una vez en un canvas y compartidos por todos
// los materiales del mismo tipo. Sin DOM (tests en Node) no hay mapas y las
// figuras quedan lisas.
import * as THREE from "three";

export const SURFACES = {
  fur: { scale: 0.45, sheen: 0.35, repeat: [3, 6] },
  wool: { scale: 0.7, sheen: 0.5, repeat: [4, 4] },
  cloth: { scale: 0.3, sheen: 0.18, repeat: [7, 7] },
  skin: { scale: 0.14, sheen: 0, repeat: [5, 5] },
  feathers: { scale: 0.4, sheen: 0.25, repeat: [3, 5] },
};

function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Ruido de valor periódico (se repite cada `freq` celdas): la textura no muestra costuras.
function noise(x, y, freq, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const w = (i, j) => hash(((i % freq) + freq) % freq, ((j % freq) + freq) % freq, seed);
  const a = w(xi, yi);
  const b = w(xi + 1, yi);
  const c = w(xi, yi + 1);
  const d = w(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function heightAt(kind, u, v) {
  switch (kind) {
    case "fur":
      // Hebras alargadas en vertical con variación fina.
      return noise(u * 18, v * 3, 18, 3) * 0.55 + noise(u * 60, v * 9, 60, 5) * 0.3 + noise(u * 120, v * 30, 120, 7) * 0.15;
    case "wool":
      // Rizos: bultos redondos de dos tamaños.
      return noise(u * 8, v * 8, 8, 11) * 0.6 + noise(u * 16, v * 16, 16, 13) * 0.4;
    case "cloth":
      // Trama: hilos cruzados con algo de irregularidad.
      return (Math.sin(u * Math.PI * 2 * 24) + Math.sin(v * Math.PI * 2 * 24)) * 0.12 + 0.5 + noise(u * 30, v * 30, 30, 17) * 0.25;
    case "feathers":
      // Barbas diagonales suaves.
      return noise(u * 10 + v * 6, v * 22, 22, 19) * 0.6 + noise(u * 50, v * 50, 50, 23) * 0.2;
    default:
      // Piel: grano muy fino.
      return noise(u * 48, v * 48, 48, 29) * 0.7 + noise(u * 96, v * 96, 96, 31) * 0.3;
  }
}

const cache = new Map();

/** Mapa de normales compartido de un tipo de superficie (o null sin DOM). */
export function surfaceNormalMap(kind) {
  if (typeof document === "undefined" || !SURFACES[kind]) return null;
  if (cache.has(kind)) return cache.get(kind);
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) heights[y * size + x] = heightAt(kind, x / size, y / size);
  }
  const image = ctx.createImageData(size, size);
  const strength = 2.2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const l = heights[y * size + ((x - 1 + size) % size)];
      const r = heights[y * size + ((x + 1) % size)];
      const u = heights[((y - 1 + size) % size) * size + x];
      const d = heights[((y + 1) % size) * size + x];
      const nx = (l - r) * strength;
      const ny = (d - u) * strength;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      image.data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      image.data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      image.data[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...SURFACES[kind].repeat);
  tex.needsUpdate = true;
  cache.set(kind, tex);
  return tex;
}
