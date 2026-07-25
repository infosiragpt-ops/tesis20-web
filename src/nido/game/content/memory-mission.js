// Contenido de "Memoria Mágica": mazos temáticos de parejas usando el
// catálogo de stickers ya ilustrado (sin arte nuevo). Cada tema es un
// "juego" distinto en el hub aunque comparta motor con los demás.

export const MEMORY_THEMES = Object.freeze([
  {
    id: "bosque",
    name: "Memoria del Bosque",
    tagline: "Encuentra las parejas de animalitos.",
    accent: "#46b982",
    accentSoft: "#e2f6ec",
    stickers: ["Dog", "Cat", "Bird", "Rabbit", "Cow", "Horse", "FishSimple", "Butterfly", "Bug", "PawPrint"],
  },
  {
    id: "cocina",
    name: "Memoria de la Cocina",
    tagline: "Empareja frutas y meriendas ricas.",
    accent: "#ff6f61",
    accentSoft: "#ffe3df",
    stickers: ["Carrot", "Bread", "BowlFood", "Coffee", "ForkKnife", "Flower", "Sun", "Cloud", "Drop", "Fire"],
  },
  {
    id: "casa",
    name: "Memoria de la Casa",
    tagline: "Descubre los objetos de casa iguales.",
    accent: "#4b8ff7",
    accentSoft: "#e3f1ff",
    stickers: ["House", "Door", "Chair", "Bed", "Car", "Boat", "Bicycle", "Package", "Clock", "HouseLine"],
  },
  {
    id: "cole",
    name: "Memoria del Cole",
    tagline: "Empareja útiles y juguetes del cole.",
    accent: "#ffc94d",
    accentSoft: "#fff3c9",
    stickers: ["Backpack", "Pencil", "BookOpen", "Palette", "Headphones", "Balloon", "Basketball", "GameController", "Microphone", "Tooth"],
  },
  {
    id: "formas",
    name: "Memoria de las Formas",
    tagline: "Reconoce figuras y colores iguales.",
    accent: "#9873e7",
    accentSoft: "#efe7ff",
    stickers: ["Circle", "Square", "Triangle", "Rectangle", "Pentagon", "Hexagon", "Star", "Cube", "CircleDashed", "Smiley"],
  },
]);

// Rango por edad: la ronda 1 arranca suave (menos parejas, más tiempo de
// vista) y la ronda 20 llega al nivel ya afinado de siempre (mismos valores
// que antes de introducir el escalado), para que la dificultad se sienta
// progresiva sin superar nunca el techo ya validado por edad.
export const MEMORY_AGE_PROFILES = Object.freeze({
  "2-3": {
    minPairCount: 2,
    maxPairCount: 3,
    startPreviewMs: 3400,
    endPreviewMs: 2600,
    startMismatchMs: 1500,
    endMismatchMs: 1100,
  },
  "4-5": {
    minPairCount: 3,
    maxPairCount: 6,
    startPreviewMs: 2600,
    endPreviewMs: 1800,
    startMismatchMs: 1150,
    endMismatchMs: 850,
  },
  6: {
    minPairCount: 4,
    maxPairCount: 8,
    startPreviewMs: 2000,
    endPreviewMs: 1200,
    startMismatchMs: 900,
    endMismatchMs: 650,
  },
});

export const MEMORY_ROUNDS = 20;

/**
 * Dificultad efectiva de una ronda: interpola entre el inicio suave y el
 * techo ya afinado de la edad según el avance dentro de las 20 rondas.
 *
 * @param {keyof typeof MEMORY_AGE_PROFILES} ageId
 * @param {number} roundIndex 0..MEMORY_ROUNDS-1
 */
export function memoryDifficultyForRound(ageId, roundIndex) {
  const profile = MEMORY_AGE_PROFILES[ageId] ?? MEMORY_AGE_PROFILES["2-3"];
  const progress = Math.min(1, Math.max(0, roundIndex / (MEMORY_ROUNDS - 1)));
  const pairCount = Math.round(
    profile.minPairCount + progress * (profile.maxPairCount - profile.minPairCount),
  );
  const previewMs = Math.round(
    profile.startPreviewMs - progress * (profile.startPreviewMs - profile.endPreviewMs),
  );
  const mismatchMs = Math.round(
    profile.startMismatchMs - progress * (profile.startMismatchMs - profile.endMismatchMs),
  );
  return { pairCount, previewMs, mismatchMs };
}

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

function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/**
 * Genera el tablero de una ronda: una lista de cartas ya barajadas con
 * pares repetidos, determinista por (themeId, ageId, roundIndex).
 *
 * @returns {{ id: string, sticker: string, matched: boolean }[]}
 */
export function createMemoryBoard({ themeId, ageId, roundIndex }) {
  const theme = MEMORY_THEMES.find((item) => item.id === themeId) ?? MEMORY_THEMES[0];
  const { pairCount: roundPairCount } = memoryDifficultyForRound(ageId, roundIndex);
  const random = mulberry(hashText(`memoria|${themeId}|${ageId}|${roundIndex}`));
  const pairCount = Math.min(roundPairCount, theme.stickers.length);
  const chosen = shuffle(theme.stickers, random).slice(0, pairCount);
  const cards = shuffle(
    chosen.flatMap((sticker, index) => [
      { id: `${sticker}-a`, sticker, pairId: index },
      { id: `${sticker}-b`, sticker, pairId: index },
    ]),
    random,
  );
  return cards.map((card) => ({ ...card, matched: false }));
}
