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

// Rango por edad: la ronda 1 cae despacio y con pocos señuelos; la ronda 20
// llega al nivel ya afinado de siempre (mismos valores que antes del
// escalado), igual que en Misión del Bosque y Memoria Mágica.
export const CATCH_AGE_PROFILES = Object.freeze({
  "2-3": {
    targets: [1, 2],
    startFallSpeed: 55,
    endFallSpeed: 70,
    startSpawnGapMs: 2400,
    endSpawnGapMs: 1900,
    startDecoyChance: 0.05,
    endDecoyChance: 0.15,
  },
  "4-5": {
    targets: [2, 3, 4],
    startFallSpeed: 75,
    endFallSpeed: 95,
    startSpawnGapMs: 1900,
    endSpawnGapMs: 1500,
    startDecoyChance: 0.15,
    endDecoyChance: 0.32,
  },
  6: {
    targets: [3, 4, 5, 6],
    startFallSpeed: 95,
    endFallSpeed: 125,
    startSpawnGapMs: 1500,
    endSpawnGapMs: 1150,
    startDecoyChance: 0.25,
    endDecoyChance: 0.45,
  },
});

export const CATCH_ROUNDS = 20;

/**
 * Dificultad efectiva de una ronda: interpola entre el arranque suave y el
 * techo ya afinado de la edad según el avance dentro de las 20 rondas.
 *
 * @param {keyof typeof CATCH_AGE_PROFILES} ageId
 * @param {number} roundIndex 0..CATCH_ROUNDS-1
 */
export function catchDifficultyForRound(ageId, roundIndex) {
  const profile = CATCH_AGE_PROFILES[ageId] ?? CATCH_AGE_PROFILES["2-3"];
  const progress = Math.min(1, Math.max(0, roundIndex / (CATCH_ROUNDS - 1)));
  const fallSpeed = Math.round(
    profile.startFallSpeed + progress * (profile.endFallSpeed - profile.startFallSpeed),
  );
  const spawnGapMs = Math.round(
    profile.startSpawnGapMs -
      progress * (profile.startSpawnGapMs - profile.endSpawnGapMs),
  );
  const decoyChance = Number(
    (
      profile.startDecoyChance +
      progress * (profile.endDecoyChance - profile.startDecoyChance)
    ).toFixed(3),
  );
  return { fallSpeed, spawnGapMs, decoyChance };
}

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
  const { fallSpeed, spawnGapMs, decoyChance } = catchDifficultyForRound(ageId, roundIndex);
  const random = mulberry(hashText(`atrapa|${themeId}|${ageId}|${roundIndex}`));
  const target = theme.target[Math.floor(random() * theme.target.length)];
  const count = profile.targets[Math.floor(random() * profile.targets.length)];

  return {
    target,
    count,
    fallSpeed,
    spawnGapMs,
    decoyChance,
    instructionText: `Atrapa ${count} ${target}`,
    spokenText: `¡Prepárate! Atrapa ${NUMBER_WORDS[count]} ${count === 1 ? "vez" : "veces"} lo que caiga igual a este dibujo. ¡Vamos!`,
  };
}
