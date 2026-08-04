import { useEffect, useMemo, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Database } from "@phosphor-icons/react/Database";
import { DownloadSimple } from "@phosphor-icons/react/DownloadSimple";
import { FileText } from "@phosphor-icons/react/FileText";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import {
  ACADEMIC_RESOURCE_DOCUMENT_COUNT,
  ACADEMIC_RESOURCES,
} from "./data/academic-resources.js";
import {
  getThesisRepository,
  THESIS_REPOSITORIES,
} from "./data/thesis-repositories.js";
import { searchTheses, THESIS_LEVEL_LABELS } from "./thesis-search.js";
import { trackInteraction } from "./platform-enhancements.jsx";
import "./resources-search.css";

const SEARCH_EXAMPLES = [
  "educación",
  "gestión pública",
  "salud ocupacional",
  "enfermería",
  "inteligencia artificial",
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

function ThesisSearchResult({ thesis }) {
  const repository = getThesisRepository(thesis.sourceId);
  if (!repository) return null;

  return (
    <article className="thesis-result">
      <header className="thesis-result__source">
        <InstitutionLogo institution={repository} />
        <div>
          <span>{repository.acronym}</span>
          <small>{repository.name}</small>
        </div>
        <span>{THESIS_LEVEL_LABELS[thesis.level] || "Tesis"}</span>
      </header>
      <div className="thesis-result__body">
        <p>{thesis.year || "Año no indicado"}</p>
        <h3>{thesis.title}</h3>
        {thesis.authors.length > 0 && (
          <span className="thesis-result__authors">
            {thesis.authors.join(" · ")}
          </span>
        )}
        {thesis.abstract && <p className="thesis-result__abstract">{thesis.abstract}</p>}
        {thesis.subjects.length > 0 && (
          <ul className="thesis-result__subjects" aria-label="Temas relacionados">
            {thesis.subjects.slice(0, 5).map((subject) => (
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
          })
        }
      >
        Ver en el repositorio original
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

  // Búsqueda en vivo (debounce) al escribir en el campo
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
    }, 320);

    return () => window.clearTimeout(timer);
  }, [draftQuery, query]);

  const results = useMemo(
    () =>
      query && index
        ? searchTheses(index.records, { query, level, sourceId, yearFrom })
        : [],
    [index, level, query, sourceId, yearFrom],
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

  return (
    <section className="thesis-search" id="buscar-tesis" aria-labelledby="thesis-search-title">
      <div className="resources-shell">
        <header className="thesis-search__heading">
          <div>
            <p>Buscador especializado</p>
            <h2 id="thesis-search-title">Encuentra tesis, no documentos mezclados</h2>
            <span>
              El índice acepta únicamente registros identificados como tesis en los metadatos
              oficiales. Cada resultado conserva autor, año, temas y enlace a su universidad.
            </span>
          </div>
          <div className="thesis-search__metrics" aria-live="polite">
            <span><strong>{index?.records?.length || "—"}</strong> tesis</span>
            <span><strong>{indexedRepositories.length || "—"}</strong> universidades conectadas</span>
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
                placeholder="Ej.: gestión pública, educación, enfermería"
                minLength="2"
                autoComplete="off"
                enterKeyHint="search"
              />
            </span>
          </label>
          <div className="thesis-search__filters">
            <label>
              Nivel
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">Todos los niveles</option>
                <option value="bachelor">Pregrado</option>
                <option value="master">Maestría</option>
                <option value="doctoral">Doctorado</option>
              </select>
            </label>
            <label>
              Universidad
              <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
                <option value="all">Todas las conectadas</option>
                {indexedRepositories.map((repository) => (
                  <option value={repository.id} key={repository.id}>{repository.acronym}</option>
                ))}
              </select>
            </label>
            <label>
              Antigüedad
              <select value={yearFrom} onChange={(event) => setYearFrom(event.target.value)}>
                <option value="all">Cualquier año</option>
                <option value="2023">Desde 2023</option>
                <option value="2020">Desde 2020</option>
                <option value="2015">Desde 2015</option>
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
          <div className="thesis-search__sources" aria-label="Repositorios universitarios conectados">
            <span>Fuentes conectadas</span>
            <ul>
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
            Preparando el índice verificado de tesis…
          </div>
        )}
        {status === "error" && (
          <div className="thesis-search__state thesis-search__state--error" role="alert">
            <p>No se pudo cargar el índice en este momento.</p>
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
            Escribe un tema para buscar coincidencias en título, autor, resumen y palabras clave.
          </div>
        )}
        {status === "ready" && query && (
          <div className="thesis-search__results" aria-live="polite">
            <header>
              <h3>{results.length > 0 ? `${results.length} resultados más relevantes` : "Sin coincidencias exactas"}</h3>
              <span>para “{query}”</span>
            </header>
            {results.length > 0 ? (
              <div className="thesis-search__result-list">
                {results.map((thesis) => <ThesisSearchResult thesis={thesis} key={thesis.id} />)}
              </div>
            ) : (
              <p className="thesis-search__no-results">
                No hay coincidencias con estos filtros. Prueba con términos más generales (por
                ejemplo «educación» o «salud»), quita el filtro de universidad/año o usa otra
                palabra clave del título o del autor.
              </p>
            )}
          </div>
        )}

        <aside className="thesis-search__method">
          <CheckCircle size={24} weight="duotone" aria-hidden="true" />
          <p>
            <strong>Precisión por metadatos.</strong> Se cosechan registros mediante OAI‑PMH, se
            validan los tipos de tesis de pregrado, maestría y doctorado, y se eliminan duplicados.
            No alojamos ni copiamos los archivos: siempre enviamos al repositorio de origen.
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
            <p>Recursos académicos + buscador especializado</p>
            <h1 id="resources-page-title">Recursos y repositorio de tesis</h1>
            <span>
              Busca tesis peruanas por tema, autor, universidad, nivel y año, o consulta documentos
              institucionales útiles para orientar tu investigación.
            </span>
            <a href="#buscar-tesis">
              Buscar tesis
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <ThesisSearch />

      <section
        className="resources-library"
        id="documentos-disponibles"
        aria-labelledby="resources-library-title"
      >
        <div className="resources-shell">
          <header className="resources-library__heading">
            <div>
              <p>Recursos institucionales</p>
              <h2 id="resources-library-title">Documentos disponibles</h2>
            </div>
            <span>
              {ACADEMIC_RESOURCE_DOCUMENT_COUNT} {ACADEMIC_RESOURCE_DOCUMENT_COUNT === 1 ? "recurso" : "recursos"}
            </span>
          </header>

          <div className="resources-university-list">
            {ACADEMIC_RESOURCES.map((institution) => (
              <article className="resources-university" key={institution.id}>
                <header className="resources-university__header">
                  <InstitutionLogo institution={institution} />
                  <div>
                    <p>Institución</p>
                    <h2>{institution.name}</h2>
                    <small>{institution.description}</small>
                  </div>
                  <a
                    href={institution.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    aria-label={`Visitar el sitio de ${institution.name} (se abre en una pestaña nueva)`}
                  >
                    Sitio institucional
                    <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
                  </a>
                </header>

                <div className="resources-document-list">
                  {institution.documents.map((document) => (
                    <section className="resources-document" key={document.id}>
                      <span className="resources-document__icon" aria-hidden="true">
                        <FileText size={30} weight="duotone" />
                      </span>
                      <div className="resources-document__content">
                        <p>{document.category}</p>
                        <h3>{document.title}</h3>
                        <span>{document.description}</span>
                        <div className="resources-document__meta">
                          <span>{document.format}</span>
                          <span>{document.pages} {document.pages === 1 ? "página" : "páginas"}</span>
                        </div>
                        <div className="resources-document__programs">
                          <strong>Programas incluidos</strong>
                          <ul>
                            {document.programs.map((program) => (
                              <li key={program}>
                                <CheckCircle size={15} weight="fill" aria-hidden="true" />
                                {program}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="resources-document__actions">
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${document.title} de ${institution.name} (se abre en una pestaña nueva)`}
                          onClick={() =>
                            trackInteraction("resource_document_open", {
                              institution: institution.id,
                              document: document.id,
                            })
                          }
                        >
                          Abrir PDF
                          <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
                        </a>
                        <a
                          href={document.href}
                          download={document.fileName}
                          onClick={() =>
                            trackInteraction("resource_document_download", {
                              institution: institution.id,
                              document: document.id,
                            })
                          }
                        >
                          Descargar
                          <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                        </a>
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="resources-validity-note">
            <CheckCircle size={26} weight="duotone" aria-hidden="true" />
            <div>
              <h2>Verifica siempre la versión vigente</h2>
              <p>
                Los documentos se publican como referencia académica y pertenecen a sus
                instituciones de origen. Antes de usarlos, confirma en la universidad si existe
                una edición más reciente o una norma específica para tu programa.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="resources-next" aria-labelledby="resources-next-title">
        <div className="resources-shell">
          <p>Cobertura nacional progresiva</p>
          <h2 id="resources-next-title">Más universidades, una fuente a la vez</h2>
          <span>
            El piloto conecta UPN, UCV, UNSA, UNAP, UPCH y UPC. UTP y las demás instituciones del
            país se incorporarán solo cuando exista un canal interoperable estable y sus metadatos
            superen la validación exclusiva para tesis.
          </span>
        </div>
      </section>
    </main>
  );
}
