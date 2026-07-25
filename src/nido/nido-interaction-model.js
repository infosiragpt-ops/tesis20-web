export const NIDO_ROUTE_INTERACTIONS = Object.freeze({
  "logica:detective": "tap",
  "logica:uno-mas": "drag",
  "logica:colores": "drag",
  "logica:que-sobra": "tap",
  "logica:que-es-real": "tap",
  "logica:camuflaje": "tap",
  "matematicas:pequeno-y-grande": "drag",
  "matematicas:figuras": "tap",
  "matematicas:mucho-y-poco": "drag",
  "matematicas:ordena-por-tamano": "order",
  "matematicas:busca-el-patron": "order",
  "atencion:mascaras": "match",
  "atencion:dibujo": "tap",
  "atencion:quien-esta-escondido": "tap",
  "atencion:quien-esta-aqui": "tap",
  "atencion:encuentra-al-gemelo": "match",
  "atencion:encuentra-la-diferencia": "tap",
  "habla:encuentra-a-la-cria": "match",
  "habla:cual-es-la-respuesta": "tap",
  "habla:emociones": "tap",
  "habla:quien-come-que-cosa": "drag",
  "habla:preposiciones": "path",
  "habla:quien-vive-aqui": "path",
  "ingles:colores": "match",
  "ingles:animales": "match",
  "ingles:numeros": "match",
  "ingles:familia": "match",
  "ingles:objetos-cotidianos": "match",
  "ingles:acciones": "path",
});

export const NIDO_INTERACTION_META = Object.freeze({
  tap: Object.freeze({
    label: "Toca y selecciona",
    shortInstruction: "Observa la pista y toca la respuesta.",
  }),
  drag: Object.freeze({
    label: "Arrastra y suelta",
    shortInstruction:
      "Arrastra una pieza al destino. También puedes tocar la pieza y luego el destino.",
  }),
  order: Object.freeze({
    label: "Ordena y completa",
    shortInstruction:
      "Ordena las piezas o completa el espacio vacío; después comprueba tu respuesta.",
  }),
  match: Object.freeze({
    label: "Empareja",
    shortInstruction:
      "Toca la tarjeta guía y luego su pareja correcta.",
  }),
  path: Object.freeze({
    label: "Camina hasta la respuesta",
    shortInstruction:
      "Usa las flechas para caminar hasta la respuesta correcta.",
  }),
});

const AGE_PROFILES = Object.freeze({
  "2-3": Object.freeze({
    gridSize: 3,
    obstacleCount: 0,
    sourceStartsSelected: true,
    pieceSize: "large",
  }),
  "4-5": Object.freeze({
    gridSize: 4,
    obstacleCount: 1,
    sourceStartsSelected: false,
    pieceSize: "medium",
  }),
  6: Object.freeze({
    gridSize: 5,
    obstacleCount: 2,
    sourceStartsSelected: false,
    pieceSize: "compact",
  }),
});

export function getNidoAgeInteractionProfile(ageId) {
  return AGE_PROFILES[ageId] ?? AGE_PROFILES["4-5"];
}

export function getNidoInteractionType(challenge) {
  return (
    NIDO_ROUTE_INTERACTIONS[
      `${challenge?.areaId ?? ""}:${challenge?.categoryId ?? ""}`
    ] ?? "tap"
  );
}

export function getNidoInteractionMeta(challenge) {
  return NIDO_INTERACTION_META[getNidoInteractionType(challenge)];
}

export function normalizeOrderLabel(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getCorrectOrderLabels(challenge) {
  const correctOption = challenge?.options?.find(
    (option) => option.id === challenge.answerId,
  );
  return String(correctOption?.label ?? "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

export function buildInitialOrder(challenge) {
  const items = Array.isArray(challenge?.visual?.items)
    ? challenge.visual.items.map((item, index) =>
        typeof item === "object" && item !== null
          ? { ...item, interactionId: `${item.id ?? item.label}-${index}` }
          : {
              id: `item-${index}`,
              interactionId: `item-${index}`,
              label: String(item),
              value: item,
            },
      )
    : [];
  if (items.length < 2) return items;

  const offset = Math.abs(Number(challenge.seed) || 1) % items.length;
  let shuffled = [...items.slice(offset), ...items.slice(0, offset)];
  const correct = getCorrectOrderLabels(challenge).map(normalizeOrderLabel);
  const current = shuffled.map((item) =>
    normalizeOrderLabel(item.label ?? item.value),
  );

  if (
    correct.length === current.length &&
    correct.every((label, index) => label === current[index])
  ) {
    shuffled = [...shuffled].reverse();
  }
  return shuffled;
}

function seededRotation(seed, length) {
  if (!length) return 0;
  const numericSeed = Math.abs(Number(seed) || 0);
  return numericSeed % length;
}

function canReachPathTarget({ size, start, targets, obstacles }, targetId) {
  const target = targets.find((item) => item.optionId === targetId);
  if (!target) return false;

  const targetKey = `${target.row}:${target.column}`;
  const blocked = new Set([
    ...obstacles.map(({ row, column }) => `${row}:${column}`),
    ...targets
      .filter((item) => item.optionId !== targetId)
      .map(({ row, column }) => `${row}:${column}`),
  ]);
  const queue = [start];
  const visited = new Set([`${start.row}:${start.column}`]);

  while (queue.length) {
    const current = queue.shift();
    for (const [rowDelta, columnDelta] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const row = current.row + rowDelta;
      const column = current.column + columnDelta;
      const key = `${row}:${column}`;
      if (
        row < 0 ||
        column < 0 ||
        row >= size ||
        column >= size ||
        visited.has(key) ||
        blocked.has(key)
      ) {
        continue;
      }
      if (key === targetKey) return true;
      visited.add(key);
      queue.push({ row, column });
    }
  }

  return false;
}

function allPathTargetsReachable(layout) {
  return layout.targets.every((target) =>
    canReachPathTarget(layout, target.optionId),
  );
}

export function buildNidoPathLayout(challenge) {
  const profile = getNidoAgeInteractionProfile(challenge?.ageId);
  const size = profile.gridSize;
  const start = {
    row: Math.floor(size / 2),
    column: Math.floor(size / 2),
  };
  const boundary = [];

  for (let column = 0; column < size; column += 1) {
    boundary.push({ row: 0, column });
    if (size > 1) boundary.push({ row: size - 1, column });
  }
  for (let row = 1; row < size - 1; row += 1) {
    boundary.push({ row, column: 0 });
    if (size > 1) boundary.push({ row, column: size - 1 });
  }

  const rotation = seededRotation(challenge?.seed, boundary.length);
  const rotatedBoundary = [
    ...boundary.slice(rotation),
    ...boundary.slice(0, rotation),
  ];
  const spacing = Math.max(
    1,
    Math.floor(rotatedBoundary.length / Math.max(challenge.options.length, 1)),
  );
  const targets = challenge.options.map((option, index) => ({
    ...rotatedBoundary[(index * spacing) % rotatedBoundary.length],
    optionId: option.id,
  }));
  const targetKeys = new Set(
    targets.map((target) => `${target.row}:${target.column}`),
  );
  const protectedKeys = new Set([
    `${start.row}:${start.column}`,
    ...targetKeys,
  ]);
  const obstacleCandidates = [];

  for (let row = 1; row < size - 1; row += 1) {
    for (let column = 1; column < size - 1; column += 1) {
      if (!protectedKeys.has(`${row}:${column}`)) {
        obstacleCandidates.push({ row, column });
      }
    }
  }

  const obstacleRotation = seededRotation(
    Number(challenge?.seed) + 7,
    obstacleCandidates.length,
  );
  const rotatedObstacles = [
    ...obstacleCandidates.slice(obstacleRotation),
    ...obstacleCandidates.slice(0, obstacleRotation),
  ];
  let obstacles = [];
  for (const candidate of rotatedObstacles) {
    if (obstacles.length >= profile.obstacleCount) break;
    const nextObstacles = [...obstacles, candidate];
    if (
      allPathTargetsReachable({
        size,
        start,
        targets,
        obstacles: nextObstacles,
      })
    ) {
      obstacles = nextObstacles;
    }
  }

  return {
    size,
    start,
    targets,
    obstacles,
  };
}

export function isNidoPathMoveAllowed(layout, row, column) {
  if (
    row < 0 ||
    column < 0 ||
    row >= layout.size ||
    column >= layout.size
  ) {
    return false;
  }
  return !layout.obstacles.some(
    (obstacle) => obstacle.row === row && obstacle.column === column,
  );
}
