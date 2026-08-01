import { useEffect, useMemo, useState } from "react";
import { trackInteraction } from "./platform-enhancements.jsx";
import { createTeacherSearchIndex, searchTeacherIndex } from "./teacher-search.js";

const WHATSAPP_PHONE = "51918714054";
const TEACHER_PAGE_SIZE = 24;
let directoryRequest;

function useAcademicDirectory() {
  const [directory, setDirectory] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!document.querySelector('link[href="/assets/academic-directory-v1.css?v=20260801-search4"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/assets/academic-directory-v1.css?v=20260801-search4";
      document.head.appendChild(stylesheet);
    }
    directoryRequest ||= fetch("/data/academic-directory.json?v=20260801-search4").then((response) => {
      if (!response.ok) throw new Error(`No se pudo cargar el directorio (${response.status})`);
      return response.json();
    });
    directoryRequest.then(setDirectory).catch(() => setFailed(true));
  }, []);

  return { directory, failed };
}

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

function teacherCardsMarkup(teachers) {
  return teachers.map((teacher) => `<article class="teacher-card">
    <img class="teacher-card__photo" src="${escapeHtml(teacher.photo)}" alt="Retrato ilustrativo de ${escapeHtml(teacher.name)}" width="418" height="470" loading="lazy" decoding="async">
    <div class="teacher-card__body"><div class="teacher-card__title"><div><p>Docente asesor</p><h2>${escapeHtml(teacher.name)}</h2></div><span>${escapeHtml(teacher.country)}</span></div>
    <p class="teacher-card__description">${escapeHtml(teacher.description)}</p>
    <dl><div><dt>Especialidades</dt><dd><ul class="teacher-card__tags">${(teacher.specialties || []).map((specialty) => `<li>${escapeHtml(specialty)}</li>`).join("")}</ul></dd></div><div><dt>Carreras</dt><dd>${teacher.careers.map(escapeHtml).join(" · ")}</dd></div><div><dt>Universidad</dt><dd>${teacher.universities.map(escapeHtml).join(" · ")}</dd></div></dl>
    <div class="teacher-card__footer"><p><small>Precio referencial por hora</small><strong>S/ ${teacher.price}</strong></p>
    <a href="${escapeHtml(buildTeacherWhatsappHref(teacher))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-teacher="${escapeHtml(teacher.id)}" aria-label="Contactar a Tesis20 por WhatsApp para solicitar asesoría con ${escapeHtml(teacher.name)}">Contactar por WhatsApp</a></div></div>
  </article>`).join("");
}

function buildTeacherWhatsappHref(teacher) {
  const message = [
    "¡Hola, Tesis20! Quiero solicitar una asesoría con este docente:",
    "",
    `Nombre: ${teacher.name}`,
    `Especialidades: ${(teacher.specialties || []).join(", ")}`,
    `Carrera(s): ${teacher.careers.join(", ")}`,
    `Universidad donde enseña: ${teacher.universities.join(", ")}`,
    `País: ${teacher.country}`,
    `Precio referencial por hora: S/ ${teacher.price}`,
    `Perfil: ${teacher.description}`,
    "",
    "Por favor, confirmen su disponibilidad y el precio final para mi tema.",
  ].join("\n");

  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

function DirectoryHero({ eyebrow, title, description, stat, statLabel, children }) {
  return (
    <section className="directory-hero" aria-labelledby="directory-page-title">
      <div className="directory-shell directory-hero__inner">
        <div className="directory-hero__copy">
          <p>{eyebrow}</p>
          <h1 id="directory-page-title">{title}</h1>
          <span>{description}</span>
          {children}
        </div>
        <div className="directory-hero__stat" aria-label={`${stat} ${statLabel}`}>
          <strong>{stat}</strong>
          <span>{statLabel}</span>
          <i aria-hidden="true">T20</i>
        </div>
      </div>
    </section>
  );
}

export function CareersPage() {
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("");
  const { directory, failed } = useAcademicDirectory();
  const careerAreas = directory?.careerAreas || [];

  const visibleAreas = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    return careerAreas.map((area) => ({
      ...area,
      careers: area.careers.filter((career) => {
        const matchesArea = !areaId || area.id === areaId;
        const matchesQuery =
          !normalizedQuery || normalizeSearchText(career).includes(normalizedQuery);
        return matchesArea && matchesQuery;
      }),
    })).filter((area) => area.careers.length > 0);
  }, [areaId, careerAreas, query]);

  const resultCount = visibleAreas.reduce(
    (total, area) => total + area.careers.length,
    0,
  );
  const hasFilters = Boolean(query || areaId);
  const careerCards = useMemo(() => careerCardsMarkup(visibleAreas), [visibleAreas]);

  return (
    <main className="directory-page" id="main-content" tabIndex="-1">
      <DirectoryHero
        eyebrow="Explorador académico internacional"
        title="Encuentra tu carrera por área de conocimiento"
        description="Consulta un mapa amplio de carreras universitarias y campos emergentes. Los nombres y especialidades pueden variar según cada país y universidad."
        stat={directory?.careerCount ?? "…"}
        statLabel="carreras orientativas"
      >
        <a className="directory-hero__link" href="/docentes">
          Buscar docentes por carrera
          <span aria-hidden="true">→</span>
        </a>
      </DirectoryHero>

      <section className="directory-search" aria-labelledby="career-search-title">
        <div className="directory-shell">
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
                  {careerAreas.map((area) => (
                    <option value={area.id} key={area.id}>{area.name}</option>
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

          {!directory && !failed ? (
            <div className="directory-empty" role="status">
              <span aria-hidden="true">•••</span>
              <h2>Cargando carreras</h2>
              <p>Estamos preparando el catálogo académico.</p>
            </div>
          ) : visibleAreas.length ? (
            <div className="career-area-grid" dangerouslySetInnerHTML={{ __html: careerCards }} />
          ) : (
            <div className="directory-empty">
              <span aria-hidden="true">⌕</span>
              <h2>No encontramos esa carrera</h2>
              <p>Prueba con otra palabra o revisa todas las áreas disponibles.</p>
              <button type="button" onClick={() => { setQuery(""); setAreaId(""); }}>
                Mostrar todo el catálogo
              </button>
            </div>
          )}

          <aside className="directory-note">
            <strong>Catálogo internacional orientativo</strong>
            <p>
              La denominación de una carrera cambia entre países y universidades. Si no
              encuentras el nombre exacto, Tesis20 puede ayudarte a ubicar el área equivalente.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function TeachersPage() {
  const [needQuery, setNeedQuery] = useState("");
  const [career, setCareer] = useState("");
  const [university, setUniversity] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    query: "",
    career: "",
    university: "",
  });
  const [visibleLimit, setVisibleLimit] = useState(TEACHER_PAGE_SIZE);
  const { directory, failed } = useAcademicDirectory();
  const teachers = directory?.teachers || [];
  const teacherCareerOptions = useMemo(
    () => [...new Set(teachers.flatMap((teacher) => teacher.careers))].sort((a, b) => a.localeCompare(b, "es")),
    [teachers],
  );
  const teacherUniversityOptions = useMemo(
    () => [...new Set(teachers.flatMap((teacher) => teacher.universities))].sort((a, b) => a.localeCompare(b, "es")),
    [teachers],
  );
  const teacherSearchIndex = useMemo(() => createTeacherSearchIndex(teachers), [teachers]);

  const matchingTeachers = useMemo(
    () => searchTeacherIndex(teacherSearchIndex, appliedFilters),
    [appliedFilters, teacherSearchIndex],
  );
  const visibleTeachers = matchingTeachers.slice(0, visibleLimit);

  const hasFilters = Boolean(
    needQuery ||
    career ||
    university ||
    appliedFilters.query ||
    appliedFilters.career ||
    appliedFilters.university
  );
  const teacherCards = useMemo(() => teacherCardsMarkup(visibleTeachers), [visibleTeachers]);

  const applySearch = (event) => {
    event.preventDefault();
    setVisibleLimit(TEACHER_PAGE_SIZE);
    setAppliedFilters({ query: needQuery.trim(), career, university });
    trackInteraction("teacher_search_submit", {
      hasQuery: Boolean(needQuery.trim()),
      hasCareer: Boolean(career),
      hasUniversity: Boolean(university),
    });
  };

  const clearSearch = () => {
    setNeedQuery("");
    setCareer("");
    setUniversity("");
    setAppliedFilters({ query: "", career: "", university: "" });
    setVisibleLimit(TEACHER_PAGE_SIZE);
  };

  return (
    <main className="directory-page" id="main-content" tabIndex="-1">
      <DirectoryHero
        eyebrow="Red académica Tesis20"
        title="Encuentra un docente para tu tema"
        description="Describe lo que necesitas —por ejemplo, derecho penal, metodología cualitativa o SPSS— y encuentra docentes por especialidad, carrera y universidad."
        stat={directory?.teachers.length ?? "…"}
        statLabel="perfiles demostrativos"
      >
        <a className="directory-hero__link" href="/carreras">
          Explorar todas las carreras
          <span aria-hidden="true">→</span>
        </a>
      </DirectoryHero>

      <section className="directory-search teacher-directory" aria-labelledby="teacher-search-title">
        <div className="directory-shell">
          <div className="directory-search__heading">
            <div>
              <p>Directorio académico</p>
              <h2 id="teacher-search-title">Docentes disponibles</h2>
            </div>
            <span aria-live="polite">
              {matchingTeachers.length} {matchingTeachers.length === 1 ? "docente encontrado" : "docentes encontrados"}
            </span>
          </div>

          <form
            className="directory-filters directory-filters--teachers"
            role="search"
            aria-label="Buscar docentes por necesidad"
            onSubmit={applySearch}
          >
            <label className="directory-need-field">
              <span>¿Qué asesoría necesitas?</span>
              <span className="directory-field">
                <input
                  type="search"
                  value={needQuery}
                  placeholder="Ej.: derecho penal, SPSS, tesis cualitativa…"
                  autoComplete="off"
                  onChange={(event) => setNeedQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applySearch(event);
                  }}
                />
              </span>
              <small className="directory-field-hint">
                Busca por tema, especialidad, metodología, software o nombre del docente.
              </small>
            </label>
            <label>
              <span>Carrera</span>
              <span className="directory-field">
                <select value={career} onChange={(event) => setCareer(event.target.value)}>
                  <option value="">Todas las carreras</option>
                  {teacherCareerOptions.map((option) => (
                    <option value={option} key={option}>{option}</option>
                  ))}
                </select>
              </span>
            </label>
            <label>
              <span>Universidad donde enseña</span>
              <span className="directory-field">
                <select value={university} onChange={(event) => setUniversity(event.target.value)}>
                  <option value="">Todas las universidades</option>
                  {teacherUniversityOptions.map((option) => (
                    <option value={option} key={option}>{option}</option>
                  ))}
                </select>
              </span>
            </label>
            <div className="directory-actions">
              <button
                type="submit"
                className="directory-search-button"
                aria-controls="teacher-results"
              >
                Buscar docentes
              </button>
              <button
                type="button"
                className="directory-clear"
                disabled={!hasFilters}
                onClick={clearSearch}
              >
                Limpiar
              </button>
            </div>
          </form>

          {!directory && !failed ? (
            <div className="directory-empty" role="status">
              <span aria-hidden="true">•••</span>
              <h2>Cargando docentes</h2>
              <p>Estamos preparando los perfiles académicos.</p>
            </div>
          ) : visibleTeachers.length ? (
            <div
              id="teacher-results"
              className="teacher-grid"
              dangerouslySetInnerHTML={{ __html: teacherCards }}
              onClick={(event) => {
                const link = event.target.closest("[data-teacher]");
                if (link) trackInteraction("teacher_whatsapp_click", {
                  teacher: link.dataset.teacher,
                  location: "teacher_card",
                });
              }}
            />
          ) : (
            <div className="directory-empty">
              <span aria-hidden="true">⌕</span>
              <h2>No encontramos docentes con esos filtros</h2>
              <p>Prueba otra necesidad, especialidad, carrera o universidad.</p>
              <button type="button" onClick={clearSearch}>
                Limpiar búsqueda
              </button>
            </div>
          )}

          {matchingTeachers.length > visibleTeachers.length ? (
            <div className="directory-results-more">
              <span aria-live="polite">
                Mostrando {visibleTeachers.length} de {matchingTeachers.length} docentes
              </span>
              <button
                type="button"
                onClick={() => setVisibleLimit((current) => current + TEACHER_PAGE_SIZE)}
              >
                Mostrar más docentes
              </button>
            </div>
          ) : null}

          <aside className="directory-note directory-note--warning">
            <strong>Perfiles de demostración</strong>
            <p>
              Los nombres, retratos, universidades y precios de esta primera versión son
              ilustrativos. Tesis20 confirmará identidad, experiencia, disponibilidad y tarifa
              antes de coordinar una asesoría.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
