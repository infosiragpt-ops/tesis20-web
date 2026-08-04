const SEARCH_STOP_WORDS = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "los",
  "para",
  "por",
  "su",
  "un",
  "una",
  "y",
]);

/** Puntuación mínima para considerar un resultado relevante. */
const MIN_SEARCH_SCORE = 28;

export const THESIS_LEVEL_LABELS = {
  bachelor: "Tesis de pregrado",
  master: "Tesis de maestría",
  doctoral: "Tesis doctoral",
  thesis: "Tesis",
};

export function normalizeThesisSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getQueryTokens(query) {
  const tokens = normalizeThesisSearchText(query)
    .split(" ")
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
  return [...new Set(tokens)];
}

/**
 * Cantidad mínima de tokens de la consulta que deben aparecer en el registro.
 * - 1–2 términos: todos (AND estricto).
 * - 3+ términos: al menos 2 o ceil(2/3), para no devolver vacío en frases largas.
 */
function requiredTokenMatches(tokenCount) {
  if (tokenCount <= 2) return tokenCount;
  return Math.max(2, Math.ceil(tokenCount * (2 / 3)));
}

function scoreThesis(record, phrase, tokens) {
  const title = normalizeThesisSearchText(record.title);
  const authors = normalizeThesisSearchText(record.authors.join(" "));
  const subjects = normalizeThesisSearchText(record.subjects.join(" "));
  const abstract = normalizeThesisSearchText(record.abstract);
  const searchable = `${title} ${subjects} ${authors} ${abstract}`;

  const matchedTokens = tokens.filter((token) => searchable.includes(token));
  if (matchedTokens.length < requiredTokenMatches(tokens.length)) return 0;

  let score = 0;

  // Coincidencia de frase completa
  if (title === phrase) score += 180;
  else if (title.includes(phrase)) score += 100;
  if (subjects.includes(phrase)) score += 60;
  if (authors.includes(phrase)) score += 45;
  if (abstract.includes(phrase)) score += 20;

  // Todos los tokens en un campo
  if (tokens.every((token) => title.includes(token))) score += 80;
  if (tokens.every((token) => subjects.includes(token))) score += 40;
  if (tokens.every((token) => authors.includes(token))) score += 36;
  if (tokens.every((token) => abstract.includes(token))) score += 16;

  // Proporción de tokens coincidentes
  const matchRatio = matchedTokens.length / tokens.length;
  score += Math.round(matchRatio * 40);

  for (const token of matchedTokens) {
    const titleWords = title.split(" ");
    if (titleWords.includes(token)) score += 24;
    else if (title.includes(token)) score += 16;
    if (subjects.includes(token)) score += 12;
    if (authors.includes(token)) score += 8;
    if (abstract.includes(token)) score += 3;
  }

  // Penalización suave si faltan tokens en consultas largas
  const missing = tokens.length - matchedTokens.length;
  if (missing > 0) score -= missing * 8;

  return score;
}

export function expandThesisRecord(record) {
  return {
    id: record.id,
    sourceId: record.s,
    title: record.t,
    authors: Array.isArray(record.a) ? record.a : [],
    year: Number(record.y) || null,
    level: record.l || "thesis",
    url: record.u,
    subjects: Array.isArray(record.k) ? record.k : [],
    abstract: record.d || "",
  };
}

export function searchTheses(
  compactRecords,
  { query, level = "all", sourceId = "all", yearFrom = "all", limit = 24 },
) {
  const phrase = normalizeThesisSearchText(query);
  const tokens = getQueryTokens(query);
  if (phrase.length < 2 || tokens.length === 0) return [];

  const minimumYear = yearFrom === "all" ? null : Number(yearFrom);

  return compactRecords
    .map(expandThesisRecord)
    .filter((record) => level === "all" || record.level === level)
    .filter((record) => sourceId === "all" || record.sourceId === sourceId)
    .filter((record) => !minimumYear || (record.year && record.year >= minimumYear))
    .map((record) => ({ record, score: scoreThesis(record, phrase, tokens) }))
    .filter(({ score }) => score >= MIN_SEARCH_SCORE)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (right.record.year || 0) - (left.record.year || 0) ||
        left.record.title.localeCompare(right.record.title, "es"),
    )
    .slice(0, limit)
    .map(({ record }) => record);
}
