/**
 * Catálogo generativo del Nido.
 *
 * Escribir cien juegos por materia a mano sería inmantenible y, peor, saldrían
 * clones: la misma consigna repintada. Aquí cada juego nace de cruzar dos ejes
 * que sí son independientes:
 *
 *   MECÁNICA — qué tiene que hacer el niño (contar, seguir un patrón, recordar,
 *              nombrar…). Define la pregunta, la escena y cómo se arman las
 *              opciones.
 *   PACK     — con qué lo hace (la cocina, el mar, los juguetes…). Define el
 *              vocabulario y los dibujos.
 *
 * Diez mecánicas por materia × diez packs = cien juegos, y ninguno comparte a la
 * vez tarea y contenido con otro.
 *
 * Regla de narración: salvo en Inglés, el texto hablado depende solo de la
 * mecánica y la edad, nunca del pack ni de la ronda. El objetivo del reto vive
 * en el dibujo, no en la frase («cuenta cuántos hay» sirve igual con zanahorias
 * que con globos), así que una misma locución cubre los diez packs de esa
 * mecánica. En Inglés no se puede: la palabra en inglés *es* el contenido y
 * tiene que sonar, así que allí la locución depende de la palabra de la ronda.
 */

const item = (id, label, en, iconName, gender) =>
  Object.freeze({ id, label, en, iconName, gender });

const pack = (id, name, plural, iconName, items) =>
  Object.freeze({ id, name, plural, iconName, items: Object.freeze(items) });

export const MATRIX_PACKS = Object.freeze([
  pack("mascotas", "Mascotas", "mascotas", "Dog", [
    item("perro", "perro", "dog", "Dog", "el"),
    item("gato", "gato", "cat", "Cat", "el"),
    item("conejo", "conejo", "rabbit", "Rabbit", "el"),
    item("pajaro", "pájaro", "bird", "Bird", "el"),
    item("tortuga", "tortuga", "turtle", "PawPrint", "la"),
  ]),
  pack("granja", "La granja", "animales de la granja", "Cow", [
    item("vaca", "vaca", "cow", "Cow", "la"),
    item("caballo", "caballo", "horse", "Horse", "el"),
    item("gallina", "gallina", "hen", "Bird", "la"),
    item("oveja", "oveja", "sheep", "PawPrint", "la"),
    item("pez", "pez", "fish", "FishSimple", "el"),
  ]),
  pack("jardin", "El jardín", "cositas del jardín", "Flower", [
    item("flor", "flor", "flower", "Flower", "la"),
    item("arbol", "árbol", "tree", "Tree", "el"),
    item("planta", "planta", "plant", "Plant", "la"),
    item("mariposa", "mariposa", "butterfly", "Butterfly", "la"),
    item("abeja", "abeja", "bee", "Bug", "la"),
  ]),
  pack("mar", "El mar", "cositas del mar", "Waves", [
    item("pez", "pez", "fish", "FishSimple", "el"),
    item("ola", "ola", "wave", "Waves", "la"),
    item("bote", "bote", "boat", "Boat", "el"),
    item("gota", "gota", "drop", "Drop", "la"),
    item("palmera", "palmera", "palm tree", "TreePalm", "la"),
  ]),
  pack("cielo", "El cielo", "cositas del cielo", "Sun", [
    item("sol", "sol", "sun", "Sun", "el"),
    item("luna", "luna", "moon", "Moon", "la"),
    item("nube", "nube", "cloud", "Cloud", "la"),
    item("estrella", "estrella", "star", "Star", "la"),
    item("copo", "copo", "snowflake", "Snowflake", "el"),
  ]),
  pack("cocina", "La cocina", "cositas de la cocina", "ForkKnife", [
    item("zanahoria", "zanahoria", "carrot", "Carrot", "la"),
    item("pan", "pan", "bread", "Bread", "el"),
    item("plato", "plato", "plate", "BowlFood", "el"),
    item("taza", "taza", "cup", "Coffee", "la"),
    item("tenedor", "tenedor", "fork", "ForkKnife", "el"),
  ]),
  pack("casa", "La casa", "cositas de la casa", "House", [
    item("casa", "casa", "house", "House", "la"),
    item("puerta", "puerta", "door", "Door", "la"),
    item("silla", "silla", "chair", "Chair", "la"),
    item("cama", "cama", "bed", "Bed", "la"),
    item("reloj", "reloj", "clock", "Clock", "el"),
  ]),
  pack("vehiculos", "Vehículos", "vehículos", "Car", [
    item("auto", "auto", "car", "Car", "el"),
    item("bote", "bote", "boat", "Boat", "el"),
    item("bicicleta", "bicicleta", "bike", "Bicycle", "la"),
    item("caja", "caja", "box", "Package", "la"),
    item("globo", "globo", "balloon", "Balloon", "el"),
  ]),
  pack("escuela", "La escuela", "cositas del cole", "Backpack", [
    item("mochila", "mochila", "backpack", "Backpack", "la"),
    item("lapiz", "lápiz", "pencil", "Pencil", "el"),
    item("libro", "libro", "book", "BookOpen", "el"),
    item("paleta", "paleta", "palette", "Palette", "la"),
    item("audifono", "audífono", "headphones", "Headphones", "el"),
  ]),
  pack("juguetes", "Juguetes", "juguetes", "Balloon", [
    item("globo", "globo", "balloon", "Balloon", "el"),
    item("pelota", "pelota", "ball", "Basketball", "la"),
    item("control", "control", "controller", "GameController", "el"),
    item("microfono", "micrófono", "microphone", "Microphone", "el"),
    item("cubo", "cubo", "cube", "Cube", "el"),
  ]),
  pack("formas", "Formas", "figuras", "Shapes", [
    item("circulo", "círculo", "circle", "Circle", "el"),
    item("cuadrado", "cuadrado", "square", "Square", "el"),
    item("triangulo", "triángulo", "triangle", "Triangle", "el"),
    item("estrella", "estrella", "star", "Star", "la"),
    item("hexagono", "hexágono", "hexagon", "Hexagon", "el"),
  ]),
  pack("caritas", "Caritas", "caritas", "MaskHappy", [
    item("alegre", "carita alegre", "happy face", "Smiley", "la"),
    item("triste", "carita triste", "sad face", "SmileySad", "la"),
    item("sorprendida", "carita sorprendida", "surprised face", "SmileyWink", "la"),
    item("tranquila", "carita tranquila", "calm face", "SmileyMeh", "la"),
    item("asustada", "carita asustada", "scared face", "SmileyNervous", "la"),
  ]),
]);

const PACK_BY_ID = new Map(MATRIX_PACKS.map((entry) => [entry.id, entry]));

const TONES = Object.freeze([
  { id: "red", label: "rojo", en: "red", tone: "#ef5350" },
  { id: "blue", label: "azul", en: "blue", tone: "#42a5f5" },
  { id: "yellow", label: "amarillo", en: "yellow", tone: "#fbc02d" },
  { id: "green", label: "verde", en: "green", tone: "#43a047" },
  { id: "orange", label: "naranja", en: "orange", tone: "#fb8c00" },
  { id: "purple", label: "morado", en: "purple", tone: "#8e5bd9" },
]);

const ENGLISH_NUMBERS = Object.freeze([
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
]);

// ---------------------------------------------------------------------------
// Utilidades de contenido
// ---------------------------------------------------------------------------

/** Texto distinto por edad: breve para 2–3, guiado para 4–5, de dos pasos para 6. */
const tri = (age, small, middle, big) =>
  age.id === "2-3" ? small : age.id === "4-5" ? middle : big;

/** Elementos del pack distintos de los excluidos, en orden estable por semilla. */
function rest(source, excludeIds, count, h, seed, offset) {
  const pool = source.filter((entry) => !excludeIds.includes(entry.id));
  const rotated = h.rotate(pool, h.mix(seed, offset) % Math.max(1, pool.length));
  return rotated.slice(0, count);
}

/**
 * Elementos de otros packs, para intrusos y contrastes. Algunos packs comparten
 * piezas (el pez está en la granja y en el mar, la estrella en el cielo y en las
 * formas), así que se descartan los ids ya usados: si un distractor repitiera al
 * dibujo correcto, el reto tendría dos respuestas buenas.
 */
function foreignItems(currentPack, avoidIds, count, h, seed, offset) {
  const taken = new Set(avoidIds);
  const pool = MATRIX_PACKS.filter((entry) => entry.id !== currentPack.id);
  const rotated = h.rotate(pool, h.mix(seed, offset) % pool.length);
  const chosen = [];
  for (let lap = 0; lap < rotated.length && chosen.length < count; lap += 1) {
    const other = rotated[lap];
    const items = h.rotate(other.items, h.mix(seed, offset + lap) % other.items.length);
    for (const entry of items) {
      if (taken.has(entry.id)) continue;
      taken.add(entry.id);
      chosen.push(entry);
      break;
    }
  }
  return chosen;
}

const idsOf = (...entries) => entries.flat().map((entry) => entry.id);

const tint = (entry, color) => ({ ...entry, tone: color.tone });

const numberChoice = (value) => ({
  id: `numero-${value}`,
  label: String(value),
  value,
  iconName: "NumberCircleOne",
});

/** Cantidad de la ronda: sube con la edad y se mueve con el número de juego. */
function roundCount(age, gameIndex, floor = 2) {
  const span = 2 + age.difficulty;
  return floor + age.difficulty + (gameIndex % span);
}

/** Conteo aproximado de sílabas del español: grupos de vocales. */
function syllables(word) {
  const groups = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .match(/[aeiou]+/g);
  return groups ? groups.length : 1;
}

const numbersAround = (value, h, seed) => {
  const near = [value, value + 1, Math.max(0, value - 1), value + 2];
  const unique = [...new Set(near)];
  return [unique[0], ...h.rotate(unique.slice(1), h.mix(seed, 9) % 3)].map(numberChoice);
};

// ---------------------------------------------------------------------------
// Mecánicas
// ---------------------------------------------------------------------------

const mechanic = (id, title, describe, speak, build) =>
  Object.freeze({ id, title, describe, speak, build });

const LOGIC_MECHANICS = Object.freeze([
  mechanic(
    "igual-al-modelo",
    "Igual al modelo",
    (p) => `Encuentra el dibujo idéntico al modelo entre ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Mira el dibujo de arriba… ¡y busca el que es igualito! ¿Cuál es?",
        "Observa con calma el modelo de arriba y busca abajo el que es exactamente igual. ¡Tócalo!",
        "Estudia el modelo de arriba, compáralo con cada opción y toca el que coincide en todo.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const model = p.items[gameIndex % p.items.length];
      const distractors = rest(p.items, [model.id], 3, h, seed, 1);
      return {
        question: "¿Cuál es igual al modelo?",
        visualType: "choice-grid",
        visual: { model, complexityHint: age.difficulty },
        choices: [model, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "el-intruso",
    "El intruso",
    (p) => `Descubre qué elemento no pertenece a ${p.name.toLowerCase()}.`,
    (age) =>
      tri(
        age,
        "Casi todos son del mismo grupo… ¡pero uno se coló! Tócalo.",
        "Mira bien: casi todos pertenecen al mismo grupo, pero hay un invitado sorpresa. ¿Cuál no pertenece?",
        "Compara todas las opciones, decide qué tienen en común y toca la única que no pertenece al grupo.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const family = rest(p.items, [], 3, h, seed, gameIndex + 1);
      const [intruder] = foreignItems(p, idsOf(family), 1, h, seed, gameIndex + 5);
      return {
        question: "¿Cuál no pertenece al grupo?",
        visualType: "choice-grid",
        visual: { family: p.name },
        choices: [intruder, ...family],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "serie-ab",
    "Serie AB",
    (p) => `Continúa la serie que alterna dos ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Mira el orden de la fila… ¿qué viene después? ¡Tócalo!",
        "Fíjate en cómo se turnan los dibujos de la fila. Después del último… ¿cuál sigue?",
        "Descubre la regla que ordena la fila, síguela hasta el final y toca el dibujo que continúa.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const [first, second] = rest(p.items, [], 2, h, seed, gameIndex + 1);
      const length = 4 + age.difficulty;
      const items = Array.from({ length }, (_, index) =>
        index % 2 === 0 ? first : second,
      );
      const answer = length % 2 === 0 ? first : second;
      const distractors = rest(p.items, [answer.id], 3, h, seed, 7);
      return {
        question: "¿Qué dibujo continúa la serie?",
        visualType: "sequence",
        visual: { items, missingPosition: "end" },
        choices: [answer, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "serie-aab",
    "Serie AAB",
    (p) => `Sigue el patrón de dos iguales y uno distinto con ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Dos iguales y uno distinto… ¿qué viene ahora? ¡Tócalo!",
        "El patrón repite dos dibujos iguales y luego uno distinto. ¿Cuál toca ahora?",
        "Identifica el patrón de tres pasos, cuenta en qué punto quedó la fila y toca el dibujo que sigue.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const [first, second] = rest(p.items, [], 2, h, seed, gameIndex + 2);
      const cycle = [first, first, second];
      const length = 5 + age.difficulty;
      const items = Array.from({ length }, (_, index) => cycle[index % 3]);
      const answer = cycle[length % 3];
      const distractors = rest(p.items, [answer.id], 3, h, seed, 8);
      return {
        question: "¿Qué dibujo continúa el patrón?",
        visualType: "sequence",
        visual: { items, missingPosition: "end" },
        choices: [answer, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "la-sombra",
    "La sombra",
    (p) => `Reconoce a quién pertenece la sombra entre ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Esta es una sombra… ¿de quién será? ¡Tócalo!",
        "Mira la forma oscura de arriba: es la sombra de uno de estos dibujos. ¿De cuál?",
        "Compara el contorno de la sombra con cada opción y toca el dibujo al que pertenece.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const owner = p.items[(gameIndex + 1) % p.items.length];
      const distractors = rest(p.items, [owner.id], 3, h, seed, 3);
      return {
        question: "¿De quién es esta sombra?",
        visualType: "choice-grid",
        visual: { model: { ...owner, tone: "#2b2f38" } },
        choices: [owner, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "mismo-color",
    "Mismo color",
    (p) => `Empareja por color, no por dibujo, entre ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Mira el color de arriba y busca el que tiene ese mismo color.",
        "Arriba hay un color. Busca abajo el dibujo pintado del mismo color, aunque sea otro dibujo.",
        "Ignora la forma y fíjate solo en el color: toca el dibujo pintado igual que el modelo de arriba.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const color = TONES[gameIndex % TONES.length];
      const otherColors = rest(TONES, [color.id], 3, h, seed, 4);
      const [target, ...others] = rest(p.items, [], 4, h, seed, gameIndex + 3);
      const [model] = foreignItems(p, [], 1, h, seed, gameIndex + 11);
      return {
        question: `¿Cuál es del mismo color?`,
        visualType: "choice-grid",
        visual: { model: tint(model, color) },
        choices: [
          tint(target, color),
          ...others.map((entry, index) =>
            tint(entry, otherColors[index % otherColors.length]),
          ),
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "va-con-estos",
    "Va con estos",
    (p) => `Elige el elemento que acompaña al grupo de ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Estos dos van juntos… ¿cuál más va con ellos? ¡Tócalo!",
        "Arriba hay dos dibujos que son del mismo grupo. Busca abajo otro que vaya con ellos.",
        "Descubre qué tienen en común los dibujos de arriba y elige el único que pertenece a esa misma familia.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const shown = rest(p.items, [], 2, h, seed, gameIndex + 4);
      const partner = rest(
        p.items,
        shown.map((entry) => entry.id),
        1,
        h,
        seed,
        gameIndex + 6,
      )[0];
      const strangers = foreignItems(
        p,
        idsOf(shown, partner),
        3,
        h,
        seed,
        gameIndex + 13,
      );
      return {
        question: "¿Cuál va con estos dibujos?",
        visualType: "choice-grid",
        visual: { items: shown, family: p.name },
        choices: [partner, ...strangers],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "dos-pistas",
    "Dos pistas",
    (p) => `Combina dibujo y color para encontrar el objetivo entre ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Hay dos pistas arriba: el dibujo y el color. ¡Busca el que tiene los dos!",
        "Mira las dos pistas de arriba: un dibujo y un color. Solo una opción cumple las dos. ¿Cuál es?",
        "Aplica las dos pistas a la vez, descarta las que fallan en una y toca la única que cumple ambas.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 2) % p.items.length];
      const color = TONES[(gameIndex + 1) % TONES.length];
      const otherColor = TONES[(gameIndex + 4) % TONES.length];
      const otherItem = rest(p.items, [target.id], 1, h, seed, gameIndex + 7)[0];
      const thirdItem = rest(
        p.items,
        [target.id, otherItem.id],
        1,
        h,
        seed,
        gameIndex + 9,
      )[0];
      return {
        question: "¿Cuál cumple las dos pistas?",
        visualType: "choice-grid",
        visual: {
          clues: [
            { type: "dibujo", value: target.id, label: target.label, iconName: target.iconName },
            { type: "color", value: color.id, label: color.label, tone: color.tone },
          ],
        },
        choices: [
          tint(target, color),
          tint(otherItem, color),
          tint(target, otherColor),
          tint(thirdItem, otherColor),
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "el-repetido",
    "El repetido",
    (p) => `Detecta qué dibujo aparece dos veces entre ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Uno de la fila salió dos veces… ¿cuál? ¡Tócalo!",
        "En la fila hay un dibujo que aparece repetido. Recórrela con el dedito y encuéntralo.",
        "Recorre la fila comparando cada dibujo con los anteriores y toca el único que aparece dos veces.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = 3 + age.difficulty;
      const row = rest(p.items, [], size, h, seed, gameIndex + 5);
      const repeated = row[h.mix(seed, 12) % row.length];
      const items = h.rotate([...row, repeated], h.mix(seed, 13) % (size + 1));
      const distractors = rest(p.items, [repeated.id], 3, h, seed, 15);
      return {
        question: "¿Cuál se repite en la fila?",
        visualType: "choice-grid",
        visual: { items },
        choices: [repeated, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "el-que-falta-en-la-fila",
    "No está en la fila",
    (p) => `Descubre qué ${p.plural} no aparece en la fila.`,
    (age) =>
      tri(
        age,
        "Mira la fila de arriba… ¿cuál de abajo NO está ahí?",
        "Compara cada opción con la fila de arriba y busca la única que no aparece.",
        "Revisa la fila entera, ve descartando las opciones que sí están y toca la que falta.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = 2 + age.difficulty;
      const row = rest(p.items, [], size, h, seed, gameIndex + 8);
      const missing = rest(
        p.items,
        row.map((entry) => entry.id),
        1,
        h,
        seed,
        gameIndex + 10,
      )[0] ?? foreignItems(p, idsOf(row), 1, h, seed, gameIndex + 17)[0];
      return {
        question: "¿Cuál no está en la fila?",
        visualType: "choice-grid",
        visual: { items: row },
        choices: [missing, ...row.slice(0, 3)],
        correctIndex: 0,
      };
    },
  ),
]);

const MATH_MECHANICS = Object.freeze([
  mechanic(
    "cuenta-y-toca",
    "Cuenta y toca",
    (p) => `Cuenta cuántos ${p.plural} hay y elige el número.`,
    (age) =>
      tri(
        age,
        "Cuenta conmigo, despacito… ¿cuántos hay? ¡Toca el número!",
        "Señala cada dibujo con tu dedito mientras cuentas en voz alta. ¿Cuántos hay? Toca el número.",
        "Cuenta todos los dibujos sin saltarte ninguno y toca el número que corresponde al total.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[gameIndex % p.items.length];
      const count = roundCount(age, gameIndex);
      return {
        question: "¿Cuántos hay?",
        visualType: "quantity",
        visual: { itemIconName: target.iconName, count },
        choices: numbersAround(count, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "donde-hay-mas",
    "¿Dónde hay más?",
    (p) => `Compara dos grupos de ${p.plural} y elige el que tiene más.`,
    (age) =>
      tri(
        age,
        "Mira los dos grupos… ¿cuál tiene más? ¡Tócalo!",
        "Cuenta el primer grupo y después el segundo. ¿Cuál tiene más dibujos?",
        "Cuenta los dos grupos, compara los totales y toca el grupo que tiene la mayor cantidad.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const icon = p.items[gameIndex % p.items.length].iconName;
      const small = roundCount(age, gameIndex, 1);
      const big = small + 1 + (h.mix(seed, 3) % (1 + age.difficulty));
      const firstIsBig = h.mix(seed, 4) % 2 === 0;
      return {
        question: "¿Qué grupo tiene más?",
        visualType: "comparison",
        visual: {
          groups: [
            { id: "grupo-1", count: firstIsBig ? big : small, iconName: icon },
            { id: "grupo-2", count: firstIsBig ? small : big, iconName: icon },
          ],
        },
        choices: [
          { id: firstIsBig ? "grupo-1" : "grupo-2", label: firstIsBig ? "El primer grupo" : "El segundo grupo" },
          { id: firstIsBig ? "grupo-2" : "grupo-1", label: firstIsBig ? "El segundo grupo" : "El primer grupo" },
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "donde-hay-menos",
    "¿Dónde hay menos?",
    (p) => `Compara dos grupos de ${p.plural} y elige el que tiene menos.`,
    (age) =>
      tri(
        age,
        "Mira los dos grupos… ¿cuál tiene menos? ¡Tócalo!",
        "Cuenta los dos grupos con calma. ¿Cuál tiene menos dibujos?",
        "Cuenta ambos grupos, compara los totales y toca el que tiene la menor cantidad.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const icon = p.items[(gameIndex + 1) % p.items.length].iconName;
      const small = roundCount(age, gameIndex, 1);
      const big = small + 1 + (h.mix(seed, 5) % (1 + age.difficulty));
      const firstIsSmall = h.mix(seed, 6) % 2 === 0;
      return {
        question: "¿Qué grupo tiene menos?",
        visualType: "comparison",
        visual: {
          groups: [
            { id: "grupo-1", count: firstIsSmall ? small : big, iconName: icon },
            { id: "grupo-2", count: firstIsSmall ? big : small, iconName: icon },
          ],
        },
        choices: [
          { id: firstIsSmall ? "grupo-1" : "grupo-2", label: firstIsSmall ? "El primer grupo" : "El segundo grupo" },
          { id: firstIsSmall ? "grupo-2" : "grupo-1", label: firstIsSmall ? "El segundo grupo" : "El primer grupo" },
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "si-se-va-uno",
    "Si se va uno",
    (p) => `Cuenta los ${p.plural} y descubre cuántos quedan si se va uno.`,
    (age) =>
      tri(
        age,
        "Cuenta cuántos hay… ¡y si se va uno! ¿Cuántos quedan?",
        "Primero cuenta todos los dibujos. Ahora imagina que uno se va: ¿cuántos quedan?",
        "Cuenta el total, réstale uno mentalmente y toca el número de los que quedan.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 2) % p.items.length];
      const count = roundCount(age, gameIndex, 3);
      return {
        question: "Si se va uno, ¿cuántos quedan?",
        visualType: "quantity",
        visual: { itemIconName: target.iconName, count },
        choices: numbersAround(count - 1, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "junta-los-grupos",
    "Junta los grupos",
    (p) => `Suma dos grupos de ${p.plural} y di cuántos hay en total.`,
    (age) =>
      tri(
        age,
        "Hay dos grupitos… ¡júntalos y cuenta! ¿Cuántos son?",
        "Cuenta el primer grupo, sigue contando con el segundo y dime cuántos hay en total.",
        "Suma las dos cantidades sin volver a empezar desde uno y toca el número del total.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const icon = p.items[(gameIndex + 3) % p.items.length].iconName;
      const first = 1 + (gameIndex % (2 + age.difficulty));
      const second = 1 + ((gameIndex + age.difficulty) % (2 + age.difficulty));
      return {
        question: "¿Cuántos hay en total?",
        visualType: "quantity",
        visual: { kind: "add-one", count: first, addedCount: second, itemIconName: icon },
        choices: numbersAround(first + second, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "numero-que-sigue",
    "El número que sigue",
    () => "Completa la serie de números que va hacia adelante.",
    (age) =>
      tri(
        age,
        "Cuenta los números de la fila… ¿cuál sigue?",
        "Lee los números de la fila en voz alta. ¿Qué número viene después?",
        "Descubre de cuánto en cuánto avanza la serie y toca el número que continúa.",
      ),
    ({ age, gameIndex, seed, h }) => {
      const step = age.difficulty >= 3 && gameIndex % 2 === 1 ? 2 : 1;
      const start = 1 + (gameIndex % 5);
      const length = 3 + age.difficulty;
      const items = Array.from({ length }, (_, index) => {
        const value = start + index * step;
        return { id: `serie-${value}`, label: String(value) };
      });
      const answer = start + length * step;
      return {
        question: "¿Qué número sigue?",
        visualType: "sequence",
        visual: { items, missingPosition: "end" },
        choices: numbersAround(answer, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "cuenta-hacia-atras",
    "Cuenta hacia atrás",
    () => "Sigue la serie de números que va hacia atrás.",
    (age) =>
      tri(
        age,
        "Los números van bajando… ¿cuál sigue?",
        "Esta fila cuenta hacia atrás. Después del último número… ¿cuál viene?",
        "La serie descuenta paso a paso: descubre cuánto baja cada vez y toca el número que sigue.",
      ),
    ({ age, gameIndex, seed, h }) => {
      const length = 3 + age.difficulty;
      const start = length + 2 + (gameIndex % 4);
      const items = Array.from({ length }, (_, index) => {
        const value = start - index;
        return { id: `atras-${value}`, label: String(value) };
      });
      const answer = start - length;
      return {
        question: "¿Qué número sigue al contar hacia atrás?",
        visualType: "sequence",
        visual: { items, missingPosition: "end" },
        choices: numbersAround(answer, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "primero-o-ultimo",
    "Primero o último",
    (p) => `Ubica qué ${p.plural} está en cada lugar de la fila.`,
    (age) =>
      tri(
        age,
        "Mira la fila… ¿cuál está primero? ¡Tócalo!",
        "Recorre la fila desde el principio. ¿Cuál está al final de todo?",
        "Cuenta las posiciones de la fila de izquierda a derecha y toca el que está justo en el medio.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = age.id === "6" ? 5 : 3 + (age.difficulty - 1);
      const row = rest(p.items, [], size, h, seed, gameIndex + 11);
      const position = age.id === "2-3" ? 0 : age.id === "4-5" ? row.length - 1 : Math.floor(row.length / 2);
      const answer = row[position];
      const distractors = row.filter((entry) => entry.id !== answer.id).slice(0, 3);
      return {
        question:
          age.id === "2-3"
            ? "¿Cuál está primero?"
            : age.id === "4-5"
              ? "¿Cuál está último?"
              : "¿Cuál está en el medio?",
        visualType: "sequence",
        visual: { items: row },
        choices: [answer, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "ordena-por-tamano",
    "El más grande",
    (p) => `Compara tamaños de ${p.plural} y elige el correcto.`,
    (age) =>
      tri(
        age,
        "Mira los tamaños… ¿cuál es el más grande? ¡Tócalo!",
        "Compara los tres tamaños con calma. ¿Cuál es el más grande de todos?",
        "Ordena mentalmente los tamaños de menor a mayor y toca el más pequeño de la fila.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 4) % p.items.length];
      const sizes = [
        { id: "pequeno", label: "pequeño", scale: 0.7 },
        { id: "mediano", label: "mediano", scale: 1 },
        { id: "grande", label: "grande", scale: 1.4 },
      ];
      const wantsSmall = age.id === "6";
      const answer = wantsSmall ? sizes[0] : sizes[2];
      const ordered = h.rotate(sizes, h.mix(seed, 7) % 3);
      return {
        question: wantsSmall ? "¿Cuál es el más pequeño?" : "¿Cuál es el más grande?",
        visualType: "comparison",
        visual: { kind: "size-order", itemIconName: target.iconName, items: ordered },
        choices: [
          { ...answer, iconName: target.iconName },
          ...sizes
            .filter((entry) => entry.id !== answer.id)
            .map((entry) => ({ ...entry, iconName: target.iconName })),
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "misma-cantidad",
    "¿Misma cantidad?",
    (p) => `Decide si dos grupos de ${p.plural} tienen la misma cantidad.`,
    (age) =>
      tri(
        age,
        "Cuenta los dos grupos… ¿tienen lo mismo?",
        "Cuenta el primer grupo y luego el segundo. ¿Tienen la misma cantidad?",
        "Cuenta ambos grupos y decide si son iguales o si a uno le sobran o le faltan dibujos.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const icon = p.items[(gameIndex + 5) % p.items.length].iconName;
      const base = roundCount(age, gameIndex, 1);
      const equal = h.mix(seed, 8) % 2 === 0;
      const secondCount = equal ? base : base + 1;
      const choices = [
        { id: "igual", label: "Sí, tienen lo mismo", iconName: "CheckCircle" },
        { id: "distinto", label: "No, uno tiene más", iconName: "XCircle" },
        { id: "menos", label: "No, uno tiene menos", iconName: "Subtract" },
      ];
      return {
        question: "¿Los dos grupos tienen la misma cantidad?",
        visualType: "comparison",
        visual: {
          groups: [
            { id: "grupo-1", count: base, iconName: icon },
            { id: "grupo-2", count: secondCount, iconName: icon },
          ],
        },
        choices: equal ? choices : [choices[1], choices[0], choices[2]],
        correctIndex: 0,
      };
    },
  ),
]);

const ATTENTION_MECHANICS = Object.freeze([
  mechanic(
    "memoriza-y-elige",
    "Memoriza y elige",
    (p) => `Recuerda qué ${p.plural} apareció antes de esconderse.`,
    (age) =>
      tri(
        age,
        "Mira bien el dibujo… ¡se va a esconder! ¿Cuál era?",
        "Observa el dibujo con atención. Cuando se esconda, tócalo entre las opciones.",
        "Memoriza el dibujo antes de que desaparezca y recupéralo entre las opciones sin dudar.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const model = p.items[gameIndex % p.items.length];
      const distractors = rest(p.items, [model.id], 3, h, seed, 2);
      return {
        question: "¿Cuál dibujo viste?",
        visualType: "memory",
        visual: { model, previewSeconds: 5 - age.difficulty },
        choices: [model, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "memoriza-el-color",
    "Memoriza el color",
    (p) => `Recuerda de qué color estaba pintado el dibujo de ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Mira el color del dibujo… ¡y recuérdalo! ¿Cuál era?",
        "Fíjate bien en el color del dibujo. Cuando se esconda, toca ese mismo color.",
        "Retén el color exacto del dibujo y elígelo entre tonos parecidos cuando desaparezca.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const model = p.items[(gameIndex + 1) % p.items.length];
      const color = TONES[gameIndex % TONES.length];
      const others = rest(TONES, [color.id], 3, h, seed, 4);
      return {
        question: "¿De qué color era?",
        visualType: "memory",
        visual: { model: tint(model, color), previewSeconds: 5 - age.difficulty },
        choices: [color, ...others].map((entry) => ({
          id: entry.id,
          label: entry.label,
          tone: entry.tone,
        })),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "detalle-escondido",
    "Detalle escondido",
    (p) => `Localiza un dibujo concreto entre muchos ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Hay muchos dibujos… ¡busca el que te pido! ¿Lo ves?",
        "Recorre la escena con tus ojitos y encuentra el dibujo que se repite menos.",
        "Barre la escena en orden, sin saltarte zonas, y localiza el dibujo que aparece una sola vez.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 2) % p.items.length];
      const distractors = rest(p.items, [target.id], 3, h, seed, 6);
      return {
        question: "¿Dónde está el dibujo escondido?",
        visualType: "choice-grid",
        visual: {
          kind: "drawing-detail",
          targetId: target.id,
          detailCount: 4 + age.difficulty * 2,
        },
        choices: [target, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "que-cambio-de-color",
    "¿Qué cambió?",
    (p) => `Compara dos escenas de ${p.plural} y detecta el cambio de color.`,
    (age) =>
      tri(
        age,
        "Mira las dos escenas… ¿cuál cambió de color?",
        "Compara la escena A con la escena B. Uno de los dibujos cambió de color: ¿cuál?",
        "Contrasta las dos escenas dibujo por dibujo y señala el único que cambió de color.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = 2 + age.difficulty;
      const row = rest(p.items, [], size, h, seed, gameIndex + 3);
      const changed = row[h.mix(seed, 11) % row.length];
      return {
        question: "¿Qué dibujo cambió?",
        visualType: "comparison",
        visual: { kind: "difference", changeType: "tone" },
        choices: [changed, ...row.filter((entry) => entry.id !== changed.id).slice(0, 3)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "que-desaparecio",
    "¿Qué desapareció?",
    (p) => `Descubre qué ${p.plural} falta en la segunda escena.`,
    (age) =>
      tri(
        age,
        "En la escena B falta uno… ¿cuál se fue?",
        "Mira la escena A y luego la B. Uno de los dibujos ya no está: ¿cuál desapareció?",
        "Compara las dos escenas con cuidado y nombra el dibujo que ya no aparece en la segunda.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = 2 + age.difficulty;
      const row = rest(p.items, [], size, h, seed, gameIndex + 5);
      const gone = row[h.mix(seed, 14) % row.length];
      return {
        question: "¿Qué dibujo desapareció?",
        visualType: "comparison",
        visual: { kind: "difference", changeType: "missing" },
        choices: [gone, ...row.filter((entry) => entry.id !== gone.id).slice(0, 3)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "quien-se-escondio",
    "¿Quién se escondió?",
    (p) => `Usa la pista para adivinar qué ${p.plural} está tapado.`,
    (age) =>
      tri(
        age,
        "Alguien se escondió detrás de la nube… ¡adivina quién!",
        "Detrás de la nube se escondió un dibujo. Lee la pista y descubre cuál es.",
        "Combina la pista con lo que ya conoces del grupo y deduce qué dibujo está tapado.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const hidden = p.items[(gameIndex + 3) % p.items.length];
      const distractors = rest(p.items, [hidden.id], 3, h, seed, 8);
      return {
        question: "¿Quién se escondió?",
        visualType: "choice-grid",
        visual: {
          kind: "hidden-character",
          cover: { id: "nube", label: "nube", iconName: "Cloud" },
          clue: `Empieza con “${hidden.label.slice(0, 1).toUpperCase()}”.`,
        },
        choices: [hidden, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "ojo-de-lince",
    "Ojo de lince",
    (p) => `Encuentra ${p.plural} camuflados sobre un fondo del mismo color.`,
    (age) =>
      tri(
        age,
        "Hay algo escondido en el fondo… ¡atrápalo con tu dedito!",
        "El dibujo se camufla con el color del fondo. Míralo de cerquita: ¿cuál es?",
        "El objetivo casi se funde con el fondo: fíjate en los bordes y descúbrelo.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 4) % p.items.length];
      const color = TONES[(gameIndex + 2) % TONES.length];
      const others = rest(TONES, [color.id], 2, h, seed, 10);
      const companions = rest(p.items, [target.id], 3, h, seed, 12);
      return {
        question: "¿Cuál está camuflado?",
        visualType: "choice-grid",
        visual: { kind: "camouflage", backgroundTone: color.tone },
        choices: [
          tint(target, color),
          ...companions.map((entry, index) => tint(entry, others[index % others.length])),
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "el-gemelo-exacto",
    "El gemelo exacto",
    (p) => `Distingue el ${p.name.toLowerCase()} idéntico entre copias casi iguales.`,
    (age) =>
      tri(
        age,
        "Busca el que es exactamente igual al de arriba.",
        "Todos se parecen mucho, pero solo uno es idéntico al modelo. ¿Cuál?",
        "Las copias cambian solo en el tono: compara con precisión y toca la idéntica.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const model = p.items[(gameIndex + 5) % p.items.length];
      const color = TONES[(gameIndex + 3) % TONES.length];
      const others = rest(TONES, [color.id], 3, h, seed, 13);
      return {
        question: "¿Cuál es exactamente igual?",
        visualType: "choice-grid",
        visual: { model: tint(model, color) },
        choices: [tint(model, color), ...others.map((entry) => tint(model, entry))],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "cuantos-dibujos-hay",
    "¿Cuántos ves?",
    (p) => `Cuenta cuántos dibujos distintos de ${p.plural} hay en la fila.`,
    (age) =>
      tri(
        age,
        "Cuenta los dibujos de la fila… ¿cuántos son?",
        "La fila mezcla dibujos distintos. Cuéntalos todos y toca el número.",
        "Cuenta la fila completa sin repetir ni saltarte ninguno y elige el total exacto.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const size = 2 + age.difficulty + (gameIndex % 3);
      const row = Array.from({ length: size }, (_, index) => {
        const entry = p.items[(gameIndex + index) % p.items.length];
        return { ...entry, id: `${entry.id}-${index}` };
      });
      return {
        question: "¿Cuántos dibujos hay en la fila?",
        visualType: "quantity",
        visual: { items: row },
        choices: numbersAround(size, h, seed),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "dos-detalles",
    "Dos detalles",
    (p) => `Busca ${p.plural} que cumplan dibujo y color a la vez en una escena llena.`,
    (age) =>
      tri(
        age,
        "Busca el dibujo con el color que te muestro. ¡Con calma!",
        "En la escena hay muchos dibujos. Encuentra el que coincide en dibujo y en color.",
        "La escena está llena: filtra primero por el dibujo, después por el color, y toca el que cumple ambos.",
      ),
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 6) % p.items.length];
      const color = TONES[(gameIndex + 4) % TONES.length];
      const otherColors = rest(TONES, [color.id], 3, h, seed, 15);
      const companions = rest(p.items, [target.id], 3, h, seed, 16);
      const tinted = tint(target, color);
      return {
        question: "¿Cuál cumple el dibujo y el color?",
        visualType: "choice-grid",
        visual: {
          kind: "drawing-detail",
          targetId: tinted.id,
          detailCount: 6 + age.difficulty * 2,
        },
        choices: [
          tinted,
          ...companions.map((entry, index) =>
            tint(entry, otherColors[index % otherColors.length]),
          ),
        ],
        correctIndex: 0,
      };
    },
  ),
]);

const SPEECH_MECHANICS = Object.freeze([
  mechanic(
    "de-que-color-es",
    "¿De qué color es?",
    (p) => `Nombra el color de cada ${p.name.toLowerCase()}.`,
    (age) =>
      tri(
        age,
        "Mira el dibujo y dime… ¿de qué color es? ¡Toca el color!",
        "Observa el dibujo de arriba y di su color en voz alta. Después tócalo abajo.",
        "Nombra en voz alta el color exacto del dibujo y elígelo entre tonos parecidos.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const model = p.items[gameIndex % p.items.length];
      const color = TONES[(gameIndex + 1) % TONES.length];
      const others = rest(TONES, [color.id], 3, h, seed, 3);
      return {
        question: "¿De qué color es?",
        visualType: "word-match",
        visual: { model: tint(model, color) },
        choices: [color, ...others].map((entry) => ({
          id: entry.id,
          label: entry.label,
          tone: entry.tone,
        })),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "uno-o-muchos",
    "Uno o muchos",
    (p) => `Distingue uno de muchos ${p.plural} y usa el plural.`,
    (age) =>
      tri(
        age,
        "En un grupo hay uno solito y en el otro hay muchos. ¿Dónde hay muchos?",
        "Mira los dos grupos y dilo en voz alta: ¿dónde hay muchos y dónde hay uno solo?",
        "Nombra cada grupo usando el singular y el plural, y después toca el grupo donde hay muchos.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const entry = p.items[gameIndex % p.items.length];
      const manyFirst = h.mix(seed, 5) % 2 === 0;
      return {
        question: "¿Dónde hay muchos?",
        visualType: "comparison",
        visual: {
          groups: [
            { id: "grupo-1", count: manyFirst ? 4 : 1, iconName: entry.iconName },
            { id: "grupo-2", count: manyFirst ? 1 : 4, iconName: entry.iconName },
          ],
        },
        choices: [
          { id: manyFirst ? "grupo-1" : "grupo-2", label: manyFirst ? "El primer grupo" : "El segundo grupo" },
          { id: manyFirst ? "grupo-2" : "grupo-1", label: manyFirst ? "El segundo grupo" : "El primer grupo" },
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "palabra-larga",
    "La palabra larga",
    (p) => `Compara los nombres de ${p.plural} y elige el más largo.`,
    (age) =>
      tri(
        age,
        "Di los nombres en voz alta… ¿cuál suena más largo?",
        "Nombra cada dibujo despacito y elige el que tiene la palabra más larga.",
        "Pronuncia los nombres separando sílabas y toca el que tiene la palabra más larga.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const pool = rest(p.items, [], 4, h, seed, gameIndex + 2);
      const longest = [...pool].sort(
        (left, right) => right.label.length - left.label.length,
      )[0];
      return {
        question: "¿Cuál tiene el nombre más largo?",
        visualType: "word-match",
        visual: { items: pool },
        choices: [longest, ...pool.filter((entry) => entry.id !== longest.id)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "palabra-corta",
    "La palabra corta",
    (p) => `Compara los nombres de ${p.plural} y elige el más corto.`,
    (age) =>
      tri(
        age,
        "Di los nombres en voz alta… ¿cuál suena más cortito?",
        "Nombra cada dibujo y elige el que tiene la palabra más corta.",
        "Pronuncia los nombres separando sílabas y toca el que tiene la palabra más corta.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const pool = rest(p.items, [], 4, h, seed, gameIndex + 4);
      const shortest = [...pool].sort(
        (left, right) => left.label.length - right.label.length,
      )[0];
      return {
        question: "¿Cuál tiene el nombre más corto?",
        visualType: "word-match",
        visual: { items: pool },
        choices: [shortest, ...pool.filter((entry) => entry.id !== shortest.id)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "cuantas-silabas",
    "¿Cuántas sílabas?",
    (p) => `Separa en sílabas el nombre de cada ${p.name.toLowerCase()}.`,
    (age) =>
      tri(
        age,
        "Di el nombre dando palmaditas… ¿cuántas palmadas salen?",
        "Nombra el dibujo separando las sílabas con palmadas y cuenta cuántas hicieron falta.",
        "Segmenta la palabra en sílabas, cuéntalas con precisión y toca el número correcto.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const entry = p.items[gameIndex % p.items.length];
      const count = syllables(entry.label);
      return {
        question: "¿Cuántas sílabas tiene?",
        visualType: "word-match",
        visual: { model: entry, repeatWord: entry.label },
        choices: numbersAround(count, h, seed).slice(0, 4),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "el-o-la",
    "¿El o la?",
    (p) => `Practica el artículo correcto con los nombres de ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Este dibujo… ¿es “el” o es “la”? ¡Elige!",
        "Nombra el dibujo con su artículo. ¿Se dice “el” o se dice “la”?",
        "Decide qué artículo acompaña a esta palabra y dilo en voz alta antes de tocar.",
      ),
    ({ pack: p, gameIndex }) => {
      const entry = p.items[gameIndex % p.items.length];
      const choices = [
        { id: "el", label: "el" },
        { id: "la", label: "la" },
      ];
      return {
        question: `¿Se dice “el ${entry.label}” o “la ${entry.label}”?`,
        visualType: "word-match",
        visual: { model: entry, repeatWord: entry.label },
        choices: entry.gender === "el" ? choices : [choices[1], choices[0]],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "donde-esta",
    "¿Dónde está?",
    (p) => `Usa encima, debajo, dentro y al lado con ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Mira dónde está el dibujo pequeñito… ¿encima o debajo?",
        "Observa la escena y dilo con palabras: ¿dónde está el dibujo pequeño?",
        "Describe la posición exacta del dibujo respecto al otro y elige la palabra que la nombra.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const positions = [
        { id: "encima", label: "encima" },
        { id: "debajo", label: "debajo" },
        { id: "al-lado", label: "al lado" },
        { id: "entre", label: "entre" },
      ];
      const answer = positions[gameIndex % positions.length];
      const [reference, subject] = rest(p.items, [], 2, h, seed, gameIndex + 6);
      return {
        question: "¿Dónde está?",
        visualType: "word-match",
        visual: {
          kind: "position-scene",
          position: answer.id === "entre" ? "between" : answer.id,
          referenceIconName: reference.iconName,
          subjectIconName: subject.iconName,
        },
        choices: [answer, ...positions.filter((entry) => entry.id !== answer.id)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "es-de-la-familia",
    "¿Es de la familia?",
    (p) => `Reconoce qué palabras pertenecen a ${p.name.toLowerCase()}.`,
    (age) =>
      tri(
        age,
        "Dime cuál es de este grupo… ¡y tócalo!",
        "De todas estas palabras, solo una pertenece a este grupo. Nómbrala y tócala.",
        "Clasifica cada palabra por su significado y elige la única que pertenece a este grupo.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const belongs = p.items[gameIndex % p.items.length];
      const strangers = foreignItems(p, idsOf([belongs]), 3, h, seed, gameIndex + 7);
      return {
        question: `¿Cuál es de ${p.name.toLowerCase()}?`,
        visualType: "word-match",
        visual: { family: p.name, topic: p.name },
        choices: [belongs, ...strangers],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "nombra-el-dibujo",
    "Nombra el dibujo",
    (p) => `Di en voz alta el nombre de cada ${p.name.toLowerCase()}.`,
    (age) =>
      tri(
        age,
        "Mira el dibujo y di su nombre en voz alta… ¡y después tócalo!",
        "Nombra en voz alta el dibujo de arriba y búscalo entre las opciones de abajo.",
        "Di el nombre completo del dibujo, escúchate y luego selecciónalo entre las opciones.",
      ),
    ({ pack: p, gameIndex, seed, h }) => {
      const model = p.items[gameIndex % p.items.length];
      const distractors = rest(p.items, [model.id], 3, h, seed, 9);
      return {
        question: "¿Cuál es el dibujo que nombraste?",
        visualType: "speech",
        visual: { model, repeatWord: model.label },
        choices: [model, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "grande-o-pequeno",
    "Grande o pequeño",
    (p) => `Describe con palabras el tamaño de los ${p.plural}.`,
    (age) =>
      tri(
        age,
        "Uno es grande y otro pequeño… ¿cómo es el de la derecha?",
        "Compara los dos tamaños y dilo con palabras: el de la derecha, ¿es grande o pequeño?",
        "Describe con precisión el tamaño del dibujo de la derecha usando la palabra correcta.",
      ),
    ({ pack: p, gameIndex }) => {
      const entry = p.items[gameIndex % p.items.length];
      const choices = [
        { id: "grande", label: "grande" },
        { id: "pequeno", label: "pequeño" },
      ];
      return {
        question: "¿Cómo es el de la derecha?",
        visualType: "word-match",
        visual: { kind: "size-pair", itemIconName: entry.iconName },
        choices,
        correctIndex: 0,
      };
    },
  ),
]);

// ---------------------------------------------------------------------------
// Inglés: aquí la locución sí depende de la palabra de la ronda, porque la
// palabra en inglés es justamente lo que hay que escuchar.
// ---------------------------------------------------------------------------

const ENGLISH_MECHANICS = Object.freeze([
  mechanic(
    "touch-the-word",
    "Touch the…",
    (p) => `Escucha el nombre en inglés de ${p.plural} y tócalo.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[gameIndex % p.items.length];
      const distractors = rest(p.items, [target.id], 3, h, seed, 2);
      return {
        question: `Touch the ${target.en}.`,
        spoken: tri(
          age,
          `En inglés esto se dice ${target.en}. ¡Toca el ${target.en}!`,
          `Escucha con atención: ${target.en}. En español decimos ${target.label}. ¿Cuál es el ${target.en}?`,
          `Escucha la palabra en inglés: ${target.en}. Búscala entre las opciones y tócala sin ayuda del español.`,
        ),
        visualType: "word-match",
        visual: { word: target.en },
        choices: [target, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "listen-and-repeat",
    "Listen and repeat",
    (p) => `Repite en voz alta el nombre en inglés de ${p.plural}.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const target = p.items[(gameIndex + 1) % p.items.length];
      const distractors = rest(p.items, [target.id], 3, h, seed, 3);
      return {
        question: `Say it: ${target.en}.`,
        spoken: tri(
          age,
          `Esto es un ${target.en}. Dilo conmigo: ${target.en}. ¡Ahora tócalo!`,
          `Mira bien: esto es un ${target.en}. Repite conmigo, ${target.en}, y después tócalo.`,
          `Escucha y repite en voz alta: ${target.en}. Cuando lo hayas dicho, selecciona la imagen correcta.`,
        ),
        visualType: "speech",
        visual: { model: target, word: target.en, repeatWord: target.en },
        choices: [target, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-colors",
    "Colors",
    (p) => `Aprende los colores en inglés con ${p.plural}.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const color = TONES[gameIndex % TONES.length];
      const others = rest(TONES, [color.id], 3, h, seed, 4);
      const [target, ...companions] = rest(p.items, [], 4, h, seed, gameIndex + 5);
      return {
        question: `Touch the ${color.en} one.`,
        spoken: tri(
          age,
          `El color ${color.label} en inglés es ${color.en}. ¡Toca el ${color.en}!`,
          `Escucha el color: ${color.en}. En español es ${color.label}. ¿Cuál está pintado de ${color.en}?`,
          `Busca el dibujo pintado de ${color.en} y tócalo. Recuerda el color solo por su nombre en inglés.`,
        ),
        visualType: "word-match",
        visual: { word: color.en },
        choices: [
          tint(target, color),
          ...companions.map((entry, index) => tint(entry, others[index % others.length])),
        ],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-numbers",
    "Numbers",
    (p) => `Cuenta ${p.plural} en inglés.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const entry = p.items[(gameIndex + 2) % p.items.length];
      const count = 1 + ((gameIndex + age.difficulty) % 5);
      const word = ENGLISH_NUMBERS[count];
      const choices = numbersAround(count, h, seed).map((choice) => ({
        ...choice,
        label: `${choice.label} · ${ENGLISH_NUMBERS[Number(choice.value)] ?? ""}`,
      }));
      return {
        question: `How many? ${word}?`,
        spoken: tri(
          age,
          `Cuenta conmigo en inglés y toca el número: ${word}.`,
          `Cuenta los dibujos y escucha el número en inglés: ${word}. ¿Cuál es?`,
          `Cuenta en inglés hasta el total y comprueba si coincide con ${word}. Después toca el número.`,
        ),
        visualType: "quantity",
        visual: { itemIconName: entry.iconName, count, word },
        choices,
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-big-small",
    "Big and small",
    (p) => `Aprende big y small con ${p.plural}.`,
    null,
    ({ pack: p, age, gameIndex }) => {
      const entry = p.items[(gameIndex + 3) % p.items.length];
      const wantsBig = gameIndex % 2 === 0;
      const word = wantsBig ? "big" : "small";
      const choices = [
        { id: "big", label: "big", iconName: entry.iconName, scale: 1.4 },
        { id: "small", label: "small", iconName: entry.iconName, scale: 0.7 },
      ];
      return {
        question: `Touch the ${word} one.`,
        spoken: tri(
          age,
          `En inglés, ${word}. ¡Toca el ${word}!`,
          `Escucha: ${word}. En español es ${wantsBig ? "grande" : "pequeño"}. ¿Cuál es el ${word}?`,
          `Compara los dos tamaños y toca el que es ${word}, guiándote solo por la palabra en inglés.`,
        ),
        visualType: "comparison",
        visual: { kind: "size-pair", itemIconName: entry.iconName, word },
        choices: wantsBig ? choices : [choices[1], choices[0]],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-where",
    "On and under",
    (p) => `Aprende on, under y next to con ${p.plural}.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const positions = [
        { id: "on", label: "on", spanish: "encima", scene: "encima" },
        { id: "under", label: "under", spanish: "debajo", scene: "debajo" },
        { id: "next-to", label: "next to", spanish: "al lado", scene: "al-lado" },
      ];
      const answer = positions[gameIndex % positions.length];
      const [reference, subject] = rest(p.items, [], 2, h, seed, gameIndex + 6);
      return {
        question: `Where is it? ${answer.label}?`,
        spoken: tri(
          age,
          `En inglés se dice ${answer.label}. ¡Toca ${answer.label}!`,
          `Mira dónde está y escucha: ${answer.label}, que en español es ${answer.spanish}. ¿Cuál es?`,
          `Observa la escena y elige la preposición inglesa correcta: ${answer.label}.`,
        ),
        visualType: "word-match",
        visual: {
          kind: "position-scene",
          position: answer.scene,
          referenceIconName: reference.iconName,
          subjectIconName: subject.iconName,
          word: answer.label,
        },
        choices: [answer, ...positions.filter((entry) => entry.id !== answer.id)],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-one-many",
    "One and many",
    (p) => `Distingue one y many con ${p.plural}.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const entry = p.items[(gameIndex + 4) % p.items.length];
      const wantsMany = gameIndex % 2 === 1;
      const word = wantsMany ? "many" : "one";
      const manyFirst = h.mix(seed, 7) % 2 === 0;
      return {
        question: `Touch ${word}.`,
        spoken: tri(
          age,
          `En inglés, ${word}. ¡Toca ${word}!`,
          `Escucha: ${word}, que en español es ${wantsMany ? "muchos" : "uno"}. ¿Dónde está?`,
          `Compara los dos grupos y toca el que corresponde a ${word} en inglés.`,
        ),
        visualType: "comparison",
        visual: {
          groups: [
            { id: "grupo-1", count: manyFirst ? 4 : 1, iconName: entry.iconName },
            { id: "grupo-2", count: manyFirst ? 1 : 4, iconName: entry.iconName },
          ],
          word,
        },
        choices: (() => {
          const manyGroup = { id: manyFirst ? "grupo-1" : "grupo-2", label: "many" };
          const oneGroup = { id: manyFirst ? "grupo-2" : "grupo-1", label: "one" };
          return wantsMany ? [manyGroup, oneGroup] : [oneGroup, manyGroup];
        })(),
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-same",
    "Find the same",
    (p) => `Empareja ${p.plural} escuchando la palabra en inglés.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const model = p.items[(gameIndex + 5) % p.items.length];
      const distractors = rest(p.items, [model.id], 3, h, seed, 8);
      return {
        question: `Find the same ${model.en}.`,
        spoken: tri(
          age,
          `Arriba hay un ${model.en}. ¡Busca el otro ${model.en}!`,
          `El dibujo de arriba es un ${model.en}. Encuentra abajo el que es igual.`,
          `Memoriza el modelo, escucha su nombre en inglés, ${model.en}, y localiza el idéntico.`,
        ),
        visualType: "choice-grid",
        visual: { model, word: model.en },
        choices: [model, ...distractors],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-yes-no",
    "Yes or no",
    (p) => `Responde yes o no sobre ${p.plural} en inglés.`,
    null,
    ({ pack: p, age, gameIndex, seed, h }) => {
      const shown = p.items[(gameIndex + 6) % p.items.length];
      const asksTruth = h.mix(seed, 9) % 2 === 0;
      const asked = asksTruth ? shown : rest(p.items, [shown.id], 1, h, seed, 10)[0];
      const choices = [
        { id: "yes", label: "yes", iconName: "CheckCircle" },
        { id: "no", label: "no", iconName: "XCircle" },
      ];
      return {
        question: `Is this a ${asked.en}?`,
        spoken: tri(
          age,
          `¿Es un ${asked.en}? Contesta: yes o no.`,
          `Mira el dibujo y escucha la pregunta: is this a ${asked.en}? Responde yes o no.`,
          `Escucha la pregunta completa, compárala con el dibujo y responde yes o no en inglés.`,
        ),
        visualType: "word-match",
        visual: { model: shown, word: asked.en },
        choices: asksTruth ? choices : [choices[1], choices[0]],
        correctIndex: 0,
      };
    },
  ),
  mechanic(
    "english-shapes",
    "Shapes",
    (p) => `Reconoce las figuras en inglés junto a ${p.plural}.`,
    null,
    ({ age, gameIndex, seed, h }) => {
      const shapes = [
        { id: "circle", label: "circle", iconName: "Circle" },
        { id: "square", label: "square", iconName: "Square" },
        { id: "triangle", label: "triangle", iconName: "Triangle" },
        { id: "star", label: "star", iconName: "Star" },
        { id: "hexagon", label: "hexagon", iconName: "Hexagon" },
      ];
      const target = shapes[gameIndex % shapes.length];
      const others = rest(shapes, [target.id], 3, h, seed, 11);
      return {
        question: `Touch the ${target.label}.`,
        spoken: tri(
          age,
          `Esta figura en inglés es ${target.label}. ¡Tócala!`,
          `Escucha el nombre de la figura en inglés: ${target.label}. ¿Cuál es?`,
          `Identifica la figura por su nombre en inglés, ${target.label}, y tócala entre las opciones.`,
        ),
        visualType: "choice-grid",
        visual: { word: target.label },
        choices: [target, ...others],
        correctIndex: 0,
      };
    },
  ),
]);

const AREA_MECHANICS = Object.freeze({
  logica: LOGIC_MECHANICS,
  matematicas: MATH_MECHANICS,
  atencion: ATTENTION_MECHANICS,
  habla: SPEECH_MECHANICS,
  ingles: ENGLISH_MECHANICS,
});

// Diez packs por materia: se eligen los que mejor sostienen cada tipo de tarea
// (formas y caritas dan más juego en lógica y atención; granja y cocina, en
// habla e inglés) y se dejan fuera los dos restantes para que ninguna materia
// repita el mismo repertorio visual que la de al lado.
const AREA_PACK_IDS = Object.freeze({
  logica: ["formas", "caritas", "mascotas", "jardin", "cocina", "casa", "vehiculos", "escuela", "juguetes", "cielo"],
  matematicas: ["juguetes", "cocina", "jardin", "mar", "cielo", "formas", "vehiculos", "escuela", "granja", "mascotas"],
  atencion: ["caritas", "formas", "mascotas", "casa", "escuela", "juguetes", "cocina", "cielo", "mar", "granja"],
  habla: ["mascotas", "granja", "casa", "cocina", "jardin", "escuela", "juguetes", "vehiculos", "cielo", "caritas"],
  ingles: ["mascotas", "granja", "cocina", "casa", "escuela", "juguetes", "formas", "cielo", "jardin", "vehiculos"],
});

const MECHANIC_BY_KEY = new Map();
for (const [areaId, mechanics] of Object.entries(AREA_MECHANICS)) {
  mechanics.forEach((entry, index) => {
    MECHANIC_BY_KEY.set(`${areaId}/${entry.id}`, { mechanic: entry, index });
  });
}

/** Marca que `buildCurriculumChallenge` usa para desviar el reto a esta matriz. */
export const MATRIX_STRATEGY = "matrix";

/**
 * Las cien categorías generadas de una materia. El currículo escrito a mano se
 * conserva tal cual y estas se añaden detrás.
 */
export function buildMatrixCategories(areaId, gameCount) {
  const mechanics = AREA_MECHANICS[areaId];
  const packIds = AREA_PACK_IDS[areaId];
  if (!mechanics || !packIds) return [];

  // Recorrido en diagonal: si se listaran mecánica por mecánica, la sala
  // mostraría diez «Igual al modelo» seguidos y parecería el mismo juego diez
  // veces. Así cada tarjeta contigua cambia de tarea y de tema a la vez.
  const categories = [];
  for (let lap = 0; lap < packIds.length; lap += 1) {
    for (const [index, entry] of mechanics.entries()) {
      const themePack = PACK_BY_ID.get(packIds[(index + lap) % packIds.length]);
      if (!themePack) continue;
      categories.push(
        Object.freeze({
          id: `${entry.id}--${themePack.id}`,
          name: `${entry.title} · ${themePack.name}`,
          iconName: themePack.iconName,
          strategy: MATRIX_STRATEGY,
          description: entry.describe(themePack),
          gameCount,
          blueprint: Object.freeze({
            areaId,
            mechanicId: entry.id,
            packId: themePack.id,
          }),
        }),
      );
    }
  }
  return categories;
}

/**
 * Definición del reto para `makeChallenge`. Devuelve también `coachingIndex`
 * para fijar el cierre alentador por mecánica: si rotara con la ronda, cada
 * juego necesitaría el triple de locuciones grabadas.
 */
export function buildMatrixDefinition({ blueprint, age, gameIndex, seed, helpers }) {
  const found = MECHANIC_BY_KEY.get(`${blueprint.areaId}/${blueprint.mechanicId}`);
  const themePack = PACK_BY_ID.get(blueprint.packId);
  if (!found || !themePack) {
    throw new RangeError(
      `Juego generado desconocido: ${blueprint.areaId}/${blueprint.mechanicId}/${blueprint.packId}`,
    );
  }

  const built = found.mechanic.build({
    pack: themePack,
    age,
    gameIndex,
    seed,
    h: helpers,
  });

  return {
    question: built.question,
    spokenInstruction: built.spoken ?? found.mechanic.speak(age),
    coachingIndex: found.index,
    visualType: built.visualType,
    visualKind: built.visual?.kind ?? `matrix-${found.mechanic.id}`,
    visual: built.visual,
    choices: built.choices,
    correctIndex: built.correctIndex,
  };
}
