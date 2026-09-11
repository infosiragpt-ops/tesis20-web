// Osito de anteojos sentado, al estilo de la portada: cabezón, ojos grandes
// dentro de los anillos crema, sonrisa, mejillas y una bolsita cruzada (donde
// Kusi guarda el panal). Cabeza (userData.head), orejas (ear) y patas
// delanteras (arm) van en grupos articulados para que el escenario los anime.
import * as THREE from "three";
import { mat, mesh, blob, box, fit, eyeball, smile, cheek } from "./_shared.js";

export const id = "oso";
export const label = "Oso de anteojos";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);

function onHead(ox, oy, radius, inset = 0) {
  const oz = Math.sqrt(Math.max(0, radius * radius - ox * ox - oy * oy));
  const n = new THREE.Vector3(ox, oy, oz).normalize();
  return n.multiplyScalar(radius + inset).toArray();
}

function limb(from, to, r, material) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = mesh(new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 6, 16), material);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

export function build() {
  const g = new THREE.Group();
  const fur = mat("#3a251c", { rough: 0.72 , surface: "fur" });
  const cream = mat("#f3e2b8", { surface: "fur" });
  const tan = mat("#dcbf92", { surface: "fur" });
  const inner = mat("#8a5f4a");
  const black = mat("#1c1a22", { rough: 0.3 });
  const bag = mat("#c4553f", { rough: 0.8 });
  const strap = mat("#8f3b2c", { rough: 0.8 });

  /* ------------------------------ cuerpo ------------------------------ */
  const hips = blob(0.11, fur, { y: 0.062 });
  hips.scale.set(1.1, 0.55, 1);
  g.add(hips);
  const body = blob(0.115, fur, { y: 0.155 });
  body.scale.set(1, 1.05, 0.92);
  g.add(body);
  const bib = blob(0.062, cream, { y: 0.2, z: 0.08, rx: -0.35 });
  bib.scale.set(1, 1.2, 0.45);
  g.add(bib);
  const belly = blob(0.05, tan, { y: 0.125, z: 0.095 });
  belly.scale.set(1.1, 0.9, 0.4);
  g.add(belly);
  g.add(blob(0.025, fur, { y: 0.06, z: -0.115 }));

  // Bolsita cruzada al hombro
  g.add(limb([-0.07, 0.245, 0.05], [0.09, 0.095, 0.085], 0.006, strap));
  const pouch = box(0.052, 0.042, 0.026, bag, { x: 0.098, y: 0.088, z: 0.078, rz: -0.25 });
  g.add(pouch);
  g.add(box(0.052, 0.016, 0.028, strap, { x: 0.098, y: 0.104, z: 0.079, rz: -0.25 }));
  g.add(blob(0.006, mat("#f2c14e", { rough: 0.45 }), { x: 0.1, y: 0.094, z: 0.093 }));

  /* -------------------------- patas traseras -------------------------- */
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.112, 0.045, 0.06);
    leg.rotation.y = side * 0.22;
    const thigh = blob(0.048, fur, {});
    thigh.scale.set(0.9, 0.8, 1.35);
    leg.add(thigh);
    leg.add(blob(0.034, fur, { y: 0.004, z: 0.045 }));
    const sole = blob(0.026, tan, { y: 0.008, z: 0.07 });
    sole.scale.set(0.9, 1.05, 0.35);
    leg.add(sole);
    [-1, 0, 1].forEach((t) => leg.add(blob(0.006, fur, { x: t * 0.013, y: 0.028, z: 0.076 })));
    g.add(leg);
  });

  /* ------------------ patas delanteras articuladas -------------------- */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.088, 0.185, 0.035);
    arm.userData.arm = side;
    arm.add(limb([0, 0, 0], [-side * 0.038, -0.15, 0.08], 0.03, fur));
    const paw = blob(0.033, fur, { x: -side * 0.038, y: -0.153, z: 0.083 });
    paw.scale.set(1, 0.8, 1.1);
    arm.add(paw);
    const pad = blob(0.014, tan, { x: -side * 0.038, y: -0.15, z: 0.113 });
    pad.scale.set(1.2, 0.9, 0.4);
    arm.add(pad);
    g.add(arm);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const HR = 0.092;
  const headG = new THREE.Group();
  headG.position.set(0, 0.315, 0.01);
  headG.userData.head = 1;
  const head = blob(HR, fur, {});
  head.scale.set(1.1, 1, 1);
  headG.add(head);
  // Orejas redondas articuladas
  [-1, 1].forEach((side) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.076, 0.066, -0.005);
    ear.userData.ear = side;
    ear.add(blob(0.032, fur, {}));
    const disc = blob(0.018, inner, { z: 0.026 });
    disc.scale.set(1, 1, 0.5);
    ear.add(disc);
    headG.add(ear);
  });
  // Hocico claro, nariz y sonrisa
  const muzzle = blob(0.046, tan, { y: -0.037, z: 0.078 });
  muzzle.scale.set(1.2, 0.85, 1);
  headG.add(muzzle);
  const nose = blob(0.017, black, { y: -0.015, z: 0.12 });
  nose.scale.set(1.25, 0.8, 0.8);
  headG.add(nose);
  smile(headG, { y: -0.04, z: 0.118, r: 0.013, thick: 0.0025, color: "#1c1a22" });
  // Anillos crema (los «anteojos») pegados a la curva de la cabeza
  [-1, 1].forEach((side) => {
    const ox = side * 0.041;
    const oy = 0.012;
    const oz = Math.sqrt(HR * HR - ox * ox - oy * oy);
    const n = new THREE.Vector3(ox, oy, oz).normalize();
    const ring = mesh(new THREE.TorusGeometry(0.03, 0.009, 12, 32), cream);
    ring.position.copy(n).multiplyScalar(HR - 0.003);
    ring.quaternion.setFromUnitVectors(FRONT, n);
    headG.add(ring);
    // Franja que baja del anillo por la mejilla hasta la pechera
    headG.add(limb(onHead(side * 0.058, -0.02, HR, -0.004), onHead(side * 0.03, -0.074, HR, -0.004), 0.0085, cream));
    // Ojos grandes con brillo dentro de los anillos
    eyeball(headG, { x: side * 0.041, y: 0.012, z: 0.086, r: 0.019, iris: "#2b1a12", squash: 0.6 });
    cheek(headG, { x: side * 0.063, y: -0.03, z: 0.062, r: 0.012, color: "#b8705f" });
  });
  g.add(headG);

  return fit(g, 0.3);
}
