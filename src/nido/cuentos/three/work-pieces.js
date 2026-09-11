// Piezas de las «obras» de los cuentos: lo que una figura carga y coloca
// para que se la vea trabajando (paja, madera, ladrillos) o lo que recoge del
// suelo (flores, caracolas). Geometría en unidades del diorama, apoyada en
// y = 0; cada pieza trae su transformación final en la construcción.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl } from "./toys/_shared.js";

const materials = {};
function material(key, color, opts) {
  if (!materials[key]) materials[key] = mat(color, opts);
  return materials[key];
}

function strawBundle() {
  const g = new THREE.Group();
  const straw = material("straw", "#e6c46e", { rough: 0.9 });
  const tie = material("tie", "#a8673b", { rough: 0.7 });
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2;
    g.add(cyl(0.0026, 0.0026, 0.075, straw, { x: Math.cos(a) * 0.006, z: Math.sin(a) * 0.006, ry: a, rz: (i % 3) * 0.05 }, 6));
  }
  g.add(cyl(0.0095, 0.0095, 0.006, tie, {}, 10));
  return g;
}

function plank() {
  return box(0.09, 0.011, 0.02, material("plank", "#c58a52", { rough: 0.85 }));
}

function brick() {
  return box(0.03, 0.015, 0.017, material("brick", "#c9553d", { rough: 0.85 }));
}

function flower() {
  const g = new THREE.Group();
  g.add(cyl(0.0025, 0.003, 0.03, material("stem", "#4c9c47", { rough: 0.8 }), { y: 0.015 }, 6));
  const petals = material("petal", "#f4c95d", { rough: 0.6 });
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    const petal = blob(0.008, petals, { x: Math.sin(a) * 0.009, y: 0.032, z: Math.cos(a) * 0.009 });
    petal.scale.set(1, 0.45, 1.3);
    petal.rotation.y = a;
    g.add(petal);
  }
  g.add(blob(0.005, material("center", "#d9483f", { rough: 0.6 }), { y: 0.034 }));
  return g;
}

function shell() {
  const g = new THREE.Group();
  const s = blob(0.014, material("shell", "#f6d7c3", { rough: 0.45, clearcoat: 0.6 }), { y: 0.008 });
  s.scale.set(1.2, 0.6, 1);
  g.add(s);
  g.add(blob(0.006, material("shellTip", "#e2a98f", { rough: 0.5 }), { x: 0.012, y: 0.006 }));
  return g;
}

/** Cabaña de paja: anillo de fardos de pie, segunda fila inclinada y remate. */
function strawHut() {
  const pieces = [];
  const ring = [40, 80, 120, 160, 200, 240, 280, 320];
  // Planta ovalada (menos fondo) para quedar delante de la lámina del pop-up.
  ring.forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    pieces.push({ build: strawBundle, pos: [Math.sin(a) * 0.05, 0.038, Math.cos(a) * 0.032], rot: [0, a, 0] });
  });
  [60, 150, 210, 300].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    pieces.push({ build: strawBundle, pos: [Math.sin(a) * 0.028, 0.095, Math.cos(a) * 0.018], rot: [Math.cos(a) * 0.55, a, -Math.sin(a) * 0.55] });
  });
  pieces.push({ build: strawBundle, pos: [0, 0.128, 0], rot: [0, 0.4, Math.PI / 2] });
  return pieces;
}

/** Casa de madera: postes, vigas, tablas de pared y cabios del techo. */
function woodHouse() {
  const pieces = [];
  [[-0.045, -0.025], [0.045, -0.025], [-0.045, 0.025], [0.045, 0.025]].forEach(([x, z]) => {
    pieces.push({ build: plank, pos: [x, 0.05, z], rot: [0, 0, Math.PI / 2] });
  });
  [[0, -0.025, 0], [0, 0.025, 0], [-0.045, 0, Math.PI / 2], [0.045, 0, Math.PI / 2]].forEach(([x, z, ry]) => {
    pieces.push({ build: plank, pos: [x, 0.1, z], rot: [0, ry, 0] });
  });
  [[0, 0.027, 0.03], [0, 0.027, 0.07]].forEach(([x, z, y]) => {
    pieces.push({ build: plank, pos: [x, y, z], rot: [0, 0, 0] });
  });
  pieces.push({ build: plank, pos: [-0.024, 0.125, 0], rot: [0, Math.PI / 2, 0.75] });
  pieces.push({ build: plank, pos: [0.024, 0.125, 0], rot: [0, Math.PI / 2, -0.75] });
  return pieces;
}

/** Pared de ladrillos: cuatro hiladas trabadas. */
function brickWall() {
  const pieces = [];
  for (let row = 0; row < 4; row += 1) {
    const count = row % 2 ? 3 : 4;
    for (let i = 0; i < count; i += 1) {
      const x = (i - (count - 1) / 2) * 0.031;
      pieces.push({ build: brick, pos: [x, 0.0075 + row * 0.0155, 0], rot: [0, 0, 0] });
    }
  }
  return pieces;
}

/** Cosas repartidas por el suelo para recoger (flores, caracolas). */
function scattered(build, count, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const pieces = [];
  for (let i = 0; i < count; i += 1) {
    pieces.push({ build, pos: [-0.15 + (i / (count - 1)) * 0.3 + (rand() - 0.5) * 0.04, 0, 0.02 + (rand() - 0.5) * 0.04], rot: [0, rand() * Math.PI * 2, 0] });
  }
  return pieces;
}

/** Pila de material junto a la obra. */
function pileFor(task) {
  const g = new THREE.Group();
  if (task === "paja") {
    for (let i = 0; i < 5; i += 1) {
      const b = strawBundle();
      b.position.set((i % 3) * 0.02 - 0.02, 0.012 + Math.floor(i / 3) * 0.02, (i % 2) * 0.016 - 0.008);
      b.rotation.set(0, i * 0.7, Math.PI / 2);
      g.add(b);
    }
  } else if (task === "madera") {
    for (let i = 0; i < 4; i += 1) {
      const p = plank();
      p.position.set(0, 0.006 + i * 0.012, (i % 2) * 0.01 - 0.005);
      p.rotation.y = (i % 2) * 0.12;
      g.add(p);
    }
  } else if (task === "ladrillos") {
    for (let i = 0; i < 6; i += 1) {
      const b = brick();
      b.position.set((i % 3) * 0.032 - 0.032, 0.0075 + Math.floor(i / 3) * 0.0155, 0);
      g.add(b);
    }
  }
  return g;
}

export const WORK_TASKS = {
  paja: { pieces: strawHut, batch: 4, sound: "paja-colocar", place: "build", label: "paja", carryRot: [0, 0, Math.PI / 2] },
  madera: { pieces: woodHouse, batch: 3, sound: "martillo", place: "build", label: "madera" },
  ladrillos: { pieces: brickWall, batch: 4, sound: "ladrillo", place: "build", label: "ladrillos" },
  flores: { gather: true, pieces: () => scattered(flower, 6, 11), sound: "toy-ramo" },
  caracolas: { gather: true, pieces: () => scattered(shell, 6, 23), sound: "toy-caracola" },
};

/** Piezas de una tarea: mallas ya creadas (ocultas) con su destino. */
export function buildWorkPieces(task) {
  const spec = WORK_TASKS[task];
  if (!spec) return [];
  return spec.pieces().map((piece) => {
    const object = piece.build();
    object.position.set(...piece.pos);
    object.rotation.set(...piece.rot);
    return { object, pos: piece.pos, rot: piece.rot };
  });
}

export function buildWorkPile(task) {
  return WORK_TASKS[task]?.gather ? null : pileFor(task);
}

// Objetos de la escenografía SVG que la obra ya representa en 3D.
export const WORK_PROPS = new Set(["paja", "madera", "ladrillos"]);
