// Velero de madera de juguete sobre su peana: casco azul, cubierta clara, dos velas y banderita roja.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "barco";
export const label = "Velero";

const DECK = 0.15;
const MAST_X = -0.01;

// Perfil del casco (radio, posición a lo largo) de popa a proa, suavizado con spline.
function hullProfile() {
  const ctrl = [
    [0, -0.15], [0.05, -0.148], [0.068, -0.14], [0.078, -0.09], [0.08, -0.03],
    [0.077, 0.03], [0.068, 0.08], [0.052, 0.12], [0.03, 0.15], [0.01, 0.168], [0, 0.172],
  ].map(([r, t]) => new THREE.Vector2(r, t));
  const pts = new THREE.SplineCurve(ctrl).getPoints(48).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  return pts;
}

// Contorno de la cubierta en planta (largo, ancho) a partir del perfil.
function deckShape(profile, kl = 1, kw = 1) {
  const s = new THREE.Shape();
  profile.forEach((p, i) => (i ? s.lineTo(p.y * kl, p.x * kw) : s.moveTo(p.y * kl, p.x * kw)));
  for (let i = profile.length - 2; i > 0; i -= 1) s.lineTo(profile[i].y * kl, -profile[i].x * kw);
  s.closePath();
  return s;
}

function slab(shape, depth, material, opts) {
  return mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material, opts);
}

// Vela triangular con el borde libre ligeramente abombado.
function sail(a, b, c, bulge, material, thickness = 0.005) {
  const s = new THREE.Shape();
  s.moveTo(a[0], a[1]);
  const mx = (a[0] + b[0]) / 2 + bulge[0];
  const my = (a[1] + b[1]) / 2 + bulge[1];
  s.quadraticCurveTo(mx, my, b[0], b[1]);
  s.lineTo(c[0], c[1]);
  s.closePath();
  return slab(s, thickness, material, { z: -thickness / 2 });
}

export function build() {
  const g = new THREE.Group();
  const navy = mat("#2f5aa0");
  const white = mat("#f6f2e8", { rough: 0.7 });
  const wood = mat("#b98756", { rough: 0.8 });
  const deckWood = mat("#e2c393", { rough: 0.75 });
  const mastWood = mat("#c9a06a", { rough: 0.75 });
  const red = mat("#d8413a");
  const yellow = mat("#f2c14e");

  // Peana ovalada con dos patitas
  const plank = cyl(0.1, 0.105, 0.02, wood, { y: 0.01, s: [1.5, 1, 0.6] }, 32);
  g.add(plank);
  [-0.08, 0.08].forEach((x) => g.add(cyl(0.012, 0.015, 0.08, mastWood, { x, y: 0.06 }, 12)));

  // Casco: media revolución del perfil, achatado en profundidad
  const profile = hullProfile();
  const hull = mesh(new THREE.LatheGeometry(profile, 36, 0, Math.PI), navy, { y: DECK, rz: -Math.PI / 2, s: [0.95, 1, 1] });
  g.add(hull);
  // Franja blanca (regala) y cubierta de madera clara
  g.add(slab(deckShape(profile, 1.02, 1.05), 0.012, white, { y: DECK - 0.012, rx: -Math.PI / 2 }));
  g.add(slab(deckShape(profile), 0.008, deckWood, { y: DECK, rx: -Math.PI / 2 }));

  // Mástil, botavara y remate
  g.add(cyl(0.005, 0.0065, 0.2, mastWood, { x: MAST_X, y: DECK + 0.1 }, 12));
  g.add(cyl(0.004, 0.004, 0.12, mastWood, { x: MAST_X - 0.058, y: DECK + 0.04, rz: Math.PI / 2 }, 10));
  g.add(blob(0.009, yellow, { x: MAST_X, y: DECK + 0.202 }));

  // Velas: la mayor a proa, la menor a popa sobre la botavara
  g.add(sail([MAST_X, DECK + 0.16], [0.155, DECK + 0.02], [MAST_X, DECK + 0.02], [0.02, 0.025], white));
  g.add(sail([MAST_X, DECK + 0.13], [MAST_X - 0.115, DECK + 0.045], [MAST_X, DECK + 0.045], [-0.015, 0.02], white));

  // Banderita roja
  const flag = new THREE.Shape();
  flag.moveTo(MAST_X, DECK + 0.195);
  flag.lineTo(MAST_X - 0.048, DECK + 0.182);
  flag.lineTo(MAST_X, DECK + 0.17);
  flag.closePath();
  g.add(slab(flag, 0.004, red, { z: -0.002 }));

  return fit(g, 0.3);
}
