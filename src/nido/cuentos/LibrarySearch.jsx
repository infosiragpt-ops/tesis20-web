import { useEffect, useMemo, useRef, useState } from 'react';
import { searchBooks, resumePage } from './collection-layout.js';
import { bookStatus } from './cuentos-progress.js';

// La búsqueda sólo monta miniaturas al abrirse; no descarga escenas ni audio.
export function LibrarySearch({ books, state, onOpen }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const matches = useMemo(() => searchBooks(books, query, filter, state.books), [books, query, filter, state.books]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const outside = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [query, filter]);

  const choose = book => {
    setOpen(false);
    onOpen(book.id);
  };

  return <div className="cuentos-library-search" ref={rootRef} onKeyDown={event => {
    if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  }}>
    <button ref={triggerRef} type="button" className="cuentos-btn" aria-expanded={open} aria-controls="story-search-panel" onClick={() => setOpen(value => !value)}>
      ⌕ Buscar entre {books.length} libros
    </button>
    {open ? <section id="story-search-panel" className="cuentos-search-panel" aria-label="Buscar un cuento">
      <div className="cuentos-search-panel__head">
        <label htmlFor="story-search">Tu próxima aventura</label>
        <button type="button" className="cuentos-search-close" onClick={close} aria-label="Cerrar buscador">×</button>
      </div>
      <input ref={inputRef} id="story-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busca por título…" autoFocus type="search" onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Enter' && matches.length === 1) { event.preventDefault(); choose(matches[0]); }
        if (event.key === 'ArrowDown' && matches.length) { event.preventDefault(); resultsRef.current?.querySelector('button')?.focus(); }
      }} />
      <div className="cuentos-search-filter">
        <label htmlFor="story-filter">Mostrar</label>
        <select id="story-filter" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="all">Todos los cuentos</option>
          <option value="narrated">Voz de estudio</option>
          <option value="device">Voz del dispositivo</option>
          <option value="started">Seguir leyendo</option>
        </select>
      </div>
      <p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? 'libro encontrado' : 'libros encontrados'}</p>
      <ul ref={resultsRef} aria-label="Resultados de cuentos">{matches.map(book => {
        const status = bookStatus(state, book);
        return <li key={book.id}><button type="button" onClick={() => choose(book)}>
          <img src={book.cover.image} alt="" width="40" height="58" loading="lazy" decoding="async" />
          <span className="cuentos-search-result__copy">
            <strong>{book.title}</strong>
            <small>{book.narration === 'device' ? 'Voz del dispositivo · texto íntegro' : 'Voz de estudio'} · {book.pages.length} páginas</small>
            {status.started ? <span className="cuentos-search-result__progress">{status.finished ? 'Completado · volver a leer' : `Continuar en la página ${resumePage(book, status) + 1} · ${status.pct}% leído`}</span> : null}
          </span>
        </button></li>;
      })}</ul>
      {!matches.length ? <div className="cuentos-search-empty">
        <p>{filter === 'started' && !query ? 'Aquí aparecerán los cuentos que empieces a leer.' : 'No encontramos un cuento con esos filtros.'}</p>
        <button type="button" onClick={() => { setQuery(''); setFilter('all'); inputRef.current?.focus(); }}>Ver todos los cuentos</button>
      </div> : null}
    </section> : null}
  </div>;
}
