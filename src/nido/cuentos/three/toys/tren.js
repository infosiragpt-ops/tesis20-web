// Locomotora de juguete de madera: caldera azul, cabina roja y una nube de humo, avanzando hacia +x.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit } from "./_shared.js";

export const id = "tren";
export const label = "Tren";

export function build() {
  const g = new THREE.Group();
  const blue = mat("#3574d4");
  const navy = mat("#24457f");
  const red = mat("#d9463b");
  const black = mat("#2b2a30", { rough: 0.5 });
  const cream = mat("#f3e7cf");
  const yellow = mat("#f2c230");
  const wood = mat("#b98756", { rough: 0.8 });
  const glass = mat("#bfe4ff", { rough: 0.25 });
  const white = mat("#f8f8f5", { rough: 0.9 });
  const gold = mat("#e6b53c", { rough: 0.4 });

  // Chasis de madera
  g.add(box(0.36, 0.03, 0.1, wood, { y: 0.075 }));

  // Ruedas: grandes atrás, pequeñas delante, con centros claros
  const wheels = [
    { x: -0.1, r: 0.055 },
    { x: 0.1, r: 0.035 },
  ];
  [-1, 1].forEach((side) => {
    wheels.forEach(({ x, r }) => {
      g.add(cyl(r, r, 0.024, black, { x, y: r, z: side * 0.061, rx: Math.PI / 2 }, 28));
      g.add(cyl(r * 0.3, r * 0.3, 0.008, cream, { x, y: r, z: side * 0.076, rx: Math.PI / 2 }, 16));
    });
  });

  // Caldera azul horizontal con tapa frontal y faro
  g.add(cyl(0.055, 0.055, 0.22, blue, { x: 0.03, y: 0.14, rz: Math.PI / 2 }, 32));
  g.add(cyl(0.058, 0.058, 0.014, navy, { x: 0.14, y: 0.14, rz: Math.PI / 2 }, 32));
  g.add(cyl(0.018, 0.018, 0.012, mat("#ffd95a", { emissive: "#ffb300", emissiveIntensity: 0.35 }), { x: 0.151, y: 0.14, rz: Math.PI / 2 }, 16));
  // Cúpula y aro dorados
  g.add(blob(0.028, gold, { x: -0.01, y: 0.195 }));
  g.add(mesh(new THREE.TorusGeometry(0.055, 0.005, 10, 32), gold, { x: 0.05, y: 0.14, ry: Math.PI / 2 }));

  // Chimenea negra
  g.add(cyl(0.018, 0.018, 0.07, black, { x: 0.095, y: 0.22 }, 20));
  g.add(cyl(0.024, 0.02, 0.016, black, { x: 0.095, y: 0.262 }, 20));

  // Nube de humo
  g.add(blob(0.03, white, { x: 0.088, y: 0.294 }));
  g.add(blob(0.024, white, { x: 0.062, y: 0.308, z: 0.01 }));
  g.add(blob(0.022, white, { x: 0.114, y: 0.304, z: -0.009 }));
  g.add(blob(0.021, white, { x: 0.084, y: 0.326, z: 0.003 }));
  g.add(blob(0.016, white, { x: 0.052, y: 0.33, z: -0.007 }));

  // Cabina roja con techo azul y ventanas
  g.add(box(0.11, 0.16, 0.1, red, { x: -0.115, y: 0.16 }));
  g.add(box(0.13, 0.018, 0.12, navy, { x: -0.115, y: 0.249 }));
  [-1, 1].forEach((side) => {
    g.add(box(0.068, 0.068, 0.005, cream, { x: -0.115, y: 0.19, z: side * 0.05 }));
    g.add(box(0.056, 0.056, 0.008, glass, { x: -0.115, y: 0.19, z: side * 0.05 }));
  });
  g.add(box(0.005, 0.068, 0.058, cream, { x: -0.17, y: 0.19 }));
  g.add(box(0.008, 0.056, 0.046, glass, { x: -0.17, y: 0.19 }));

  // Parachoques amarillo delante y enganche detrás
  g.add(box(0.025, 0.036, 0.12, yellow, { x: 0.17, y: 0.075 }));
  [-1, 1].forEach((side) => {
    g.add(cyl(0.012, 0.012, 0.01, yellow, { x: 0.187, y: 0.075, z: side * 0.04, rz: Math.PI / 2 }, 16));
  });
  g.add(cyl(0.008, 0.008, 0.03, wood, { x: -0.19, y: 0.075, rz: Math.PI / 2 }, 12));
  g.add(blob(0.013, red, { x: -0.208, y: 0.075 }));

  return fit(g, 0.3);
}
