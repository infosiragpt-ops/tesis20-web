// Frasco de vidrio con tapón de corcho y cordón; dentro flota una estrellita luminosa.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "frasco";
export const label = "Frasco de luz";

// Orden de dibujo de los transparentes: pared trasera < interior < pared frontal,
// para que la estrella y el halo se vean nítidos a través del vidrio.
const ORDER_BACK = 1;
const ORDER_INNER = 2;
const ORDER_FRONT = 3;

function jarGeometry() {
  const pts = [
    [0, 0.012], [0.04, 0.008], [0.062, 0], [0.08, 0.006], [0.09, 0.025], [0.092, 0.06], [0.092, 0.17],
    [0.088, 0.2], [0.076, 0.225], [0.062, 0.24], [0.056, 0.255], [0.056, 0.28], [0.06, 0.29],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 40);
}

function starShape(outer, inner) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/** Material de vidrio: no escribe profundidad para no tapar lo que hay detrás. */
function glassMat(color, opacity, rough = 0.08) {
  const m = mat(color, { rough, opacity });
  m.depthWrite = false;
  return m;
}

/** Halo de luz: suma color en vez de mezclarlo (no ensucia el interior). */
function haloMat(opacity) {
  const m = mat("#553300", { rough: 1, emissive: "#ffcc55", emissiveIntensity: 2.5, opacity });
  m.blending = THREE.AdditiveBlending;
  m.depthWrite = false;
  m.side = THREE.BackSide; // solo el hemisferio trasero: brilla detrás de la estrella, no encima
  return m;
}

export function build() {
  const g = new THREE.Group();
  const glassBack = glassMat("#eef9ff", 0.12);
  glassBack.side = THREE.BackSide;
  const glassFront = glassMat("#eef9ff", 0.26);
  const glassThick = glassMat("#e8f7fb", 0.5, 0.3);
  const shine = glassMat("#ffffff", 0.55, 0.2);
  const cork = mat("#c69a62", { rough: 0.95 });
  const corkDark = mat("#a8804d", { rough: 0.95 });
  const cord = mat("#e8d5ae", { rough: 0.85 });
  // La estrella se dibuja sin tone mapping: con ACES cualquier emisivo intenso se comprime a
  // crema/blanco, y así el amarillo llega saturado a la pantalla (el halo aporta el "resplandor").
  const gold = mat("#ffd54a", { rough: 0.4, emissive: "#ffaa00", emissiveIntensity: 1 });
  gold.toneMapped = false;
  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; return m; };
  const ordered = (m, order) => { m.renderOrder = order; return m; };

  // Vidrio (cara interior y exterior para verlo de verdad transparente).
  // No proyecta sombra: la sombra dura se veía a través del vidrio como una mancha.
  const geo = jarGeometry();
  g.add(ordered(noShadow(mesh(geo, glassBack)), ORDER_BACK));
  g.add(ordered(noShadow(mesh(geo, glassFront)), ORDER_FRONT));
  // Fondo grueso de vidrio (fino y claro: base, no líquido). Tampoco proyecta sombra:
  // cualquier sombra en el suelo se vería a través del vidrio como una mancha.
  g.add(ordered(noShadow(cyl(0.086, 0.078, 0.013, glassThick, { y: 0.0105 }, 40)), ORDER_INNER));
  // Brillos de vidrio al frente
  g.add(ordered(noShadow(mesh(new THREE.CapsuleGeometry(0.005, 0.08, 4, 10), shine, { x: -0.032, y: 0.13, z: 0.089 })), ORDER_FRONT));
  g.add(ordered(noShadow(mesh(new THREE.CapsuleGeometry(0.005, 0.018, 4, 10), shine, { x: -0.032, y: 0.062, z: 0.089 })), ORDER_FRONT));
  // Labio del cuello
  g.add(ordered(noShadow(mesh(new THREE.TorusGeometry(0.058, 0.008, 12, 40), glassFront, { y: 0.292, rx: Math.PI / 2 })), ORDER_FRONT));

  // Tapón de corcho (sin proyectar sombra: caería dentro del frasco y se vería como una mancha)
  const noCast = (m) => { m.castShadow = false; return m; };
  g.add(noCast(cyl(0.062, 0.054, 0.06, cork, { y: 0.31 }, 28)));
  const dome = noCast(blob(0.062, cork, { y: 0.338 }));
  dome.scale.set(1, 0.3, 1);
  g.add(dome);
  g.add(noCast(mesh(new THREE.TorusGeometry(0.048, 0.0035, 8, 32), corkDark, { y: 0.3495, rx: Math.PI / 2 })));

  // Cordón atado al cuello, con nudo y dos cabos colgando al frente que abren hacia fuera.
  // Cada cabo termina en una cuenta colocada exactamente en la punta de la cápsula.
  g.add(noCast(mesh(new THREE.TorusGeometry(0.062, 0.007, 10, 40), cord, { y: 0.264, rx: Math.PI / 2 })));
  g.add(noCast(blob(0.012, cord, { y: 0.262, z: 0.066 })));
  const cordEnd = (len, opts) => {
    const cap = mesh(new THREE.CapsuleGeometry(0.006, len, 4, 10), cord, opts);
    cap.updateMatrix();
    const tip = new THREE.Vector3(0, -len / 2, 0).applyMatrix4(cap.matrix);
    g.add(noCast(cap));
    g.add(noCast(blob(0.009, cord, { x: tip.x, y: tip.y, z: tip.z })));
  };
  cordEnd(0.05, { x: -0.016, y: 0.232, z: 0.078, rz: -0.22, rx: -0.42 });
  cordEnd(0.04, { x: 0.016, y: 0.238, z: 0.077, rz: 0.28, rx: -0.4 });

  // Estrellita luminosa flotando dentro
  const star = mesh(
    new THREE.ExtrudeGeometry(starShape(0.034, 0.015), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }),
    gold,
    { y: 0.12, z: -0.006, rz: 0.2 },
  );
  g.add(noShadow(star));
  // Halo cálido en cinco capas aditivas concéntricas (gradiente suave alrededor de la estrella)
  [[0.03, 0.13], [0.042, 0.09], [0.054, 0.06], [0.066, 0.04], [0.078, 0.025]].forEach(([r, opacity]) => {
    g.add(ordered(noShadow(blob(r, haloMat(opacity), { y: 0.12 })), ORDER_INNER));
  });
  // Puntitos de luz flotando
  [
    [0.045, 0.07, 0.03], [-0.05, 0.165, 0.02], [0.03, 0.185, -0.04], [-0.04, 0.05, -0.03], [0.055, 0.14, -0.02],
  ].forEach(([x, y, z]) => g.add(noShadow(blob(0.006, gold, { x, y, z }))));

  return fit(g, 0.3);
}
