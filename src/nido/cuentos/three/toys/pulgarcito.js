import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit } from "./_shared.js";

export const id = "pulgarcito";
export const label = "Pulgarcito";

// Geometría original: sombrero verde, pluma roja, lino, pañuelo y botas.
function person({ adult = false, mother = false } = {}) {
  const g = new THREE.Group();
  const skin = mat("#f0c29e"), hair = mat("#694329"), cream = mat("#f7e8c8", { rough: .9 });
  const green = mat(mother ? "#879b65" : "#5f713b", { rough: .84 });
  const brown = mat("#79502f", { rough: .7 }), scarf = mat("#ab4e35", { rough: .86 });
  const gold = mat("#deb96c", { rough: .4, metal: .25 });
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .026, .111, 0); leg.userData.leg = side;
    leg.add(cyl(.021, .025, .082, green, { y: -.041 }));
    leg.add(blob(.026, brown, { y: -.087, z: .018, s: [1, .72, 1.55] }));
    leg.add(cyl(.026, .028, .035, brown, { y: -.059 }));
    g.add(leg);
  }
  g.add(cyl(.039, .052, .103, cream, { y: .152 }));
  if (mother) {
    g.add(cyl(.035, .073, .135, green, { y: .108 }));
    g.add(blob(.041, cream, { y: .119, z: .044, s: [1.05, 1.45, .16] }));
  }
  g.add(cyl(.052, .052, .012, brown, { y: .119 }));
  g.add(mesh(new THREE.TorusGeometry(.009, .0025, 6, 12), gold, { y: .12, z: .053 }));
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * .049, .187, 0);
    arm.rotation.z = side * .22; arm.userData.arm = side;
    arm.add(cyl(.018, .017, .064, cream, { y: -.024 }));
    arm.add(cyl(.02, .02, .014, cream, { y: -.054 }));
    arm.add(blob(.018, skin, { y: -.074, z: .008 })); g.add(arm);
  }
  const head = new THREE.Group(); head.position.set(0, .262, .004); head.userData.head = true;
  head.add(blob(.061, skin, { s: [1, 1.03, .9] }));
  head.add(blob(.064, hair, { y: .019, z: -.014, s: [1, .82, .86] }));
  for (let i = 0; i < 7; i++) head.add(blob(.017, hair, { x: (i - 3) * .015, y: .039 - Math.abs(i - 2) * .003, z: .032, s: [.9, 1.3, .7], rz: -.35 }));
  const white = mat("#fffaf0", { rough: .18 }), iris = mat("#493021", { rough: .22 });
  for (const side of [-1, 1]) {
    head.add(blob(.012, skin, { x: side * .058, y: -.004 }));
    const eye = new THREE.Group(); eye.position.set(side * .025, .008, .047); eye.userData.eye = true;
    eye.add(blob(.015, white, { s: [.88, 1.2, .5] }));
    eye.add(blob(.01, iris, { x: -side * .002, y: .001, z: .009, s: [.92, 1.2, .6] }));
    eye.add(blob(.0035, white, { x: -side * .002 + .003, y: .006, z: .015 }));
    head.add(eye);
    head.add(blob(.011, mat("#e79e87"), { x: side * .038, y: -.016, z: .044, s: [1.1, .65, .2] }));
  }
  head.add(blob(.009, skin, { y: -.011, z: .061 }));
  head.add(mesh(new THREE.TorusGeometry(.014, .0017, 6, 18, Math.PI), brown, { y: -.021, z: .054, rz: Math.PI }));
  if (!mother) {
    head.add(cyl(.078, .083, .008, green, { y: .043, rz: -.12 }, 40));
    head.add(cone(.062, .081, green, { x: .009, y: .084, rz: -.23 }, 40));
    head.add(blob(.029, green, { x: .036, y: .105, s: [1.2, .38, .65] }));
    if (!adult) {
      const feather = new THREE.Shape(); feather.moveTo(0, 0); feather.quadraticCurveTo(-.044, .039, -.038, .072);
      feather.quadraticCurveTo(.004, .063, .008, .008); feather.closePath();
      head.add(mesh(new THREE.ExtrudeGeometry(feather, { depth: .002, bevelEnabled: true, bevelSize: .001, bevelThickness: .001, bevelSegments: 2, steps: 1 }), scarf, { x: -.043, y: .049, z: .011, rz: .18 }));
    }
  } else head.add(blob(.034, hair, { y: .035, z: -.051 }));
  if (adult) head.scale.setScalar(.86);
  g.add(head);
  g.add(mesh(new THREE.TorusGeometry(.035, .009, 10, 32), scarf, { y: .202, rx: Math.PI / 2 }));
  g.add(blob(.014, scarf, { y: .197, z: .042 }));
  g.add(cone(.016, .07, scarf, { x: -.016, y: .165, z: .052, rz: -.35 }));
  if (!adult) {
    g.add(cyl(.005, .005, .12, brown, { x: .007, y: .161, z: .05, rz: -.58 }));
    g.add(blob(.035, brown, { x: .057, y: .121, s: [.6, 1, .55] }));
    g.add(blob(.029, mat("#ad8250"), { x: .063, y: .132, z: .018, s: [.65, .65, .22] }));
  }
  return fit(g, .3);
}

export function build() { return person(); }
export const father = { id: "papa-pulgarcito", label: "Papá de Pulgarcito", build: () => person({ adult: true }) };
export const mother = { id: "mama-pulgarcito", label: "Mamá de Pulgarcito", build: () => person({ adult: true, mother: true }) };
