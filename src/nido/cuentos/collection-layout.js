// Las ediciones completas mantienen cada palabra del texto autorizado.
// Solo se añaden saltos de página: nunca se resume ni se corta el final.
// Las páginas son rangos [inicio, fin) sobre la lista de palabras del cuento,
// así la hoja que se ve y el audio grabado se pueden cruzar palabra a palabra.

/** Palabras del cuento en orden y los índices donde termina cada párrafo. */
export function storyTokens(paragraphs) {
  const tokens = [];
  const paragraphEnds = new Set();
  for (const paragraph of paragraphs) {
    const words = String(paragraph ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    tokens.push(...words);
    paragraphEnds.add(tokens.length - 1);
  }
  return { tokens, paragraphEnds };
}

/**
 * Reparto antiguo: cortes fijos cada `limit` palabras aunque caigan a media
 * frase. Se conserva porque la voz de estudio de los clásicos se grabó con
 * estas páginas y sus marcas de tiempo siguen este orden.
 */
export function fixedRanges(paragraphs, limit = 65) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Invalid page size');
  const ranges = [];
  let start = 0;
  let at = 0;
  const flush = () => { if (at > start) ranges.push([start, at]); start = at; };
  for (const paragraph of paragraphs) {
    const count = String(paragraph ?? '').trim().split(/\s+/).filter(Boolean).length;
    if (!count) continue;
    if (at > start && at - start + count > limit) flush();
    for (let i = 0; i < count; i += 1) {
      at += 1;
      if (at - start >= limit) flush();
    }
  }
  flush();
  return ranges;
}

export function paginateStory(paragraphs, limit = 65) {
  const { tokens } = storyTokens(paragraphs);
  return fixedRanges(paragraphs, limit).map(([start, end]) => tokens.slice(start, end).join(' '));
}

const ENDS_SENTENCE = /[.!?…]["'»”’)\]]*$/;
const ENDS_CLAUSE = /[,;:]["'»”’)\]]*$/;
// «—¡No!» abre frase; «—dijo» después de «¡No!» la continúa.
const STARTS_SENTENCE = /^[—–\-«"“'¡¿(]*[\p{Lu}\d]/u;

// Costo de cortar la página después de la palabra `index`.
function breakCost(tokens, index, paragraphEnds) {
  if (index === tokens.length - 1) return 0;
  const word = tokens[index];
  const next = tokens[index + 1];
  const paragraph = paragraphEnds.has(index);
  if (ENDS_SENTENCE.test(word) && STARTS_SENTENCE.test(next)) return paragraph ? 0 : 2;
  // Fin de párrafo sin punto: «les dijo:» antes del diálogo, o un párrafo que
  // la fuente cortó a media frase («que» | «se encontraban»).
  if (paragraph && /:["'»”’)\]]*$/.test(word)) return 8;
  if (ENDS_SENTENCE.test(word)) return 12;
  if (ENDS_CLAUSE.test(word)) return 18;
  return 60;
}

function lengthCost(count, target) {
  let cost = ((count - target) / 10) ** 2;
  if (count < 20) cost += 200;
  else if (count < 30) cost += (30 - count) * 3;
  if (count > 80) cost += (count - 80) * 4;
  return cost;
}

/**
 * Reparto por frases: cada página termina, siempre que se pueda, donde
 * termina una oración (mejor si también acaba el párrafo) y ronda las
 * `target` palabras. Se elige el reparto de menor costo de todo el cuento,
 * así no quedan hojas con dos palabras sueltas ni frases partidas.
 */
export function sentenceRanges(paragraphs, { target = 55, max = 130 } = {}) {
  const { tokens, paragraphEnds } = storyTokens(paragraphs);
  const count = tokens.length;
  const best = new Float64Array(count + 1).fill(Infinity);
  const from = new Int32Array(count + 1);
  best[0] = 0;
  for (let end = 1; end <= count; end += 1) {
    const cut = breakCost(tokens, end - 1, paragraphEnds);
    for (let start = Math.max(0, end - max); start < end; start += 1) {
      if (best[start] === Infinity) continue;
      const cost = best[start] + lengthCost(end - start, target) + cut;
      if (cost < best[end]) {
        best[end] = cost;
        from[end] = start;
      }
    }
  }
  const ranges = [];
  for (let end = count; end > 0; end = from[end]) ranges.unshift([from[end], end]);
  return ranges;
}

export function pageWindow(page, count, size = 7) {
  const start = Math.max(0, Math.min(page - Math.floor(size / 2), count - size));
  return Array.from({ length: Math.min(size, count) }, (_, i) => start + i);
}

export function resumePage(book, entry) {
  const valid = value => Number.isInteger(value) && value >= 0 && value < book.pages.length;
  const pages = [...new Set((entry?.pages || []).filter(valid))];
  if (pages.length === book.pages.length) return 0;
  return valid(entry?.lastPage) ? entry.lastPage : (pages.at(-1) ?? 0);
}

export function isClassicEdition(book) {
  return book?.id?.startsWith('clasico-') || book?.edition === 'Texto de la web';
}

export function hasStudioNarration(book) {
  return book?.narration !== 'reading-only' && book?.narration !== 'device';
}

export function searchBooks(books, query, filter = 'all', entries = {}) {
  const key = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
  const terms = key(query).trim().split(/\s+/).filter(Boolean);
  return books.filter(book => {
    if (!terms.every(term => key(book.title).includes(term))) return false;
    if (filter === 'narrated') return hasStudioNarration(book);
    if (filter === 'reading' || filter === 'device' || filter === 'classic') return isClassicEdition(book);
    if (filter === 'started') {
      const pages = new Set((entries[book.id]?.pages || []).filter(i => Number.isInteger(i) && i >= 0 && i < book.pages.length));
      return pages.size > 0 && pages.size < book.pages.length;
    }
    return true;
  });
}
