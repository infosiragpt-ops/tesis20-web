// Estrella dorada y gordita con carita simpática, de pie sobre una peana azul noche.
import * as THREE from "three";
import { mat, mesh, blob, cyl, eyes, fit } from "./_shared.js";

export const id = "estrella";
export const label = "Estrella";

/** Suelda vértices coincidentes y recalcula normales para un sombreado redondeado. */
function smooth(geo, tol = 1e-5) {
  const pos = geo.attributes.position;
  const seen = new Map();
  const verts = [];
  const index = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const key = `${Math.round(x / tol)}|${Math.round(y / tol)}|${Math.round(z / tol)}`;
    let j = seen.get(key);
    if (j === undefined) {
      j = verts.length / 3;
      seen.set(key, j);
      verts.push(x, y, z);
    }
    index.push(j);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  out.setIndex(index);
  out.computeVertexNormals();
  return out;
}

export function build() {
  const g = new THREE.Group();
  const gold = mat("#f7c531", { rough: 0.5, emissive: "#c98a0e", emissiveIntensity: 0.22 });
  const night = mat("#243b6b", { rough: 0.7 });
  const nightLight = mat("#3a58a0", { rough: 0.7 });
  const dark = mat("#2a2230", { rough: 0.35 });
  const pink = mat("#f08a8a", { rough: 0.7 });
  const white = mat("#fff6d6", { rough: 0.4, emissive: "#ffe9a0", emissiveIntensity: 0.4 });

  // Peana azul noche con aro claro y puntitos de cielo
  const baseR = 0.105;
  g.add(cyl(baseR, baseR * 1.06, 0.03, night, { y: 0.015 }, 32));
  g.add(mesh(new THREE.TorusGeometry(baseR - 0.006, 0.004, 8, 40), nightLight, { y: 0.03, rx: Math.PI / 2 }));
  [[0.065, 0.055], [-0.075, 0.025], [0.025, -0.08], [-0.05, -0.065]].forEach(([x, z]) => {
    g.add(blob(0.006, white, { x, y: 0.03, z }));
  });

  // Cuerpo: estrella de cinco puntas extruida con bisel redondeado
  const R = 0.115;
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? R : R * 0.52;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const depth = 0.04;
  const bevel = 0.024;
  const geo = smooth(
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 4,
    }),
  );
  geo.translate(0, 0, -depth / 2);
  geo.computeBoundingBox();
  const starY = 0.03 - geo.boundingBox.min.y - 0.008;
  g.add(mesh(geo, gold, { y: starY }));

  // Carita: ojos, mejillas y sonrisa en la cara frontal
  const front = depth / 2 + bevel;
  eyes(g, { x: 0.028, y: starY + 0.012, z: front + 0.002, r: 0.013 });
  [-1, 1].forEach((side) => {
    const cheek = blob(0.011, pink, { x: side * 0.046, y: starY - 0.006, z: front - 0.001 });
    cheek.scale.set(1, 0.8, 0.4);
    g.add(cheek);
  });
  g.add(mesh(new THREE.TorusGeometry(0.022, 0.0045, 8, 18, Math.PI), dark, { y: starY - 0.013, z: front + 0.002, rz: Math.PI }));

  return fit(g, 0.3);
}
