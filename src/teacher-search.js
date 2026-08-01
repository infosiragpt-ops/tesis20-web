const SEARCH_STOP_WORDS = new Set([
  "asesor",
  "asesora",
  "asesoria",
  "asesoramiento",
  "al",
  "alguien",
  "apoyo",
  "ayuda",
  "ayudar",
  "busco",
  "buscar",
  "con",
  "de",
  "del",
  "docente",
  "docentes",
  "el",
  "en",
  "especialista",
  "especializado",
  "especializada",
  "experiencia",
  "experto",
  "experta",
  "hacer",
  "la",
  "las",
  "los",
  "mi",
  "necesito",
  "orientacion",
  "para",
  "profesor",
  "profesora",
  "que",
  "quiero",
  "sepa",
  "sobre",
  "tema",
  "tesis",
  "un",
  "una",
  "y",
]);

export function normalizeTeacherSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getTeacherSearchTerms(query) {
  const normalized = normalizeTeacherSearch(query);
  if (!normalized) return [];

  return [...new Set(
    normalized
      .split(/\s+/)
      .filter((term) => term.length > 1 && !SEARCH_STOP_WORDS.has(term)),
  )];
}

export function createTeacherSearchIndex(teachers) {
  return teachers.map((teacher, index) => {
    const fields = {
      name: normalizeTeacherSearch(teacher.name),
      specialties: normalizeTeacherSearch((teacher.specialties || []).join(" ")),
      searchTerms: normalizeTeacherSearch((teacher.searchTerms || []).join(" ")),
      careers: normalizeTeacherSearch((teacher.careers || []).join(" ")),
      universities: normalizeTeacherSearch((teacher.universities || []).join(" ")),
      description: normalizeTeacherSearch(teacher.description),
      country: normalizeTeacherSearch(teacher.country),
    };

    return {
      teacher,
      index,
      fields,
      corpus: Object.values(fields).join(" "),
    };
  });
}

function teacherSearchScore(entry, normalizedQuery, terms) {
  if (terms.some((term) => !entry.corpus.includes(term))) return -1;

  let score = 0;
  if (normalizedQuery) {
    if (entry.fields.specialties.includes(normalizedQuery)) score += 120;
    if (entry.fields.searchTerms.includes(normalizedQuery)) score += 100;
    if (entry.fields.careers.includes(normalizedQuery)) score += 90;
    if (entry.fields.name.includes(normalizedQuery)) score += 80;
    if (entry.fields.description.includes(normalizedQuery)) score += 70;
  }

  for (const term of terms) {
    if (entry.fields.specialties.includes(term)) score += 15;
    if (entry.fields.searchTerms.includes(term)) score += 13;
    if (entry.fields.careers.includes(term)) score += 11;
    if (entry.fields.name.includes(term)) score += 9;
    if (entry.fields.description.includes(term)) score += 7;
    if (entry.fields.universities.includes(term)) score += 5;
  }

  return score;
}

export function searchTeacherIndex(index, filters = {}) {
  const normalizedQuery = normalizeTeacherSearch(filters.query);
  const terms = getTeacherSearchTerms(filters.query);

  return index
    .map((entry) => {
      if (filters.career && !entry.teacher.careers.includes(filters.career)) return null;
      if (filters.university && !entry.teacher.universities.includes(filters.university)) return null;

      const score = terms.length
        ? teacherSearchScore(entry, normalizedQuery, terms)
        : 0;
      if (score < 0) return null;

      return { ...entry, score };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.teacher);
}
