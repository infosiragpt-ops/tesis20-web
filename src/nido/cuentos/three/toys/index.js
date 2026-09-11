// Registro de figuras 3D. Un souvenir sin figura propia se representa como
// una medalla de madera con su emblema dibujado encima.

import * as THREE from "three";
import { mat, mesh, cyl, fit } from "./_shared.js";
import * as abuelita from "./abuelita.js";
import * as arbol from "./arbol.js";
import * as ballena from "./ballena.js";
import * as barco from "./barco.js";
import * as bufeo from "./bufeo.js";
import * as buho from "./buho.js";
import * as cactus from "./cactus.js";
import * as campana from "./campana.js";
import * as canasta from "./canasta.js";
import * as caperucita from "./caperucita.js";
import * as caracola from "./caracola.js";
import * as casa from "./casa.js";
import * as cazador from "./cazador.js";
import * as cerdito from "./cerdito.js";
import * as cohete from "./cohete.js";
import * as cometa from "./cometa.js";
import * as escalera from "./escalera.js";
import * as estrella from "./estrella.js";
import * as farol from "./farol.js";
import * as frasco from "./frasco.js";
import * as gorro from "./gorro.js";
import * as lobo from "./lobo.js";
import * as luna from "./luna.js";
import * as manzana from "./manzana.js";
import * as olla from "./olla.js";
import * as oso from "./oso.js";
import * as oveja from "./oveja.js";
import * as pajarito from "./pajarito.js";
import * as pez from "./pez.js";
import * as picaflor from "./picaflor.js";
import * as quena from "./quena.js";
import * as ramo from "./ramo.js";
import * as rana from "./rana.js";
import * as tambor from "./tambor.js";
import * as tren from "./tren.js";
import * as vicuna from "./vicuna.js";
import * as zorro from "./zorro.js";
import * as mariposa from "./mariposa.js";
import * as pelicano from "./pelicano.js";
import * as carpintero from "./carpintero.js";
import { nina, nino, nina2, maquinista } from "./personajes.js";

const pipo = { id: "pipo", label: "Pipo", build: () => cerdito.build({ hat: true, item: "paja" }) };
const lolo = { id: "lolo", label: "Lolo", build: () => cerdito.build({ shirt: "#4fa85f", item: "madera" }) };
const tito = { id: "tito", label: "Tito", build: () => cerdito.build({ plaid: true, item: "badilejo" }) };
// El lobo metido en la cama de la abuelita lleva su gorro de dormir.
const loboCama = { id: "lobo-cama", label: "Lobo disfrazado", build: () => lobo.build({ bonnet: true }) };
const REGISTRY = { abuelita, arbol, ballena, barco, bufeo, buho, cactus, campana, canasta, caperucita, caracola, casa, cazador, cerdito, cohete, cometa, escalera, estrella, farol, frasco, gorro, lobo, luna, manzana, olla, oso, oveja, pajarito, pez, picaflor, quena, ramo, rana, tambor, tren, vicuna, zorro, mariposa, pelicano, carpintero, nina, nino, nina2, maquinista, pipo, lolo, tito, "lobo-cama": loboCama };

// Tamaño relativo en el diorama: las criaturas pequeñas se ven pequeñas
// junto a los personajes grandes (1 = altura estándar de figura).
export const TOY_SCALE = { mariposa: 0.5, picaflor: 0.75, carpintero: 0.75, pajarito: 0.55, rana: 0.85, pez: 0.85 };

export function registerToys(modules) {
  modules.forEach((module) => {
    if (module?.id && typeof module.build === "function") REGISTRY[module.id] = module;
  });
}

export function hasToy(id) {
  return Boolean(REGISTRY[id]);
}

export function toyLabel(id) {
  return REGISTRY[id]?.label || "Figura mágica";
}

// Qué figura representa cada souvenir de los cuentos.
export const PIN_TOY = {
  caperuza: "caperucita",
  canasta: "canasta",
  pajarito: "pajarito",
  ramo: "ramo",
  gorro: "gorro",
  manzana: "manzana",
  casita: "casa",
  lobo: "lobo",
  escalera: "escalera",
  olla: "olla",
  buho: "buho",
  luna: "luna",
  farol: "farol",
  estrella: "estrella",
  nenufar: "rana",
  canoa: "barco",
  pez: "pez",
  luciernaga: "frasco",
  bufeo: "bufeo",
  cometa: "cometa",
  oveja: "oveja",
  campana: "campana",
  cactus: "cactus",
  colibri: "picaflor",
  zorro: "zorro",
  tren: "tren",
  vicuna: "vicuna",
  picaflor: "picaflor",
  caracola: "caracola",
  ballena: "ballena",
  hoja: "arbol",
  tambor: "tambor",
  quena: "quena",
};

/** Medalla de madera con el emblema del souvenir como textura. */
export function badgeToy(texture, accent = "#d9a95a") {
  const g = new THREE.Group();
  const wood = mat("#b98756", { rough: 0.8 });
  const face = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 });
  const rim = mat(accent, { rough: 0.45, metal: 0.1 });
  g.add(cyl(0.1, 0.1, 0.03, wood, { y: 0.015 }));
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.028, 40), [rim, face, face]);
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, 0.155, 0);
  coin.castShadow = true;
  coin.receiveShadow = true;
  g.add(coin);
  g.add(mesh(new THREE.TorusGeometry(0.122, 0.012, 12, 40), rim, { y: 0.155 }));
  return fit(g, 0.29);
}

export function buildToy(id, { emblemTexture } = {}) {
  const module = REGISTRY[id];
  if (module) return module.build();
  return badgeToy(emblemTexture || null);
}

/** Versión "fantasma" (souvenir todavía no encontrado): gris y translúcida. */
export function ghostify(group) {
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    const ghost = materials.map(() =>
      new THREE.MeshStandardMaterial({ color: "#d9d2c3", roughness: 0.95, transparent: true, opacity: 0.62 }),
    );
    obj.material = Array.isArray(obj.material) ? ghost : ghost[0];
    obj.castShadow = false;
  });
  return group;
}
