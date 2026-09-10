// Farol de mano de madera oscura con vela cálida dentro: la luz que guía en el bosque.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, cone, fit } from "./_shared.js";

export const id = "farol";
export const label = "Farol";

export function build() {
  const g = new THREE.Group();
  const wood = mat("#4a2e1c", { rough: 0.75 });
  const woodLight = mat("#6b4530", { rough: 0.75 });
  const roofPaint = mat("#8a3a2c", { rough: 0.7 });
  const brass = mat("#d3a64c", { rough: 0.4, metal: 0.3 });
  const glass = mat("#ffe3a3", { rough: 0.15, opacity: 0.32, emissive: "#ff9a2e", emissiveIntensity: 0.25 });
  const wax = mat("#f7ecd3", { rough: 0.5 });
  const flame = mat("#ffc75a", { rough: 0.3, emissive: "#ff8a1a", emissiveIntensity: 1.6 });
  const glow = mat("#ffb347", { rough: 0.3, opacity: 0.35, emissive: "#ff9a2e", emissiveIntensity: 1.2 });

  const half = 0.052;
  const baseH = 0.022;
  const bodyH = 0.13;
  const frameH = 0.014;
  const roofBase = baseH + bodyH + frameH;
  const roofH = 0.06;

  // Base cuadrada en dos escalones
  g.add(box(0.14, baseH, 0.14, wood, { y: baseH / 2 }));
  g.add(box(0.116, 0.01, 0.116, woodLight, { y: baseH + 0.005 }));

  // Cuatro varillas verticales
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      g.add(cyl(0.008, 0.008, bodyH, wood, { x: sx * half, y: baseH + bodyH / 2, z: sz * half }, 12));
    });
  });

  // Paneles de vidrio translúcidos
  const panelW = half * 2 - 0.012;
  [-1, 1].forEach((s) => {
    g.add(box(panelW, bodyH - 0.01, 0.004, glass, { y: baseH + bodyH / 2, z: s * half }));
    g.add(box(0.004, bodyH - 0.01, panelW, glass, { x: s * half, y: baseH + bodyH / 2 }));
  });

  // Vela y llama
  g.add(cyl(0.017, 0.018, 0.055, wax, { y: baseH + 0.01 + 0.0275 }, 16));
  const flameY = baseH + 0.01 + 0.055;
  g.add(blob(0.011, flame, { y: flameY + 0.008 }));
  g.add(cone(0.011, 0.028, flame, { y: flameY + 0.022 }, 12));
  g.add(blob(0.028, glow, { y: flameY + 0.016 }));

  // Marco superior y techito piramidal
  g.add(box(0.14, frameH, 0.14, wood, { y: baseH + bodyH + frameH / 2 }));
  const roofGeo = new THREE.ConeGeometry(0.098, roofH, 4).rotateY(Math.PI / 4);
  g.add(mesh(roofGeo, roofPaint, { y: roofBase + roofH / 2 }));
  g.add(blob(0.013, brass, { y: roofBase + roofH }));

  // Asa curva encima
  const arcR = 0.053;
  const arcY = roofBase + 0.03;
  g.add(mesh(new THREE.TorusGeometry(arcR, 0.007, 12, 32, Math.PI), brass, { y: arcY }));
  [-1, 1].forEach((s) => {
    g.add(blob(0.012, brass, { x: s * arcR, y: arcY - 0.006 }));
  });

  return fit(g, 0.3);
}
