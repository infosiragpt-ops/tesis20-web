// Contenido de "Misión del Bosque: recolecta y entrega".
// Todo es declarativo: cambiar cantidades, obstáculos o narración no toca el
// motor. Generación determinista por (edad, ronda, nivel) para que las 20
// rondas sean estables y testeables.

export const FOREST_ROUNDS = 20;

/**
 * @typedef {{
 *   target: number,
 *   parts: number[] | null,
 *   operation: "count" | "sum" | "sub",
 *   instructionText: string,
 *   spokenText: string,
 *   fruitCount: number,
 *   platformCount: number,
 *   obstacleCount: number,
 *   helpAlways: boolean,
 * }} ForestRound
 */

const NUMBER_WORDS = [
  "cero",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
];

// Perfiles por banda de edad de la plataforma (cubre 2 a 7 años en 3 bandas).
export const FOREST_AGE_PROFILES = Object.freeze({
  "2-3": {
    maxLevel: 1,
    levels: [
      { targets: [1, 2], operation: "count", platforms: 0, obstacles: 1 },
      { targets: [2, 3], operation: "count", platforms: 0, obstacles: 1 },
    ],
    helpAlways: true,
    walkOnly: true,
  },
  "4-5": {
    maxLevel: 2,
    levels: [
      { targets: [2, 3], operation: "count", platforms: 1, obstacles: 1 },
      { targets: [3, 4, 5], operation: "count", platforms: 1, obstacles: 2 },
      { targets: [3, 4, 5], operation: "sum", platforms: 1, obstacles: 2 },
    ],
    helpAlways: false,
    walkOnly: false,
  },
  6: {
    maxLevel: 2,
    levels: [
      { targets: [4, 5, 6], operation: "sum", platforms: 2, obstacles: 2 },
      { targets: [6, 7, 8], operation: "sum", platforms: 2, obstacles: 3 },
      { targets: [5, 6, 7, 8], operation: "sub", platforms: 2, obstacles: 3 },
    ],
    helpAlways: false,
    walkOnly: false,
  },
});

/**
 * Piso de dificultad determinado por el número de ronda: reparte las bandas
 * de nivel de cada edad en partes iguales a lo largo de las 20 rondas, para
 * que la ronda 12 de 20 sea objetivamente más difícil que la ronda 1 aunque
 * el jugador no haya encadenado aciertos (el sistema adaptativo puede subir
 * el nivel más rápido si acierta seguido, pero nunca queda por debajo de
 * este piso).
 *
 * @param {number} roundIndex 0..FOREST_ROUNDS-1
 * @param {number} maxLevel nivel máximo de la edad (profile.maxLevel)
 */
export function roundDifficultyFloor(roundIndex, maxLevel) {
  if (maxLevel <= 0) return 0;
  const band = Math.floor((roundIndex / FOREST_ROUNDS) * (maxLevel + 1));
  return Math.min(maxLevel, Math.max(0, band));
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

const fruitWord = (count) => (count === 1 ? "fruta" : "frutas");

/**
 * Genera la ronda del bosque para una edad, índice y nivel adaptativo.
 *
 * @param {{ ageId: keyof typeof FOREST_AGE_PROFILES, roundIndex: number, level?: number }} params
 * @returns {ForestRound}
 */
export function createForestRound({ ageId, roundIndex, level = 0 }) {
  const profile = FOREST_AGE_PROFILES[ageId] ?? FOREST_AGE_PROFILES["2-3"];
  const levelDef =
    profile.levels[Math.min(level, profile.levels.length - 1)];
  const random = mulberry(hashText(`bosque|${ageId}|${roundIndex}|${level}`));
  const pick = (items) => items[Math.floor(random() * items.length)];

  const target = pick(levelDef.targets);
  let parts = null;
  let operation = levelDef.operation;
  let instructionText = `Lleva ${target} ${fruitWord(target)} a la cesta`;
  let spokenText = `Niko necesita ${NUMBER_WORDS[target]} ${fruitWord(target)}. Recógelas y llévalas a la cesta.`;

  if (operation === "sum" && target >= 2) {
    const first = 1 + Math.floor(random() * (target - 1));
    parts = [first, target - first];
    instructionText = `Lleva ${parts[0]} + ${parts[1]} frutas`;
    spokenText = `Suma conmigo: ${NUMBER_WORDS[parts[0]]} más ${NUMBER_WORDS[parts[1]]}. Lleva esa cantidad de frutas a la cesta.`;
  } else if (operation === "sub") {
    const minuend = Math.min(10, target + 1 + Math.floor(random() * (10 - target)));
    parts = [minuend, minuend - target];
    instructionText = `Lleva ${parts[0]} − ${parts[1]} frutas`;
    spokenText = `Resta conmigo: ${NUMBER_WORDS[parts[0]]} menos ${NUMBER_WORDS[parts[1]]}. Lleva esa cantidad de frutas a la cesta.`;
  } else {
    operation = "count";
  }

  // Escalado suave dentro de cada nivel: además del salto por bandas, cada
  // ronda añade un poco más de terreno que recorrer, para que el avance se
  // sienta continuo y no solo en saltos bruscos cada 7-10 rondas.
  const roundBonusObstacles = Math.floor(roundIndex / 7);
  const roundBonusPlatforms = Math.floor(roundIndex / 10);

  return {
    target,
    parts,
    operation,
    instructionText,
    spokenText,
    fruitCount: Math.min(10, target + 2 + Math.floor(random() * 2)),
    platformCount: levelDef.platforms + roundBonusPlatforms,
    obstacleCount: levelDef.obstacles + roundBonusObstacles,
    helpAlways: profile.helpAlways,
  };
}

/**
 * Distribuye frutas, plataformas y arbustos en el mundo de forma determinista.
 *
 * @param {ForestRound} round
 * @param {{ width: number, groundY: number }} world
 * @param {number} seedExtra
 */
export function layoutForestRound(round, world, seedExtra = 0) {
  const random = mulberry(
    hashText(`layout|${round.instructionText}|${round.fruitCount}|${seedExtra}`),
  );
  const platforms = [];
  const obstacles = [];
  const fruits = [];

  const playStart = 220;
  const playEnd = world.width - 420;

  for (let index = 0; index < round.platformCount; index += 1) {
    const x =
      playStart + 260 + ((playEnd - playStart - 480) / Math.max(1, round.platformCount)) * index + random() * 120;
    platforms.push({
      x: Math.round(x),
      y: world.groundY - 132 - Math.round(random() * 40),
      w: 170,
      h: 22,
    });
  }

  for (let index = 0; index < round.obstacleCount; index += 1) {
    obstacles.push({
      x: Math.round(
        playStart + 140 + ((playEnd - playStart - 200) / Math.max(1, round.obstacleCount)) * index + random() * 90,
      ),
      w: 54,
      h: 40 + Math.round(random() * 14),
    });
  }

  for (let index = 0; index < round.fruitCount; index += 1) {
    const onPlatform = platforms.length > 0 && random() < 0.3;
    if (onPlatform) {
      const platform = platforms[Math.floor(random() * platforms.length)];
      fruits.push({
        id: `fruta-${index}`,
        x: platform.x + 24 + random() * (platform.w - 48),
        y: platform.y - 26,
        collected: false,
      });
    } else {
      fruits.push({
        id: `fruta-${index}`,
        x: playStart + random() * (playEnd - playStart),
        y: world.groundY - 26,
        collected: false,
      });
    }
  }

  return { platforms, obstacles, fruits };
}
