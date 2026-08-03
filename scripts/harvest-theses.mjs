import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACTIVE_THESIS_REPOSITORIES } from "../src/data/thesis-repositories.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "public/data/theses-index.json");
const userAgent = "Tesis20Harvester/1.0 (+https://www.tesis20.com/recursos)";
const MAX_INDEX_BYTES = 210 * 1024;

const thesisTypes = [
  ["doctoral", ["doctoralthesis", "c_db06", "tesis doctoral", "tesis de doctorado"]],
  ["master", ["masterthesis", "c_bdcc", "tesis de maestria", "tesis de máster"]],
  ["bachelor", ["bachelorthesis", "c_7a1f", "tesis de pregrado", "tesis de grado", "tesis de licenciatura"]],
  ["thesis", ["/c_46ec", "semantics/thesis", " tesis"]],
];

const excludedWorks = [
  "articulo cientifico",
  "informe por servicios profesionales",
  "monografia",
  "proyecto profesional",
  "proyectos profesionales",
  "trabajo academico",
  "trabajo de investigacion",
  "trabajo de suficiencia profesional",
];

const strongDescriptionExclusions = [
  "articulo cientifico",
  "monografia",
  "trabajo academico",
  "trabajo de suficiencia profesional",
];

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value = "") {
  return decodeXml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

function valuesFor(block, tag) {
  return [...block.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean);
}

function classifyThesis(types) {
  const normalizedTypes = normalize(types.join(" "));
  for (const [level, markers] of thesisTypes) {
    if (markers.some((marker) => normalizedTypes.includes(normalize(marker)))) return level;
  }
  return null;
}

function selectUrl(identifiers, repositoryUrl) {
  const urls = identifiers.filter((identifier) => /^https?:\/\//i.test(identifier));
  const selectedUrl = (
    urls.find((url) => /hdl\.handle\.net|handle\//i.test(url)) ||
    urls.find((url) => url.startsWith(repositoryUrl)) ||
    urls[0] ||
    null
  );
  return selectedUrl?.replace(/^http:/i, "https:") || null;
}

function getYear(dates) {
  for (const date of dates) {
    const match = date.match(/(?:19|20)\d{2}/);
    if (match) return Number(match[0]);
  }
  return null;
}

function compactAbstract(descriptions) {
  const description = descriptions.find((value) => value.length >= 60 && !/^https?:\/\//i.test(value));
  if (!description) return "";
  return description.length > 220 ? `${description.slice(0, 217).trimEnd()}…` : description;
}

function parseRecords(xml, repository) {
  const records = [];
  const blocks = xml.match(/<record>[^]*?<\/record>/gi) || [];

  for (const block of blocks) {
    if (/<header\b[^>]*status=["']deleted["']/i.test(block)) continue;
    const metadata = block.match(/<metadata>([^]*?)<\/metadata>/i)?.[1];
    if (!metadata) continue;

    const titles = valuesFor(metadata, "dc:title");
    const types = valuesFor(metadata, "dc:type");
    const descriptions = valuesFor(metadata, "dc:description");
    const subjects = valuesFor(metadata, "dc:subject");
    const level = classifyThesis(types);
    const title = titles[0];
    const normalizedTitle = normalize(title);
    const normalizedTypes = normalize(types.join(" "));
    const normalizedSubjects = subjects.map((subject) => normalize(subject));
    const shortDescriptionLabels = descriptions
      .filter((description) => description.length <= 80)
      .map((description) => normalize(description));
    const descriptionStarts = descriptions.map((description) => normalize(description).slice(0, 180));
    const isExcludedWork = excludedWorks.some(
      (term) =>
        normalizedTitle.includes(term) ||
        normalizedTypes.includes(term) ||
        normalizedSubjects.some((subject) => subject.includes(term)) ||
        shortDescriptionLabels.some((label) => label.includes(term)),
    ) || strongDescriptionExclusions.some((term) =>
      descriptionStarts.some((description) => description.includes(term))
    );
    if (!title || !level || isExcludedWork) continue;

    const identifiers = valuesFor(metadata, "dc:identifier");
    const url = selectUrl(identifiers, repository.repositoryUrl);
    if (!url) continue;

    const headerId = valuesFor(block.match(/<header[^>]*>([^]*?)<\/header>/i)?.[1] || "", "identifier")[0];
    const id = createHash("sha1").update(headerId || url).digest("hex").slice(0, 14);

    records.push({
      id,
      s: repository.id,
      t: title,
      a: valuesFor(metadata, "dc:creator").slice(0, 4),
      y: getYear(valuesFor(metadata, "dc:date")),
      l: level,
      u: url,
      k: subjects.slice(0, 8),
      d: compactAbstract(descriptions),
    });
  }

  return records;
}

function parseInputArguments() {
  const inputs = new Map();
  for (let index = 2; index < process.argv.length; index += 1) {
    if (process.argv[index] !== "--input") continue;
    const [sourceId, filePath] = String(process.argv[index + 1] || "").split("=", 2);
    if (sourceId && filePath) inputs.set(sourceId, filePath);
    index += 1;
  }
  return inputs;
}

async function fetchOaiPage(repository) {
  const url = new URL(repository.oaiUrl);
  url.searchParams.set("verb", "ListRecords");
  url.searchParams.set("metadataPrefix", "oai_dc");
  const response = await fetch(url, {
    headers: { Accept: "application/xml,text/xml;q=0.9", "User-Agent": userAgent },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const xml = await response.text();
  if (!/<OAI-PMH\b/i.test(xml)) throw new Error("la respuesta no es OAI-PMH");
  return xml;
}

async function main() {
  const inputs = parseInputArguments();
  const records = [];
  const sourceSummaries = [];

  for (const repository of ACTIVE_THESIS_REPOSITORIES) {
    const xml = inputs.has(repository.id)
      ? await readFile(path.resolve(inputs.get(repository.id)), "utf8")
      : await fetchOaiPage(repository);
    const parsed = parseRecords(xml, repository).slice(0, repository.initialRecordLimit);
    records.push(...parsed);
    sourceSummaries.push({ id: repository.id, records: parsed.length });
    console.log(`✓ ${repository.acronym}: ${parsed.length} tesis verificadas`);
  }

  const deduplicated = [...new Map(records.map((record) => [record.u.replace(/\/$/, ""), record])).values()]
    .sort((left, right) => (right.y || 0) - (left.y || 0) || left.t.localeCompare(right.t, "es"));
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    methodology: "OAI-PMH; dc:type/COAR; sin descarga de archivos",
    sources: sourceSummaries,
    records: deduplicated,
  };
  const serialized = JSON.stringify(payload);

  if (Buffer.byteLength(serialized) > MAX_INDEX_BYTES) {
    throw new Error(
      `El índice ocupa ${Buffer.byteLength(serialized)} bytes y supera el máximo de ${MAX_INDEX_BYTES}.`,
    );
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${serialized}\n`);
  console.log(`✓ Índice escrito: ${deduplicated.length} tesis, ${Buffer.byteLength(serialized)} bytes`);
}

main().catch((error) => {
  console.error(`No se pudo generar el índice de tesis: ${error.message}`);
  process.exitCode = 1;
});
