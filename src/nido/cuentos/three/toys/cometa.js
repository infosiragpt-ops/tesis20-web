// Cometa de papel roja con varillas cruzadas y lazo, de pie sobre su palito y una peana de madera.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit, base } from "./_shared.js";

export const id = "cometa";
export const label = "Cometa";

export function build() {
  const g = new THREE.Group();
  const red = mat("#e2463a", { rough: 0.55 });
  const wood = mat("#cfa66e", { rough: 0.75 });
  const pale = mat("#efd9ac", { rough: 0.7 });
  const yellow = mat("#f7c843", { rough: 0.5 });
  const blue = mat("#3f7fe0", { rough: 0.5 });

  // Peana y palito
  g.add(base(0.09));
  g.add(cyl(0.0075, 0.0075, 0.265, wood, { y: 0.1525, z: -0.016 }, 12));

  // Grupo de la cometa, con origen en el cruce de varillas, algo inclinada hacia atrás
  const kite = new THREE.Group();
  kite.position.set(0, 0.28, 0);
  kite.rotation.x = -0.18;
  g.add(kite);

  // Papel: rombo extruido, placa fina de madera pintada
  const top = 0.09;
  const bottom = -0.15;
  const half = 0.11;
  const shape = new THREE.Shape();
  shape.moveTo(0, top);
  shape.lineTo(half, 0);
  shape.lineTo(0, bottom);
  shape.lineTo(-half, 0);
  shape.closePath();
  const paperGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
  paperGeo.translate(0, 0, -0.006);
  kite.add(mesh(paperGeo, red));

  // Taco trasero que une el palito con el papel
  kite.add(box(0.026, 0.026, 0.022, wood, { z: -0.012 }));

  // Varillas cruzadas sobre el frente, con remates redondos
  const zSpar = 0.01;
  kite.add(cyl(0.0055, 0.0055, top - bottom + 0.02, pale, { y: (top + bottom) / 2, z: zSpar }, 10));
  kite.add(cyl(0.0055, 0.0055, half * 2 + 0.02, pale, { z: zSpar, rz: Math.PI / 2 }, 10));
  kite.add(blob(0.009, wood, { z: zSpar }));
  [[0, top + 0.01], [half + 0.01, 0], [0, bottom - 0.01], [-half - 0.01, 0]].forEach(([x, y]) => {
    kite.add(blob(0.0075, wood, { x, y, z: zSpar }));
  });

  // Lazo de cinta amarillo y azul en la punta inferior
  const bowY = bottom - 0.02;
  [-1, 1].forEach((side) => {
    const loop = blob(0.017, yellow, { x: side * 0.027, y: bowY + 0.003, z: 0.008, rz: side * 0.45 });
    loop.scale.set(1.3, 0.7, 0.55);
    kite.add(loop);
    kite.add(box(0.011, 0.05, 0.004, blue, { x: side * 0.012, y: bowY - 0.03, z: 0.007, rz: side * 0.28 }));
  });
  kite.add(blob(0.011, blue, { y: bowY, z: 0.011 }));

  return fit(g, 0.3);
}
