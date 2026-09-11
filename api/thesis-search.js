/**
 * Búsqueda automatizada de tesis / disertaciones en el grafo académico global
 * (OpenAlex) con ranking por relevancia + citas.
 *
 * Precisión: solo type=dissertation (excluye artículos, papers y grises).
 * GET /api/thesis-search?q=...&yearFrom=2015&sort=relevance|citations&minCitations=0
 *
 * Robustez: la consulta al proveedor se corta a los 8,5 s (por debajo del
 * máximo de la función en Vercel, así el cliente recibe un 503 limpio y no
 * un 504), las respuestas se cachean 5 min por instancia además del CDN, y
 * los errores del proveedor se traducen a códigos claros (429/503) sin
 * filtrar detalles internos.
 */

const OPENALEX_WORKS = "https://api.openalex.org/works";
const MAILTO = process.env.OPENALEX_MAILTO || "contacto@tesis20.com";
const USER_AGENT = `Tesis20Search/2.1 (mailto:${MAILTO})`;
const UPSTREAM_TIMEOUT_MS = 8_500;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const CURRENT_YEAR = new Date().getUTCFullYear();

// Caché por instancia (LRU sencillo): las búsquedas repetidas en ráfaga no
// vuelven a pegarle al proveedor mientras la función siga caliente.
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  while (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export function sanitizeQuery(value = "") {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export function parseSearchParams(query = {}) {
  const q = sanitizeQuery(query.q || "");
  const yearFromRaw = String(query.yearFrom ?? "");
  const yearFromNumber = /^\d{4}$/.test(yearFromRaw) ? Number(yearFromRaw) : null;
  const yearFrom = yearFromNumber && yearFromNumber >= 1900 && yearFromNumber <= CURRENT_YEAR + 1 ? yearFromNumber : null;
  const sort = query.sort === "citations" ? "citations" : "relevance";
  const minCitations = Math.max(0, Math.min(1000, Math.floor(Number(query.minCitations) || 0)));
  const page = Math.max(1, Math.min(50, Math.floor(Number(query.page) || 1)));
  const perPage = Math.max(1, Math.min(50, Math.floor(Number(query.perPage) || 24)));
  return { q, yearFrom, sort, minCitations, page, perPage };
}

function invertAbstract(inverted) {
  if (!inverted || typeof inverted !== "object") return "";
  const pairs = [];
  for (const [word, positions] of Object.entries(inverted)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) pairs.push([position, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  const text = pairs.map(([, word]) => word).join(" ");
  return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
}

function isHttpsUrl(value) {
  return /^https:\/\//i.test(String(value || ""));
}

export function normalizeDoi(doi) {
  if (!doi) return null;
  const cleaned = String(doi)
    .replace(/^https?:\/\/doi\.org\//i, "")
    .trim();
  // DOI inválido o truncado (ruido frecuente en metadatos abiertos)
  if (
    !/^10\.\d{4,9}\/[A-Za-z0-9][A-Za-z0-9._;()/:-]+[A-Za-z0-9)]$/.test(cleaned) ||
    /\s/.test(cleaned) ||
    cleaned.length < 11 ||
    /[.-]$/.test(cleaned)
  ) {
    return null;
  }
  return cleaned;
}

export function isHighPrecisionRecord(record) {
  if (!record.title || record.title.length < 16 || record.title.length > 400) return false;
  if (!isHttpsUrl(record.url)) return false;
  // Títulos con basura de metadatos mal parseados
  if (/DOI:\s*10\./i.test(record.title)) return false;
  if (/https?:\/\//i.test(record.title)) return false;
  // Citas extremas sin autor ni institución suelen ser basura de indexación
  if ((record.authors || []).length === 0 && (record.citations || 0) > 200) return false;
  if ((record.citations || 0) > 5000 && (record.institutions || []).length === 0) return false;
  // Landing pages genéricas o rotas
  if (/civis\.se|opengrey/i.test(record.url) && (record.citations || 0) > 1000) return false;
  return true;
}

export function mapWork(work) {
  const authorships = Array.isArray(work.authorships) ? work.authorships : [];
  const authors = authorships
    .map((item) => item?.author?.display_name)
    .filter(Boolean)
    .slice(0, 5);

  const institutions = [];
  for (const item of authorships) {
    for (const institution of item?.institutions || []) {
      if (institution?.display_name && !institutions.includes(institution.display_name)) {
        institutions.push(institution.display_name);
      }
      if (institutions.length >= 3) break;
    }
    if (institutions.length >= 3) break;
  }

  const location = work.primary_location || {};
  const source = location.source || {};
  const openAccess = work.open_access || {};
  const doi = normalizeDoi(work.doi);
  const candidates = [
    location.landing_page_url,
    openAccess.oa_url,
    location.pdf_url,
    doi ? `https://doi.org/${doi}` : null,
    work.id,
  ].filter(Boolean);
  const url = candidates.find((item) => isHttpsUrl(item)) || candidates[0] || null;

  const subjects = (work.topics || work.concepts || [])
    .map((item) => item?.display_name)
    .filter(Boolean)
    .slice(0, 6);

  const citations = Number(work.cited_by_count) || 0;
  const relevance = Number(work.relevance_score) || 0;
  // Ranking: relevancia semántica dominante + boost logarítmico de citas (documentos influyentes)
  const rankScore =
    relevance * 1.35 +
    Math.log1p(citations) * 22 +
    (citations >= 5 ? 10 : 0) +
    (citations >= 25 ? 16 : 0) +
    (citations >= 100 ? 20 : 0) +
    (authors.length > 0 ? 6 : 0) +
    (institutions.length > 0 ? 8 : 0) +
    (doi ? 5 : 0);

  return {
    id: String(work.id || "").replace("https://openalex.org/", "oa:"),
    sourceId: "openalex",
    sourceLabel: source.display_name || institutions[0] || "Corpus académico global",
    title: work.display_name || work.title || "Sin título",
    authors,
    institutions,
    year: Number(work.publication_year) || null,
    level: "doctoral",
    url,
    doi: doi ? `https://doi.org/${doi}` : null,
    subjects,
    abstract: invertAbstract(work.abstract_inverted_index),
    citations,
    relevance,
    rankScore: Math.round(rankScore * 10) / 10,
    isOpenAccess: Boolean(openAccess.is_oa),
    origin: "global",
  };
}

export function buildOpenAlexUrl({ q, yearFrom, sort, minCitations, page, perPage }) {
  const url = new URL(OPENALEX_WORKS);
  // Solo disertaciones/tesis; se excluyen retractados para precisión de contenido.
  const filters = ["type:dissertation", "is_retracted:false"];

  // OpenAlex usa rangos con comparadores > / < (p. ej. year:>2014 ≈ desde 2015).
  if (yearFrom) filters.push(`publication_year:>${yearFrom - 1}`);
  if (minCitations > 0) filters.push(`cited_by_count:>${minCitations - 1}`);

  url.searchParams.set("search", q);
  url.searchParams.set("filter", filters.join(","));
  // Siempre pedimos relevancia de OpenAlex; reordenamos localmente con citas.
  // Si el usuario pide "más citadas", OpenAlex ordena por citas y nosotros re-rankeamos.
  url.searchParams.set(
    "sort",
    sort === "citations" ? "cited_by_count:desc" : "relevance_score:desc",
  );
  // Pedimos más filas de las que mostramos para poder filtrar ruido y conservar precisión.
  url.searchParams.set("per_page", String(Math.min(50, Math.max(perPage * 2, perPage))));
  url.searchParams.set("page", String(page));
  url.searchParams.set(
    "select",
    [
      "id",
      "title",
      "display_name",
      "publication_year",
      "cited_by_count",
      "relevance_score",
      "authorships",
      "primary_location",
      "open_access",
      "type",
      "doi",
      "abstract_inverted_index",
      "topics",
    ].join(","),
  );
  url.searchParams.set("mailto", MAILTO);

  const apiKey = process.env.OPENALEX_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  return url;
}

export function rankRecords(results, sort, perPage) {
  return (Array.isArray(results) ? results : [])
    .map(mapWork)
    .filter((record) => record.title && record.url && isHighPrecisionRecord(record))
    .sort((left, right) => {
      if (sort === "citations") {
        return (
          right.citations - left.citations ||
          right.rankScore - left.rankScore ||
          (right.year || 0) - (left.year || 0)
        );
      }
      return (
        right.rankScore - left.rankScore ||
        right.citations - left.citations ||
        (right.year || 0) - (left.year || 0)
      );
    })
    .slice(0, perPage);
}

function requestId() {
  return Math.random().toString(36).slice(2, 10);
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const id = requestId();
  const startedAt = Date.now();
  res.setHeader("X-Request-Id", id);

  try {
    const params = parseSearchParams(req.query || {});
    if (params.q.length < 2) {
      res.setHeader("Cache-Control", "no-store");
      res.status(400).json({ error: "La consulta debe tener al menos 2 caracteres." });
      return;
    }

    const openAlexUrl = buildOpenAlexUrl(params);
    const cacheKey = openAlexUrl.toString();
    let payload = cacheGet(cacheKey);
    let served = "cache";

    if (!payload) {
      served = "upstream";
      const response = await fetch(openAlexUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after") || "30";
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Retry-After", retryAfter);
        res.status(429).json({ error: "El corpus académico está limitando las consultas. Inténtalo en unos segundos.", retryAfter });
        return;
      }
      if (!response.ok) {
        console.error(`[thesis-search ${id}] upstream HTTP ${response.status}`);
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Retry-After", "20");
        res.status(503).json({ error: "No se pudo consultar el corpus académico global. Inténtalo de nuevo en un momento.", requestId: id });
        return;
      }

      payload = await response.json();
      cacheSet(cacheKey, payload);
    }

    const records = rankRecords(payload.results, params.sort, params.perPage);
    const tookMs = Date.now() - startedAt;
    res.setHeader("Server-Timing", `search;dur=${tookMs};desc="${served}"`);

    res.status(200).json({
      version: 2,
      query: params.q,
      sort: params.sort,
      origin: "openalex",
      precision: "type:dissertation+is_retracted:false+quality-gate",
      meta: {
        total: payload.meta?.count ?? records.length,
        page: params.page,
        perPage: params.perPage,
        returned: records.length,
        served,
        tookMs,
        corpusWorks: 322_000_000,
        corpusDissertations: 11_100_000,
        corpusInstitutions: 131_000,
      },
      records,
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    console.error(`[thesis-search ${id}] ${timedOut ? "timeout" : "error"}: ${error instanceof Error ? error.message : String(error)}`);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "20");
    res.status(timedOut ? 503 : 500).json({
      error: timedOut
        ? "El corpus académico tardó demasiado en responder. Inténtalo de nuevo en un momento."
        : "Error interno al buscar tesis.",
      requestId: id,
    });
  }
}
