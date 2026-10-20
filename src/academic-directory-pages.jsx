import { useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Breadcrumb } from "./site-core.jsx";
import { CAREER_AREAS, CAREER_COUNT } from "./data/academic-directory.js";
import "./page-hero.css";
import "./academic-directory.css";

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function careerCardsMarkup(areas) {
  return areas.map((area) => `<article class="career-area-card">
    <header><span aria-hidden="true">T20</span><div><h2>${escapeHtml(area.name)}</h2><p>${escapeHtml(area.description)}</p></div><strong>${area.careers.length}</strong></header>
    <ul>${area.careers.map((career) => `<li><span>${escapeHtml(career)}</span></li>`).join("")}</ul>
  </article>`).join("");
}

/**
 * Catálogo orientativo de carreras por área de conocimiento. Las 234 carreras
 * se filtran en el navegador (sin red); el enlace de cada búsqueda lleva a la
 * solicitud de asesor con la carrera ya elegida.
 */
export function CareersPage() {
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("");

  const visibleAreas = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    return CAREER_AREAS.map((area) => ({
      ...area,
      careers: area.careers.filter((career) => {
        const matchesArea = !areaId || area.id === areaId;
        const matchesQuery =
          !normalizedQuery || normalizeSearchText(career).includes(normalizedQuery);
        return matchesArea && matchesQuery;
      }),
    })).filter((area) => area.careers.length > 0);
  }, [areaId, query]);

  const resultCount = visibleAreas.reduce((total, area) => total + area.careers.length, 0);
  const hasFilters = Boolean(query || areaId);
  const careerCards = useMemo(() => careerCardsMarkup(visibleAreas), [visibleAreas]);

  return (
    <main className="directory-page" id="main-content" tabIndex="-1">
      <section className="page-hero" aria-labelledby="directory-page-title">
        <div className="page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumb current="Carreras" />
            <p className="page-hero__eyebrow">Explorador académico</p>
            <h1 id="directory-page-title">Encuentra tu carrera por área de conocimiento</h1>
            <p className="page-hero__intro">
              Un mapa orientativo de {CAREER_COUNT} carreras universitarias y campos emergentes,
              organizado en {CAREER_AREAS.length} áreas. Los nombres pueden variar según el país y
              la universidad; si no encuentras el tuyo, ubicamos el área equivalente.
            </p>
            <div className="page-hero__actions">
              <a className="whatsapp-button whatsapp-button--dark" href="/docentes">
                <ArrowRight size={20} weight="bold" aria-hidden="true" />
                <span>Solicitar un asesor para mi carrera</span>
              </a>
              <a className="text-link" href="#catalogo">
                Ver el catálogo <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className="page-hero__highlights" aria-label="Qué incluye el catálogo">
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                {CAREER_AREAS.length} áreas de conocimiento
              </li>
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                Búsqueda por nombre o área
              </li>
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                Asesor según tu especialidad
              </li>
            </ul>
          </div>
          <aside className="page-hero__card page-hero__card--stat" aria-label={`${CAREER_COUNT} carreras orientativas`}>
            <strong>{CAREER_COUNT}</strong>
            <span>carreras orientativas</span>
            <small>en {CAREER_AREAS.length} áreas de conocimiento</small>
          </aside>
        </div>
      </section>

      <section className="directory-search" id="catalogo" aria-labelledby="career-search-title">
        <div className="section-shell">
          <div className="directory-search__heading">
            <div>
              <p>Busca y compara</p>
              <h2 id="career-search-title">Catálogo de carreras</h2>
            </div>
            <span aria-live="polite">
              {resultCount} {resultCount === 1 ? "carrera encontrada" : "carreras encontradas"}
            </span>
          </div>

          <div className="directory-filters" role="search">
            <label>
              <span>Nombre de la carrera</span>
              <span className="directory-field">
                <input
                  type="search"
                  value={query}
                  placeholder="Ej.: Ingeniería, Psicología, Marketing…"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </span>
            </label>
            <label>
              <span>Área de conocimiento</span>
              <span className="directory-field">
                <select value={areaId} onChange={(event) => setAreaId(event.target.value)}>
                  <option value="">Todas las áreas</option>
                  {CAREER_AREAS.map((area) => (
                    <option value={area.id} key={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <button
              type="button"
              className="directory-clear"
              disabled={!hasFilters}
              onClick={() => {
                setQuery("");
                setAreaId("");
              }}
            >
              Limpiar
            </button>
          </div>

          {visibleAreas.length ? (
            <div className="career-area-grid" dangerouslySetInnerHTML={{ __html: careerCards }} />
          ) : (
            <div className="directory-empty">
              <span aria-hidden="true">⌕</span>
              <h2>No encontramos esa carrera</h2>
              <p>Prueba con otra palabra o revisa todas las áreas disponibles.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setAreaId("");
                }}
              >
                Mostrar todo el catálogo
              </button>
            </div>
          )}

          <aside className="directory-note">
            <strong>Catálogo internacional orientativo</strong>
            <p>
              La denominación de una carrera cambia entre países y universidades. Si no
              encuentras el nombre exacto, Tesis20 puede ayudarte a ubicar el área equivalente y
              el asesor adecuado.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
