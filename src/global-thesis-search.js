/**
 * Cliente del corpus académico global (proxy /api/thesis-search → OpenAlex).
 * Complementa el índice local verificado (OAI-PMH Perú).
 */

export const GLOBAL_CORPUS_STATS = {
  works: 322_000_000,
  dissertations: 11_100_000,
  institutions: 131_000,
};

export function formatCompactNumber(value) {
  const number = Number(value) || 0;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(number);
}

/**
 * Une resultados locales (repositorios PE) y globales (OpenAlex).
 * Prioriza: score local alto, luego rankScore/citas globales; deduplica por URL normalizada.
 */
export function mergeThesisResults(localResults = [], globalResults = [], { limit = 36 } = {}) {
  const seen = new Set();
  const merged = [];

  const push = (item, boost = 0) => {
    const key = String(item.url || item.id || "")
      .replace(/\/$/, "")
      .toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push({
      ...item,
      origin: item.origin || (item.sourceId === "openalex" ? "global" : "local"),
      citations: Number(item.citations) || 0,
      rankScore: (Number(item.rankScore) || 0) + boost,
    });
  };

  // Locales verificados (OAI-PMH PE) reciben prioridad de confianza institucional.
  for (const item of localResults) push({ ...item, origin: "local" }, 2_500);
  for (const item of globalResults) push({ ...item, origin: "global" }, 0);

  return merged
    .sort(
      (left, right) =>
        right.rankScore - left.rankScore ||
        right.citations - left.citations ||
        (right.year || 0) - (left.year || 0),
    )
    .slice(0, limit);
}

export async function searchGlobalTheses(
  {
    query,
    yearFrom = "all",
    sort = "relevance",
    minCitations = 0,
    perPage = 24,
    signal,
  } = {},
) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < 2) {
    return { records: [], meta: null, error: null };
  }

  const params = new URLSearchParams({
    q: trimmed.slice(0, 160),
    sort,
    perPage: String(perPage),
    minCitations: String(minCitations),
  });
  if (yearFrom && yearFrom !== "all") params.set("yearFrom", yearFrom);

  try {
    const response = await fetch(`/api/thesis-search?${params}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return {
        records: [],
        meta: null,
        error: `HTTP ${response.status}`,
      };
    }
    const payload = await response.json();
    return {
      records: Array.isArray(payload.records) ? payload.records : [],
      meta: payload.meta || null,
      error: null,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { records: [], meta: null, error: null, aborted: true };
    }
    return {
      records: [],
      meta: null,
      error: error instanceof Error ? error.message : "error",
    };
  }
}
