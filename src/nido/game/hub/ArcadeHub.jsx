// Sala de Juegos: hub estilo portal de arcade (grid denso de tarjetas
// grandes y coloridas, filtros por categoría, tarjeta destacada) inspirado
// en el lenguaje visual de portales de minijuegos y apps educativas
// premium: color saturado, tipografía redondeada gruesa, mascota expresiva,
// feedback inmediato al pasar el cursor.

import { useEffect, useMemo, useState } from "react";

// El catálogo pasó de 40 a más de 500 juegos: pintarlos todos de golpe llena la
// pantalla de tarjetas que nadie va a mirar y ralentiza el desplazamiento en
// tablets modestas. Se revelan por tandas y hay un buscador para llegar directo.
const PAGE_SIZE = 48;

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("es");
}

/**
 * El filtro activo vive en el padre: la fila "Materias del Nido" también lo
 * cambia, así que no puede haber dos fuentes de verdad.
 *
 * @param {{
 *   tiles: Array<{
 *     id: string, title: string, tagline: string, category: string,
 *     accent: string, accentSoft: string, badge?: string,
 *     progressLabel?: string, icon: React.ReactNode,
 *     onOpen: (event: React.MouseEvent) => void,
 *   }>,
 *   categories: Array<{ id: string, label: string }>,
 *   activeCategory: string,
 *   onCategoryChange: (categoryId: string) => void,
 * }} props
 */
export default function ArcadeHub({
  tiles,
  categories,
  activeCategory,
  onCategoryChange,
}) {
  const [query, setQuery] = useState("");
  const [pageCount, setPageCount] = useState(1);

  const visibleTiles = useMemo(() => {
    const search = normalize(query).trim();
    return tiles.filter((tile) => {
      if (activeCategory !== "todos" && tile.category !== activeCategory) {
        return false;
      }
      if (!search) return true;
      return normalize(`${tile.title} ${tile.tagline}`).includes(search);
    });
  }, [activeCategory, query, tiles]);

  // Cambiar de materia o de búsqueda empieza otra vez por la primera tanda.
  useEffect(() => {
    setPageCount(1);
  }, [activeCategory, query]);

  const shownTiles = visibleTiles.slice(0, pageCount * PAGE_SIZE);
  const remaining = visibleTiles.length - shownTiles.length;

  return (
    <div className="arcade">
      <div
        className="arcade__filters"
        role="tablist"
        aria-label="Filtrar juegos por categoría"
      >
        <button
          className={activeCategory === "todos" ? "is-selected" : ""}
          type="button"
          role="tab"
          aria-selected={activeCategory === "todos"}
          onClick={() => onCategoryChange("todos")}
        >
          Todos · {tiles.length}
        </button>
        {categories.map((category) => {
          const count = tiles.filter((tile) => tile.category === category.id).length;
          if (!count) return null;
          return (
            <button
              className={activeCategory === category.id ? "is-selected" : ""}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
              key={category.id}
            >
              {category.label} · {count}
            </button>
          );
        })}
      </div>

      <div className="arcade__search">
        <label htmlFor="arcade-search">Buscar un juego</label>
        <input
          id="arcade-search"
          type="search"
          value={query}
          placeholder="Escribe: contar, sombra, colors…"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
        <span aria-live="polite">
          {visibleTiles.length === tiles.length
            ? `${tiles.length} juegos`
            : `${visibleTiles.length} de ${tiles.length} juegos`}
        </span>
      </div>

      <div className="arcade__grid" aria-label="Juegos disponibles">
        {shownTiles.map((tile) => (
          <button
            className="arcade__tile"
            type="button"
            data-game-id={tile.id}
            style={{
              "--tile-accent": tile.accent,
              "--tile-accent-soft": tile.accentSoft,
            }}
            onClick={tile.onOpen}
            key={tile.id}
          >
            <span className="arcade__tile-glow" aria-hidden="true" />
            {tile.badge ? <span className="arcade__tile-badge">{tile.badge}</span> : null}
            <span className="arcade__tile-icon" aria-hidden="true">
              {tile.icon}
            </span>
            <span className="arcade__tile-copy">
              <strong>{tile.title}</strong>
              <small>{tile.tagline}</small>
            </span>
            {tile.progressLabel ? (
              <span className="arcade__tile-progress">{tile.progressLabel}</span>
            ) : null}
            <span className="arcade__tile-play" aria-hidden="true">▶</span>
          </button>
        ))}
      </div>

      {remaining > 0 ? (
        <button
          className="arcade__more"
          type="button"
          onClick={() => setPageCount((count) => count + 1)}
        >
          Ver más juegos · quedan {remaining}
        </button>
      ) : null}

      {!visibleTiles.length ? (
        <p className="arcade__empty">
          {query.trim()
            ? `Ningún juego se llama así. Prueba con otra palabra.`
            : "No hay juegos en esta categoría todavía."}
        </p>
      ) : null}
    </div>
  );
}
