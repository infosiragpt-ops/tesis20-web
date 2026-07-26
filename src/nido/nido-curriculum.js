import { NIDO_ROUTE_INTERACTIONS } from "./nido-interaction-model.js";
import {
  MATRIX_STRATEGY,
  buildMatrixCategories,
  buildMatrixDefinition,
} from "./nido-curriculum-matrix.js";

const GAME_COUNT = 20;

export const NIDO_CURRICULUM_GAME_COUNT = GAME_COUNT;

export const NIDO_AGE_GROUPS = Object.freeze([
  {
    id: "2-3",
    name: "2–3 años",
    iconName: "Baby",
    difficulty: 1,
    instructionStyle: "breve",
  },
  {
    id: "4-5",
    name: "4–5 años",
    iconName: "Smiley",
    difficulty: 2,
    instructionStyle: "guiada",
  },
  {
    id: "6",
    name: "6 años",
    iconName: "Student",
    difficulty: 3,
    instructionStyle: "dos pasos",
  },
]);

export const NIDO_VISUAL_TYPES = Object.freeze([
  "sequence",
  "choice-grid",
  "quantity",
  "comparison",
  "memory",
  "speech",
  "word-match",
]);

const category = (id, name, iconName, strategy, description) => ({
  id,
  name,
  iconName,
  strategy,
  description,
  gameCount: GAME_COUNT,
});

const HANDMADE_CURRICULUM = Object.freeze([
  {
    id: "logica",
    name: "Lógica",
    iconName: "PuzzlePiece",
    description: "Observar, relacionar, clasificar y resolver patrones.",
    categories: Object.freeze([
      category(
        "detective",
        "Detective",
        "Detective",
        "detective",
        "Combina pistas de forma y color.",
      ),
      category(
        "uno-mas",
        "Uno más",
        "PlusCircle",
        "one-more",
        "Descubre qué cantidad aparece al agregar uno.",
      ),
      category(
        "colores",
        "Colores",
        "Palette",
        "color-pattern",
        "Continúa secuencias de colores.",
      ),
      category(
        "que-sobra",
        "¿Qué sobra?",
        "SelectionSlash",
        "odd-one-out",
        "Encuentra el elemento que no pertenece al grupo.",
      ),
      category(
        "que-es-real",
        "¿Qué es real?",
        "CheckCircle",
        "real-or-imaginary",
        "Distingue elementos reales de personajes imaginarios.",
      ),
      category(
        "camuflaje",
        "Camuflaje",
        "Eye",
        "camouflage",
        "Localiza figuras escondidas por su color y forma.",
      ),
    ]),
  },
  {
    id: "matematicas",
    name: "Matemáticas",
    iconName: "MathOperations",
    description: "Comparar, contar, ordenar y reconocer relaciones numéricas.",
    categories: Object.freeze([
      category(
        "pequeno-y-grande",
        "Pequeño y grande",
        "ArrowsOut",
        "size-comparison",
        "Compara dos objetos por su tamaño.",
      ),
      category(
        "figuras",
        "Figuras",
        "Shapes",
        "shape-properties",
        "Reconoce figuras por su forma y sus lados.",
      ),
      category(
        "mucho-y-poco",
        "Mucho y poco",
        "CirclesThreePlus",
        "quantity-comparison",
        "Compara grupos y sus cantidades.",
      ),
      category(
        "ordena-por-tamano",
        "Ordena por tamaño",
        "SortAscending",
        "size-order",
        "Ordena elementos de menor a mayor y viceversa.",
      ),
      category(
        "busca-el-patron",
        "Busca el patrón",
        "ChartLineUp",
        "number-pattern",
        "Completa series numéricas sencillas.",
      ),
    ]),
  },
  {
    id: "atencion",
    name: "Atención y memoria",
    iconName: "Brain",
    description: "Concentrarse, recordar detalles y reconocer coincidencias.",
    categories: Object.freeze([
      category(
        "mascaras",
        "Máscaras",
        "MaskHappy",
        "mask-match",
        "Reconoce expresiones, colores y pequeños detalles.",
      ),
      category(
        "dibujo",
        "Dibujo",
        "PaintBrush",
        "drawing-detail",
        "Busca un detalle concreto dentro de una escena.",
      ),
      category(
        "quien-esta-escondido",
        "¿Quién está escondido?",
        "EyeClosed",
        "hidden-character",
        "Usa pistas para descubrir al personaje oculto.",
      ),
      category(
        "quien-esta-aqui",
        "¿Quién está aquí?",
        "UsersThree",
        "character-clue",
        "Identifica quién llegó a partir de sus características.",
      ),
      category(
        "encuentra-al-gemelo",
        "Encuentra al gemelo",
        "Copy",
        "twin-match",
        "Encuentra la opción exactamente igual al modelo.",
      ),
      category(
        "encuentra-la-diferencia",
        "Encuentra la diferencia",
        "Subtract",
        "difference",
        "Detecta el elemento que cambió entre dos escenas.",
      ),
    ]),
  },
  {
    id: "habla",
    name: "Desarrollo del habla",
    iconName: "ChatCircleDots",
    description: "Escuchar, nombrar, relacionar y construir lenguaje.",
    categories: Object.freeze([
      category(
        "encuentra-a-la-cria",
        "Encuentra a la cría",
        "Baby",
        "animal-young",
        "Relaciona cada animal con el nombre de su cría.",
      ),
      category(
        "cual-es-la-respuesta",
        "¿Cuál es la respuesta?",
        "Question",
        "spoken-question",
        "Escucha una pregunta y elige una respuesta clara.",
      ),
      category(
        "emociones",
        "Emociones",
        "Smiley",
        "emotion",
        "Reconoce y nombra emociones cotidianas.",
      ),
      category(
        "quien-come-que-cosa",
        "¿Quién come qué cosa?",
        "ForkKnife",
        "animal-food",
        "Relaciona animales con sus alimentos.",
      ),
      category(
        "preposiciones",
        "Preposiciones",
        "ArrowsHorizontal",
        "position",
        "Comprende arriba, abajo, dentro, fuera y al lado.",
      ),
      category(
        "quien-vive-aqui",
        "¿Quién vive aquí?",
        "HouseLine",
        "habitat",
        "Relaciona seres vivos con su hábitat.",
      ),
    ]),
  },
  {
    id: "ingles",
    name: "Inglés",
    iconName: "Translate",
    description: "Aprender vocabulario básico con imágenes, escucha y repetición.",
    categories: Object.freeze([
      category(
        "colores",
        "Colores",
        "Palette",
        "english-colors",
        "Reconoce y pronuncia colores en inglés.",
      ),
      category(
        "animales",
        "Animales",
        "PawPrint",
        "english-animals",
        "Relaciona animales con sus nombres en inglés.",
      ),
      category(
        "numeros",
        "Números",
        "NumberCircleOne",
        "english-numbers",
        "Cuenta y reconoce los números en inglés.",
      ),
      category(
        "familia",
        "Familia",
        "UsersThree",
        "english-family",
        "Aprende los nombres de la familia en inglés.",
      ),
      category(
        "objetos-cotidianos",
        "Objetos cotidianos",
        "Cube",
        "english-objects",
        "Nombra objetos del entorno en inglés.",
      ),
      category(
        "acciones",
        "Acciones",
        "PersonSimpleRun",
        "english-actions",
        "Reconoce y pronuncia acciones básicas.",
      ),
    ]),
  },
]);

// Cada materia suma sus cien juegos generados (diez mecánicas × diez packs) a
// los escritos a mano, que se conservan intactos y siguen apareciendo primero.
export const NIDO_CURRICULUM = Object.freeze(
  HANDMADE_CURRICULUM.map((area) =>
    Object.freeze({
      ...area,
      categories: Object.freeze([
        ...area.categories,
        ...buildMatrixCategories(area.id, GAME_COUNT),
      ]),
    }),
  ),
);

const SHAPES = Object.freeze([
  { id: "circle", label: "círculo", iconName: "Circle", sides: 0 },
  { id: "triangle", label: "triángulo", iconName: "Triangle", sides: 3 },
  { id: "square", label: "cuadrado", iconName: "Square", sides: 4 },
  { id: "pentagon", label: "pentágono", iconName: "Pentagon", sides: 5 },
  { id: "hexagon", label: "hexágono", iconName: "Hexagon", sides: 6 },
  { id: "star", label: "estrella", iconName: "Star", sides: 10 },
]);

const COLORS = Object.freeze([
  { id: "red", label: "rojo", english: "red", tone: "#ef5350" },
  { id: "blue", label: "azul", english: "blue", tone: "#42a5f5" },
  { id: "yellow", label: "amarillo", english: "yellow", tone: "#fbc02d" },
  { id: "green", label: "verde", english: "green", tone: "#43a047" },
  { id: "orange", label: "naranja", english: "orange", tone: "#fb8c00" },
  { id: "purple", label: "morado", english: "purple", tone: "#8e5bd9" },
  { id: "pink", label: "rosado", english: "pink", tone: "#ec6f91" },
  { id: "brown", label: "marrón", english: "brown", tone: "#795548" },
  { id: "black", label: "negro", english: "black", tone: "#20242b" },
  { id: "white", label: "blanco", english: "white", tone: "#f8fafc" },
]);

const ANIMALS = Object.freeze([
  { id: "dog", label: "perro", english: "dog", iconName: "Dog" },
  { id: "cat", label: "gato", english: "cat", iconName: "Cat" },
  { id: "horse", label: "caballo", english: "horse", iconName: "Horse" },
  { id: "duck", label: "pato", english: "duck", iconName: "Duck" },
  { id: "fish", label: "pez", english: "fish", iconName: "FishSimple" },
  { id: "cow", label: "vaca", english: "cow", iconName: "Cow" },
  { id: "rabbit", label: "conejo", english: "rabbit", iconName: "Rabbit" },
  { id: "butterfly", label: "mariposa", english: "butterfly", iconName: "Butterfly" },
  { id: "lion", label: "león", english: "lion", iconName: "Lion" },
  { id: "turtle", label: "tortuga", english: "turtle", iconName: "Turtle" },
]);

const LOGIC_FAMILIES = Object.freeze([
  {
    name: "animales",
    members: [
      { id: "dog", label: "perro", iconName: "Dog" },
      { id: "cat", label: "gato", iconName: "Cat" },
      { id: "fish", label: "pez", iconName: "FishSimple" },
    ],
    outsider: { id: "chair", label: "silla", iconName: "Chair" },
  },
  {
    name: "útiles",
    members: [
      { id: "book", label: "libro", iconName: "BookOpen" },
      { id: "pencil", label: "lápiz", iconName: "Pencil" },
      { id: "backpack", label: "mochila", iconName: "Backpack" },
    ],
    outsider: { id: "tree", label: "árbol", iconName: "Tree" },
  },
  {
    name: "transportes",
    members: [
      { id: "car", label: "auto", iconName: "Car" },
      { id: "bicycle", label: "bicicleta", iconName: "Bicycle" },
      { id: "boat", label: "bote", iconName: "Boat" },
    ],
    outsider: { id: "cup", label: "taza", iconName: "Coffee" },
  },
  {
    name: "alimentos",
    members: [
      { id: "apple", label: "manzana", iconName: "BowlFood" },
      { id: "carrot", label: "zanahoria", iconName: "Carrot" },
      { id: "bread", label: "pan", iconName: "Bread" },
    ],
    outsider: { id: "clock", label: "reloj", iconName: "Clock" },
  },
]);

const REAL_AND_IMAGINARY = Object.freeze([
  {
    real: { id: "dog", label: "perro", iconName: "Dog" },
    imaginary: [
      { id: "unicorn", label: "unicornio", iconName: "Unicorn" },
      { id: "dragon", label: "dragón", iconName: "Dragon" },
    ],
  },
  {
    real: { id: "butterfly", label: "mariposa", iconName: "Butterfly" },
    imaginary: [
      { id: "winged-lion", label: "león con alas", iconName: "WingedLion" },
      { id: "three-headed-bird", label: "ave de tres cabezas", iconName: "ThreeHeadedBird" },
    ],
  },
  {
    real: { id: "turtle", label: "tortuga", iconName: "Turtle" },
    imaginary: [
      { id: "flying-fish", label: "pez que camina", iconName: "FishSimple" },
      { id: "talking-moon", label: "luna que habla", iconName: "Moon" },
    ],
  },
  {
    real: { id: "bicycle", label: "bicicleta", iconName: "Bicycle" },
    imaginary: [
      { id: "cloud-car", label: "auto de nube", iconName: "Cloud" },
      { id: "star-boat", label: "bote de estrellas", iconName: "Star" },
    ],
  },
  {
    real: { id: "tree", label: "árbol", iconName: "Tree" },
    imaginary: [
      { id: "walking-house", label: "casa con piernas", iconName: "House" },
      { id: "singing-sun", label: "sol cantante", iconName: "Sun" },
    ],
  },
]);

const MASK_EXPRESSIONS = Object.freeze([
  { id: "happy", label: "alegre", iconName: "Smiley" },
  { id: "sad", label: "triste", iconName: "SmileySad" },
  { id: "surprised", label: "sorprendida", iconName: "SmileyWink" },
  { id: "calm", label: "tranquila", iconName: "SmileyMeh" },
]);

const CHARACTER_CLUES = Object.freeze([
  {
    id: "rabbit",
    label: "conejo",
    iconName: "Rabbit",
    clue: "Tiene orejas largas y salta.",
  },
  {
    id: "fish",
    label: "pez",
    iconName: "FishSimple",
    clue: "Vive en el agua y nada.",
  },
  {
    id: "bird",
    label: "ave",
    iconName: "Bird",
    clue: "Tiene plumas y puede volar.",
  },
  {
    id: "cat",
    label: "gato",
    iconName: "Cat",
    clue: "Tiene bigotes y maúlla.",
  },
  {
    id: "dog",
    label: "perro",
    iconName: "Dog",
    clue: "Ladra y mueve la cola.",
  },
  {
    id: "turtle",
    label: "tortuga",
    iconName: "Turtle",
    clue: "Camina despacio y lleva caparazón.",
  },
]);

const ANIMAL_YOUNG = Object.freeze([
  { article: "la", adult: "vaca", young: "ternero", adultIcon: "Cow", youngIcon: "Cow" },
  { article: "el", adult: "caballo", young: "potro", adultIcon: "Horse", youngIcon: "Horse" },
  { article: "la", adult: "gallina", young: "pollito", adultIcon: "Bird", youngIcon: "Bird" },
  { article: "el", adult: "perro", young: "cachorro", adultIcon: "Dog", youngIcon: "Dog" },
  { article: "el", adult: "gato", young: "gatito", adultIcon: "Cat", youngIcon: "Cat" },
  { article: "la", adult: "oveja", young: "cordero", adultIcon: "Sheep", youngIcon: "Sheep" },
  { article: "el", adult: "pato", young: "patito", adultIcon: "Duck", youngIcon: "Duck" },
  { article: "el", adult: "conejo", young: "gazapo", adultIcon: "Rabbit", youngIcon: "Rabbit" },
]);

const SPOKEN_QUESTIONS = Object.freeze([
  { question: "¿Qué usamos para beber agua?", answer: "vaso", iconName: "Coffee" },
  { question: "¿Qué usamos para escribir?", answer: "lápiz", iconName: "Pencil" },
  { question: "¿Dónde dormimos por la noche?", answer: "cama", iconName: "Bed" },
  { question: "¿Qué abrimos para entrar a una casa?", answer: "puerta", iconName: "Door" },
  { question: "¿Qué usamos cuando llueve?", answer: "paraguas", iconName: "Umbrella" },
  { question: "¿Qué alumbra durante el día?", answer: "sol", iconName: "Sun" },
  { question: "¿Qué usamos para saber la hora?", answer: "reloj", iconName: "Clock" },
  { question: "¿Qué usamos para escuchar música?", answer: "audífonos", iconName: "Headphones" },
  { question: "¿Dónde guardamos los libros?", answer: "mochila", iconName: "Backpack" },
  { question: "¿Qué usamos para cepillarnos los dientes?", answer: "cepillo", iconName: "Tooth" },
]);

const EMOTIONS = Object.freeze([
  { id: "happy", label: "alegría", context: "Recibió una buena noticia.", iconName: "Smiley" },
  { id: "sad", label: "tristeza", context: "Perdió su juguete favorito.", iconName: "SmileySad" },
  { id: "surprised", label: "sorpresa", context: "Encontró un regalo inesperado.", iconName: "SmileyWink" },
  { id: "calm", label: "calma", context: "Respira despacio mientras descansa.", iconName: "SmileyMeh" },
  { id: "afraid", label: "miedo", context: "Escuchó un ruido fuerte en la oscuridad.", iconName: "SmileyNervous" },
  { id: "angry", label: "enojo", context: "Alguien rompió su torre de bloques.", iconName: "SmileyXEyes" },
]);

const ANIMAL_FOODS = Object.freeze([
  { article: "el", animal: "conejo", animalIcon: "Rabbit", food: "zanahoria", foodIcon: "Carrot" },
  { article: "la", animal: "vaca", animalIcon: "Cow", food: "pasto", foodIcon: "Plant" },
  { article: "el", animal: "panda", animalIcon: "Panda", food: "bambú", foodIcon: "Plant" },
  { article: "el", animal: "mono", animalIcon: "Monkey", food: "plátano", foodIcon: "BowlFood" },
  { article: "la", animal: "ardilla", animalIcon: "Squirrel", food: "nuez", foodIcon: "BowlFood" },
  { article: "la", animal: "mariposa", animalIcon: "Butterfly", food: "néctar", foodIcon: "Flower" },
  { article: "el", animal: "caballo", animalIcon: "Horse", food: "heno", foodIcon: "Plant" },
  { article: "el", animal: "gato", animalIcon: "Cat", food: "pescado", foodIcon: "FishSimple" },
]);

const POSITIONS = Object.freeze([
  { id: "above", label: "encima de", iconName: "ArrowUp" },
  { id: "below", label: "debajo de", iconName: "ArrowDown" },
  { id: "inside", label: "dentro de", iconName: "ArrowSquareIn" },
  { id: "outside", label: "fuera de", iconName: "ArrowSquareOut" },
  { id: "beside", label: "al lado de", iconName: "ArrowsHorizontal" },
  { id: "between", label: "entre", iconName: "ArrowsLeftRight" },
  { id: "behind", label: "detrás de", iconName: "ArrowBendLeftDown" },
  { id: "in-front", label: "delante de", iconName: "ArrowBendRightUp" },
]);

const HABITATS = Object.freeze([
  { article: "el", animal: "pez", animalIcon: "FishSimple", habitat: "agua", habitatPhrase: "el agua", habitatIcon: "Waves" },
  { article: "el", animal: "ave", animalIcon: "Bird", habitat: "nido", habitatPhrase: "un nido", habitatIcon: "Bird" },
  { article: "la", animal: "abeja", animalIcon: "Bug", habitat: "colmena", habitatPhrase: "una colmena", habitatIcon: "Hexagon" },
  { article: "el", animal: "conejo", animalIcon: "Rabbit", habitat: "madriguera", habitatPhrase: "una madriguera", habitatIcon: "CircleDashed" },
  { article: "el", animal: "león", animalIcon: "Lion", habitat: "sabana", habitatPhrase: "la sabana", habitatIcon: "SunHorizon" },
  { article: "la", animal: "rana", animalIcon: "Frog", habitat: "estanque", habitatPhrase: "un estanque", habitatIcon: "Drop" },
  { article: "el", animal: "oso polar", animalIcon: "PolarBear", habitat: "hielo", habitatPhrase: "el hielo", habitatIcon: "Snowflake" },
  { article: "el", animal: "mono", animalIcon: "Monkey", habitat: "selva", habitatPhrase: "la selva", habitatIcon: "TreePalm" },
]);

const ENGLISH_VOCABULARY = Object.freeze({
  "english-colors": COLORS.map(({ id, label, english, tone }) => ({
    id,
    spanish: label,
    english,
    iconName: "Palette",
    tone,
  })),
  "english-animals": ANIMALS.map(({ id, label, english, iconName }) => ({
    id,
    spanish: label,
    english,
    iconName,
  })),
  "english-numbers": [
    ["one", "uno"],
    ["two", "dos"],
    ["three", "tres"],
    ["four", "cuatro"],
    ["five", "cinco"],
    ["six", "seis"],
    ["seven", "siete"],
    ["eight", "ocho"],
    ["nine", "nueve"],
    ["ten", "diez"],
  ].map(([english, spanish], index) => ({
    id: `number-${index + 1}`,
    spanish,
    english,
    value: index + 1,
    iconName: "NumberCircleOne",
  })),
  "english-family": [
    ["mother", "mamá", "FamilyMother"],
    ["father", "papá", "FamilyFather"],
    ["sister", "hermana", "FamilySister"],
    ["brother", "hermano", "FamilyBrother"],
    ["grandmother", "abuela", "FamilyGrandmother"],
    ["grandfather", "abuelo", "FamilyGrandfather"],
    ["aunt", "tía", "FamilyAunt"],
    ["uncle", "tío", "FamilyUncle"],
    ["cousin", "primo o prima", "FamilyCousin"],
    ["family", "familia", "UsersThree"],
  ].map(([english, spanish, iconName]) => ({
    id: english,
    spanish,
    english,
    iconName,
  })),
  "english-objects": [
    ["book", "libro", "BookOpen"],
    ["pencil", "lápiz", "Pencil"],
    ["chair", "silla", "Chair"],
    ["table", "mesa", "Table"],
    ["door", "puerta", "Door"],
    ["window", "ventana", "Browsers"],
    ["backpack", "mochila", "Backpack"],
    ["cup", "taza", "Coffee"],
    ["ball", "pelota", "Basketball"],
    ["clock", "reloj", "Clock"],
  ].map(([english, spanish, iconName]) => ({
    id: english,
    spanish,
    english,
    iconName,
  })),
  "english-actions": [
    ["run", "correr", "PersonSimpleRun"],
    ["jump", "saltar", "PersonSimple"],
    ["eat", "comer", "ForkKnife"],
    ["drink", "beber", "Coffee"],
    ["read", "leer", "BookOpen"],
    ["write", "escribir", "Pencil"],
    ["sing", "cantar", "Microphone"],
    ["dance", "bailar", "PersonSimpleTaiChi"],
    ["sleep", "dormir", "Bed"],
    ["play", "jugar", "GameController"],
  ].map(([english, spanish, iconName]) => ({
    id: english,
    spanish,
    english,
    iconName,
  })),
});

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mix(seed, offset = 0) {
  let value = (seed + Math.imul(offset + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  value ^= value >>> 15;
  return value >>> 0;
}

function pick(items, seed, offset = 0) {
  return items[mix(seed, offset) % items.length];
}

function rotate(items, amount) {
  if (!items.length) return [];
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asCandidate(value, index = 0) {
  if (typeof value === "object" && value !== null) {
    return {
      id: value.id ?? slugify(value.label ?? `option-${index + 1}`),
      label: String(value.label ?? value.value ?? value.id),
      iconName: value.iconName ?? null,
      tone: value.tone ?? null,
      value: value.value ?? value.label ?? value.id,
      meta: value.meta ?? null,
    };
  }

  return {
    id: slugify(value),
    label: String(value),
    iconName: null,
    tone: null,
    value,
    meta: null,
  };
}

function makeOptions(values, correctIndex, seed) {
  const candidates = values.map((value, index) => ({
    ...asCandidate(value, index),
    sourceIndex: index,
    isCorrect: index === correctIndex,
  }));

  const ordered = [...candidates].sort(
    (left, right) =>
      mix(seed, left.sourceIndex + 31) - mix(seed, right.sourceIndex + 31),
  );

  const seen = new Map();
  const options = ordered.map((candidate) => {
    const baseId = `option-${slugify(candidate.id || candidate.label)}`;
    const duplicateNumber = seen.get(baseId) ?? 0;
    seen.set(baseId, duplicateNumber + 1);
    return {
      id: duplicateNumber ? `${baseId}-${duplicateNumber + 1}` : baseId,
      label: candidate.label,
      iconName: candidate.iconName,
      tone: candidate.tone,
      value: candidate.value,
      meta: candidate.meta,
      isCorrect: candidate.isCorrect,
    };
  });

  const answerId = options.find((option) => option.isCorrect)?.id;
  return {
    options: options.map(({ isCorrect, ...option }) => option),
    answerId,
  };
}

/**
 * Cantidad de opciones visibles para un reto, según la edad, el número de
 * juego dentro de la categoría (0..GAME_COUNT-1) y la ronda. El techo por
 * edad es el mismo de siempre (age.difficulty + 1, tope 4, alineado con
 * check-nido-curriculum.mjs) y nunca se supera.
 *
 * En la ronda 0 los primeros juegos arrancan en el mínimo (2 opciones) y solo
 * alcanzan el techo hacia el final de las 20 rondas. Al repetir la categoría
 * el suelo sube: quien vuelve por segunda vez ya no empieza con la elección
 * más fácil que resolvió ayer. La ronda 0 conserva exactamente el reparto
 * anterior, que es el validado contra el audio profesional grabado.
 */
function optionCountForRound(age, gameIndex, round = 0, mastery = 0) {
  const baseCeiling = Math.min(age.difficulty + 1, 4);
  // A partir de la tercera vuelta el techo sube un escalón: quien ya resolvió
  // cuarenta retos de la categoría puede con una opción más, y sin esto 2–3
  // años se quedaba en dos opciones para siempre. Las rondas 0 y 1 conservan
  // el techo por edad que valida check-nido-curriculum.mjs.
  const raised = (round >= 2 ? 1 : 0) + (mastery > 0 ? 1 : 0);
  const maxCount = Math.min(4, baseCeiling + raised);
  // La racha limpia sube también el suelo, no sólo el techo: si únicamente
  // subiera el techo, la rampa por número de reto seguiría mandando y el niño
  // que acierta tres seguidas no notaría nada hasta el reto diez.
  const step = mastery > 0 ? 1 : mastery < 0 ? -1 : 0;
  const minCount = Math.min(
    maxCount,
    2 + Math.max(0, Math.min(Math.max(round, 0), 2) + step),
  );
  if (maxCount <= minCount) return maxCount;
  const progress = gameIndex / (GAME_COUNT - 1);
  const ramped = minCount + Math.round(progress * (maxCount - minCount));
  return Math.min(maxCount, Math.max(minCount, ramped));
}

/**
 * Traduce el marcador vivo de la ruta a un escalón de dificultad: 1 sube,
 * -1 baja, 0 deja el reto como está. Vive aquí, junto al resto de la política
 * de dificultad, para que la pantalla no decida por su cuenta.
 *
 * Se pide una racha limpia de tres retos para subir, y se baja sólo cuando los
 * intentos extra superan a los aciertos: al niño que falla una vez y se
 * recupera no se le castiga.
 */
export function nidoMasteryStep({ streak = 0, mistakes = 0, correct = 0 } = {}) {
  const solved = Math.max(correct, 1);
  const errorRate = mistakes / solved;
  if (streak >= 3 && errorRate <= 0.35) return 1;
  if (errorRate >= 1) return -1;
  return 0;
}

const HEX_COLOR = /^#([0-9a-f]{6})$/i;

function toRgb(tone) {
  const match = HEX_COLOR.exec(String(tone ?? ""));
  if (!match) return null;
  const value = Number.parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

/**
 * Distancia de color «redmean»: aproxima la percepción humana mucho mejor que
 * la euclídea cruda en RGB y no necesita convertir a Lab. Normalizada a 0..1.
 */
function colorDistance(left, right) {
  const meanRed = (left.r + right.r) / 2;
  const deltaR = left.r - right.r;
  const deltaG = left.g - right.g;
  const deltaB = left.b - right.b;
  const raw = Math.sqrt(
    (2 + meanRed / 256) * deltaR * deltaR +
      4 * deltaG * deltaG +
      (2 + (255 - meanRed) / 256) * deltaB * deltaB,
  );
  return Math.min(1, raw / 768);
}

/**
 * Cuánto se parecen dos opciones: 0 es «casi indistinguibles» y 1 es «no
 * comparten nada». Es lo que permite graduar la exigencia de un reto sin
 * cambiar ni la consigna ni el dibujo: enfrentar la respuesta correcta a un
 * naranja cuando ya es amarilla es mucho más difícil que enfrentarla a un
 * verde, aunque la pregunta hablada sea idéntica.
 *
 * Se promedian solo las señales que ambas opciones comparten, porque los
 * retos son muy distintos entre sí: unos se juegan con color, otros con
 * cantidades y otros solo con el dibujo.
 */
function optionDistance(correct, candidate) {
  const signals = [];

  const correctRgb = toRgb(correct.tone);
  const candidateRgb = toRgb(candidate.tone);
  if (correctRgb && candidateRgb) {
    signals.push(colorDistance(correctRgb, candidateRgb));
  }

  const correctValue = Number(correct.value);
  const candidateValue = Number(candidate.value);
  if (Number.isFinite(correctValue) && Number.isFinite(candidateValue)) {
    // Confundir 4 con 5 es normal a los cinco años; confundir 4 con 9 no.
    signals.push(Math.min(1, Math.abs(correctValue - candidateValue) / 5));
  }

  if (correct.iconName && candidate.iconName) {
    signals.push(correct.iconName === candidate.iconName ? 0.1 : 0.9);
  }

  if (!signals.length) {
    const left = String(correct.label ?? "").toLowerCase();
    const right = String(candidate.label ?? "").toLowerCase();
    if (left && right) {
      const shared = left[0] === right[0] ? 0.4 : 1;
      const lengthGap =
        Math.abs(left.length - right.length) / Math.max(left.length, right.length);
      signals.push(Math.min(1, shared * (0.6 + lengthGap)));
    }
  }

  if (!signals.length) return 0.5;
  return signals.reduce((total, value) => total + value, 0) / signals.length;
}

/**
 * Cuánto aprieta el reto, de 0 (distractores obvios) a 1 (distractores que
 * obligan a mirar dos veces). Sube dentro de la categoría y sigue subiendo al
 * repetirla, así que es el eje que hace progresar a 2–3 años, cuyo número de
 * opciones está fijado en dos por diseño.
 */
function distractorTension(gameIndex, round, mastery = 0) {
  const within = GAME_COUNT > 1 ? gameIndex / (GAME_COUNT - 1) : 1;
  const replays = Math.min(Math.max(round, 0), 3) / 3;
  // El escalón por rendimiento pesa tanto como saltarse media categoría: es lo
  // que hace que el reto responda al niño de hoy y no sólo a su edad.
  const adaptive = 0.3 * Math.max(-1, Math.min(1, mastery));
  return Math.max(0, Math.min(1, 0.15 + 0.6 * within + 0.25 * replays + adaptive));
}

/**
 * Escoge qué distractores sobreviven al recorte por edad. Antes se tomaban los
 * primeros del array ya barajado, así que la dificultad real de cada reto era
 * aleatoria: un mismo juego podía enfrentar «silla verde» contra «reloj rojo»
 * (trivial) o «silla naranja» contra «puerta amarilla» (exigente) sin ningún
 * patrón. Aquí se ordenan por parecido y se toma una ventana cuya posición
 * depende de la tensión, de modo que la dificultad crece de verdad.
 */
function pickDistractors(correct, pool, count, tension, seed) {
  if (count <= 0) return [];
  if (pool.length <= count) return pool;

  const ranked = pool
    .map((option, index) => ({
      option,
      index,
      distance: optionDistance(correct, option),
    }))
    .sort(
      (left, right) =>
        left.distance - right.distance ||
        mix(seed, left.index + 53) - mix(seed, right.index + 53),
    );

  // tension 1 → cabeza de la lista (los más parecidos); tension 0 → cola.
  const start = Math.round((1 - tension) * (ranked.length - count));
  return ranked.slice(start, start + count).map((entry) => entry.option);
}

/**
 * Cierres alentadores que rematan cada consigna hablada.
 *
 * Catorce por edad, no tres. Con tres, «¡Confío en ti!» aparecía en el 24% de
 * las 2460 locuciones del catálogo y «¡Tú puedes!» en el 19%: un niño que
 * encadena veinte retos oía la misma despedida siete veces y la narración se
 * volvía un runrún. Ninguno marca género —quien juega puede ser niña— ni
 * insinúa la respuesta, y cada uno pide una entonación distinta (susurro
 * cómplice, entusiasmo, ternura lenta) para que la maestra no lea siempre
 * igual. `coaching-lines.test.mjs` lo verifica.
 */
export const AGE_COACHING_LINES = Object.freeze({
    "2-3": [
      "Vamos despacito, sin apuro. ¡Tú puedes!",
      "Mira una cosita a la vez. ¡Lo harás genial!",
      "Respira, mira bien… ¡y elige con tu dedito!",
      "Cuando quieras, con tu dedito. ¡Aquí te espero!",
      "No hay ninguna prisa. ¡Tómate tu tiempito!",
      "Ojitos bien abiertos… ¡tú sabes cuál es!",
      "Primero miramos y después tocamos. ¡Así, muy bien!",
      "Yo te espero aquí. ¡Mira con toda tu calma!",
      "Cuenta hasta tres en tu cabecita… ¡y elige!",
      "Señala el que tú creas. ¡Confío en ti!",
      "Un ratito para pensar… ¡y ya está!",
      "Piensa con tu cabecita. ¡Qué bien lo haces!",
      "Sin miedo, que aquí nadie se equivoca. ¡Vamos!",
      "Mira bien el dibujo… ¡y toca cuando quieras!",
    ],
    "4-5": [
      "Piensa con calma y elige. ¡Confío en ti!",
      "Busca las pistas con tu lupa invisible. ¡Vamos!",
      "Tómate tu tiempo… ¡tú puedes con esto!",
      "Esto es una misión secreta. ¡Shhh, concéntrate!",
      "Mira otra vez con ojos de detective. ¡Adelante!",
      "Tu cabeza ya lo sabe. ¡Solo déjala pensar!",
      "Respira hondo… ¡y elige con toda tu valentía!",
      "¡Lupa en mano! Observa cada detalle. ¡Vamos allá!",
      "Cada pista guarda un secreto. ¡Escúchalas todas!",
      "Aquí nadie tiene prisa. ¡Piénsalo a tu ritmo!",
      "Confía en lo que ves. ¡Tu mente es muy sabia!",
      "Un pasito de pensamiento… ¡y a por ello!",
      "¡Qué gran aventura! Observa bien… ¡y decide!",
      "Somos un equipo. ¡Yo te acompaño y tú decides!",
    ],
    6: [
      "Piénsalo bien y demuestra lo que sabes. ¡Adelante!",
      "Analiza cada detalle con calma. ¡Confío en ti!",
      "Revisa con tus ojos de águila antes de elegir. ¡Tú puedes!",
      "Compara las opciones una por una. ¡Tú sabes hacerlo!",
      "Descarta lo que no encaja. ¡Esa es la estrategia!",
      "Tu razonamiento vale más que la prisa. ¡Demuéstralo!",
      "Lee, observa y decide. ¡Tienes todo lo necesario!",
      "Busca el detalle que marca la diferencia. ¡Vamos!",
      "Piensa como quien resuelve misterios. ¡Tú puedes!",
      "Nada de adivinar: razona y elige. ¡Con seguridad!",
      "Ya has llegado muy lejos. ¡Demuéstralo una vez más!",
      "Revisa tu idea antes de confirmarla. ¡Buen criterio!",
      "Tienes la mente afilada. ¡Úsala sin miedo!",
      "Observa el conjunto, no solo una parte. ¡Vamos allá!",
    ],
});

function makeChallenge(context, definition) {
  const {
    area,
    categoryItem,
    age,
    gameIndex,
    seed,
    round = 0,
    mastery = 0,
  } = context;
  const baseSpokenInstruction =
    definition.spokenInstruction ??
    `${definition.question} Escucha con atención, mira con calma y elige tu respuesta.`;
  const ageCoaching = AGE_COACHING_LINES;
  const coachingLines = ageCoaching[age.id];
  // La invariante que hay que respetar no es «un cierre por mecánica», sino
  // «el mismo cierre para todos los retos que comparten locución»: si dos retos
  // con idéntica consigna base recibieran cierres distintos, cada uno pasaría a
  // necesitar su propio mp3 y el catálogo grabado se multiplicaría. Derivarlo
  // del hash del texto base lo garantiza por construcción, y además reparte los
  // catorce cierres, cosa que el índice de mecánica no podía hacer: solo tomaba
  // diez valores. Los escritos a mano no comparten voz, así que ahí rotar con el
  // número de juego es gratis y da más variedad todavía.
  const coachingIndex = definition.sharedVoice
    ? hashSeed(baseSpokenInstruction)
    : Number.isInteger(definition.coachingIndex)
      ? definition.coachingIndex
      : gameIndex;
  const spokenInstruction = `${baseSpokenInstruction} ${coachingLines[coachingIndex % coachingLines.length]}`;
  const maximumOptionCount = optionCountForRound(age, gameIndex, round, mastery);
  const correctOption = definition.options.find(
    (option) => option.id === definition.answerId,
  );
  const visibleOptionIds = new Set([
    definition.answerId,
    ...pickDistractors(
      correctOption ?? {},
      definition.options.filter((option) => option.id !== definition.answerId),
      Math.max(0, maximumOptionCount - 1),
      distractorTension(gameIndex, round, mastery),
      seed,
    ).map((option) => option.id),
  ]);
  const ageAdjustedOptions = definition.options.filter((option) =>
    visibleOptionIds.has(option.id),
  );

  if (!correctOption || !ageAdjustedOptions.length) {
    throw new Error(
      `El reto ${area.id}/${categoryItem.id}/${age.id}/${gameIndex + 1} no tiene una respuesta visible.`,
    );
  }

  const challengeId = `${area.id}-${categoryItem.id}-${age.id}-${gameIndex + 1}`;
  const publicId = round ? `${challengeId}-ronda-${round + 1}` : challengeId;
  // Cuando la narración no depende del reto concreto, varios retos comparten
  // una única pista de audio: la clave sale del propio texto hablado, así que
  // dos retos comparten archivo exactamente cuando dicen lo mismo.
  const voiceId = definition.sharedVoice
    ? `voz-${age.id}-${hashSeed(spokenInstruction).toString(36)}`
    : challengeId;

  return Object.freeze({
    id: publicId,
    areaId: area.id,
    categoryId: categoryItem.id,
    ageId: age.id,
    gameIndex,
    gameNumber: gameIndex + 1,
    totalGames: categoryItem.gameCount,
    difficulty: age.difficulty,
    instructionStyle: age.instructionStyle,
    interaction:
      definition.interaction ??
      NIDO_ROUTE_INTERACTIONS[`${area.id}:${categoryItem.id}`] ??
      "tap",
    question: definition.question,
    prompt: definition.question,
    spokenInstruction,
    voice: spokenInstruction,
    audioId: round ? null : voiceId,
    visualType: definition.visualType,
    visual: Object.freeze({
      kind: definition.visualKind,
      ageProfile: age.id,
      complexity: age.difficulty,
      ...definition.visual,
    }),
    options: Object.freeze(ageAdjustedOptions),
    answerId: definition.answerId,
    answer: definition.answerId,
    iconMetadata: Object.freeze({
      area: area.iconName,
      category: categoryItem.iconName,
      speaker: "SpeakerHigh",
      success: "CheckCircle",
    }),
    seed,
  });
}

function logicChallenge(context) {
  const { categoryItem, age, gameIndex, seed } = context;

  if (categoryItem.strategy === "detective") {
    const shape = pick(SHAPES.slice(0, 3 + age.difficulty), seed, 1);
    const color = pick(COLORS.slice(0, 6), seed, 2);
    const otherShape = pick(
      SHAPES.filter((item) => item.id !== shape.id),
      seed,
      3,
    );
    const otherColor = pick(
      COLORS.slice(0, 6).filter((item) => item.id !== color.id),
      seed,
      4,
    );
    const choices = [
      {
        id: `${shape.id}-${color.id}`,
        label: `${shape.label} de color ${color.label}`,
        iconName: shape.iconName,
        tone: color.tone,
      },
      {
        id: `${otherShape.id}-${color.id}`,
        label: `${otherShape.label} de color ${color.label}`,
        iconName: otherShape.iconName,
        tone: color.tone,
      },
      {
        id: `${shape.id}-${otherColor.id}`,
        label: `${shape.label} de color ${otherColor.label}`,
        iconName: shape.iconName,
        tone: otherColor.tone,
      },
    ];
    const answer = makeOptions(choices, 0, seed);

    return makeChallenge(context, {
      question: `¿Dónde está el ${shape.label} de color ${color.label}?`,
      spokenInstruction: `¡Detective a la obra! Se esconde un ${shape.label} de color ${color.label}. Mira las dos pistas con tus ojos de lupa… ¿dónde está?`,
      visualType: "choice-grid",
      visualKind: "detective-clues",
      visual: {
        clues: [
          { type: "shape", value: shape.id, label: shape.label, iconName: shape.iconName },
          { type: "color", value: color.id, label: color.label, tone: color.tone },
        ],
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "one-more") {
    const amount = 1 + ((gameIndex + age.difficulty) % (4 + age.difficulty * 2));
    const result = amount + 1;
    const answer = makeOptions(
      [result, Math.max(1, result - 1), result + 1].map((value) => ({
        id: `number-${value}`,
        label: String(value),
        value,
        iconName: "NumberCircleOne",
      })),
      0,
      seed,
    );

    return makeChallenge(context, {
      question: `Hay ${amount}. Si agregamos uno más, ¿cuántos hay?`,
      spokenInstruction: `Hay ${amount} en la fila… ¡y llega uno más! Cuenta conmigo despacito: ¿cuántos hay ahora? Toca el número.`,
      visualType: "quantity",
      visualKind: "add-one",
      visual: {
        count: amount,
        addedCount: 1,
        itemIconName: pick(["Circle", "Star", "Flower", "Balloon"], seed, 5),
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "color-pattern") {
    const colorA = pick(COLORS.slice(0, 6), seed, 1);
    const colorB = pick(
      COLORS.slice(0, 6).filter((item) => item.id !== colorA.id),
      seed,
      2,
    );
    const colorC = pick(
      COLORS.slice(0, 6).filter(
        (item) => item.id !== colorA.id && item.id !== colorB.id,
      ),
      seed,
      3,
    );
    const usesThree = age.difficulty >= 3 && gameIndex % 2 === 1;
    const pattern = usesThree ? [colorA, colorB, colorC] : [colorA, colorB];
    const length = 4 + age.difficulty;
    const sequence = Array.from(
      { length },
      (_, index) => pattern[index % pattern.length],
    );
    const correct = pattern[length % pattern.length];
    const answer = makeOptions(
      [correct, ...[colorA, colorB, colorC].filter((item) => item.id !== correct.id)]
        .slice(0, 3),
      0,
      seed,
    );

    return makeChallenge(context, {
      question: "¿Qué color continúa la serie?",
      spokenInstruction: `¡Qué patrón tan bonito! Mira el orden de los colores. Después del ${sequence.at(-1).label}… ¿cuál sigue? ¡Tócalo!`,
      visualType: "sequence",
      visualKind: "color-pattern",
      visual: {
        items: sequence.map(({ id, label, tone }) => ({ id, label, tone })),
        missingPosition: "end",
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "odd-one-out") {
    const family = pick(LOGIC_FAMILIES, seed, 1);
    const answer = makeOptions(
      [...rotate(family.members, gameIndex), family.outsider],
      family.members.length,
      seed,
    );

    return makeChallenge(context, {
      question: "¿Qué elemento sobra?",
      spokenInstruction: `Casi todos son ${family.name}… ¡pero se coló un invitado sorpresa! Descubre cuál no pertenece al grupo y tócalo.`,
      visualType: "choice-grid",
      visualKind: "odd-one-out",
      visual: { family: family.name },
      ...answer,
    });
  }

  if (categoryItem.strategy === "real-or-imaginary") {
    const set = pick(REAL_AND_IMAGINARY, seed, 1);
    const answer = makeOptions([set.real, ...set.imaginary], 0, seed);

    return makeChallenge(context, {
      question: "¿Cuál de estas opciones existe en el mundo real?",
      spokenInstruction: `Piensa bien: ¿cuál de estos existe de verdad en el mundo real? Cuando lo sepas… ¡tócalo!`,
      visualType: "choice-grid",
      visualKind: "real-or-imaginary",
      visual: { topic: gameIndex % 2 ? "seres y objetos" : "mundo real" },
      ...answer,
    });
  }

  const shape = pick(SHAPES.slice(0, 3 + age.difficulty), seed, 1);
  const targetColor = pick(COLORS.slice(0, 6), seed, 2);
  const distractorColors = COLORS.slice(0, 6)
    .filter((item) => item.id !== targetColor.id)
    .slice(0, 2);
  const choices = [
    {
      id: `${shape.id}-${targetColor.id}`,
      label: `${shape.label} escondido de color ${targetColor.label}`,
      iconName: shape.iconName,
      tone: targetColor.tone,
    },
    ...distractorColors.map((color) => ({
      id: `${shape.id}-${color.id}`,
      label: `${shape.label} de color ${color.label}`,
      iconName: shape.iconName,
      tone: color.tone,
    })),
  ];
  const answer = makeOptions(choices, 0, seed);

  return makeChallenge(context, {
    question: `¿Cuál ${shape.label} está camuflado en el fondo ${targetColor.label}?`,
    spokenInstruction: `Shhh… ¡hay una figura escondida! Busca el ${shape.label} de color ${targetColor.label}, el que se camufla con el fondo. ¡Atrápalo!`,
    visualType: "choice-grid",
    visualKind: "camouflage",
    visual: {
      backgroundTone: targetColor.tone,
      targetShape: shape.id,
      contrast: Math.max(0.12, 0.32 - age.difficulty * 0.04),
    },
    ...answer,
  });
}

function mathChallenge(context) {
  const { categoryItem, age, gameIndex, seed } = context;

  if (categoryItem.strategy === "size-comparison") {
    const askLarge = gameIndex % 2 === 0;
    const itemIconName = pick(
      ["Balloon", "Tree", "FishSimple", "Flower", "House"],
      seed,
      1,
    );
    const choices = [
      {
        id: askLarge ? "large" : "small",
        label: askLarge ? "El grande" : "El pequeño",
        iconName: itemIconName,
        meta: { scale: askLarge ? 1.35 : 0.7 },
      },
      {
        id: askLarge ? "small" : "large",
        label: askLarge ? "El pequeño" : "El grande",
        iconName: itemIconName,
        meta: { scale: askLarge ? 0.7 : 1.35 },
      },
    ];
    const answer = makeOptions(choices, 0, seed);

    return makeChallenge(context, {
      question: `¿Cuál es ${askLarge ? "más grande" : "más pequeño"}?`,
      spokenInstruction: `Uno es grandote y el otro pequeñito. Compáralos con calma y toca el que es ${askLarge ? "más grande" : "más pequeño"}.`,
      visualType: "comparison",
      visualKind: "size-pair",
      visual: { itemIconName, relation: askLarge ? "largest" : "smallest" },
      ...answer,
    });
  }

  if (categoryItem.strategy === "shape-properties") {
    const eligibleShapes = SHAPES.filter(
      (shape) => shape.sides > 0 && shape.sides <= 2 + age.difficulty + 2,
    );
    const target = pick(eligibleShapes, seed, 1);
    const others = rotate(
      SHAPES.filter((shape) => shape.id !== target.id && shape.sides > 0),
      gameIndex,
    ).slice(0, 2);
    const askBySides = age.difficulty >= 2 && gameIndex % 2 === 1;
    const answer = makeOptions([target, ...others], 0, seed);

    return makeChallenge(context, {
      question: askBySides
        ? `¿Qué figura tiene ${target.sides} lados?`
        : `¿Cuál es el ${target.label}?`,
      spokenInstruction: askBySides
        ? `¡A contar laditos! Recorre cada figura con tu dedito y toca la que tiene ${target.sides} lados.`
        : `Mira estas figuras tan bonitas… ¿dónde está el ${target.label}? ¡Tócalo!`,
      visualType: "choice-grid",
      visualKind: "shape-properties",
      visual: { clue: askBySides ? { sides: target.sides } : { name: target.label } },
      ...answer,
    });
  }

  if (categoryItem.strategy === "quantity-comparison") {
    const base = 1 + ((gameIndex + age.difficulty) % (3 + age.difficulty));
    const gap = 1 + (mix(seed, 2) % Math.min(3, age.difficulty + 1));
    const counts = [base, base + gap];
    const askMost = gameIndex % 2 === 0;
    const correctIndex = askMost ? 1 : 0;
    const answer = makeOptions(
      counts.map((count, index) => ({
        id: `group-${index + 1}`,
        label: `Grupo ${index + 1}`,
        iconName: "CirclesThreePlus",
        meta: { count },
      })),
      correctIndex,
      seed,
    );

    return makeChallenge(context, {
      question: `¿Qué grupo tiene ${askMost ? "muchos" : "pocos"} elementos?`,
      spokenInstruction: `¡A contar! Cuenta los dos grupos con tu dedito, uno por uno, y toca el que tiene ${askMost ? "más" : "menos"}.`,
      visualType: "quantity",
      visualKind: "quantity-groups",
      visual: {
        groups: counts.map((count, index) => ({
          id: `group-${index + 1}`,
          count,
          itemIconName: pick(["Circle", "Star", "Flower"], seed, index + 4),
        })),
        relation: askMost ? "most" : "least",
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "size-order") {
    const ascending = gameIndex % 2 === 0;
    const sizes = [
      { id: "small", label: "pequeño", scale: 0.65 },
      { id: "medium", label: "mediano", scale: 1 },
      { id: "large", label: "grande", scale: 1.35 },
    ];
    const correct = ascending
      ? "pequeño, mediano, grande"
      : "grande, mediano, pequeño";
    const answer = makeOptions(
      [
        { id: "correct-order", label: correct, iconName: "SortAscending" },
        {
          id: "reverse-order",
          label: ascending
            ? "grande, mediano, pequeño"
            : "pequeño, mediano, grande",
          iconName: "SortDescending",
        },
        {
          id: "mixed-order",
          label: "mediano, pequeño, grande",
          iconName: "ArrowsDownUp",
        },
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: `¿Cuál es el orden de ${ascending ? "pequeño a grande" : "grande a pequeño"}?`,
      spokenInstruction: `Como una escalerita: mira los tres tamaños y elige el orden que va de ${ascending ? "pequeño a grande" : "grande a pequeño"}.`,
      visualType: "comparison",
      visualKind: "size-order",
      visual: {
        items: rotate(sizes, mix(seed, 3) % sizes.length),
        itemIconName: pick(["Balloon", "Tree", "Circle", "House"], seed, 4),
        direction: ascending ? "ascending" : "descending",
      },
      ...answer,
    });
  }

  const step = 1 + ((gameIndex + age.difficulty) % Math.min(4, age.difficulty + 1));
  const start = 1 + (mix(seed, 2) % (3 + age.difficulty));
  const length = 3 + Math.min(2, age.difficulty);
  const sequence = Array.from({ length }, (_, index) => start + index * step);
  const result = start + length * step;
  const answer = makeOptions(
    [result, result - 1, result + step].map((value) => ({
      id: `number-${value}`,
      label: String(value),
      value,
      iconName: "NumberCircleOne",
    })),
    0,
    seed,
  );

  return makeChallenge(context, {
    question: "¿Qué número continúa el patrón?",
    spokenInstruction: `Escucha esta serie mágica: ${sequence.join(", ")}… ¿Descubriste el truco? ¡Toca el número que sigue!`,
    visualType: "sequence",
    visualKind: "number-pattern",
    visual: { items: sequence, step, missingPosition: "end" },
    ...answer,
  });
}

function attentionChallenge(context) {
  const { categoryItem, age, gameIndex, seed } = context;

  if (categoryItem.strategy === "mask-match") {
    const expression = pick(MASK_EXPRESSIONS, seed, 1);
    const color = pick(COLORS.slice(0, 6), seed, 2);
    const otherExpression = pick(
      MASK_EXPRESSIONS.filter((item) => item.id !== expression.id),
      seed,
      3,
    );
    const otherColor = pick(
      COLORS.slice(0, 6).filter((item) => item.id !== color.id),
      seed,
      4,
    );
    const answer = makeOptions(
      [
        {
          id: `${expression.id}-${color.id}`,
          label: `máscara ${expression.label} de color ${color.label}`,
          iconName: expression.iconName,
          tone: color.tone,
        },
        {
          id: `${otherExpression.id}-${color.id}`,
          label: `máscara ${otherExpression.label} de color ${color.label}`,
          iconName: otherExpression.iconName,
          tone: color.tone,
        },
        {
          id: `${expression.id}-${otherColor.id}`,
          label: `máscara ${expression.label} de color ${otherColor.label}`,
          iconName: expression.iconName,
          tone: otherColor.tone,
        },
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: `¿Cuál máscara está ${expression.label} y es de color ${color.label}?`,
      spokenInstruction: `¡Memoria de elefante! La máscara es ${expression.label} y de color ${color.label}. Encuentra la que tiene las dos cosas y tócala.`,
      visualType: "memory",
      visualKind: "mask-match",
      visual: {
        model: {
          expression: expression.id,
          iconName: expression.iconName,
          tone: color.tone,
        },
        previewSeconds: Math.max(2, 6 - age.difficulty),
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "drawing-detail") {
    const details = [
      { id: "sun", label: "sol", iconName: "Sun" },
      { id: "cloud", label: "nube", iconName: "Cloud" },
      { id: "tree", label: "árbol", iconName: "Tree" },
      { id: "house", label: "casa", iconName: "House" },
      { id: "flower", label: "flor", iconName: "Flower" },
      { id: "bird", label: "ave", iconName: "Bird" },
    ];
    const target = pick(details, seed, 1);
    const others = rotate(
      details.filter((item) => item.id !== target.id),
      gameIndex,
    ).slice(0, 3);
    const answer = makeOptions([target, ...others], 0, seed);

    return makeChallenge(context, {
      question: `¿Dónde está el ${target.label} en el dibujo?`,
      spokenInstruction: `Explora el dibujo como un aventurero: en algún rincón se esconde el ${target.label}. Cuando lo veas… ¡tócalo!`,
      visualType: "choice-grid",
      visualKind: "drawing-detail",
      visual: {
        sceneId: `park-${(gameIndex % 5) + 1}`,
        targetId: target.id,
        detailCount: 5 + age.difficulty * 2,
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "hidden-character") {
    const character = pick(CHARACTER_CLUES, seed, 1);
    const others = rotate(
      CHARACTER_CLUES.filter((item) => item.id !== character.id),
      gameIndex,
    ).slice(0, 2);
    const cover = pick(
      [
        { id: "tree", label: "árbol", iconName: "Tree" },
        { id: "door", label: "puerta", iconName: "Door" },
        { id: "box", label: "caja", iconName: "Package" },
        { id: "curtain", label: "cortina", iconName: "Rectangle" },
      ],
      seed,
      2,
    );
    const answer = makeOptions([character, ...others], 0, seed);

    return makeChallenge(context, {
      question: `¿Quién está escondido detrás de ${cover.label === "árbol" ? "un" : "una"} ${cover.label}?`,
      spokenInstruction: `${character.clue} Mmm… ¿quién puede ser? ¡Resuelve el misterio y toca a ese personaje!`,
      visualType: "memory",
      visualKind: "hidden-character",
      visual: {
        cover,
        clue: character.clue,
        revealAfterAnswer: true,
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "character-clue") {
    const character = pick(CHARACTER_CLUES, seed, 1);
    const others = rotate(
      CHARACTER_CLUES.filter((item) => item.id !== character.id),
      gameIndex + 2,
    ).slice(0, 3);
    const answer = makeOptions([character, ...others], 0, seed);

    return makeChallenge(context, {
      question: `¿Quién está aquí? Pista: ${character.clue}`,
      spokenInstruction: `${character.clue} Mira a todos con mucha atención… ¡y toca a quien acaba de llegar!`,
      visualType: "choice-grid",
      visualKind: "character-clue",
      visual: { clue: character.clue },
      ...answer,
    });
  }

  if (categoryItem.strategy === "twin-match") {
    const shape = pick(SHAPES.slice(0, 3 + age.difficulty), seed, 1);
    const color = pick(COLORS.slice(0, 6), seed, 2);
    const mark = pick(["dot", "line", "small-circle", "corner"], seed, 3);
    const otherShape = pick(
      SHAPES.filter((item) => item.id !== shape.id),
      seed,
      4,
    );
    const otherColor = pick(
      COLORS.slice(0, 6).filter((item) => item.id !== color.id),
      seed,
      5,
    );
    const markLabel =
      {
        dot: "un punto",
        line: "una línea",
        "small-circle": "un círculo pequeño",
        corner: "una esquina",
      }[mark] ?? "una marca";
    const answer = makeOptions(
      [
        {
          id: `${shape.id}-${color.id}-${mark}`,
          label: `${shape.label} ${color.label} con ${markLabel}`,
          iconName: shape.iconName,
          tone: color.tone,
          meta: { mark },
        },
        {
          id: `${otherShape.id}-${color.id}-${mark}`,
          label: `${otherShape.label} ${color.label} con ${markLabel}`,
          iconName: otherShape.iconName,
          tone: color.tone,
          meta: { mark },
        },
        {
          id: `${shape.id}-${otherColor.id}-${mark}`,
          label: `${shape.label} ${otherColor.label} con ${markLabel}`,
          iconName: shape.iconName,
          tone: otherColor.tone,
          meta: { mark },
        },
        {
          id: `${shape.id}-${color.id}-different-mark`,
          label: `${shape.label} ${color.label} con una equis`,
          iconName: shape.iconName,
          tone: color.tone,
          meta: { mark: "different-mark" },
        },
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: "¿Cuál es exactamente igual al modelo?",
      spokenInstruction: "¡Búsqueda de gemelos! Compara la forma, el color y la marca… ¡y toca al gemelo idéntico!",
      visualType: "memory",
      visualKind: "twin-match",
      visual: {
        model: {
          shape: shape.id,
          iconName: shape.iconName,
          tone: color.tone,
          mark,
        },
        previewSeconds: Math.max(2, 6 - age.difficulty),
      },
      ...answer,
    });
  }

  const sceneItems = [
    { id: "sun", label: "sol", iconName: "Sun" },
    { id: "tree", label: "árbol", iconName: "Tree" },
    { id: "house", label: "casa", iconName: "House" },
    { id: "bird", label: "ave", iconName: "Bird" },
    { id: "flower", label: "flor", iconName: "Flower" },
    { id: "cloud", label: "nube", iconName: "Cloud" },
  ];
  const changed = pick(sceneItems, seed, 1);
  const alternatives = rotate(
    sceneItems.filter((item) => item.id !== changed.id),
    gameIndex,
  ).slice(0, 3);
  const changeType = pick(["color", "position", "size", "missing"], seed, 2);
  const answer = makeOptions([changed, ...alternatives], 0, seed);

  return makeChallenge(context, {
    question: "¿Qué elemento cambió entre los dos dibujos?",
    spokenInstruction: `Dos dibujos casi iguales… ¡pero algo cambió! Mira con mucho cuidado y toca lo que es diferente.`,
    visualType: "memory",
    visualKind: "difference",
    visual: {
      sceneA: `garden-${(gameIndex % 4) + 1}-a`,
      sceneB: `garden-${(gameIndex % 4) + 1}-b`,
      changedItemId: changed.id,
      changeType,
    },
    ...answer,
  });
}

function speechChallenge(context) {
  const { categoryItem, gameIndex, seed } = context;

  if (categoryItem.strategy === "animal-young") {
    const pair = pick(ANIMAL_YOUNG, seed, 1);
    const adultPossessive =
      pair.article === "la" ? `de la ${pair.adult}` : `del ${pair.adult}`;
    const distractors = rotate(
      ANIMAL_YOUNG.filter((item) => item.young !== pair.young),
      gameIndex,
    ).slice(0, 2);
    const answer = makeOptions(
      [
        { id: pair.young, label: pair.young, iconName: pair.youngIcon },
        ...distractors.map((item) => ({
          id: item.young,
          label: item.young,
          iconName: item.youngIcon,
        })),
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: `¿Cómo se llama la cría ${adultPossessive}?`,
      spokenInstruction: `¿Sabías que la cría ${adultPossessive} se llama ${pair.young}? Dilo conmigo: ¡${pair.young}! Ahora toca su imagen.`,
      visualType: "speech",
      visualKind: "animal-young",
      visual: {
        adult: { label: pair.adult, iconName: pair.adultIcon },
        repeatWord: pair.young,
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "spoken-question") {
    const item = pick(SPOKEN_QUESTIONS, seed, 1);
    const distractors = rotate(
      SPOKEN_QUESTIONS.filter((candidate) => candidate.answer !== item.answer),
      gameIndex,
    ).slice(0, 2);
    const answer = makeOptions(
      [
        { id: item.answer, label: item.answer, iconName: item.iconName },
        ...distractors.map((candidate) => ({
          id: candidate.answer,
          label: candidate.answer,
          iconName: candidate.iconName,
        })),
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: item.question,
      spokenInstruction: `${item.question} Piénsalo… dilo en voz alta con tu vocecita… ¡y toca la respuesta!`,
      visualType: "speech",
      visualKind: "spoken-question",
      visual: { listenFirst: true, repeatAnswer: item.answer },
      ...answer,
    });
  }

  if (categoryItem.strategy === "emotion") {
    const emotion = pick(EMOTIONS, seed, 1);
    const distractors = rotate(
      EMOTIONS.filter((item) => item.id !== emotion.id),
      gameIndex,
    ).slice(0, 2);
    const answer = makeOptions([emotion, ...distractors], 0, seed);

    return makeChallenge(context, {
      question: `¿Qué emoción siente? ${emotion.context}`,
      spokenInstruction: `${emotion.context} Esa emoción se llama ${emotion.label}. Dilo conmigo: ¡${emotion.label}! Y ahora tócala.`,
      visualType: "speech",
      visualKind: "emotion-scene",
      visual: {
        context: emotion.context,
        expressionIconName: emotion.iconName,
        repeatWord: emotion.label,
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "animal-food") {
    const pair = pick(ANIMAL_FOODS, seed, 1);
    const animalSubject = `${pair.article} ${pair.animal}`;
    const animalSubjectCapitalized =
      animalSubject.charAt(0).toUpperCase() + animalSubject.slice(1);
    const distractors = rotate(
      ANIMAL_FOODS.filter((item) => item.food !== pair.food),
      gameIndex,
    ).slice(0, 2);
    const answer = makeOptions(
      [
        { id: pair.food, label: pair.food, iconName: pair.foodIcon },
        ...distractors.map((item) => ({
          id: item.food,
          label: item.food,
          iconName: item.foodIcon,
        })),
      ],
      0,
      seed,
    );

    return makeChallenge(context, {
      question: `¿Qué come ${animalSubject}?`,
      spokenInstruction: `¡Ñam, ñam! ${animalSubjectCapitalized} come ${pair.food}. Repite la frase conmigo… ¡y toca ${pair.food}!`,
      visualType: "speech",
      visualKind: "animal-food",
      visual: {
        subject: { label: pair.animal, iconName: pair.animalIcon },
        repeatPhrase: `${animalSubjectCapitalized} come ${pair.food}.`,
      },
      ...answer,
    });
  }

  if (categoryItem.strategy === "position") {
    const position = pick(POSITIONS, seed, 1);
    const positionPhrase =
      position.id === "between"
        ? "entre las dos referencias"
        : `${position.label} la referencia`;
    const distractors = rotate(
      POSITIONS.filter((item) => item.id !== position.id),
      gameIndex,
    ).slice(0, 2);
    const subjectIconName = pick(["Basketball", "Cat", "BookOpen", "Star"], seed, 2);
    const referenceIconName = pick(["Cube", "Table", "Chair", "House"], seed, 3);
    const answer = makeOptions([position, ...distractors], 0, seed);

    return makeChallenge(context, {
      question: `¿Dónde está el objeto respecto de la referencia?`,
      spokenInstruction: `Mira bien dónde está: ${positionPhrase}. Dilo conmigo: ¡${position.label}! Y toca esa opción.`,
      visualType: "speech",
      visualKind: "position-scene",
      visual: {
        subjectIconName,
        referenceIconName,
        position: position.id,
        repeatPhrase: position.label,
      },
      ...answer,
    });
  }

  const pair = pick(HABITATS, seed, 1);
  const animalSubject = `${pair.article} ${pair.animal}`;
  const animalSubjectCapitalized =
    animalSubject.charAt(0).toUpperCase() + animalSubject.slice(1);
  const distractors = rotate(
    HABITATS.filter((item) => item.habitat !== pair.habitat),
    gameIndex,
  ).slice(0, 2);
  const answer = makeOptions(
    [
      { id: pair.habitat, label: pair.habitat, iconName: pair.habitatIcon },
      ...distractors.map((item) => ({
        id: item.habitat,
        label: item.habitat,
        iconName: item.habitatIcon,
      })),
    ],
    0,
    seed,
  );

  return makeChallenge(context, {
    question: `¿Dónde vive ${animalSubject}?`,
    spokenInstruction: `¿Dónde vive? ${animalSubjectCapitalized} vive en ${pair.habitatPhrase}. Repítelo conmigo… ¡y toca ${pair.habitat}!`,
    visualType: "speech",
    visualKind: "habitat-match",
    visual: {
      subject: { label: pair.animal, iconName: pair.animalIcon },
      repeatPhrase: `${animalSubjectCapitalized} vive en ${pair.habitatPhrase}.`,
    },
    ...answer,
  });
}

// Apoyo visual en español del área de inglés: en las primeras rondas el
// español acompaña siempre a la palabra en inglés; en las rondas intermedias
// solo aparece la primera vez que la ruta presenta esa palabra; en las
// rondas avanzadas/expertas desaparece (solo audio + imagen). Es una capa
// puramente visual: la narración (y su audio pregrabado) no cambia nunca.
const ENGLISH_SUPPORT_FULL_UNTIL = 7;
const ENGLISH_SUPPORT_NONE_FROM = 14;

function englishWordIndex(words, age, gameIndex) {
  return (
    (gameIndex + (age.difficulty - 1) * Math.max(1, words.length / 5)) %
    words.length
  );
}

function englishSpanishSupport({ words, age, gameIndex }) {
  if (age.id === "2-3") return true;
  if (gameIndex < ENGLISH_SUPPORT_FULL_UNTIL) return true;
  if (gameIndex >= ENGLISH_SUPPORT_NONE_FROM) return false;
  const current = englishWordIndex(words, age, gameIndex);
  for (let earlier = 0; earlier < gameIndex; earlier += 1) {
    if (englishWordIndex(words, age, earlier) === current) return false;
  }
  return true;
}

function englishChallenge(context) {
  const { categoryItem, age, gameIndex, seed } = context;
  const words = ENGLISH_VOCABULARY[categoryItem.strategy];
  const item =
    words[
      (gameIndex + (age.difficulty - 1) * Math.max(1, words.length / 5)) %
        words.length
    ];
  const reverse =
    age.id === "2-3"
      ? false
      : age.id === "4-5"
        ? gameIndex >= 10
        : gameIndex % 2 === 1;
  const distractors = rotate(
    words.filter((candidate) => candidate.id !== item.id),
    mix(seed, 1),
  ).slice(0, 3);
  const answer = makeOptions(
    [item, ...distractors].map((candidate) => ({
      id: candidate.id,
      label: reverse ? candidate.spanish : candidate.english,
      iconName: candidate.iconName,
      tone: candidate.tone,
      value: reverse ? candidate.spanish : candidate.english,
      meta: {
        spanish: candidate.spanish,
        english: candidate.english,
        numericValue: candidate.value ?? null,
      },
    })),
    0,
    seed,
  );

  const question = reverse
    ? age.id === "6"
      ? `Listen and choose: what does “${item.english}” mean?`
      : `What does “${item.english}” mean?`
    : age.id === "2-3"
      ? `Escucha: ¿dónde está “${item.english}”?`
      : `¿Cómo se dice “${item.spanish}” en inglés?`;
  const spokenInstruction = reverse
    ? age.id === "6"
      ? `Listen carefully: ${item.english}. Can you say it out loud? Great! Now choose what it means in Spanish.`
      : `Listen: ${item.english}. En español significa ${item.spanish}. ¡Muy bien! Ahora toca ${item.spanish}.`
    : age.id === "2-3"
      ? `Escucha esta palabra mágica: ${item.english}. Repite conmigo: ¡${item.english}! Ahora búscala en los dibujos y tócala.`
      : age.id === "6"
        ? `How do you say ${item.spanish} in English? Say it out loud with me… then touch the word!`
        : `Escucha y repite conmigo: ${item.english}… ¡${item.english}! ¿Ya lo dijiste? ¡Ahora tócalo!`;

  // En modo inverso la palabra grande en inglés ES la consigna, siempre se
  // muestra; el retiro gradual solo aplica al apoyo en español del modo
  // directo (es→en).
  const spanishSupport = reverse
    ? true
    : englishSpanishSupport({ words, age, gameIndex });

  return makeChallenge(context, {
    question,
    spokenInstruction,
    visualType: "word-match",
    visualKind: categoryItem.strategy,
    visual: {
      sourceLanguage: reverse ? "en" : "es",
      targetLanguage: reverse ? "es" : "en",
      word: reverse ? item.english : spanishSupport ? item.spanish : null,
      spanishSupport,
      iconName: item.iconName,
      tone: item.tone ?? null,
      numericValue: item.value ?? null,
      repeatWord: item.english,
    },
    ...answer,
  });
}

/**
 * Puente hacia el catálogo generado: la matriz decide qué se pregunta y con qué
 * dibujos, y aquí se convierte en el mismo formato que producen los juegos
 * escritos a mano (opciones barajadas, cierre alentador, id de audio).
 */
function matrixChallenge(context) {
  const { categoryItem, age, gameIndex, seed } = context;
  const definition = buildMatrixDefinition({
    blueprint: categoryItem.blueprint,
    age,
    gameIndex,
    seed,
    helpers: { pick, mix, rotate },
  });
  const { options, answerId } = makeOptions(
    definition.choices,
    definition.correctIndex,
    seed,
  );

  return makeChallenge(context, {
    ...definition,
    sharedVoice: true,
    options,
    answerId,
  });
}

const AREA_BUILDERS = Object.freeze({
  logica: logicChallenge,
  matematicas: mathChallenge,
  atencion: attentionChallenge,
  habla: speechChallenge,
  ingles: englishChallenge,
});

export function getCurriculumArea(areaId) {
  return NIDO_CURRICULUM.find((area) => area.id === areaId) ?? null;
}

export function getCurriculumCategory(areaId, categoryId) {
  return (
    getCurriculumArea(areaId)?.categories.find(
      (categoryItem) => categoryItem.id === categoryId,
    ) ?? null
  );
}

// `round` habilita rondas infinitas: cada ronda re-siembra los 20 retos con
// combinaciones nuevas. La ronda 0 conserva la semilla original para que la
// narración profesional pregrabada siga coincidiendo con sus textos.
export function buildCurriculumChallenge({
  areaId,
  categoryId,
  ageId,
  gameIndex,
  round = 0,
  mastery = 0,
}) {
  const area = getCurriculumArea(areaId);
  if (!area) {
    throw new RangeError(`Área de Nido desconocida: ${areaId}`);
  }

  const categoryItem = getCurriculumCategory(areaId, categoryId);
  if (!categoryItem) {
    throw new RangeError(
      `Subcategoría desconocida para ${area.name}: ${categoryId}`,
    );
  }

  const age = NIDO_AGE_GROUPS.find((item) => item.id === ageId);
  if (!age) {
    throw new RangeError(`Rango de edad de Nido desconocido: ${ageId}`);
  }

  if (!Number.isInteger(gameIndex) || gameIndex < 0 || gameIndex >= GAME_COUNT) {
    throw new RangeError(
      `gameIndex debe ser un entero entre 0 y ${GAME_COUNT - 1}.`,
    );
  }

  const safeRound = Number.isInteger(round) && round > 0 ? round : 0;
  const seed = hashSeed(
    safeRound
      ? `${areaId}|${categoryId}|${ageId}|${gameIndex}|ronda-${safeRound}`
      : `${areaId}|${categoryId}|${ageId}|${gameIndex}`,
  );
  const build =
    categoryItem.strategy === MATRIX_STRATEGY
      ? matrixChallenge
      : AREA_BUILDERS[areaId];
  const challenge = build({
    area,
    categoryItem,
    age,
    gameIndex,
    seed,
    round: safeRound,
    // Sin señal de rendimiento el reto sale exactamente igual que antes: los
    // scripts de validación y el audio grabado siguen viendo el mismo catálogo.
    mastery: Math.max(-1, Math.min(1, Number(mastery) || 0)),
  });

  if (
    !safeRound &&
    areaId === "atencion" &&
    categoryId === "mascaras" &&
    ageId === "2-3" &&
    gameIndex === 0
  ) {
    const teddyWithBow = Object.freeze({
      id: "teddy-with-bow",
      label: "Osito con moño",
      imageSrc: "/assets/nido/activities/teddy-with-bow-v1.jpg",
    });
    const teddyWithoutBow = Object.freeze({
      id: "teddy-without-bow",
      label: "Osito sin moño",
      imageSrc: "/assets/nido/activities/teddy-without-bow-v1.jpg",
    });

    return Object.freeze({
      ...challenge,
      question: "¿Cuál osito tiene un moño?",
      prompt: "¿Cuál osito tiene un moño?",
      spokenInstruction:
        "¡Mira estos ositos tan tiernos! Uno tiene un moño precioso… ¿lo ves? ¡Tócalo!",
      voice:
        "¡Mira estos ositos tan tiernos! Uno tiene un moño precioso… ¿lo ves? ¡Tócalo!",
      audioId: challenge.id,
      visualType: "choice-grid",
      visual: Object.freeze({
        kind: "teddy-bow-match",
        items: Object.freeze([teddyWithBow, teddyWithoutBow]),
      }),
      options: Object.freeze([teddyWithBow, teddyWithoutBow]),
      answerId: teddyWithBow.id,
      answer: teddyWithBow.id,
    });
  }

  return challenge;
}

export function buildCurriculumCategoryChallenges({
  areaId,
  categoryId,
  ageId,
}) {
  return Object.freeze(
    Array.from({ length: GAME_COUNT }, (_, gameIndex) =>
      buildCurriculumChallenge({
        areaId,
        categoryId,
        ageId,
        gameIndex,
      }),
    ),
  );
}
