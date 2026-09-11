// Catálogo de acciones que el escenario 3D sabe animar (ver stage.applyAct).
// Las páginas de cuentos-data.js las usan en `acts` (sostenidas mientras dura
// la página) y en `cues` (ráfaga al pronunciar una palabra). Los tests de CI
// comprueban que ningún cuento pida una acción que no esté aquí.
//
// Cada acción mueve el grupo entero y, si la figura los declara en userData,
// la cabeza (head), los brazos (arm), las alas (wing), la cola (tail), las
// orejas (ear) y las patas (leg). Una figura sin esas partes se mueve entera.
export const ACTS = {
  blow: "toma aire y sopla",
  howl: "aúlla con la cabeza en alto",
  shiver: "tiembla de miedo o de frío",
  run: "corre",
  walk: "camina despacio",
  build: "trabaja con los brazos",
  cheer: "salta de alegría con los brazos arriba",
  sleep: "se acurruca y duerme",
  look: "levanta la vista al cielo",
  listen: "escucha con la cabeza ladeada y las orejas atentas",
  think: "piensa con la cabeza inclinada",
  nod: "asiente con la cabeza",
  sing: "canta con la cabeza en alto",
  raise: "levanta los brazos al cielo",
  wave: "saluda con la mano",
  fly: "vuela batiendo las alas",
  jump: "da saltos grandes",
  swim: "nada moviendo la cola",
  sniff: "olfatea el suelo",
  peck: "picotea hacia adelante",
  dance: "baila al ritmo",
};

export const ACT_NAMES = new Set(Object.keys(ACTS));
