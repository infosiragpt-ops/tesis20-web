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

export const NIDO_CURRICULUM = Object.freeze([
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
  { id: "duck", label: "pato", english: "duck", iconName: "Bird" },
  { id: "fish", label: "pez", english: "fish", iconName: "FishSimple" },
  { id: "cow", label: "vaca", english: "cow", iconName: "Cow" },
  { id: "rabbit", label: "conejo", english: "rabbit", iconName: "Rabbit" },
  { id: "butterfly", label: "mariposa", english: "butterfly", iconName: "Butterfly" },
  { id: "lion", label: "león", english: "lion", iconName: "PawPrint" },
  { id: "turtle", label: "tortuga", english: "turtle", iconName: "PawPrint" },
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
      { id: "unicorn", label: "unicornio", iconName: "Horse" },
      { id: "dragon", label: "dragón", iconName: "Fire" },
    ],
  },
  {
    real: { id: "butterfly", label: "mariposa", iconName: "Butterfly" },
    imaginary: [
      { id: "winged-lion", label: "león con alas", iconName: "PawPrint" },
      { id: "three-headed-bird", label: "ave de tres cabezas", iconName: "Bird" },
    ],
  },
  {
    real: { id: "turtle", label: "tortuga", iconName: "PawPrint" },
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
    iconName: "PawPrint",
    clue: "Camina despacio y lleva caparazón.",
  },
]);

const ANIMAL_YOUNG = Object.freeze([
  { article: "la", adult: "vaca", young: "ternero", adultIcon: "Cow", youngIcon: "Cow" },
  { article: "el", adult: "caballo", young: "potro", adultIcon: "Horse", youngIcon: "Horse" },
  { article: "la", adult: "gallina", young: "pollito", adultIcon: "Bird", youngIcon: "Bird" },
  { article: "el", adult: "perro", young: "cachorro", adultIcon: "Dog", youngIcon: "Dog" },
  { article: "el", adult: "gato", young: "gatito", adultIcon: "Cat", youngIcon: "Cat" },
  { article: "la", adult: "oveja", young: "cordero", adultIcon: "PawPrint", youngIcon: "PawPrint" },
  { article: "el", adult: "pato", young: "patito", adultIcon: "Bird", youngIcon: "Bird" },
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
  { article: "el", animal: "panda", animalIcon: "PawPrint", food: "bambú", foodIcon: "Plant" },
  { article: "el", animal: "mono", animalIcon: "PawPrint", food: "plátano", foodIcon: "BowlFood" },
  { article: "la", animal: "ardilla", animalIcon: "PawPrint", food: "nuez", foodIcon: "BowlFood" },
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
  { article: "el", animal: "león", animalIcon: "PawPrint", habitat: "sabana", habitatPhrase: "la sabana", habitatIcon: "SunHorizon" },
  { article: "la", animal: "rana", animalIcon: "PawPrint", habitat: "estanque", habitatPhrase: "un estanque", habitatIcon: "Drop" },
  { article: "el", animal: "oso polar", animalIcon: "PawPrint", habitat: "hielo", habitatPhrase: "el hielo", habitatIcon: "Snowflake" },
  { article: "el", animal: "mono", animalIcon: "PawPrint", habitat: "selva", habitatPhrase: "la selva", habitatIcon: "TreePalm" },
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
    ["mother", "mamá", "Person"],
    ["father", "papá", "Person"],
    ["sister", "hermana", "Person"],
    ["brother", "hermano", "Person"],
    ["grandmother", "abuela", "Person"],
    ["grandfather", "abuelo", "Person"],
    ["aunt", "tía", "Person"],
    ["uncle", "tío", "Person"],
    ["cousin", "primo o prima", "Person"],
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

function makeChallenge(context, definition) {
  const { area, categoryItem, age, gameIndex, seed } = context;
  const baseSpokenInstruction =
    definition.spokenInstruction ??
    `${definition.question} Escucha, observa y toca la respuesta correcta.`;
  const ageCoaching = {
    "2-3": "Vamos despacio. Mira una opción a la vez.",
    "4-5": "Observa todas las pistas y piensa antes de elegir.",
    6: "Resuelve el reto y comprueba tu respuesta antes de continuar.",
  };
  const spokenInstruction = `${baseSpokenInstruction} ${ageCoaching[age.id]}`;
  const maximumOptionCount = Math.min(age.difficulty + 1, 4);
  const correctOption = definition.options.find(
    (option) => option.id === definition.answerId,
  );
  const visibleOptionIds = new Set([
    definition.answerId,
    ...definition.options
      .filter((option) => option.id !== definition.answerId)
      .slice(0, Math.max(0, maximumOptionCount - 1))
      .map((option) => option.id),
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

  return Object.freeze({
    id: challengeId,
    areaId: area.id,
    categoryId: categoryItem.id,
    ageId: age.id,
    gameIndex,
    gameNumber: gameIndex + 1,
    totalGames: categoryItem.gameCount,
    difficulty: age.difficulty,
    instructionStyle: age.instructionStyle,
    question: definition.question,
    prompt: definition.question,
    spokenInstruction,
    voice: spokenInstruction,
    audioId: challengeId,
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
      spokenInstruction: `Juego ${gameIndex + 1}. Busca el ${shape.label} de color ${color.label}. Observa las dos pistas antes de responder.`,
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
      spokenInstruction: `Cuenta ${amount} elementos. Agrega uno más y toca el número ${result}.`,
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
      spokenInstruction: `Mira el orden de los colores. Después de ${sequence.at(-1).label}, toca el color que continúa.`,
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
      spokenInstruction: `Tres opciones pertenecen al grupo de ${family.name}. Toca la opción que no pertenece al grupo.`,
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
      spokenInstruction: `Piensa en lo que has visto en la vida real. Toca ${set.real.label}.`,
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
    spokenInstruction: `Busca la figura que tiene el mismo color que el fondo. Toca el ${shape.label} ${targetColor.label}.`,
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
      spokenInstruction: `Compara el tamaño de los dos dibujos y toca el que es ${askLarge ? "más grande" : "más pequeño"}.`,
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
        ? `Cuenta los lados de cada figura y toca la que tiene ${target.sides}.`
        : `Observa las figuras y toca el ${target.label}.`,
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
      spokenInstruction: `Cuenta los dos grupos y toca el que tiene ${askMost ? "más" : "menos"} elementos.`,
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
      spokenInstruction: `Mira los tres tamaños y elige el orden que va de ${ascending ? "pequeño a grande" : "grande a pequeño"}.`,
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
    spokenInstruction: `Escucha la serie: ${sequence.join(", ")}. Observa cuánto aumenta y toca el número que sigue.`,
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
      spokenInstruction: `Recuerda dos detalles: emoción ${expression.label} y color ${color.label}. Toca la máscara que tiene ambos.`,
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
      spokenInstruction: `Mira cada rincón del dibujo y toca el ${target.label}.`,
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
      spokenInstruction: `${character.clue} ¿Quién puede ser? Escucha la pista y toca ${character.label}.`,
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
      spokenInstruction: `${character.clue} Mira todas las opciones y toca ${character.label}.`,
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
    const answer = makeOptions(
      [
        {
          id: `${shape.id}-${color.id}-${mark}`,
          label: "El gemelo exacto",
          iconName: shape.iconName,
          tone: color.tone,
          meta: { mark },
        },
        {
          id: `${otherShape.id}-${color.id}-${mark}`,
          label: "Cambia la forma",
          iconName: otherShape.iconName,
          tone: color.tone,
          meta: { mark },
        },
        {
          id: `${shape.id}-${otherColor.id}-${mark}`,
          label: "Cambia el color",
          iconName: shape.iconName,
          tone: otherColor.tone,
          meta: { mark },
        },
        {
          id: `${shape.id}-${color.id}-different-mark`,
          label: "Cambia la marca",
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
      spokenInstruction: "Compara forma, color y marca. Toca el gemelo que coincide en los tres detalles.",
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
    spokenInstruction: `Compara los dos dibujos. El ${changed.label} cambió de ${changeType === "missing" ? "presencia" : changeType}. Tócalo.`,
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
      spokenInstruction: `La cría ${adultPossessive} se llama ${pair.young}. Repite ${pair.young} y toca su imagen.`,
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
      spokenInstruction: `${item.question} Piensa, di la respuesta en voz alta y toca ${item.answer}.`,
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
      spokenInstruction: `${emotion.context} Esa emoción se llama ${emotion.label}. Repite ${emotion.label} y elígela.`,
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
      spokenInstruction: `${animalSubjectCapitalized} come ${pair.food}. Repite la frase y toca ${pair.food}.`,
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
      spokenInstruction: `El objeto está ${positionPhrase}. Repite ${position.label} y toca esa opción.`,
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
    spokenInstruction: `${animalSubjectCapitalized} vive en ${pair.habitatPhrase}. Repite la frase y toca ${pair.habitat}.`,
    visualType: "speech",
    visualKind: "habitat-match",
    visual: {
      subject: { label: pair.animal, iconName: pair.animalIcon },
      repeatPhrase: `${animalSubjectCapitalized} vive en ${pair.habitatPhrase}.`,
    },
    ...answer,
  });
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
      ? `Listen carefully: ${item.english}. Say the word, then choose its meaning in Spanish.`
      : `Listen: ${item.english}. En español significa ${item.spanish}. Toca ${item.spanish}.`
    : age.id === "2-3"
      ? `Escucha y repite conmigo: ${item.english}. ${item.english}. Ahora encuentra ${item.english}.`
      : age.id === "6"
        ? `Say the English word for ${item.spanish}. Then choose ${item.english}.`
        : `Escucha y repite: ${item.english}. ${item.english}. Ahora toca ${item.english}.`;

  return makeChallenge(context, {
    question,
    spokenInstruction,
    visualType: "word-match",
    visualKind: categoryItem.strategy,
    visual: {
      sourceLanguage: reverse ? "en" : "es",
      targetLanguage: reverse ? "es" : "en",
      word: reverse ? item.english : item.spanish,
      iconName: item.iconName,
      tone: item.tone ?? null,
      numericValue: item.value ?? null,
      repeatWord: item.english,
    },
    ...answer,
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

export function buildCurriculumChallenge({
  areaId,
  categoryId,
  ageId,
  gameIndex,
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

  const seed = hashSeed(`${areaId}|${categoryId}|${ageId}|${gameIndex}`);
  const challenge = AREA_BUILDERS[areaId]({
    area,
    categoryItem,
    age,
    gameIndex,
    seed,
  });

  if (
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
        "Escucha con atención. Selecciona al osito que tiene un moño. Muy bien, tú puedes.",
      voice:
        "Escucha con atención. Selecciona al osito que tiene un moño. Muy bien, tú puedes.",
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
