// Caperucita como en la ilustración de referencia: cabeza grande con pelo
// castaño ondulado y flequillo, ojos grandes marrones con brillo, pecas y
// mejillas; capa roja con capucha y lazo; vestido rojo con corpiño atado en
// cruz sobre blusa blanca de mangas abullonadas; canasta de mimbre con mantel
// a cuadros en la mano derecha; calcetines blancos y zapatos marrones.
// Cabeza (userData.head), brazos (arm) y piernas (leg) articulados.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, cone, fit, eyeball, brow, smile, cheek } from "./_shared.js";

export const id = "caperucita";
export const label = "Caperucita";

function checkerTexture() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      ctx.fillStyle = (x + y) % 2 ? "#d63b3b" : "#fff6ee";
      ctx.fillRect(x * 8, y * 8, 8, 8);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wickerTexture() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c9955c";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "rgba(90,50,20,0.45)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 64; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i + 4);
    ctx.lineTo(64, i + 4);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,230,180,0.35)";
  for (let i = 0; i < 64; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i + 5, 0);
    ctx.lineTo(i + 5, 64);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function build() {
  const g = new THREE.Group();
  const red = mat("#d63b3b", { rough: 0.75, surface: "cloth" });
  const redDark = mat("#b12d2d", { rough: 0.75, surface: "cloth" });
  const skin = mat("#f6d3b6", { rough: 0.55, surface: "skin" });
  const hair = mat("#8a5a34", { rough: 0.7, surface: "fur" });
  const hairLight = mat("#a36f42", { rough: 0.7, surface: "fur" });
  const white = mat("#fbf6ee", { rough: 0.8, surface: "cloth" });
  const lace = mat("#5a3a22", { rough: 0.6 });
  const shoe = mat("#6b3f24", { rough: 0.45, clearcoat: 0.5 });
  const sock = mat("#ffffff", { rough: 0.85, surface: "wool" });
  const wickerMap = wickerTexture();
  const wicker = wickerMap ? new THREE.MeshStandardMaterial({ map: wickerMap, roughness: 0.85 }) : mat("#c9955c", { rough: 0.85 });
  const checkMap = checkerTexture();
  const checker = checkMap ? new THREE.MeshStandardMaterial({ map: checkMap, roughness: 0.8, side: THREE.DoubleSide }) : mat("#e07a7a", { rough: 0.8 });

  /* ----------------------- piernas articuladas ------------------------ */
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.021, 0.085, 0);
    leg.userData.leg = side;
    leg.add(cyl(0.011, 0.012, 0.06, skin, { y: -0.03 }, 14));
    leg.add(cyl(0.0125, 0.013, 0.02, sock, { y: -0.063 }, 14));
    const foot = blob(0.017, shoe, { y: -0.078, z: 0.008 });
    foot.scale.set(1, 0.55, 1.5);
    leg.add(foot);
    leg.add(box(0.024, 0.004, 0.006, shoe, { y: -0.07, z: 0.006 }));
    g.add(leg);
  });

  /* ------------------------------ vestido ----------------------------- */
  const skirt = cone(0.078, 0.11, red, { y: 0.1 }, 40);
  g.add(skirt);
  g.add(cyl(0.079, 0.081, 0.008, redDark, { y: 0.049 }, 40));
  // Corpiño rojo con cordón en cruz sobre la blusa blanca
  g.add(cyl(0.034, 0.047, 0.07, red, { y: 0.185 }, 28));
  g.add(cyl(0.037, 0.038, 0.022, white, { y: 0.226 }, 28));
  [0.16, 0.178, 0.196].forEach((y) => {
    g.add(cyl(0.0018, 0.0018, 0.034, lace, { y, z: 0.044, rz: 0.95 }, 6));
    g.add(cyl(0.0018, 0.0018, 0.034, lace, { y, z: 0.044, rz: -0.95 }, 6));
    [-1, 1].forEach((side) => g.add(blob(0.0032, lace, { x: side * 0.014, y, z: 0.045 })));
  });
  // Mangas abullonadas
  [-1, 1].forEach((side) => {
    const sleeve = blob(0.021, white, { x: side * 0.05, y: 0.214, z: 0.004 });
    sleeve.scale.set(1, 0.95, 1);
    g.add(sleeve);
  });
  // Capa a la espalda, abierta al frente
  const cape = mesh(new THREE.CylinderGeometry(0.048, 0.086, 0.2, 40, 1, true, Math.PI * 0.62, Math.PI * 1.76), red, { y: 0.145, z: -0.012 });
  g.add(cape);
  // Lazo al cuello
  [-1, 1].forEach((side) => {
    const loop = blob(0.012, red, { x: side * 0.015, y: 0.238, z: 0.04, rz: side * 0.3 });
    loop.scale.set(1.3, 0.8, 0.5);
    g.add(loop);
    const tail = blob(0.006, redDark, { x: side * 0.008, y: 0.222, z: 0.043, rz: side * 0.25 });
    tail.scale.set(0.8, 1.8, 0.5);
    g.add(tail);
  });
  g.add(blob(0.006, redDark, { y: 0.238, z: 0.047 }));

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.305, 0.008);
  headG.userData.head = 1;
  const face = blob(0.06, skin, {});
  face.scale.set(1, 1.05, 0.95);
  headG.add(face);
  // Pelo: casquete, flequillo en mechones y ondas a los lados
  const cap = blob(0.063, hair, { y: 0.012, z: -0.012 });
  cap.scale.set(1.02, 0.95, 1);
  headG.add(cap);
  [-0.036, -0.02, -0.004, 0.012, 0.028, 0.042].forEach((x, i) => {
    const lock = blob(0.014, i % 2 ? hairLight : hair, { x, y: 0.04 - Math.abs(x) * 0.25, z: 0.046 });
    lock.scale.set(1, 1.3, 0.7);
    lock.rotation.z = -x * 4;
    headG.add(lock);
  });
  [-1, 1].forEach((side) => {
    [0, 1, 2, 3].forEach((n) => {
      const wave = blob(0.017 - n * 0.002, n % 2 ? hairLight : hair, { x: side * (0.052 + n * 0.004), y: 0.005 - n * 0.022, z: -0.004 + (n % 2) * 0.012 });
      wave.scale.set(0.9, 1.15, 1);
      headG.add(wave);
    });
  });
  // Capucha roja abierta al frente, con pico
  const hood = mesh(new THREE.SphereGeometry(0.079, 32, 18, Math.PI * 0.5 + 0.95, Math.PI * 2 - 1.9), red, { y: 0.014, z: -0.014 });
  hood.scale.set(1, 1.08, 1);
  headG.add(hood);
  headG.add(cone(0.02, 0.05, red, { y: 0.085, z: -0.035, rx: -0.6 }, 12));
  // Cara: ojos grandes marrones, cejas, pecas, mejillas, nariz y sonrisa
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.024, y: 0.006, z: 0.05, r: 0.016, iris: "#5b3a1e", squash: 0.6, look: -side * 0.2 });
    brow(headG, { x: side * 0.024, y: 0.03, z: 0.052, r: 0.011, thick: 0.0018, color: "#7a4a2a", tilt: 0.12, side });
    cheek(headG, { x: side * 0.036, y: -0.014, z: 0.044, r: 0.011, color: "#f3a3a3" });
    [[0.028, -0.008], [0.036, -0.004], [0.032, -0.014], [0.042, -0.011]].forEach(([x, y]) => {
      headG.add(blob(0.0016, mat("#c98a63", { rough: 0.7 }), { x: side * x, y, z: 0.052 }));
    });
  });
  headG.add(blob(0.0055, skin, { y: -0.008, z: 0.058 }));
  smile(headG, { y: -0.024, z: 0.052, r: 0.012, thick: 0.0018, color: "#a3413f" });
  const teeth = box(0.014, 0.004, 0.003, mat("#ffffff", { rough: 0.3 }), { y: -0.026, z: 0.054 });
  headG.add(teeth);
  g.add(headG);

  /* ------------------------ brazos articulados ------------------------ */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.052, 0.212, 0.004);
    arm.userData.arm = side;
    arm.rotation.z = side * 0.35;
    if (side > 0) arm.rotation.x = -0.75;
    arm.add(cyl(0.0085, 0.0095, 0.068, skin, { y: -0.04 }, 14));
    arm.add(blob(0.011, skin, { y: -0.079 }));
    if (side > 0) {
      // Canasta de mimbre colgada del brazo, con mantel a cuadros
      const basket = new THREE.Group();
      basket.position.set(0.004, -0.098, 0.006);
      basket.add(cyl(0.03, 0.022, 0.04, wicker, { y: 0.02 }, 24));
      basket.add(mesh(new THREE.TorusGeometry(0.029, 0.0035, 8, 28, Math.PI), wicker, { y: 0.04 }));
      const cloth = blob(0.03, checker, { y: 0.042 });
      cloth.scale.set(1.05, 0.28, 1.05);
      basket.add(cloth);
      const fold = blob(0.014, checker, { x: 0.024, y: 0.03, z: 0.012 });
      fold.scale.set(1, 1.2, 0.5);
      basket.add(fold);
      arm.add(basket);
    }
    g.add(arm);
  });

  return fit(g, 0.31);
}
