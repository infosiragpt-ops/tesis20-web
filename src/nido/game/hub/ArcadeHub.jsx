import { useEffect, useId, useMemo, useState } from "react";

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

// FNV-1a: variaciones estables por juego, sin estado ni aleatoriedad.
function hashGameId(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * El filtro sigue viviendo en el padre para compartir estado con
 * "Materias del Nido"; la API de apertura de cada tile no cambia.
 */
export default function ArcadeHub({
  tiles,
  categories,
  activeCategory,
  onCategoryChange,
}) {
  const uid = useId().replaceAll(":", "");
  const panelId = `arcade-panel-${uid}`;
  const searchId = `arcade-search-${uid}`;
  const [query, setQuery] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const filters = useMemo(
    () => [
      { id: "todos", label: "Todos", count: tiles.length },
      ...categories
        .map((category) => ({
          ...category,
          count: tiles.filter((tile) => tile.category === category.id).length,
        }))
        .filter(({ count }) => count),
    ],
    [categories, tiles],
  );

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
  const activeFilter =
    filters.find(({ id }) => id === activeCategory) ?? filters[0];

  const moveThroughFilters = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;

    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    tabs[next].focus();
    tabs[next].click();
  };

  return (
    <div className="arcade">
      <div className="arcade__heading">
        <span className="arcade__heading-mark" aria-hidden="true" />
        <span className="arcade__heading-copy">
          <small>Tu próxima aventura</small>
          <strong>Elige, juega y conquista un reto</strong>
        </span>
        <span className="arcade__count" aria-live="polite">
          <strong>{visibleTiles.length}</strong>
          <small>{visibleTiles.length === 1 ? "juego" : "juegos"}</small>
        </span>
      </div>

      <div className="arcade__filter-rail">
        <div
          className="arcade__filters"
          role="tablist"
          aria-label="Filtrar juegos por categoría"
          onKeyDown={moveThroughFilters}
        >
          {filters.map((filter) => {
            const selected = activeCategory === filter.id;
            return (
              <button
                id={`arcade-tab-${uid}-${filter.id}`}
                className={selected ? "is-selected" : ""}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                aria-label={`${filter.label}: ${filter.count} ${
                  filter.count === 1 ? "juego" : "juegos"
                }`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onCategoryChange(filter.id)}
                key={filter.id}
              >
                <span>{filter.label}</span>
                <strong>{filter.count}</strong>
              </button>
            );
          })}
        </div>
      </div>

      <div className="arcade__search">
        <label htmlFor={searchId}>Buscar un juego</label>
        <input
          id={searchId}
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

      <div
        id={panelId}
        className="arcade__panel"
        role="tabpanel"
        aria-labelledby={`arcade-tab-${uid}-${activeFilter.id}`}
      >
        <div className="arcade__grid" aria-label="Juegos disponibles">
          {shownTiles.map((tile) => {
            const seed = hashGameId(`${tile.category}|${tile.id}`);
            const categoryLabel =
              filters.find(({ id }) => id === tile.category)?.label ??
              tile.category;

            return (
              <button
                className="arcade__tile"
                type="button"
                data-game-id={tile.id}
                data-category={tile.category}
                data-variant={seed % 6}
                style={{
                  "--tile-accent": tile.accent,
                  "--tile-soft": tile.accentSoft,
                }}
                aria-label={[
                  tile.title,
                  tile.tagline,
                  tile.progressLabel,
                  "Abrir juego",
                ]
                  .filter(Boolean)
                  .join(". ")}
                onClick={tile.onOpen}
                key={tile.id}
              >
                <span className="arcade__tile-world" aria-hidden="true" />
                <span className="arcade__tile-topline">
                  <span className="arcade__tile-category">{categoryLabel}</span>
                  <span className="arcade__tile-number" aria-hidden="true">
                    {String(tiles.indexOf(tile) + 1).padStart(2, "0")}
                  </span>
                </span>
                {tile.badge ? (
                  <span className="arcade__tile-badge">{tile.badge}</span>
                ) : null}
                <span className="arcade__tile-hero" aria-hidden="true">
                  <span className="arcade__tile-icon">{tile.icon}</span>
                </span>
                <span className="arcade__tile-copy">
                  <strong>{tile.title}</strong>
                  <small>{tile.tagline}</small>
                </span>
                <span className="arcade__tile-footer">
                  {tile.progressLabel ? (
                    <span className="arcade__tile-progress">
                      <span>{tile.progressLabel}</span>
                    </span>
                  ) : null}
                  <span className="arcade__tile-play" aria-hidden="true">
                    Jugar
                  </span>
                </span>
              </button>
            );
          })}
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
              ? "Ningún juego se llama así. Prueba con otra palabra."
              : "No hay juegos en esta categoría todavía."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
