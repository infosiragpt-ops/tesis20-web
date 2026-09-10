// Plan de voz de la biblioteca de cuentos: qué se graba y cómo se enlaza.
//
// Lo comparten el generador (scripts/generate-nido-cuentos-voice.mjs), el
// reproductor (cuentos-audio.js) y las pruebas. Es JavaScript puro, sin DOM ni
// Node, para que las tres partes calculen exactamente las mismas claves: si el
// reproductor partiera las palabras de otra forma que el generador, el
// subrayado se desfasaría sin que nadie lo notara hasta oírlo.

/** Texto que se narra al abrir una página: título y cuerpo, como en el lector. */
export function pageSpeechText(page) {
  return `${page.t}. ${page.x}`;
}

/**
 * Divide un texto en palabras separadas por espacios y guarda el índice del
 * primer carácter de cada una. Es el mismo criterio que usa el lector para
 * numerar las palabras que subraya.
 */
export function splitWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const offsets = [];
  let cursor = 0;
  for (const word of words) {
    const at = text.indexOf(word, cursor);
    offsets.push(at);
    cursor = at + word.length;
  }
  return { words, offsets };
}

/**
 * Clave de una palabra suelta: letras y dígitos en minúsculas, sin la
 * puntuación que la acompaña en la página («—¿Dónde» y «dónde?» comparten
 * clip). Devuelve null si el token no tiene letras.
 */
export function wordKey(token) {
  const clean = String(token ?? "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
  return clean || null;
}

/**
 * Cómo se dicta una palabra suelta: en minúsculas y con punto final para que
 * la voz cierre. Se normaliza para que el clip no dependa de en qué cuento
 * apareció primero la palabra («Y» al inicio de frase y «y» comparten mp3):
 * añadir un libro al principio de la biblioteca no debe regrabar nada.
 */
export function wordSpeechText(token) {
  const key = wordKey(token);
  return key ? `${key}.` : "";
}

/** Una opción del quiz se dicta como frase cerrada. */
export function optionSpeechText(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Enumera todas las locuciones de la biblioteca: una por página (con marcas
 * de tiempo para el subrayado), una por pregunta, una por opción y una por
 * palabra distinta del cuerpo de las páginas.
 */
export function enumerateCuentosVoicePlan(books) {
  const jobs = [];
  const seenWords = new Map();
  for (const book of books) {
    book.pages.forEach((page, index) => {
      jobs.push({
        kind: "page",
        key: `page:${book.id}:${index}`,
        bookId: book.id,
        index,
        text: pageSpeechText(page),
        profile: "narracion",
        timestamps: true,
      });
      for (const token of page.x.split(/\s+/)) {
        const key = wordKey(token);
        if (!key || seenWords.has(key)) continue;
        seenWords.set(key, wordSpeechText(token));
      }
    });
    book.quiz.forEach((question, index) => {
      jobs.push({
        kind: "quiz-q",
        key: `quiz:${book.id}:${index}:q`,
        bookId: book.id,
        index,
        text: optionSpeechText(question.q),
        profile: "pregunta",
        timestamps: false,
      });
      question.a.forEach((option, optionIndex) => {
        jobs.push({
          kind: "quiz-a",
          key: `quiz:${book.id}:${index}:a:${optionIndex}`,
          bookId: book.id,
          index,
          optionIndex,
          text: optionSpeechText(option),
          profile: "pregunta",
          timestamps: false,
        });
      });
    });
  }
  for (const [key, text] of seenWords) {
    jobs.push({
      kind: "word",
      key: `word:${key}`,
      wordKey: key,
      text,
      profile: "palabra",
      timestamps: false,
    });
  }
  return jobs;
}

/**
 * Convierte la alineación por carácter de ElevenLabs en el segundo en que
 * empieza cada palabra del texto. Devuelve null si la alineación no
 * corresponde carácter a carácter con el texto enviado: en ese caso es mejor
 * subrayar por tiempo estimado que confiar en marcas de otro texto.
 */
export function wordStartsFromAlignment(text, alignment) {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  if (!Array.isArray(chars) || !Array.isArray(starts)) return null;
  if (chars.join("") !== text || starts.length !== chars.length) return null;
  const { offsets } = splitWords(text);
  const result = [];
  let previous = 0;
  for (const offset of offsets) {
    const value = Number(starts[offset]);
    if (!Number.isFinite(value)) return null;
    // Las marcas nunca retroceden; si la API devolviera una menor se pisa con
    // la anterior para no subrayar hacia atrás.
    previous = Math.max(previous, value);
    result.push(Math.round(previous * 100) / 100);
  }
  return result;
}

/**
 * Reparto uniforme cuando no hay marcas de tiempo: cada palabra dura en
 * proporción a sus letras. Sirve de respaldo, no de norma.
 */
export function estimateWordStarts(text, duration) {
  const { words } = splitWords(text);
  const total = words.reduce((sum, word) => sum + word.length + 1, 0) || 1;
  const starts = [];
  let elapsed = 0;
  for (const word of words) {
    starts.push(Math.round((elapsed / total) * duration * 100) / 100);
    elapsed += word.length + 1;
  }
  return starts;
}

/** Índice de la palabra que suena en el segundo `time` (−1 antes de la primera). */
export function wordIndexAt(starts, time) {
  if (!Array.isArray(starts) || !starts.length) return -1;
  let low = 0;
  let high = starts.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (starts[middle] <= time) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}
