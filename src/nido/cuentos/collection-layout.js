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

export function resumePage(book, entry) {
  const valid = value => Number.isInteger(value) && value >= 0 && value < book.pages.length;
  const pages = [...new Set((entry?.pages || []).filter(valid))];
  if (pages.length === book.pages.length) return 0;
  return valid(entry?.lastPage) ? entry.lastPage : (pages.at(-1) ?? 0);
}

export function searchBooks(books, query, filter = 'all', entries = {}) {
  const key = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
  const terms = key(query).trim().split(/\s+/).filter(Boolean);
  return books.filter(book => {
    if (!terms.every(term => key(book.title).includes(term))) return false;
    if (filter === 'narrated') return !['reading-only', 'device'].includes(book.narration);
    if (filter === 'reading' || filter === 'device') return book.narration === 'device';
    if (filter === 'started') {
      const pages = new Set((entries[book.id]?.pages || []).filter(i => Number.isInteger(i) && i >= 0 && i < book.pages.length));
      return pages.size > 0 && pages.size < book.pages.length;
    }
    return true;
  });
}
