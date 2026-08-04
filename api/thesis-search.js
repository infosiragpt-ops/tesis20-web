/**
 * Búsqueda automatizada de tesis / disertaciones en el grafo académico global
 * (OpenAlex) con ranking por relevancia + citas.
 *
 * Precisión: solo type=dissertation (excluye artículos, papers y grises).
 * GET /api/thesis-search?q=...&yearFrom=2015&sort=relevance|citations&minCitations=0
 */

const OPENALEX_WORKS = "https://api.openalex.org/works";
const MAILTO = process.env.OPENALEX_MAILTO || "contacto@tesis20.com";
const USER_AGENT = `Tesis20Search/2.0 (mailto:${MAILTO})`;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

function sanitizeQuery(value = "") {
  return String(value).trim().slice(0, 160);
}

function invertAbstract(inverted) {
  if (!inverted || typeof inverted !== "object") return "";
  const pairs = [];
  for (const [word, positions] of Object.entries(inverted)) {
    for (const position of positions) pairs.push([position, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  const text = pairs.map(([, word]) => word).join(" ");
  return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
}

function isHttpsUrl(value) {
  return /^https:\/\//i.test(String(value || ""));
}

function normalizeDoi(doi) {
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

function isHighPrecisionRecord(record) {
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

function mapWork(work) {
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
    .map((item) => item.display_name)
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

function buildOpenAlexUrl({ q, yearFrom, sort, minCitations, page, perPage }) {
  const url = new URL(OPENALEX_WORKS);
  // Solo disertaciones/tesis; se excluyen retractados para precisión de contenido.
  const filters = ["type:dissertation", "is_retracted:false"];

  if (yearFrom) filters.push(`publication_year:>=${yearFrom}`);
  if (minCitations > 0) filters.push(`cited_by_count:>=${minCitations}`);

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

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  try {
    const q = sanitizeQuery(req.query?.q || "");
    if (q.length < 2) {
      res.status(400).json({ error: "La consulta debe tener al menos 2 caracteres." });
      return;
    }

    const yearFromRaw = req.query?.yearFrom;
    const yearFrom =
      yearFromRaw && yearFromRaw !== "all" && /^\d{4}$/.test(String(yearFromRaw))
        ? Number(yearFromRaw)
        : null;
    const sort = req.query?.sort === "citations" ? "citations" : "relevance";
    const minCitations = Math.max(0, Math.min(1000, Number(req.query?.minCitations) || 0));
    const page = Math.max(1, Math.min(50, Number(req.query?.page) || 1));
    const perPage = Math.max(1, Math.min(50, Number(req.query?.perPage) || 24));

    const openAlexUrl = buildOpenAlexUrl({ q, yearFrom, sort, minCitations, page, perPage });
    const response = await fetch(openAlexUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      res.status(502).json({
        error: "No se pudo consultar el corpus académico global.",
        status: response.status,
      });
      return;
    }

    const payload = await response.json();
    const records = (payload.results || [])
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

    res.status(200).json({
      version: 2,
      query: q,
      sort,
      origin: "openalex",
      precision: "type:dissertation+is_retracted:false+quality-gate",
      meta: {
        total: payload.meta?.count ?? records.length,
        page,
        perPage,
        returned: records.length,
        corpusWorks: 322_000_000,
        corpusDissertations: 11_100_000,
        corpusInstitutions: 131_000,
      },
      records,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error interno al buscar tesis.",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}
