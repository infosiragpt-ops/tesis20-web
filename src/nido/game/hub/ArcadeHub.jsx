// Sala de Juegos: hub estilo portal de arcade (grid denso de tarjetas
// grandes y coloridas, filtros por categoría, tarjeta destacada) inspirado
// en el lenguaje visual de portales de minijuegos y apps educativas
// premium: color saturado, tipografía redondeada gruesa, mascota expresiva,
// feedback inmediato al pasar el cursor.

import { useMemo, useState } from "react";

/**
 * @param {{
 *   tiles: Array<{
 *     id: string, title: string, tagline: string, category: string,
 *     accent: string, accentSoft: string, badge?: string,
 *     progressLabel?: string, icon: React.ReactNode, onOpen: () => void,
 *   }>,
 *   categories: Array<{ id: string, label: string }>,
 * }} props
 */
export default function ArcadeHub({ tiles, categories }) {
  const [activeCategory, setActiveCategory] = useState("todos");

  const visibleTiles = useMemo(
    () =>
      activeCategory === "todos"
        ? tiles
        : tiles.filter((tile) => tile.category === activeCategory),
    [activeCategory, tiles],
  );

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
          onClick={() => setActiveCategory("todos")}
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
              onClick={() => setActiveCategory(category.id)}
              key={category.id}
            >
              {category.label} · {count}
            </button>
          );
        })}
      </div>

      <div className="arcade__grid" aria-label="Juegos disponibles">
        {visibleTiles.map((tile) => (
          <button
            className="arcade__tile"
            type="button"
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

      {!visibleTiles.length ? (
        <p className="arcade__empty">No hay juegos en esta categoría todavía.</p>
      ) : null}
    </div>
  );
}
