const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const TEACHER_PAGE_SIZE = 24;
const teacherSearchStopWords = new Set([
  "asesor", "asesora", "asesoria", "busco", "buscar", "con", "de", "del",
  "docente", "docentes", "el", "en", "especialista", "especializado",
  "especializada", "la", "las", "los", "mi", "necesito", "para", "profesor",
  "profesora", "que", "quiero", "tesis", "un", "una", "y",
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
    "¡Hola, Tesis20! Quiero solicitar una asesoría con este docente:",
    "",
    `Nombre: ${teacher.name}`,
    `Especialidades: ${(teacher.specialties || []).join(", ")}`,
    `Carrera(s): ${(teacher.careers || []).join(", ")}`,
    `Universidad donde enseña: ${(teacher.universities || []).join(", ")}`,
    `País: ${teacher.country}`,
    `Precio referencial por hora: S/ ${teacher.price}`,
    `Perfil: ${teacher.description}`,
    "",
    "Por favor, confirmen su disponibilidad y el precio final para mi tema.",
  ].join("\n");
  return `https://api.whatsapp.com/send?phone=51918714054&text=${encodeURIComponent(message)}`;
}

function teacherCardMarkup(teacher) {
  const specialties = (teacher.specialties || [])
    .map((specialty) => `<li>${escapeHtml(specialty)}</li>`)
    .join("");

  return `<article class="teacher-card" data-teacher-card>
    <img class="teacher-card__photo" src="${escapeHtml(teacher.photo)}" alt="Retrato ilustrativo de ${escapeHtml(teacher.name)}" width="418" height="470" loading="lazy" decoding="async">
    <div class="teacher-card__body"><div class="teacher-card__title"><div><p>Docente asesor</p><h2>${escapeHtml(teacher.name)}</h2></div><span>${escapeHtml(teacher.country)}</span></div>
    <p class="teacher-card__description">${escapeHtml(teacher.description)}</p>
    <dl><div><dt>Especialidades</dt><dd><ul class="teacher-card__tags">${specialties}</ul></dd></div><div><dt>Carreras</dt><dd>${(teacher.careers || []).map(escapeHtml).join(" · ")}</dd></div><div><dt>Universidad</dt><dd>${(teacher.universities || []).map(escapeHtml).join(" · ")}</dd></div></dl>
    <div class="teacher-card__footer"><p><small>Precio referencial por hora</small><strong>S/ ${teacher.price}</strong></p><a href="${escapeHtml(buildTeacherWhatsappHref(teacher))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Contactar a Tesis20 por WhatsApp para solicitar asesoría con ${escapeHtml(teacher.name)}">Contactar por WhatsApp</a></div></div>
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
  const more = container.querySelector("[data-directory-more]");
  const loadWarning = container.querySelector("[data-directory-load-warning]");
  const fallbackCards = [...container.querySelectorAll("[data-teacher-card]")];
  let appliedFilters = { query: "", career: "", university: "" };
  let visibleLimit = TEACHER_PAGE_SIZE;

  const indexRequest = fetch("/data/academic-directory.json?v=20260801-search4")
    .then((response) => {
      if (!response.ok) throw new Error(`No se pudo cargar el directorio (${response.status})`);
      return response.json();
    })
    .then((directory) => createTeacherSearchIndex(directory.teachers || []))
    .catch(() => {
      loadWarning.hidden = false;
      return null;
    });

  const syncClearState = () => {
    clear.disabled = !need.value && !career.value && !university.value &&
      !appliedFilters.query && !appliedFilters.career && !appliedFilters.university;
  };

  const updateMeta = (total, shown) => {
    count.textContent = `${total} ${total === 1 ? "docente encontrado" : "docentes encontrados"}`;
    setEmptyState(container, total);
    pagination.hidden = total === 0 || shown >= total;
    range.textContent = `Mostrando ${shown} de ${total} docentes`;
  };

  const renderIndexedResults = (index) => {
    const matches = searchTeacherIndex(index, appliedFilters);
    const visibleTeachers = matches.slice(0, visibleLimit);
    results.innerHTML = visibleTeachers.map(teacherCardMarkup).join("");
    updateMeta(matches.length, visibleTeachers.length);
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
    count.textContent = `${total} ${total === 1 ? "docente encontrado" : "docentes encontrados"}`;
    setEmptyState(container, total);
  };

  const update = async () => {
    const index = await indexRequest;
    if (index) renderIndexedResults(index);
    else renderFallbackResults();
    syncClearState();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    appliedFilters = {
      query: need.value.trim(),
      career: career.value,
      university: university.value,
    };
    visibleLimit = TEACHER_PAGE_SIZE;
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
    visibleLimit = TEACHER_PAGE_SIZE;
    update();
    need.focus();
  });

  more.addEventListener("click", async () => {
    visibleLimit += TEACHER_PAGE_SIZE;
    await update();
  });

  syncClearState();
  indexRequest.then((index) => {
    if (index) renderIndexedResults(index);
  });
}

const directory = document.querySelector("[data-academic-directory]");
if (directory?.dataset.academicDirectory === "careers") setupCareers(directory);
if (directory?.dataset.academicDirectory === "teachers") setupTeachers(directory);
