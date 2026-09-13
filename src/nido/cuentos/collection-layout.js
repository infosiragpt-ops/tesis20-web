// Las ediciones completas mantienen cada palabra del texto autorizado.
// Solo se añaden saltos de página: nunca se resume ni se corta el final.
export function paginateStory(paragraphs, limit = 65) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Invalid page size');
  const pages = [];
  let current = [];
  const flush = () => { if (current.length) pages.push(current.join(' ')); current = []; };
  for (const paragraph of paragraphs) {
    const tokens = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    if (current.length && current.length + tokens.length > limit) flush();
    for (const token of tokens) {
      current.push(token);
      if (current.length >= limit) flush();
    }
  }
  flush();
  return pages;
}

export function pageWindow(page, count, size = 7) {
  const start = Math.max(0, Math.min(page - Math.floor(size / 2), count - size));
  return Array.from({ length: Math.min(size, count) }, (_, i) => start + i);
}

export function searchBooks(books, query) {
  const key = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
  const terms = key(query).trim().split(/\s+/).filter(Boolean);
  return books.filter(book => terms.every(term => key(book.title).includes(term)));
}
