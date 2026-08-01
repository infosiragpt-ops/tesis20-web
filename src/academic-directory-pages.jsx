import { useEffect, useMemo, useState } from "react";
import { trackInteraction } from "./platform-enhancements.jsx";
import { createTeacherSearchIndex, searchTeacherIndex } from "./teacher-search.js";
import { CAREER_AREAS, CAREER_COUNT, TEACHERS } from "./data/academic-directory.js";
import { teacherMediaMarkup } from "./teacher-portrait.js";

const WHATSAPP_PHONE = "51918714054";
const TEACHER_PAGE_SIZE = 24;
const ACADEMIC_DIRECTORY = {
  careerAreas: CAREER_AREAS,
  careerCount: CAREER_COUNT,
  teachers: TEACHERS,
};

function useAcademicDirectory() {
  useEffect(() => {
    if (!document.querySelector('link[href="/assets/academic-directory-v1.css?v=20260801-catalog4000v5"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/assets/academic-directory-v1.css?v=20260801-catalog4000v5";
      document.head.appendChild(stylesheet);
    }
  }, []);

  return { directory: ACADEMIC_DIRECTORY, failed: false };
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
    ${teacherMediaMarkup(teacher)}
    <div class="teacher-card__body"><div class="teacher-card__title"><div><p>Perfil docente demo</p><h2>${escapeHtml(teacher.name)}</h2></div><span>${escapeHtml(teacher.country)}</span></div>
    <p class="teacher-card__description">${escapeHtml(teacher.description)}</p>
    <dl><div><dt>Experiencia simulada</dt><dd>${teacher.experienceYears} años de trayectoria referencial · ${escapeHtml(teacher.profileCode)}</dd></div><div><dt>Especialidades</dt><dd><ul class="teacher-card__tags">${(teacher.specialties || []).map((specialty) => `<li>${escapeHtml(specialty)}</li>`).join("")}</ul></dd></div><div><dt>Carreras</dt><dd>${teacher.careers.map(escapeHtml).join(" · ")}</dd></div><div><dt>Universidad</dt><dd>${teacher.universities.map(escapeHtml).join(" · ")}</dd></div></dl>
    <div class="teacher-card__footer"><p><small>Precio referencial por hora</small><strong>S/ ${teacher.price}</strong></p>
    <a href="${escapeHtml(buildTeacherWhatsappHref(teacher))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-teacher="${escapeHtml(teacher.id)}" aria-label="Consultar a Tesis20 por WhatsApp sobre el perfil demostrativo de ${escapeHtml(teacher.name)}">Contactar por WhatsApp</a></div></div>
  </article>`).join("");
}

function buildTeacherWhatsappHref(teacher) {
  const message = [
    "¡Hola, Tesis20! Quiero consultar por un asesor con un perfil similar a esta referencia demostrativa:",
    "",
    `Código del perfil: ${teacher.profileCode}`,
    `Nombre: ${teacher.name}`,
    `Especialidades: ${(teacher.specialties || []).join(", ")}`,
    `Carrera(s): ${teacher.careers.join(", ")}`,
    `Universidad donde enseña: ${teacher.universities.join(", ")}`,
    `País: ${teacher.country}`,
    `Precio referencial por hora: S/ ${teacher.price}`,
    `Trayectoria referencial simulada: ${teacher.experienceYears} años`,
    `Perfil: ${teacher.description}`,
    "",
    "Este perfil es demostrativo. Tesis20 confirmará identidad, experiencia, disponibilidad y tarifa.",
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
  const [currentPage, setCurrentPage] = useState(0);
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
  const pageStart = currentPage * TEACHER_PAGE_SIZE;
  const visibleTeachers = matchingTeachers.slice(pageStart, pageStart + TEACHER_PAGE_SIZE);

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
    setCurrentPage(0);
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
    setCurrentPage(0);
  };

  const changePage = (nextPage) => {
    setCurrentPage(nextPage);
    window.requestAnimationFrame(() => {
      const results = document.getElementById("teacher-results");
      if (!results) return;
      const top = results.getBoundingClientRect().top + window.scrollY - 105;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      results.focus({ preventScroll: true });
    });
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
              <h2 id="teacher-search-title">Perfiles docentes demostrativos</h2>
            </div>
            <span aria-live="polite">
              {matchingTeachers.length} {matchingTeachers.length === 1 ? "perfil encontrado" : "perfiles encontrados"}
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

          <aside className="directory-note directory-note--warning">
            <strong>Directorio demostrativo</strong>
            <p>
              Estos 4,000 perfiles, sus nombres, retratos, universidades, experiencia y
              precios son referencias simuladas. Tesis20 confirmará un asesor real, su
              identidad, experiencia, disponibilidad y tarifa antes de coordinar.
            </p>
          </aside>

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
              tabIndex="-1"
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
              <h2>No encontramos perfiles con esos filtros</h2>
              <p>Prueba otra necesidad, especialidad, carrera o universidad.</p>
              <button type="button" onClick={clearSearch}>
                Limpiar búsqueda
              </button>
            </div>
          )}

          {matchingTeachers.length > TEACHER_PAGE_SIZE ? (
            <nav className="directory-results-more" aria-label="Paginación de docentes">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => changePage(Math.max(0, currentPage - 1))}
              >
                ← Anterior
              </button>
              <span aria-live="polite">
                Mostrando {pageStart + 1}–{pageStart + visibleTeachers.length} de {matchingTeachers.length} perfiles
              </span>
              <button
                type="button"
                disabled={pageStart + visibleTeachers.length >= matchingTeachers.length}
                onClick={() => changePage(currentPage + 1)}
              >
                Siguiente →
              </button>
            </nav>
          ) : null}

        </div>
      </section>
    </main>
  );
}
