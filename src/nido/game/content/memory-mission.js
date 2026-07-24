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

// Pares por edad: más pequeños, mazos más cortos y con más tiempo de vista.
export const MEMORY_AGE_PROFILES = Object.freeze({
  "2-3": { pairCount: 3, previewMs: 2600, mismatchMs: 1100 },
  "4-5": { pairCount: 6, previewMs: 1800, mismatchMs: 850 },
  6: { pairCount: 8, previewMs: 1200, mismatchMs: 650 },
});

export const MEMORY_ROUNDS = 20;

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
  const profile = MEMORY_AGE_PROFILES[ageId] ?? MEMORY_AGE_PROFILES["2-3"];
  const random = mulberry(hashText(`memoria|${themeId}|${ageId}|${roundIndex}`));
  const pairCount = Math.min(profile.pairCount, theme.stickers.length);
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
