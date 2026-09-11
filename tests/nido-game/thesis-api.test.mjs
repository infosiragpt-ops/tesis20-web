import test from "node:test";
import assert from "node:assert/strict";
import { buildOpenAlexUrl, isHighPrecisionRecord, mapWork, normalizeDoi, parseSearchParams, rankRecords, sanitizeQuery } from "../../api/thesis-search.js";

test("la consulta se limpia de caracteres de control y se acota", () => {
  assert.equal(sanitizeQuery("  inteligencia  artificial\n en   educación "), "inteligencia artificial en educación");
  assert.equal(sanitizeQuery("x".repeat(500)).length, 160);
});

test("los parámetros se validan con límites razonables", () => {
  const params = parseSearchParams({ q: "tesis", yearFrom: "1850", sort: "raro", minCitations: "-4", page: "999", perPage: "0.5" });
  assert.equal(params.yearFrom, null, "un año fuera de rango se ignora");
  assert.equal(params.sort, "relevance");
  assert.equal(params.minCitations, 0);
  assert.equal(params.page, 50);
  assert.equal(params.perPage, 1);
  assert.equal(parseSearchParams({ q: "tesis", yearFrom: "2015" }).yearFrom, 2015);
  assert.equal(parseSearchParams({ q: "tesis", yearFrom: "all" }).yearFrom, null);
});

test("la URL de OpenAlex solo pide disertaciones no retractadas y respeta filtros", () => {
  const url = buildOpenAlexUrl({ q: "gestión pública", yearFrom: 2015, sort: "citations", minCitations: 10, page: 2, perPage: 24 });
  assert.equal(url.searchParams.get("filter"), "type:dissertation,is_retracted:false,publication_year:>2014,cited_by_count:>9");
  assert.equal(url.searchParams.get("sort"), "cited_by_count:desc");
  assert.equal(url.searchParams.get("per_page"), "48");
  assert.equal(url.searchParams.get("page"), "2");
  assert.ok(url.searchParams.get("mailto"));
});

test("los DOI truncados o con basura se descartan", () => {
  assert.equal(normalizeDoi("https://doi.org/10.1234/abc.def"), "10.1234/abc.def");
  assert.equal(normalizeDoi("10.1234/abc."), null);
  assert.equal(normalizeDoi("10.12/x"), null);
  assert.equal(normalizeDoi(""), null);
});

test("el ranking descarta ruido y ordena por relevancia y citas", () => {
  const work = (id, extra = {}) => ({
    id: `https://openalex.org/${id}`,
    display_name: `Tesis doctoral sobre ${id} con título suficiente`,
    publication_year: 2021,
    cited_by_count: 3,
    relevance_score: 10,
    authorships: [{ author: { display_name: "Ana Pérez" }, institutions: [{ display_name: "UNMSM" }] }],
    primary_location: { landing_page_url: `https://repositorio.example/${id}` },
    open_access: { is_oa: true },
    doi: "https://doi.org/10.1234/abc.def",
    ...extra,
  });
  const ranked = rankRecords(
    [
      work("a"),
      work("b", { cited_by_count: 400, relevance_score: 4 }),
      work("c", { display_name: "corto" }),
      work("d", { primary_location: { landing_page_url: "http://inseguro.example/d" }, open_access: {}, doi: null, id: "http://openalex.org/d" }),
    ],
    "relevance",
    10,
  );
  assert.deepEqual(ranked.map((r) => r.id), ["oa:b", "oa:a"], "el título corto y la URL sin https no pasan el filtro de calidad");
  assert.ok(isHighPrecisionRecord(mapWork(work("z"))));
  assert.equal(ranked[0].doi, "https://doi.org/10.1234/abc.def");
});
