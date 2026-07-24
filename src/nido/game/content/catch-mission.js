// Contenido de "Atrapa y Cuenta": objetos caen, el niño mueve una cesta
// para atrapar la cantidad correcta de un sticker objetivo y evitar los
// señuelos. Enumerable y determinista, mismo patrón que Bosque/Memoria.

export const CATCH_THEMES = Object.freeze([
  {
    id: "granja",
    name: "Atrapa en la Granja",
    tagline: "Atrapa los animalitos correctos.",
    accent: "#ffc94d",
    accentSoft: "#fff3c9",
    target: ["Cow", "Horse", "Dog", "Cat", "Rabbit"],
    decoy: ["Bird", "Butterfly", "Bug", "FishSimple", "PawPrint"],
  },
  {
    id: "huerto",
    name: "Atrapa en el Huerto",
    tagline: "Atrapa las frutas y verduras.",
    accent: "#46b982",
    accentSoft: "#e2f6ec",
    target: ["Carrot", "Bread", "BowlFood", "Flower", "Plant"],
    decoy: ["Cloud", "Sun", "Moon", "Drop", "Fire"],
  },
  {
    id: "cielo",
    name: "Atrapa en el Cielo",
    tagline: "Atrapa lo que ves en el cielo.",
    accent: "#4b8ff7",
    accentSoft: "#e3f1ff",
    target: ["Sun", "Cloud", "Moon", "Snowflake", "Drop"],
    decoy: ["Car", "House", "Chair", "Bed", "Boat"],
  },
  {
    id: "juguetes",
    name: "Atrapa Juguetes",
    tagline: "Atrapa los juguetes correctos.",
    accent: "#9873e7",
    accentSoft: "#efe7ff",
    target: ["Balloon", "Basketball", "GameController", "Star", "Cube"],
    decoy: ["Pencil", "BookOpen", "Backpack", "Palette", "Clock"],
  },
  {
    id: "formas",
    name: "Atrapa Formas",
    tagline: "Atrapa la figura correcta.",
    accent: "#ff6f61",
    accentSoft: "#ffe3df",
    target: ["Circle", "Square", "Triangle", "Pentagon", "Hexagon"],
    decoy: ["Smiley", "SmileyMeh", "SmileyWink", "MaskHappy", "Rectangle"],
  },
]);

export const CATCH_AGE_PROFILES = Object.freeze({
  "2-3": { targets: [1, 2], fallSpeed: 70, spawnGapMs: 1900, decoyChance: 0.15 },
  "4-5": { targets: [2, 3, 4], fallSpeed: 95, spawnGapMs: 1500, decoyChance: 0.32 },
  6: { targets: [3, 4, 5, 6], fallSpeed: 125, spawnGapMs: 1150, decoyChance: 0.45 },
});

export const CATCH_ROUNDS = 20;

const NUMBER_WORDS = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis"];

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * @returns {{ target: string, targetLabel: string, count: number,
 *   fallSpeed: number, spawnGapMs: number, decoyChance: number,
 *   instructionText: string, spokenText: string }}
 */
export function createCatchRound({ themeId, ageId, roundIndex }) {
  const theme = CATCH_THEMES.find((item) => item.id === themeId) ?? CATCH_THEMES[0];
  const profile = CATCH_AGE_PROFILES[ageId] ?? CATCH_AGE_PROFILES["2-3"];
  const random = mulberry(hashText(`atrapa|${themeId}|${ageId}|${roundIndex}`));
  const target = theme.target[Math.floor(random() * theme.target.length)];
  const count = profile.targets[Math.floor(random() * profile.targets.length)];

  return {
    target,
    count,
    fallSpeed: profile.fallSpeed,
    spawnGapMs: profile.spawnGapMs,
    decoyChance: profile.decoyChance,
    instructionText: `Atrapa ${count} ${target}`,
    spokenText: `¡Prepárate! Atrapa ${NUMBER_WORDS[count]} ${count === 1 ? "vez" : "veces"} lo que caiga igual a este dibujo. ¡Vamos!`,
  };
}
