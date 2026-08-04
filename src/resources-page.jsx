import { useEffect, useMemo, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Database } from "@phosphor-icons/react/Database";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import {
  getThesisRepository,
  THESIS_REPOSITORIES,
} from "./data/thesis-repositories.js";
import { searchTheses, THESIS_LEVEL_LABELS } from "./thesis-search.js";
import {
  formatCompactNumber,
  GLOBAL_CORPUS_STATS,
  mergeThesisResults,
  searchGlobalTheses,
} from "./global-thesis-search.js";
import { trackInteraction } from "./platform-enhancements.jsx";
import "./resources-search.css";

const SEARCH_EXAMPLES = [
  "inteligencia artificial en educación",
  "machine learning healthcare",
  "gestión pública",
  "cambio climático",
  "salud ocupacional",
];

function getInitialSearchQuery() {
  if (typeof window === "undefined") return "";
  return (new URLSearchParams(window.location.search).get("q") || "").trim().slice(0, 160);
}

function InstitutionLogo({ institution, className = "" }) {
  const classes = ["resources-institution-logo", institution.logo ? "resources-institution-logo--image" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-institution={institution.id} aria-hidden="true">
      {institution.logo ? (
        <img
          src={institution.logo}
          alt=""
          width={institution.logoWidth || 320}
          height={institution.logoHeight || 180}
          loading="lazy"
          decoding="async"
        />
      ) : (
        institution.shortName || institution.acronym
      )}
    </span>
  );
}

function formatCitations(count) {
  const value = Number(count) || 0;
  if (value <= 0) return null;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k citas`;
  return `${value} ${value === 1 ? "cita" : "citas"}`;
}

function ThesisSearchResult({ thesis }) {
  const repository = getThesisRepository(thesis.sourceId);
  const isGlobal = thesis.origin === "global" || thesis.sourceId === "openalex";
  const sourceName = repository?.acronym || thesis.sourceLabel || "Corpus global";
  const sourceDetail =
    repository?.name ||
    thesis.institutions?.[0] ||
    "Grafo académico abierto (OpenAlex)";
  const citationLabel = formatCitations(thesis.citations);
  const authors = Array.isArray(thesis.authors) ? thesis.authors : [];
  const subjects = Array.isArray(thesis.subjects) ? thesis.subjects : [];

  return (
    <article className={`thesis-result${isGlobal ? " thesis-result--global" : " thesis-result--local"}`}>
      <header className="thesis-result__source">
        {repository ? (
          <InstitutionLogo institution={repository} />
        ) : (
          <span className="resources-institution-logo resources-institution-logo--global" aria-hidden="true">
            OA
          </span>
        )}
        <div>
          <span>{sourceName}</span>
          <small>{sourceDetail}</small>
        </div>
        <span className="thesis-result__badges">
          {citationLabel && (
            <em className="thesis-result__citations" title="Citas académicas indexadas">
              {citationLabel}
            </em>
          )}
          <span>{isGlobal ? "Disertación" : THESIS_LEVEL_LABELS[thesis.level] || "Tesis"}</span>
        </span>
      </header>
      <div className="thesis-result__body">
        <p>
          {thesis.year || "Año no indicado"}
          {isGlobal ? " · Corpus global" : " · Repositorio verificado"}
          {thesis.isOpenAccess ? " · Acceso abierto" : ""}
        </p>
        <h3>{thesis.title}</h3>
        {authors.length > 0 && (
          <span className="thesis-result__authors">{authors.join(" · ")}</span>
        )}
        {thesis.abstract && <p className="thesis-result__abstract">{thesis.abstract}</p>}
        {subjects.length > 0 && (
          <ul className="thesis-result__subjects" aria-label="Temas relacionados">
            {subjects.slice(0, 5).map((subject) => (
              <li key={subject}>{subject}</li>
            ))}
          </ul>
        )}
      </div>
      <a
        className="thesis-result__link"
        href={thesis.url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        onClick={() =>
          trackInteraction("thesis_result_open", {
            institution: thesis.sourceId,
            level: thesis.level,
            year: thesis.year,
            origin: isGlobal ? "global" : "local",
            citations: thesis.citations || 0,
          })
        }
      >
        Ver en la fuente original
        <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
      </a>
    </article>
  );
}

function ThesisSearch() {
  const initialQuery = getInitialSearchQuery();
  const [index, setIndex] = useState(null);
  const [status, setStatus] = useState("loading");
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [level, setLevel] = useState("all");
  const [sourceId, setSourceId] = useState("all");
  const [yearFrom, setYearFrom] = useState("all");
  const [sortMode, setSortMode] = useState("relevance");
  const [minCitations, setMinCitations] = useState("0");
  const [globalRecords, setGlobalRecords] = useState([]);
  const [globalMeta, setGlobalMeta] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("idle");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/theses-index.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!Array.isArray(payload.records)) throw new Error("Índice inválido");
        setIndex(payload);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, []);

  // Búsqueda en vivo (debounce) al escribir
  useEffect(() => {
    const trimmed = draftQuery.trim();
    if (trimmed.length < 2) {
      if (query) setQuery("");
      return undefined;
    }
    if (trimmed === query) return undefined;

    const timer = window.setTimeout(() => {
      setQuery(trimmed);
      const url = new URL(window.location.href);
      url.searchParams.set("q", trimmed);
      window.history.replaceState({}, "", `${url.pathname}${url.search}#buscar-tesis`);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [draftQuery, query]);

  // Capa global automatizada (OpenAlex vía /api/thesis-search)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setGlobalRecords([]);
      setGlobalMeta(null);
      setGlobalStatus("idle");
      return undefined;
    }

    // Si el usuario filtra solo una universidad PE, no mezclamos corpus global
    if (sourceId !== "all") {
      setGlobalRecords([]);
      setGlobalMeta(null);
      setGlobalStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    setGlobalStatus("loading");

    searchGlobalTheses({
      query,
      yearFrom,
      sort: sortMode,
      minCitations: Number(minCitations) || 0,
      perPage: 24,
      signal: controller.signal,
    }).then((result) => {
      if (result.aborted) return;
      if (result.error) {
        setGlobalRecords([]);
        setGlobalMeta(null);
        setGlobalStatus("error");
        return;
      }
      setGlobalRecords(result.records);
      setGlobalMeta(result.meta);
      setGlobalStatus("ready");
    });

    return () => controller.abort();
  }, [query, yearFrom, sortMode, minCitations, sourceId]);

  const localResults = useMemo(
    () =>
      query && index
        ? searchTheses(index.records, { query, level, sourceId, yearFrom })
        : [],
    [index, level, query, sourceId, yearFrom],
  );

  const results = useMemo(
    () => mergeThesisResults(localResults, globalRecords, { limit: 36 }),
    [localResults, globalRecords],
  );

  const applySearch = (nextQuery, { track = true } = {}) => {
    const trimmedQuery = nextQuery.trim();
    if (trimmedQuery.length < 2) return;
    setDraftQuery(trimmedQuery);
    setQuery(trimmedQuery);
    const url = new URL(window.location.href);
    url.searchParams.set("q", trimmedQuery);
    window.history.replaceState({}, "", `${url.pathname}${url.search}#buscar-tesis`);
    if (track) {
      trackInteraction("thesis_search", {
        queryLength: trimmedQuery.length,
        level,
        institution: sourceId,
        yearFrom,
        sort: sortMode,
        minCitations: Number(minCitations) || 0,
      });
    }
  };

  const submitSearch = (event, nextQuery = draftQuery) => {
    event?.preventDefault();
    applySearch(nextQuery);
  };

  const indexedSourceIds = new Set(index?.sources?.map((source) => source.id) || []);
  const indexedRepositories = THESIS_REPOSITORIES.filter((repository) =>
    indexedSourceIds.has(repository.id),
  );
  const canSearch = status === "ready" && draftQuery.trim().length >= 2;
  const isSearching = Boolean(query) && (globalStatus === "loading" || status === "loading");
  const globalHits = globalMeta?.total;

  return (
    <section className="thesis-search" id="buscar-tesis" aria-labelledby="thesis-search-title">
      <div className="resources-shell">
        <header className="thesis-search__heading">
          <div>
            <p>Buscador especializado · precisión automática</p>
            <h2 id="thesis-search-title">Tesis de mayor relevancia citada</h2>
            <span>
              Motor híbrido: repositorios universitarios verificados (OAI‑PMH) + corpus académico
              global con más de {formatCompactNumber(GLOBAL_CORPUS_STATS.dissertations)} disertaciones
              de {formatCompactNumber(GLOBAL_CORPUS_STATS.institutions)} instituciones. Solo
              documentos tipados como tesis/disertación; ranking por relevancia semántica y citas.
            </span>
          </div>
          <div className="thesis-search__metrics" aria-live="polite">
            <span>
              <strong>{formatCompactNumber(GLOBAL_CORPUS_STATS.dissertations)}</strong> disertaciones
            </span>
            <span>
              <strong>{formatCompactNumber(GLOBAL_CORPUS_STATS.institutions)}</strong> instituciones
            </span>
            <span>
              <strong>{index?.records?.length || "—"}</strong> tesis PE verificadas
            </span>
          </div>
        </header>

        <form className="thesis-search__form" role="search" onSubmit={submitSearch}>
          <label className="thesis-search__query" htmlFor="thesis-query">
            <span>Tema, título, autor o palabra clave</span>
            <span>
              <MagnifyingGlass size={22} weight="bold" aria-hidden="true" />
              <input
                id="thesis-query"
                type="search"
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Ej.: inteligencia artificial en educación"
                minLength="2"
                autoComplete="off"
                enterKeyHint="search"
              />
            </span>
          </label>
          <div className="thesis-search__filters">
            <label>
              Nivel (PE)
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">Todos los niveles</option>
                <option value="bachelor">Pregrado</option>
                <option value="master">Maestría</option>
                <option value="doctoral">Doctorado</option>
              </select>
            </label>
            <label>
              Universidad PE
              <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
                <option value="all">Todas + corpus global</option>
                {indexedRepositories.map((repository) => (
                  <option value={repository.id} key={repository.id}>{repository.acronym}</option>
                ))}
              </select>
            </label>
            <label>
              Desde el año
              <select value={yearFrom} onChange={(event) => setYearFrom(event.target.value)}>
                <option value="all">Cualquier año</option>
                <option value="2023">Desde 2023</option>
                <option value="2020">Desde 2020</option>
                <option value="2015">Desde 2015</option>
                <option value="2010">Desde 2010</option>
              </select>
            </label>
            <label>
              Relevancia
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="relevance">Relevancia + citas</option>
                <option value="citations">Más citadas primero</option>
              </select>
            </label>
            <label>
              Citas mínimas
              <select value={minCitations} onChange={(event) => setMinCitations(event.target.value)}>
                <option value="0">Sin mínimo</option>
                <option value="1">≥ 1 cita</option>
                <option value="5">≥ 5 citas</option>
                <option value="10">≥ 10 citas</option>
                <option value="25">≥ 25 citas</option>
                <option value="50">≥ 50 citas</option>
              </select>
            </label>
            <button type="submit" disabled={!canSearch}>
              <MagnifyingGlass size={19} weight="bold" aria-hidden="true" />
              Buscar tesis
            </button>
          </div>
        </form>

        <div className="thesis-search__examples" aria-label="Ejemplos de búsqueda">
          <span>Prueba con:</span>
          {SEARCH_EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              disabled={status !== "ready"}
              aria-pressed={query === example}
              onClick={(event) => submitSearch(event, example)}
            >
              {example}
            </button>
          ))}
        </div>

        {indexedRepositories.length > 0 && (
          <div className="thesis-search__sources" aria-label="Capas de búsqueda conectadas">
            <span>Capas activas</span>
            <ul>
              <li title="Corpus académico global OpenAlex">
                <span className="resources-institution-logo resources-institution-logo--global" aria-hidden="true">OA</span>
                <span>Global · {formatCompactNumber(GLOBAL_CORPUS_STATS.dissertations)}</span>
              </li>
              {indexedRepositories.map((repository) => (
                <li key={repository.id} title={repository.name}>
                  <InstitutionLogo institution={repository} />
                  <span>{repository.acronym}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "loading" && (
          <div className="thesis-search__state" role="status">
            <Database size={28} weight="duotone" aria-hidden="true" />
            Preparando el motor híbrido de tesis…
          </div>
        )}
        {status === "error" && (
          <div className="thesis-search__state thesis-search__state--error" role="alert">
            <p>No se pudo cargar el índice verificado en este momento.</p>
            <button
              type="button"
              className="thesis-search__retry"
              onClick={() => {
                setStatus("loading");
                setIndex(null);
                fetch("/data/theses-index.json")
                  .then((response) => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                  })
                  .then((payload) => {
                    if (!Array.isArray(payload.records)) throw new Error("Índice inválido");
                    setIndex(payload);
                    setStatus("ready");
                  })
                  .catch(() => setStatus("error"));
              }}
            >
              Reintentar carga
            </button>
          </div>
        )}
        {status === "ready" && !query && (
          <div className="thesis-search__state">
            <GraduationCap size={30} weight="duotone" aria-hidden="true" />
            Escribe un tema. Priorizamos tesis con mayor relevancia citada y metadatos de tipo
            disertación — sin mezclar artículos ni literatura gris.
          </div>
        )}
        {status === "ready" && query && (
          <div className="thesis-search__results" aria-live="polite">
            <header>
              <h3>
                {isSearching
                  ? "Buscando en el corpus global…"
                  : results.length > 0
                    ? `${results.length} resultados priorizados`
                    : "Sin coincidencias exactas"}
              </h3>
              <span>
                para “{query}”
                {typeof globalHits === "number"
                  ? ` · ${formatCompactNumber(globalHits)} coincidencias globales`
                  : ""}
                {localResults.length > 0 ? ` · ${localResults.length} PE verificadas` : ""}
              </span>
            </header>
            {results.length > 0 ? (
              <div className="thesis-search__result-list">
                {results.map((thesis) => (
                  <ThesisSearchResult thesis={thesis} key={`${thesis.origin || "x"}-${thesis.id}`} />
                ))}
              </div>
            ) : !isSearching ? (
              <p className="thesis-search__no-results">
                No hay coincidencias con estos filtros de precisión. Baja el mínimo de citas, amplía
                el año o usa términos más generales del título o del campo de estudio.
              </p>
            ) : null}
            {globalStatus === "error" && (
              <p className="thesis-search__global-note" role="status">
                El corpus global no respondió; se muestran solo repositorios PE verificados.
              </p>
            )}
          </div>
        )}

        <aside className="thesis-search__method">
          <CheckCircle size={24} weight="duotone" aria-hidden="true" />
          <p>
            <strong>Precisión extraordinaria, de forma automatizada.</strong> Capa PE: cosecha
            OAI‑PMH y validación dc:type/COAR exclusiva para tesis. Capa global: grafo académico
            abierto ({formatCompactNumber(GLOBAL_CORPUS_STATS.works)} trabajos,
            {` ${formatCompactNumber(GLOBAL_CORPUS_STATS.dissertations)} `}
            disertaciones) filtrado a <em>type:dissertation</em>, ordenado por relevancia semántica
            y citas. No alojamos archivos: siempre redirigimos a la fuente original.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default function ResourcesPage() {
  return (
    <main className="resources-page" id="main-content" tabIndex="-1">
      <section className="resources-hero" aria-labelledby="resources-page-title">
        <div className="resources-shell resources-hero__inner">
          <div className="resources-hero__copy">
            <p>Buscador especializado de tesis</p>
            <h1 id="resources-page-title">Recursos y repositorio de tesis</h1>
            <span>
              Busca tesis y disertaciones por tema, autor, universidad, nivel y año, con ranking
              por relevancia citada en un corpus global y repositorios peruanos verificados.
            </span>
            <a href="#buscar-tesis">
              Buscar tesis
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <ThesisSearch />

      <section className="resources-next" aria-labelledby="resources-next-title">
        <div className="resources-shell">
          <p>Cobertura global + precisión local</p>
          <h2 id="resources-next-title">Millones de disertaciones, sin mezclar ruido</h2>
          <span>
            El motor consulta de forma automatizada el grafo académico abierto (OpenAlex) — más de
            {` ${formatCompactNumber(GLOBAL_CORPUS_STATS.dissertations)} `}
            disertaciones y {formatCompactNumber(GLOBAL_CORPUS_STATS.institutions)} instituciones —
            y lo combina con repositorios peruanos verificados (UPN, UCV, UNSA, UNAP, UPCH, UPC).
            Solo se admiten registros tipados como tesis/disertación; el ranking prioriza relevancia
            y citas académicas.
          </span>
        </div>
      </section>
    </main>
  );
}
