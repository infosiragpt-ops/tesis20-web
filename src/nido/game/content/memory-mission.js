// Contenido de "Memoria Mágica": mazos temáticos de parejas usando el
// catálogo de stickers ya ilustrado (sin arte nuevo). Cada tema es un
// "juego" distinto en el hub aunque comparta motor con los demás.

// Ronda a partir de la cual una temática con mecánica especial activa su
// variante de nivel experto (últimas 4 rondas de 20, ver diseño en
// docs/PLATAFORMA_JUEGOS_360.md).
export const MEMORY_EXPERT_ROUND_INDEX = 16;

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
    // Ayuda extra propia de este mazo: tras varios errores seguidos en la
    // misma ronda, un "segundo vistazo" breve del tablero completo.
    specialRule: { type: "secondPeek", errorStreak: 3, peekMs: 900 },
  },
  {
    id: "cole",
    name: "Memoria del Cole",
    tagline: "Empareja útiles y juguetes del cole.",
    accent: "#ffc94d",
    accentSoft: "#fff3c9",
    stickers: ["Backpack", "Pencil", "BookOpen", "Palette", "Headphones", "Balloon", "Basketball", "GameController", "Microphone", "Tooth"],
    // Nivel experto (últimas rondas): una pareja es "intrusa", un objeto que
    // no es del cole, para sumar un matiz de clasificación a la memoria.
    specialRule: {
      type: "intruderPair",
      fromRoundIndex: MEMORY_EXPERT_ROUND_INDEX,
      intruderSticker: "Carrot",
    },
  },
  {
    id: "formas",
    name: "Memoria de las Formas",
    tagline: "Reconoce figuras y colores iguales.",
    accent: "#9873e7",
    accentSoft: "#efe7ff",
    stickers: ["Circle", "Square", "Triangle", "Rectangle", "Pentagon", "Hexagon", "Star", "Cube", "CircleDashed", "Smiley"],
    // Nivel experto (últimas rondas): al completar el tablero, una pregunta
    // extra de razonamiento geométrico usando figuras que ya aparecieron.
    specialRule: { type: "bonusSides", fromRoundIndex: MEMORY_EXPERT_ROUND_INDEX },
  },
]);

// Número de lados de cada figura del mazo "formas", solo para las que tienen
// un conteo de lados inequívoco (se excluyen Star, Cube y Smiley a propósito:
// no son polígonos simples de lados claros y generarían ambigüedad).
export const MEMORY_SHAPE_SIDES = Object.freeze({
  Circle: 0,
  CircleDashed: 0,
  Triangle: 3,
  Square: 4,
  Rectangle: 4,
  Pentagon: 5,
  Hexagon: 6,
});

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
 * @returns {{ id: string, sticker: string, matched: boolean, isIntruder?: boolean }[]}
 */
export function createMemoryBoard({ themeId, ageId, roundIndex }) {
  const theme = MEMORY_THEMES.find((item) => item.id === themeId) ?? MEMORY_THEMES[0];
  const { pairCount: roundPairCount } = memoryDifficultyForRound(ageId, roundIndex);
  const random = mulberry(hashText(`memoria|${themeId}|${ageId}|${roundIndex}`));
  const pairCount = Math.min(roundPairCount, theme.stickers.length);
  const chosen = shuffle(theme.stickers, random).slice(0, pairCount);

  let intruderSticker = null;
  const rule = theme.specialRule;
  if (rule?.type === "intruderPair" && roundIndex >= rule.fromRoundIndex && chosen.length > 0) {
    const swapIndex = Math.floor(random() * chosen.length);
    chosen[swapIndex] = rule.intruderSticker;
    intruderSticker = rule.intruderSticker;
  }

  const cards = shuffle(
    chosen.flatMap((sticker, index) => [
      { id: `${sticker}-a`, sticker, pairId: index, isIntruder: sticker === intruderSticker },
      { id: `${sticker}-b`, sticker, pairId: index, isIntruder: sticker === intruderSticker },
    ]),
    random,
  );
  return cards.map((card) => ({ ...card, matched: false }));
}

/**
 * Ronda con "pareja intrusa" activa para el mazo del tema (si aplica).
 */
export function hasIntruderRound(themeId, roundIndex) {
  const theme = MEMORY_THEMES.find((item) => item.id === themeId);
  const rule = theme?.specialRule;
  return rule?.type === "intruderPair" && roundIndex >= rule.fromRoundIndex;
}

/**
 * Elige una pregunta bonus de "¿cuál tiene más lados?" a partir de las
 * figuras que ya aparecen en el tablero de esta ronda, solo con figuras de
 * lados inequívocos (ver MEMORY_SHAPE_SIDES). Devuelve null si el tablero no
 * tiene al menos dos figuras distintas con número de lados distinto entre sí
 * (evita preguntas ambiguas o sin respuesta única).
 *
 * @param {{ sticker: string }[]} board
 */
export function pickBonusSidesQuestion(board) {
  const candidates = [...new Set(board.map((card) => card.sticker))].filter(
    (sticker) => MEMORY_SHAPE_SIDES[sticker] !== undefined,
  );
  if (candidates.length < 2) return null;
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const a = candidates[i];
      const b = candidates[j];
      if (MEMORY_SHAPE_SIDES[a] !== MEMORY_SHAPE_SIDES[b]) {
        const answer = MEMORY_SHAPE_SIDES[a] > MEMORY_SHAPE_SIDES[b] ? a : b;
        return { optionA: a, optionB: b, answer };
      }
    }
  }
  return null;
}
