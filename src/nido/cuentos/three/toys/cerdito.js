// Cerdito de cuento al estilo de la portada: cabezón, ojos grandes con brillo,
// sonrisa abierta, orejas grandes, hocico redondo y colita en espiral. Tres
// variantes por ropa y objeto: Pipo (sombrero de paja, overol celeste, brazada
// de paja), Lolo (camiseta verde, tabla de madera) y Tito (camisa a cuadros
// roja, overol azul, badilejo). Cabeza y brazos llevan marcas en userData
// para que el escenario los anime según la página.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, cone, fit, eyeball } from "./_shared.js";

export const id = "cerdito";
export const label = "Cerdito";

function plaidTexture() {
  // Sin DOM (tests en Node) no hay canvas: la camisa queda roja lisa.
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#d9483f";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  for (let i = 0; i < 128; i += 32) {
    ctx.fillRect(i, 0, 12, 128);
    ctx.fillRect(0, i, 128, 12);
  }
  ctx.fillStyle = "rgba(90,20,20,0.35)";
  for (let i = 16; i < 128; i += 32) {
    ctx.fillRect(i, 0, 5, 128);
    ctx.fillRect(0, i, 128, 5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function build({ outfit = "#5aa0d8", hat = false, shirt = null, plaid = false, item = null } = {}) {
  const g = new THREE.Group();
  const pink = mat("#f7b7c6", { rough: 0.55 , surface: "skin" });
  const pinkDark = mat("#ec93aa", { rough: 0.55 , surface: "skin" });
  const nostril = mat("#b5637e", { rough: 0.4 });
  const mouth = mat("#8e2f3f", { rough: 0.5 });
  const tongue = mat("#e97a92", { rough: 0.5 });
  const denim = mat(outfit, { rough: 0.8, surface: "cloth" });
  const denimDark = mat("#3f7bb0", { rough: 0.8 });
  const gold = mat("#f2c14e", { rough: 0.45 });
  const brow = mat("#8e5a3c", { rough: 0.6 });

  /* -------------------------------- cuerpo ------------------------------- */
  const body = blob(0.078, pink, { y: 0.15 });
  body.scale.set(1, 1.08, 0.9);
  g.add(body);
  let torsoMat = denim;
  if (shirt) torsoMat = mat(shirt, { rough: 0.85, surface: "cloth" });
  if (plaid) {
    const map = plaidTexture();
    torsoMat = map ? new THREE.MeshStandardMaterial({ map, roughness: 0.85 }) : mat("#d9483f", { rough: 0.85 });
  }
  if (shirt || plaid) {
    // Camiseta: cubre el torso hasta el cuello con mangas cortas
    const tee = cyl(0.066, 0.078, 0.11, torsoMat, { y: 0.16 }, 28);
    g.add(tee);
    [-1, 1].forEach((side) => g.add(cyl(0.024, 0.026, 0.04, torsoMat, { x: side * 0.075, y: 0.185, rz: side * 0.6 }, 14)));
  }
  if (shirt && !plaid) {
    // Shorts verde oscuro bajo la camiseta
    g.add(cyl(0.079, 0.072, 0.055, mat("#2f6b3a", { rough: 0.85 }), { y: 0.1 }, 28));
  }
  if (!shirt || plaid) {
    // Overol: peto, tirantes, bolsillo y botones
    const pants = cyl(0.079, 0.074, 0.075, denim, { y: 0.108 }, 28);
    g.add(pants);
    g.add(box(0.062, 0.052, 0.02, denim, { y: 0.178, z: 0.066 }));
    g.add(box(0.036, 0.026, 0.006, denimDark, { y: 0.17, z: 0.078 }));
    [-1, 1].forEach((side) => {
      g.add(box(0.014, 0.075, 0.008, denim, { x: side * 0.024, y: 0.222, z: 0.06, rx: -0.35 }));
      g.add(blob(0.006, gold, { x: side * 0.024, y: 0.2, z: 0.078 }));
    });
  }

  /* -------------------------- patas y pezuñas --------------------------- */
  [-1, 1].forEach((side) => {
    g.add(cyl(0.021, 0.024, 0.065, pink, { x: side * 0.036, y: 0.04 }, 16));
    const hoof = blob(0.024, pinkDark, { x: side * 0.036, y: 0.011, z: 0.006 });
    hoof.scale.set(1, 0.5, 1.15);
    g.add(hoof);
  });

  /* -------------------------------- cabeza ------------------------------- */
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.3, 0.01);
  headGroup.userData.head = 1;
  const head = blob(0.098, pink, { y: 0 });
  head.scale.set(1.12, 1, 1);
  headGroup.add(head);
  // Mejillas rosadas
  [-1, 1].forEach((side) => {
    const cheek = blob(0.02, pinkDark, { x: side * 0.07, y: -0.03, z: 0.07 });
    cheek.scale.set(1, 0.65, 0.5);
    headGroup.add(cheek);
  });
  // Hocico grande con fosas
  const snout = blob(0.04, pinkDark, { y: -0.02, z: 0.095 });
  snout.scale.set(1.35, 0.95, 0.7);
  headGroup.add(snout);
  [-1, 1].forEach((side) => {
    const hole = blob(0.009, nostril, { x: side * 0.017, y: -0.018, z: 0.122 });
    hole.scale.set(1, 1.3, 0.5);
    headGroup.add(hole);
  });
  // Boca abierta y sonriente con lengua
  const smile = blob(0.026, mouth, { y: -0.066, z: 0.086 });
  smile.scale.set(1.5, 0.55, 0.45);
  headGroup.add(smile);
  const tng = blob(0.012, tongue, { y: -0.072, z: 0.094 });
  tng.scale.set(1.2, 0.45, 0.6);
  headGroup.add(tng);
  // Ojos grandes con brillo y cejas
  [-1, 1].forEach((side) => {
    eyeball(headGroup, { x: side * 0.04, y: 0.028, z: 0.082, r: 0.023 });
    const b = mesh(new THREE.TorusGeometry(0.014, 0.0025, 8, 20, Math.PI * 0.8), brow, { x: side * 0.04, y: 0.056, z: 0.09, rz: side * 0.2 + Math.PI * 0.1 });
    headGroup.add(b);
  });
  // Orejas grandes, hacia afuera, con interior rosado
  [-1, 1].forEach((side) => {
    const ear = cone(0.036, 0.085, pink, { x: side * 0.078, y: 0.088, z: -0.01, rz: side * -0.75, rx: -0.25 }, 16);
    ear.scale.set(1, 1, 0.45);
    headGroup.add(ear);
    const inner = cone(0.024, 0.06, pinkDark, { x: side * 0.078, y: 0.084, z: 0.001, rz: side * -0.75, rx: -0.25 }, 16);
    inner.scale.set(1, 1, 0.4);
    headGroup.add(inner);
  });
  g.add(headGroup);

  /* ------------------------------- sombrero ------------------------------ */
  if (hat) {
    const straw = mat("#e6c46e", { rough: 0.85 });
    const strawDark = mat("#c9a34c", { rough: 0.85 });
    const band = mat("#a8673b", { rough: 0.7 });
    const brim = cyl(0.13, 0.135, 0.012, straw, { y: 0.086, rx: 0.12 }, 36);
    headGroup.add(brim);
    headGroup.add(cyl(0.062, 0.078, 0.05, straw, { y: 0.115, rx: 0.12 }, 32));
    headGroup.add(cyl(0.079, 0.08, 0.012, band, { y: 0.097, rx: 0.12 }, 32));
    headGroup.add(mesh(new THREE.TorusGeometry(0.131, 0.005, 8, 40), strawDark, { y: 0.086, rx: Math.PI / 2 + 0.12 }));
  }

  /* -------------------------------- brazos ------------------------------- */
  const arms = {};
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.078, 0.2, 0.012);
    arm.rotation.z = side * 0.55;
    arm.userData.sway = side * 0.6;
    arm.userData.arm = side;
    arm.add(cyl(0.017, 0.019, 0.085, pink, { y: -0.04 }, 14));
    arm.add(blob(0.02, pink, { y: -0.085 }));
    arms[side] = arm;
    g.add(arm);
  });

  /* -------------------------------- objeto ------------------------------- */
  if (item === "paja") {
    // Brazada de paja apretada contra el pecho
    const strawMat = mat("#e9c96a", { rough: 0.9 });
    const bundle = new THREE.Group();
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2;
      const r = 0.018 + (i % 3) * 0.006;
      bundle.add(cyl(0.004, 0.004, 0.14 + (i % 4) * 0.02, strawMat, { x: Math.cos(a) * r, z: Math.sin(a) * r, rz: Math.PI / 2 + (i % 5) * 0.06, ry: a }, 6));
    }
    bundle.position.set(0, 0.17, 0.095);
    bundle.rotation.z = 0.2;
    g.add(bundle);
    arms[-1].rotation.z = -1.3;
    arms[1].rotation.z = 1.3;
    arms[-1].rotation.x = arms[1].rotation.x = -0.9;
  } else if (item === "madera") {
    // Tabla de madera cargada en diagonal
    const wood = mat("#c58a52", { rough: 0.85 });
    const plank = box(0.24, 0.028, 0.05, wood, { x: 0.02, y: 0.16, z: 0.1, rz: 0.55 });
    g.add(plank);
    [-0.06, 0.06].forEach((x) => g.add(box(0.03, 0.004, 0.052, mat("#9c6a3c", { rough: 0.9 }), { x: 0.02 + x, y: 0.16 + x * 0.6, z: 0.1, rz: 0.55 })));
    arms[-1].rotation.z = -1.5;
    arms[-1].rotation.x = -0.7;
    arms[1].rotation.z = 0.3;
    arms[1].rotation.x = -1.1;
  } else if (item === "badilejo") {
    // Badilejo de albañil en la mano derecha, en alto
    const steel = mat("#c9ccd2", { rough: 0.3, metal: 0.7 });
    const handle = mat("#8a5a33", { rough: 0.8 });
    arms[1].rotation.z = 2.4;
    arms[1].rotation.x = -0.4;
    arms[1].add(cyl(0.006, 0.006, 0.05, handle, { y: -0.11, z: 0.012, rx: 0.6 }, 10));
    const blade = cone(0.028, 0.06, steel, { y: -0.155, z: 0.03, rx: Math.PI - 0.6 }, 4);
    blade.scale.set(1.2, 1, 0.25);
    arms[1].add(blade);
    arms[-1].rotation.z = -1.35;
    arms[-1].rotation.x = -0.9;
  }

  /* -------------------------------- colita ------------------------------- */
  const tail = mesh(new THREE.TorusGeometry(0.016, 0.005, 10, 24, Math.PI * 1.6), pinkDark, { y: 0.15, z: -0.078, rx: 0.4, ry: Math.PI / 2 });
  tail.userData.sway = 0.4;
  g.add(tail);

  return fit(g, 0.3);
}
