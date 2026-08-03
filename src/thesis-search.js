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

const MIN_SEARCH_SCORE = 45;

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

function scoreThesis(record, phrase, tokens) {
  const title = normalizeThesisSearchText(record.title);
  const authors = normalizeThesisSearchText(record.authors.join(" "));
  const subjects = normalizeThesisSearchText(record.subjects.join(" "));
  const abstract = normalizeThesisSearchText(record.abstract);
  const searchable = `${title} ${subjects} ${authors} ${abstract}`;

  if (!tokens.every((token) => searchable.includes(token))) return 0;
  const phraseMatchesOneField = [title, subjects, authors, abstract].some((field) =>
    field.includes(phrase),
  );
  const allTokensMatchTitle = tokens.every((token) => title.includes(token));
  const allTokensMatchAuthor = tokens.every((token) => authors.includes(token));
  if (
    tokens.length > 1 &&
    !phraseMatchesOneField &&
    !allTokensMatchTitle &&
    !allTokensMatchAuthor
  ) return 0;

  let score = 0;
  if (title === phrase) score += 180;
  else if (title.includes(phrase)) score += 95;
  if (subjects.includes(phrase)) score += 58;
  if (authors.includes(phrase)) score += 42;
  if (abstract.includes(phrase)) score += 18;
  if (tokens.every((token) => title.includes(token))) score += 72;
  if (tokens.every((token) => subjects.includes(token))) score += 34;

  for (const token of tokens) {
    if (title.split(" ").includes(token)) score += 22;
    else if (title.includes(token)) score += 14;
    if (subjects.includes(token)) score += 10;
    if (authors.includes(token)) score += 7;
    if (abstract.includes(token)) score += 2;
  }

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
