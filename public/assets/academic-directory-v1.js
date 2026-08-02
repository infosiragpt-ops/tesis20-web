import { assignTeacherPortraits, teacherMediaMarkup } from "/assets/teacher-portrait-v1.js?v=20260802-syntheticphotosv1";

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const TEACHER_PAGE_SIZE = 24;
const teacherSearchStopWords = new Set([
  "al", "alguien", "apoyo", "asesor", "asesora", "asesoria", "asesoramiento",
  "ayuda", "ayudar", "busco", "buscar", "con", "de", "del",
  "docente", "docentes", "el", "en", "especialista", "especializado",
  "especializada", "experiencia", "experto", "experta", "hacer", "la", "las",
  "los", "mi", "necesito", "orientacion", "para", "profesor", "profesora",
  "que", "quiero", "sepa", "sobre", "tema", "tesis", "un", "una", "y",
]);

const getTeacherSearchTerms = (query) => [...new Set(
  normalize(query)
    .split(/\s+/)
    .filter((term) => term.length > 1 && !teacherSearchStopWords.has(term)),
)];

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function createTeacherSearchIndex(teachers) {
  return teachers.map((teacher, index) => {
    const fields = {
      name: normalize(teacher.name),
      specialties: normalize((teacher.specialties || []).join(" ")),
      searchTerms: normalize((teacher.searchTerms || []).join(" ")),
      careers: normalize((teacher.careers || []).join(" ")),
      universities: normalize((teacher.universities || []).join(" ")),
      description: normalize(teacher.description),
      country: normalize(teacher.country),
    };
    return { teacher, index, fields, corpus: Object.values(fields).join(" ") };
  });
}

function searchTeacherIndex(index, filters) {
  const normalizedQuery = normalize(filters.query);
  const terms = getTeacherSearchTerms(filters.query);

  return index
    .map((entry) => {
      if (filters.career && !entry.teacher.careers.includes(filters.career)) return null;
      if (filters.university && !entry.teacher.universities.includes(filters.university)) return null;
      if (terms.some((term) => !entry.corpus.includes(term))) return null;

      let score = 0;
      if (normalizedQuery) {
        if (entry.fields.specialties.includes(normalizedQuery)) score += 120;
        if (entry.fields.searchTerms.includes(normalizedQuery)) score += 100;
        if (entry.fields.careers.includes(normalizedQuery)) score += 90;
        if (entry.fields.name.includes(normalizedQuery)) score += 80;
        if (entry.fields.description.includes(normalizedQuery)) score += 70;
      }
      terms.forEach((term) => {
        if (entry.fields.specialties.includes(term)) score += 15;
        if (entry.fields.searchTerms.includes(term)) score += 13;
        if (entry.fields.careers.includes(term)) score += 11;
        if (entry.fields.name.includes(term)) score += 9;
        if (entry.fields.description.includes(term)) score += 7;
        if (entry.fields.universities.includes(term)) score += 5;
      });

      return { ...entry, score };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.teacher);
}

function buildTeacherWhatsappHref(teacher) {
  const message = [
    "¡Hola, Tesis20! Quiero consultar por un asesor con un perfil similar a esta referencia demostrativa:",
    "",
    `Código del perfil: ${teacher.profileCode}`,
    `Nombre: ${teacher.name}`,
    `Especialidades: ${(teacher.specialties || []).join(", ")}`,
    `Carrera(s): ${(teacher.careers || []).join(", ")}`,
    `Universidad donde enseña: ${(teacher.universities || []).join(", ")}`,
    `País: ${teacher.country}`,
    `Precio referencial por hora: S/ ${teacher.price}`,
    `Trayectoria referencial simulada: ${teacher.experienceYears} años`,
    `Perfil: ${teacher.description}`,
    "",
    "Este perfil es demostrativo. Tesis20 confirmará identidad, experiencia, disponibilidad y tarifa.",
    "",
    "Por favor, confirmen su disponibilidad y el precio final para mi tema.",
  ].join("\n");
  return `https://api.whatsapp.com/send?phone=51918714054&text=${encodeURIComponent(message)}`;
}

function teacherCardMarkup(teacher, portraitIndex) {
  const specialties = (teacher.specialties || [])
    .map((specialty) => `<li>${escapeHtml(specialty)}</li>`)
    .join("");

  return `<article class="teacher-card" data-teacher-card>
    ${teacherMediaMarkup(teacher, portraitIndex)}
    <div class="teacher-card__body"><div class="teacher-card__title"><div><p>Perfil de referencia · no es una persona real</p><h2>${escapeHtml(teacher.name)}</h2></div><span>${escapeHtml(teacher.country)}</span></div>
    <p class="teacher-card__description">${escapeHtml(teacher.description)}</p>
    <dl><div><dt>Experiencia simulada</dt><dd>${teacher.experienceYears} años de trayectoria referencial · ${escapeHtml(teacher.profileCode)}</dd></div><div><dt>Especialidades</dt><dd><ul class="teacher-card__tags">${specialties}</ul></dd></div><div><dt>Carreras</dt><dd>${(teacher.careers || []).map(escapeHtml).join(" · ")}</dd></div><div><dt>Universidad</dt><dd>${(teacher.universities || []).map(escapeHtml).join(" · ")}</dd></div></dl>
    <div class="teacher-card__footer"><p><small>Precio referencial por hora</small><strong>S/ ${teacher.price}</strong></p><a href="${escapeHtml(buildTeacherWhatsappHref(teacher))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Solicitar a Tesis20 un asesor real similar al perfil demostrativo de ${escapeHtml(teacher.name)}">Solicitar asesor real similar</a></div></div>
  </article>`;
}

function setEmptyState(container, count) {
  container.querySelector("[data-directory-empty]").hidden = count > 0;
}

function setupCareers(container) {
  const query = container.querySelector("#career-query");
  const area = container.querySelector("#career-area");
  const clear = container.querySelector("[data-directory-clear]");
  const count = container.querySelector("[data-directory-count]");
  const cards = [...container.querySelectorAll("[data-career-area]")];

  const update = () => {
    const term = normalize(query.value.trim());
    let total = 0;
    cards.forEach((card) => {
      const areaMatches = !area.value || card.dataset.careerArea === area.value;
      let cardCount = 0;
      card.querySelectorAll("li").forEach((item) => {
        const matches = areaMatches && (!term || normalize(item.textContent).includes(term));
        item.hidden = !matches;
        if (matches) cardCount += 1;
      });
      card.hidden = cardCount === 0;
      card.querySelector("header strong").textContent = String(cardCount);
      total += cardCount;
    });
    count.textContent = `${total} ${total === 1 ? "carrera encontrada" : "carreras encontradas"}`;
    clear.disabled = !query.value && !area.value;
    setEmptyState(container, total);
  };

  query.addEventListener("input", update);
  area.addEventListener("change", update);
  clear.addEventListener("click", () => {
    query.value = "";
    area.value = "";
    update();
    query.focus();
  });
  update();
}

function setupTeachers(container) {
  const form = container.querySelector("[data-directory-teacher-form]");
  const need = container.querySelector("#teacher-need");
  const career = container.querySelector("#teacher-career");
  const university = container.querySelector("#teacher-university");
  const clear = container.querySelector("[data-directory-clear]");
  const count = container.querySelector("[data-directory-count]");
  const results = container.querySelector("[data-teacher-results]");
  const pagination = container.querySelector("[data-directory-pagination]");
  const range = container.querySelector("[data-directory-range]");
  const previous = container.querySelector("[data-directory-previous]");
  const next = container.querySelector("[data-directory-next]");
  const loadWarning = container.querySelector("[data-directory-load-warning]");
  const fallbackCards = [...container.querySelectorAll("[data-teacher-card]")];
  let appliedFilters = { query: "", career: "", university: "" };
  let currentPage = 0;
  let isUpdating = false;
  previous.disabled = true;
  next.disabled = true;

  const indexRequest = fetch("/data/academic-directory.json?v=20260802-syntheticphotosv1")
    .then((response) => {
      if (!response.ok) throw new Error(`No se pudo cargar el directorio (${response.status})`);
      return response.json();
    })
    .then((directory) => createTeacherSearchIndex(directory.teachers || []))
    .catch(() => {
      loadWarning.hidden = false;
      pagination.hidden = true;
      return null;
    });

  const syncClearState = () => {
    clear.disabled = !need.value && !career.value && !university.value &&
      !appliedFilters.query && !appliedFilters.career && !appliedFilters.university;
  };

  const updateMeta = (total, start, end) => {
    count.textContent = `${total} ${total === 1 ? "perfil encontrado" : "perfiles encontrados"}`;
    setEmptyState(container, total);
    pagination.hidden = total <= TEACHER_PAGE_SIZE;
    range.textContent = total ? `Mostrando ${start + 1}–${end} de ${total} perfiles` : "Sin perfiles para mostrar";
    previous.disabled = currentPage === 0;
    next.disabled = end >= total;
  };

  const renderIndexedResults = (index) => {
    const matches = searchTeacherIndex(index, appliedFilters);
    const start = currentPage * TEACHER_PAGE_SIZE;
    if (start >= matches.length && currentPage > 0) currentPage = 0;
    const safeStart = currentPage * TEACHER_PAGE_SIZE;
    const visibleTeachers = matches.slice(safeStart, safeStart + TEACHER_PAGE_SIZE);
    results.innerHTML = assignTeacherPortraits(visibleTeachers)
      .map(({ teacher, portraitIndex }) => teacherCardMarkup(teacher, portraitIndex))
      .join("");
    updateMeta(matches.length, safeStart, safeStart + visibleTeachers.length);
  };

  const renderFallbackResults = () => {
    const terms = getTeacherSearchTerms(appliedFilters.query);
    let total = 0;
    fallbackCards.forEach((card) => {
      const corpus = normalize(card.dataset.search);
      const matches =
        terms.every((term) => corpus.includes(term)) &&
        (!appliedFilters.career || card.dataset.careers.split("|").includes(appliedFilters.career)) &&
        (!appliedFilters.university || card.dataset.universities.split("|").includes(appliedFilters.university));
      card.hidden = !matches;
      if (matches) total += 1;
    });
    pagination.hidden = true;
    count.textContent = `${total} ${total === 1 ? "perfil encontrado" : "perfiles encontrados"}`;
    setEmptyState(container, total);
  };

  const update = async () => {
    if (isUpdating) return;
    isUpdating = true;
    previous.disabled = true;
    next.disabled = true;
    try {
      const index = await indexRequest;
      if (index) renderIndexedResults(index);
      else renderFallbackResults();
      syncClearState();
    } finally {
      isUpdating = false;
    }
  };

  const focusResultsStart = () => {
    const top = results.getBoundingClientRect().top + window.scrollY - 105;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    results.focus({ preventScroll: true });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    appliedFilters = {
      query: need.value.trim(),
      career: career.value,
      university: university.value,
    };
    currentPage = 0;
    update();
  });

  [need, career, university].forEach((field) => {
    field.addEventListener(field === need ? "input" : "change", syncClearState);
  });
  need.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    form.requestSubmit();
  });

  clear.addEventListener("click", () => {
    need.value = "";
    career.value = "";
    university.value = "";
    appliedFilters = { query: "", career: "", university: "" };
    currentPage = 0;
    update();
    need.focus();
  });

  previous.addEventListener("click", async () => {
    currentPage = Math.max(0, currentPage - 1);
    await update();
    focusResultsStart();
  });

  next.addEventListener("click", async () => {
    currentPage += 1;
    await update();
    focusResultsStart();
  });

  syncClearState();
  indexRequest.then((index) => {
    if (index) renderIndexedResults(index);
  });
}

const directory = document.querySelector("[data-academic-directory]");
if (directory?.dataset.academicDirectory === "careers") setupCareers(directory);
if (directory?.dataset.academicDirectory === "teachers") setupTeachers(directory);
