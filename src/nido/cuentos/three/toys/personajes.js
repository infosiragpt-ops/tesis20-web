// Personajes humanos de los cuentos originales (Sami, Tico, Ana y el
// maquinista) como figuras de cuento articuladas: cabeza (userData.head) con
// ojos grandes, cejas, mejillas y sonrisa; brazos (arm) y piernas (leg) en
// grupos con pivote en hombro y cadera para correr, saludar o levantar los
// brazos según la narración.
import * as THREE from "three";
import { mat, blob, cyl, cone, box, fit, eyeball, brow, smile, cheek } from "./_shared.js";

function child({ coat, trousers, girl = false, chullo = false, sailor = false, skinTone = "#bc8257" }) {
  const g = new THREE.Group();
  const skin = mat(skinTone, { rough: 0.62, surface: "skin" });
  const hair = mat("#352522", { rough: 0.66 , surface: "fur" });
  const fabric = mat(coat, { rough: 0.84, surface: "cloth" });
  const pants = mat(trousers, { rough: 0.8, surface: "cloth" });
  const gold = mat("#f1cc70", { rough: 0.5 });
  const boots = mat("#413435", { rough: 0.55 });

  /* ----------------------- piernas articuladas ------------------------ */
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.023, 0.1, 0);
    leg.userData.leg = side;
    leg.add(cyl(0.017, 0.018, 0.081, pants, { y: -0.044 }));
    const foot = blob(0.021, boots, { y: -0.084, z: 0.014 });
    foot.scale.set(0.9, 0.65, 1.35);
    leg.add(foot);
    g.add(leg);
  });

  /* ------------------------------ torso ------------------------------- */
  g.add(girl ? cone(0.054, 0.104, fabric, { y: 0.133 }) : cyl(0.035, 0.043, 0.096, fabric, { y: 0.133 }));
  for (let n = 0; n < 3; n += 1) g.add(blob(0.0035, gold, { y: 0.157 - n * 0.018, z: 0.04 }));
  if (girl) g.add(box(0.07, 0.012, 0.03, mat("#f6e7c8", { rough: 0.8 }), { y: 0.17, z: 0.03 }));
  g.add(cyl(0.014, 0.016, 0.026, skin, { y: 0.193 }));

  /* ------------------------ cabeza articulada ------------------------- */
  const headG = new THREE.Group();
  headG.position.set(0, 0.2, 0.002);
  headG.userData.head = 1;
  const head = blob(0.052, skin, { y: 0.047 });
  head.scale.set(0.94, 1.05, 0.93);
  headG.add(head);
  const cap = blob(0.053, hair, { y: 0.062, z: -0.015 });
  cap.scale.set(1, 0.77, 0.85);
  headG.add(cap);
  for (let i = 0; i < 5; i += 1) headG.add(blob(0.019, hair, { x: (i - 2) * 0.017, y: 0.076 + Math.sin(i) * 0.004, z: 0.016 }));
  headG.add(blob(0.009, skin, { y: 0.04, z: 0.05 }));
  smile(headG, { y: 0.028, z: 0.046, r: 0.011, thick: 0.0018, color: "#6b3a30" });
  [-1, 1].forEach((side) => {
    headG.add(blob(0.012, skin, { x: side * 0.048, y: 0.041 }));
    eyeball(headG, { x: side * 0.021, y: 0.052, z: 0.043, r: 0.013, iris: "#2b1a12", squash: 0.6 });
    brow(headG, { x: side * 0.021, y: 0.071, z: 0.046, r: 0.009, thick: 0.0018, color: "#352522", tilt: 0.15, side });
    cheek(headG, { x: side * 0.033, y: 0.034, z: 0.036, r: 0.009, color: "#d98c70" });
    if (girl) {
      for (let n = 0; n < 4; n += 1) headG.add(blob(0.016 - n * 0.0015, hair, { x: side * (0.045 + n * 0.002), y: 0.027 - n * 0.02, z: -0.008 }));
      headG.add(blob(0.013, gold, { x: side * 0.049, y: -0.049, z: 0.004 }));
    }
  });
  if (chullo) {
    // Chullo de lana: gorro rojo con orejeras, franja dorada y pompón
    const wool = mat("#c54846", { rough: 0.85 });
    headG.add(cyl(0.044, 0.057, 0.039, wool, { y: 0.104 }));
    headG.add(cyl(0.06, 0.06, 0.012, gold, { y: 0.085 }));
    headG.add(cyl(0.061, 0.061, 0.004, mat("#2f5f8f", { rough: 0.85 }), { y: 0.079 }));
    headG.add(blob(0.016, gold, { y: 0.133 }));
    [-1, 1].forEach((side) => {
      const flap = blob(0.014, wool, { x: side * 0.052, y: 0.05, z: 0.002 });
      flap.scale.set(1, 1.7, 0.6);
      headG.add(flap);
      headG.add(blob(0.007, gold, { x: side * 0.054, y: 0.024, z: 0.004 }));
    });
  }
  if (sailor) {
    // Gorra de maquinista: copa azul, franja dorada, visera y placa
    const navy = mat("#314868", { rough: 0.8 });
    headG.add(cyl(0.05, 0.05, 0.032, navy, { y: 0.106 }));
    headG.add(cyl(0.056, 0.056, 0.012, navy, { y: 0.089 }));
    headG.add(cyl(0.052, 0.052, 0.006, gold, { y: 0.082 }));
    headG.add(box(0.058, 0.005, 0.03, mat("#1e2a3f", { rough: 0.5 }), { y: 0.081, z: 0.05 }));
    headG.add(blob(0.007, gold, { y: 0.1, z: 0.05 }));
  }
  g.add(headG);

  /* ------------------------ brazos articulados ------------------------ */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.043, 0.17, 0);
    arm.rotation.z = side * 0.19;
    arm.userData.sway = side;
    arm.userData.arm = side;
    arm.add(cyl(0.014, 0.012, 0.058, fabric, { y: -0.017 }));
    arm.add(blob(0.014, skin, { y: -0.052 }));
    g.add(arm);
  });

  return fit(g, 0.32);
}

export const nina = { id: "nina", label: "Sami", build: () => child({ coat: "#c75642", trousers: "#486588", girl: true }) };
export const nino = { id: "nino", label: "Tico", build: () => child({ coat: "#e7b443", trousers: "#344e6f", chullo: true }) };
export const nina2 = { id: "nina2", label: "Ana", build: () => child({ coat: "#f3e5c7", trousers: "#427b83", girl: true, skinTone: "#c98a5e" }) };
export const maquinista = { id: "maquinista", label: "Maquinista", build: () => child({ coat: "#45658b", trousers: "#344458", sailor: true, skinTone: "#a8734d" }) };
