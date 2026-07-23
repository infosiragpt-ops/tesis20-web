import { execFileSync } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://www.tesis20.com";
const failures = [];
let checks = 0;

const routeSpecs = [
  {
    path: "/",
    output: "dist/index.html",
    title: "Asesoría de tesis en Lima y todo el Perú | Tesis20",
    h1: "Asesoría y acompañamiento para tu tesis",
    content: ["Quiero orientación", "Diagnóstico inicial", "evidencias anonimizadas"],
    schemaType: "WebPage",
  },
  {
    path: "/servicios",
    output: "dist/servicios.html",
    title: "Servicios de asesoría académica | Tesis20",
    h1: "Elige el acompañamiento que necesitas",
    content: ["Artículo científico", "IBM SPSS", "Simulación de sustentación"],
    schemaType: "CollectionPage",
  },
  {
    path: "/nido",
    output: "dist/nido.html",
    title: "Clases virtuales para niños | Tesis20 Nido",
    h1: "Aprender jugando, crecer con confianza",
    content: [
      "Explorar clases",
      "Precios referenciales de demostración",
      "Administrador, Docente o Alumno",
    ],
    schemaType: "CollectionPage",
  },
  {
    path: "/evidencias",
    output: "dist/evidencias.html",
    title: "Evidencias y resultados académicos | Tesis20",
    h1: "Resultados que generan confianza",
    content: ["datos personales se ocultan", "capturas completas", "resultado reportado"],
    schemaType: "CollectionPage",
  },
  {
    path: "/contrato",
    output: "dist/contrato.html",
    title: "Contrato general de asesoría académica | Tesis20",
    h1: "Contrato general de asesoría académica",
    content: ["Descargar contrato general en PDF", "responsabilidades", "conserva la autoría"],
    schemaType: "WebPage",
  },
  {
    path: "/servicios/articulo-cientifico",
    output: "dist/servicios/articulo-cientifico.html",
    title: "Asesoría para artículo científico | Tesis20",
    h1: "Asesoría para artículo científico",
    content: ["modelo PRISMA", "S/ 600", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
  {
    path: "/servicios/tesis-i-proyecto",
    output: "dist/servicios/tesis-i-proyecto.html",
    title: "Asesoría para proyecto de tesis | Tesis20",
    h1: "Asesoría para proyecto de tesis",
    content: ["Matriz de consistencia", "S/ 650", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
  {
    path: "/servicios/tesis-ii-titulacion",
    output: "dist/servicios/tesis-ii-titulacion.html",
    title: "Asesoría para tesis de titulación | Tesis20",
    h1: "Asesoría para tesis de titulación",
    content: ["Conclusiones y recomendaciones", "S/ 1200", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
  {
    path: "/servicios/suficiencia-profesional",
    output: "dist/servicios/suficiencia-profesional.html",
    title: "Trabajo de suficiencia profesional | Tesis20",
    h1: "Asesoría para trabajo de suficiencia profesional",
    content: ["Revisión de conclusiones, bibliografía y anexos", "S/ 1900", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
  {
    path: "/servicios/ibm-spss-statistics",
    output: "dist/servicios/ibm-spss-statistics.html",
    title: "Análisis estadístico con IBM SPSS | Tesis20",
    h1: "Análisis estadístico con IBM SPSS",
    content: ["Orientación para interpretar y presentar resultados", "S/ 450", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
  {
    path: "/servicios/simulacion-sustentacion",
    output: "dist/servicios/simulacion-sustentacion.html",
    title: "Simulación de sustentación de tesis | Tesis20",
    h1: "Simulación de sustentación de tesis",
    content: ["Balotario referencial de preguntas del jurado", "S/ 250", "Solicitar"],
    schemaType: "WebPage",
    service: true,
  },
];

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canonicalFor(routePath) {
  return `${siteOrigin}${routePath === "/" ? "/" : routePath}`;
}

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function fileSize(relativePath) {
  return (await stat(path.join(root, relativePath))).size;
}

async function walk(directory, accept = () => true) {
  const absoluteDirectory = path.join(root, directory);
  if (!(await exists(directory))) return [];

  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walk(relativePath, accept);
      return accept(relativePath) ? [relativePath] : [];
    }),
  );

  return files.flat();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeText(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function getAttribute(tag, attribute) {
  const match = tag.match(
    new RegExp(`\\b${escapeRegExp(attribute)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i"),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function getTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];
}

function getElementContents(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))].map(
    (match) => match[1],
  );
}

function getMetaContent(html, attribute, value) {
  const tag = getTags(html, "meta").find(
    (candidate) => getAttribute(candidate, attribute)?.toLowerCase() === value.toLowerCase(),
  );
  return tag ? getAttribute(tag, "content") : null;
}

function getLinkHref(html, rel, hreflang = null) {
  const tag = getTags(html, "link").find((candidate) => {
    const relations = (getAttribute(candidate, "rel") || "").toLowerCase().split(/\s+/);
    if (!relations.includes(rel.toLowerCase())) return false;
    return hreflang === null || getAttribute(candidate, "hreflang")?.toLowerCase() === hreflang.toLowerCase();
  });
  return tag ? getAttribute(tag, "href") : null;
}

function getJsonLdDocuments(html, documentName) {
  const documents = [];
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);

  for (const script of scripts) {
    const type = getAttribute(`<script ${script[1]}>`, "type");
    if (type?.toLowerCase() !== "application/ld+json") continue;
    try {
      documents.push(JSON.parse(decodeHtml(script[2]).trim()));
    } catch (error) {
      check(false, `${documentName} contiene JSON-LD inválido: ${error.message}`);
    }
  }

  return documents;
}

function flattenSchemaNodes(documents) {
  return documents.flatMap((document) => {
    if (Array.isArray(document)) return document.flatMap((item) => item?.["@graph"] || [item]);
    return document?.["@graph"] || [document];
  });
}

function hasSchemaType(node, expectedType) {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  return types.includes(expectedType);
}

function isValidImageSignature(extension, bytes) {
  const hex = bytes.toString("hex");
  if (extension === ".png") return hex.startsWith("89504e470d0a1a0a");
  if ([".jpg", ".jpeg"].includes(extension)) return hex.startsWith("ffd8ff");
  if (extension === ".webp") {
    return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (extension === ".svg") return bytes.toString("utf8", 0, 256).includes("<svg");
  return true;
}

function parseCsp(policy) {
  return new Map(
    policy
      .split(";")
      .map((directive) => directive.trim())
      .filter(Boolean)
      .map((directive) => {
        const [name, ...values] = directive.split(/\s+/);
        return [name.toLowerCase(), values];
      }),
  );
}

function extractSitemapEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => {
    const block = match[1];
    return {
      loc: normalizeText(block.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1] || ""),
      lastmod: normalizeText(block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1] || ""),
    };
  });
}

function isInternalQaArtifact(relativePath) {
  const normalized = relativePath.split(path.sep).join("/").replace(/^dist\//, "");
  return /(^|\/)qa(?:[-/]|\.|$)/i.test(normalized);
}

const index = await read("index.html");
const robots = await read("public/robots.txt");
const sitemapPath = (await exists("dist/sitemap.xml")) ? "dist/sitemap.xml" : "public/sitemap.xml";
const sitemap = await read(sitemapPath);
const manifestText = await read("public/site.webmanifest");
const serviceWorker = await read("public/sw.js");
const vercelText = await read("vercel.json");
const appSource = await read("src/App.jsx");
const manifest = JSON.parse(manifestText);
const vercel = JSON.parse(vercelText);

// Metadatos base y host canónico.
check(index.includes('rel="canonical" href="https://www.tesis20.com/"'), "El canonical base debe usar https://www.tesis20.com/.");
check(index.includes('property="og:url" content="https://www.tesis20.com/"'), "Open Graph debe declarar la URL pública con www.");
check(!index.includes("https://tesis20.com"), "index.html todavía contiene URLs absolutas sin www.");
check(!index.includes("api.whatsapp.com\" crossorigin") && !index.includes('rel="dns-prefetch" href="https://api.whatsapp.com"'), "No se debe abrir una conexión anticipada a WhatsApp.");
check(robots.includes("Sitemap: https://www.tesis20.com/sitemap.xml"), "robots.txt debe apuntar al sitemap canónico con www.");
check(!/^\s*Disallow:\s*\/\s*$/im.test(robots), "robots.txt no debe bloquear el sitio completo.");

// El sitemap debe describir exactamente las páginas indexables que entrega el build.
const sitemapEntries = extractSitemapEntries(sitemap);
const expectedCanonicalUrls = routeSpecs.map((route) => canonicalFor(route.path));
const sitemapLocations = sitemapEntries.map((entry) => entry.loc);
check(sitemapEntries.length === routeSpecs.length, `sitemap.xml debe contener exactamente ${routeSpecs.length} URLs indexables.`);
check(new Set(sitemapLocations).size === sitemapLocations.length, "sitemap.xml contiene URLs duplicadas.");
for (const canonicalUrl of expectedCanonicalUrls) {
  check(sitemapLocations.includes(canonicalUrl), `Falta ${canonicalUrl} en sitemap.xml.`);
}
for (const entry of sitemapEntries) {
  check(expectedCanonicalUrls.includes(entry.loc), `sitemap.xml contiene una URL no publicada o no canónica: ${entry.loc || "(vacía)"}.`);
  check(!/[?#]/.test(entry.loc), `La URL ${entry.loc} del sitemap no debe contener query ni fragmento.`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod), `lastmod inválido para ${entry.loc}: ${entry.lastmod || "(vacío)"}.`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) {
    const modified = Date.parse(`${entry.lastmod}T00:00:00Z`);
    check(Number.isFinite(modified) && modified <= Date.now() + 86_400_000, `lastmod no puede estar en el futuro para ${entry.loc}.`);
  }
}
check(!sitemap.includes("https://tesis20.com"), "sitemap.xml todavía contiene URLs sin www.");

// PWA y recursos de navegación.
check(manifest.id === "/" && manifest.start_url === "/" && manifest.scope === "/", "El manifest debe mantener id, inicio y alcance en la raíz.");
check(manifest.theme_color === "#F5BD42" && manifest.background_color === "#F5BD42", "El manifest debe conservar el amarillo oficial.");
check(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "El manifest debe incluir iconos PNG y SVG.");
check(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3, "El manifest debe ofrecer accesos directos a las rutas principales.");

const precacheBlock = serviceWorker.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/)?.[1] || "";
check(serviceWorker.includes("networkFirstNavigation") && serviceWorker.includes("staleWhileRevalidate"), "El service worker debe implementar estrategias de red y caché.");
check(!/\.(?:mp3|pdf)/i.test(precacheBlock), "El service worker no debe precargar audios ni PDF pesados.");
check(serviceWorker.includes("MAX_RUNTIME_ENTRIES"), "El service worker debe limitar el crecimiento de la caché dinámica.");

// La configuración de alojamiento debe servir HTML estático por ruta y un 404 real.
const globalHeaderRule = (vercel.headers || []).find((rule) => rule.source === "/(.*)");
const globalHeaders = new Map(
  (globalHeaderRule?.headers || []).map((header) => [header.key.toLowerCase(), String(header.value)]),
);
const genericSpaRewrite = (vercel.rewrites || []).find(
  (rule) => /^\/?\(\.\*\)$/.test(rule.source) && /\/index\.html$/.test(rule.destination),
);
check(vercel.cleanUrls === true, "Vercel debe activar cleanUrls para servir /servicios desde servicios.html.");
check(!genericSpaRewrite, "El fallback global hacia index.html genera soft-404; publica 404.html y elimina ese rewrite.");
check(globalHeaders.has("x-content-type-options") && globalHeaders.has("referrer-policy") && globalHeaders.has("permissions-policy"), "Faltan cabeceras básicas de estabilidad y privacidad.");
check(JSON.stringify(vercel).includes("max-age=31536000, immutable"), "Los bundles con hash necesitan caché inmutable.");

// CSP: se valida una política compatible, nunca su ausencia.
const cspPolicy = globalHeaders.get("content-security-policy") || "";
const csp = parseCsp(cspPolicy);
check(Boolean(cspPolicy), "Falta Content-Security-Policy en las cabeceras globales.");
const requiredCspSources = [
  ["default-src", "'self'"],
  ["script-src", "'self'"],
  ["style-src", "'self'"],
  ["img-src", "'self'"],
  ["font-src", "'self'"],
  ["media-src", "'self'"],
  ["connect-src", "'self'"],
  ["base-uri", "'self'"],
  ["frame-ancestors", "'self'"],
  ["object-src", "'none'"],
];
for (const [directive, source] of requiredCspSources) {
  check(csp.get(directive)?.includes(source), `CSP debe incluir ${directive} ${source}.`);
}
check(!cspPolicy.includes("'unsafe-eval'"), "CSP no debe permitir unsafe-eval.");
check(![...csp.values()].flat().includes("*"), "CSP no debe incluir orígenes comodín.");
const inlineStylesAllowed = csp.get("style-src")?.includes("'unsafe-inline'") || csp.get("style-src-attr")?.includes("'unsafe-inline'");
check(!/style\s*=\s*\{\{/m.test(appSource) || inlineStylesAllowed, "La CSP debe permitir los estilos inline usados por React mediante style-src o style-src-attr.");

// Todas las referencias locales del código deben existir antes de compilar.
const sourceFiles = [
  "index.html",
  "public/site.webmanifest",
  "public/sw.js",
  ...(await walk("src", (file) => /\.(?:js|jsx|css|json)$/.test(file))),
];
const referencedAssets = new Set();
const assetPattern = /["'(]\/((?:assets|downloads)\/[^"'()\s?#]+)/g;

for (const sourceFile of sourceFiles) {
  const contents = await read(sourceFile);
  for (const match of contents.matchAll(assetPattern)) referencedAssets.add(match[1]);
}
for (const asset of referencedAssets) {
  check(await exists(path.join("public", asset)), `El recurso referenciado /${asset} no existe en public/.`);
}

// La galería solicitada muestra 15 imágenes sin presentar las repeticiones como 15 casos distintos.
check(/const\s+GRADE_GALLERY_SIZE\s*=\s*15\s*;/.test(appSource), "La galería de calificaciones debe contener 15 imágenes.");
check(/Galería de 15 imágenes organizada con 5 capturas anonimizadas/.test(appSource), "La galería debe explicar que las 15 imágenes se organizan a partir de 5 capturas.");
const gradeImageSources = [...appSource.matchAll(/(?:image|src):\s*["'](\/assets\/grade-results\/[^"']+)["']/g)].map((match) => match[1]);
check(gradeImageSources.length > 0, "No se encontraron evidencias de calificaciones declaradas.");
check(new Set(gradeImageSources).size === gradeImageSources.length, "Las rutas de evidencias de calificaciones deben ser únicas.");
const evidenceSources = [...appSource.matchAll(/src:\s*["'](\/assets\/evidence\/[^"']+)["']/g)].map((match) => match[1]);
check(evidenceSources.length > 0, "No se encontraron evidencias agrupadas declaradas.");
check(new Set(evidenceSources).size === evidenceSources.length, "Una misma captura no debe publicarse en varios grupos de evidencias.");

const sourceImages = await walk("public/assets", (file) => /\.(?:png|jpe?g|webp|svg)$/i.test(file));
for (const imageFile of sourceImages) {
  const bytes = await readFile(path.join(root, imageFile));
  check(isValidImageSignature(path.extname(imageFile).toLowerCase(), bytes), `${imageFile} no coincide con su extensión declarada.`);
}

// A partir de aquí se verifica el artefacto que realmente se despliega.
check(await exists("dist"), "Falta dist/. Ejecuta la compilación antes del control de calidad.");
const distFiles = await walk("dist");
const leakedQaFiles = distFiles.filter(isInternalQaArtifact);
check(!leakedQaFiles.length, `El build contiene artefactos QA internos: ${leakedQaFiles.join(", ") || "ninguno"}.`);
check(await exists("dist/404.html"), "La compilación debe incluir dist/404.html para responder rutas desconocidas.");
check(await exists("dist/sw.js"), "La compilación no incluyó sw.js.");
check(await exists("dist/site.webmanifest"), "La compilación no incluyó site.webmanifest.");

const routeDocuments = new Map();
for (const route of routeSpecs) {
  const outputExists = await exists(route.output);
  check(outputExists, `La compilación no generó ${route.output} para ${route.path}.`);
  if (!outputExists) continue;

  const html = await read(route.output);
  routeDocuments.set(route.path, html);
  const canonicalUrl = canonicalFor(route.path);
  const titles = getElementContents(html, "title").map(normalizeText);
  const headings = getElementContents(html, "h1").map(normalizeText);
  const visibleText = normalizeText(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " "),
  );
  const description = getMetaContent(html, "name", "description") || "";
  const robotsMeta = getMetaContent(html, "name", "robots") || "";
  const jsonLdDocuments = getJsonLdDocuments(html, route.output);
  const schemaNodes = flattenSchemaNodes(jsonLdDocuments);

  check(/<html\b[^>]*\blang=["']es-PE["']/i.test(html), `${route.output} debe declarar lang="es-PE".`);
  check(titles.length === 1 && titles[0] === route.title, `${route.output} debe tener un único title exacto: “${route.title}”.`);
  check(headings.length === 1 && headings[0].toLocaleLowerCase("es") === route.h1.toLocaleLowerCase("es"), `${route.output} debe tener un único H1 exacto: “${route.h1}”.`);
  check(getLinkHref(html, "canonical") === canonicalUrl, `${route.output} debe declarar canonical ${canonicalUrl}.`);
  check(getLinkHref(html, "alternate", "es-PE") === canonicalUrl, `${route.output} debe declarar hreflang es-PE hacia su canonical.`);
  check(getLinkHref(html, "alternate", "x-default") === canonicalUrl, `${route.output} debe declarar hreflang x-default hacia su canonical.`);
  check(getMetaContent(html, "property", "og:url") === canonicalUrl, `${route.output} debe declarar og:url ${canonicalUrl}.`);
  check(getMetaContent(html, "property", "og:title") === route.title, `${route.output} debe alinear og:title con title.`);
  check(getMetaContent(html, "name", "twitter:title") === route.title, `${route.output} debe alinear twitter:title con title.`);
  check(description.length >= 80 && description.length <= 180, `${route.output} necesita una meta description de 80 a 180 caracteres (actual: ${description.length}).`);
  check(/\bindex\b/i.test(robotsMeta) && !/\bnoindex\b/i.test(robotsMeta), `${route.output} debe ser indexable.`);
  check(/<main\b/i.test(html), `${route.output} debe contener contenido semántico dentro de <main>.`);
  check(visibleText.length >= 350, `${route.output} debe entregar contenido útil sin depender de ejecutar JavaScript.`);
  for (const text of route.content) {
    check(visibleText.toLocaleLowerCase("es").includes(text.toLocaleLowerCase("es")), `${route.output} no contiene el texto crítico “${text}”.`);
  }
  check(jsonLdDocuments.length > 0, `${route.output} debe incluir JSON-LD renderizado en el HTML.`);
  check(schemaNodes.some((node) => hasSchemaType(node, "Organization")), `${route.output} debe incluir Organization en JSON-LD.`);
  check(schemaNodes.some((node) => hasSchemaType(node, route.schemaType) && node.url === canonicalUrl), `${route.output} debe incluir ${route.schemaType} con URL canónica.`);
  check(schemaNodes.some((node) => hasSchemaType(node, "BreadcrumbList")), `${route.output} debe incluir BreadcrumbList.`);
  if (route.path === "/servicios") {
    check(schemaNodes.some((node) => hasSchemaType(node, "ItemList")), "dist/servicios.html debe incluir el catálogo ItemList.");
  }
  if (route.path === "/contrato") {
    check(schemaNodes.some((node) => hasSchemaType(node, "DigitalDocument")), "dist/contrato.html debe describir el contrato como DigitalDocument.");
  }
  if (route.service) {
    const serviceNode = schemaNodes.find((node) => hasSchemaType(node, "Service"));
    check(Boolean(serviceNode), `${route.output} debe describir el servicio con JSON-LD Service.`);
    check(serviceNode?.offers && hasSchemaType(serviceNode.offers, "Offer"), `${route.output} debe incluir una oferta en PEN dentro del JSON-LD Service.`);
    check(serviceNode?.offers?.priceCurrency === "PEN", `${route.output} debe declarar priceCurrency PEN.`);
  }
}

if (await exists("dist/404.html")) {
  const notFoundHtml = await read("dist/404.html");
  const notFoundTitle = getElementContents(notFoundHtml, "title").map(normalizeText);
  const notFoundHeadings = getElementContents(notFoundHtml, "h1").map(normalizeText);
  const notFoundRobots = getMetaContent(notFoundHtml, "name", "robots") || "";
  check(notFoundTitle.length === 1 && notFoundTitle[0] === "Página no encontrada | Tesis20", "404.html debe tener un title específico.");
  check(notFoundHeadings.length === 1 && notFoundHeadings[0] === "Esta página no está disponible", "404.html debe tener un único H1 explicativo.");
  check(/\bnoindex\b/i.test(notFoundRobots), "404.html debe declarar noindex.");
  check(notFoundHtml !== routeDocuments.get("/"), "404.html no puede ser una copia de la portada.");
}

// Enlaces internos críticos y destinos reales.
const routeByPath = new Map(routeSpecs.map((route) => [route.path, route]));
for (const route of routeSpecs) {
  const html = routeDocuments.get(route.path);
  if (!html) continue;
  const hrefs = getTags(html, "a").map((tag) => getAttribute(tag, "href")).filter(Boolean);
  const requiredPaths =
    route.path === "/nido"
      ? ["/"]
      : ["/servicios", "/evidencias", "/contrato", "/nido"];
  for (const requiredPath of requiredPaths) {
    check(hrefs.some((href) => href === requiredPath || href.startsWith(`${requiredPath}#`)), `${route.output} debe enlazar a ${requiredPath}.`);
  }

  for (const href of hrefs) {
    check(!/^javascript:/i.test(href), `${route.output} contiene un enlace javascript: inseguro.`);
    if (/^(?:mailto:|tel:|https?:\/\/|#)/i.test(href)) continue;
    let destination;
    try {
      destination = new URL(href, `${siteOrigin}${route.path}`);
    } catch {
      check(false, `${route.output} contiene un href inválido: ${href}.`);
      continue;
    }
    if (destination.origin !== siteOrigin) continue;
    const destinationPath = destination.pathname.replace(/\/$/, "") || "/";
    if (routeByPath.has(destinationPath)) continue;
    const publicTarget = `dist${destination.pathname}`;
    check(await exists(publicTarget), `${route.output} enlaza a un destino interno inexistente: ${destination.pathname}.`);
  }
}

// La app debe usar el arreglo de 15 elementos tanto en la cuadrícula como en el contador.
check(/gradeResults\.map\(\(result,\s*index\)\s*=>/.test(appSource), "La cuadrícula debe renderizar el arreglo gradeResults.");
check(/resultsCount=\{gradeResults\.length\}/.test(appSource), "El contador debe reflejar las 15 imágenes de la galería.");
check(/aria-setsize=\{GRADE_GALLERY_SIZE\}/.test(appSource), "La galería debe comunicar sus 15 elementos a tecnologías de asistencia.");

// Presupuestos del artefacto final.
const buildAssets = distFiles.filter((file) => /dist\/build-assets\/.*\.(?:js|css|map)$/.test(file));
let javascriptBytes = 0;
let stylesheetBytes = 0;
let initialJavascriptBytes = 0;
let initialStylesheetBytes = 0;
let deployBytesWithoutAudioAndPdf = 0;
for (const distFile of distFiles) {
  const bytes = await fileSize(distFile);
  if (!/\.(?:mp3|pdf)$/i.test(distFile)) deployBytesWithoutAudioAndPdf += bytes;
}
for (const buildAsset of buildAssets) {
  const bytes = await fileSize(buildAsset);
  const isNidoLazyAsset = /\/nido-page-[^/]+\.(?:js|css)$/.test(buildAsset);
  if (buildAsset.endsWith(".js")) {
    javascriptBytes += bytes;
    if (!isNidoLazyAsset) initialJavascriptBytes += bytes;
    check(bytes <= 250 * 1024, `${buildAsset} supera el máximo de 250 KiB por chunk.`);
  }
  if (buildAsset.endsWith(".css")) {
    stylesheetBytes += bytes;
    if (!isNidoLazyAsset) initialStylesheetBytes += bytes;
    check(bytes <= 85 * 1024, `${buildAsset} supera el máximo de 85 KiB por hoja.`);
  }
  check(!buildAsset.endsWith(".map"), `No se deben publicar source maps: ${buildAsset}`);
}
check(
  initialJavascriptBytes > 0 && initialJavascriptBytes <= 450 * 1024,
  `El JavaScript inicial debe estar entre 1 y 450 KiB (${Math.ceil(initialJavascriptBytes / 1024)} KiB).`,
);
check(
  javascriptBytes <= 540 * 1024,
  `El JavaScript total con rutas diferidas no debe superar 540 KiB (${Math.ceil(javascriptBytes / 1024)} KiB).`,
);
check(
  initialStylesheetBytes > 0 && initialStylesheetBytes <= 85 * 1024,
  `El CSS inicial debe estar entre 1 y 85 KiB (${Math.ceil(initialStylesheetBytes / 1024)} KiB).`,
);
check(
  stylesheetBytes <= 120 * 1024,
  `El CSS total con rutas diferidas no debe superar 120 KiB (${Math.ceil(stylesheetBytes / 1024)} KiB).`,
);
check(deployBytesWithoutAudioAndPdf <= 9 * 1024 * 1024, `El build sin audios/PDF supera 9 MiB (${(deployBytesWithoutAudioAndPdf / 1024 / 1024).toFixed(2)} MiB).`);

for (const htmlFile of distFiles.filter((file) => file.endsWith(".html"))) {
  check((await fileSize(htmlFile)) <= 300 * 1024, `${htmlFile} supera 300 KiB.`);
}
for (const thumbnail of distFiles.filter((file) => file.includes("/assets/thumbnails/") && /\.(?:png|jpe?g|webp)$/i.test(file))) {
  check((await fileSize(thumbnail)) <= 250 * 1024, `${thumbnail} supera 250 KiB.`);
}
for (const audio of distFiles.filter((file) => /\/assets\/audio\/.*\.mp3$/i.test(file))) {
  check((await fileSize(audio)) <= 1_200 * 1024, `${audio} supera 1.2 MiB.`);
}
for (const imageFile of distFiles.filter((file) => /\.(?:png|jpe?g|webp|svg)$/i.test(file))) {
  const bytes = await readFile(path.join(root, imageFile));
  check(isValidImageSignature(path.extname(imageFile).toLowerCase(), bytes), `${imageFile} no coincide con su extensión declarada.`);
  check(bytes.length <= 1_800 * 1024, `${imageFile} supera el máximo de 1.8 MiB.`);
}

let trackedPublicQa = "";
try {
  trackedPublicQa = execFileSync("git", ["ls-files", "public"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((file) => /(^|\/)qa(?:-|\/)/.test(file))
    .join(", ");
} catch {
  // El control del índice de Git es opcional fuera de un checkout.
}
check(!trackedPublicQa, `Hay archivos QA versionados dentro de public/: ${trackedPublicQa}`);

if (failures.length) {
  console.error(`\nFallaron ${failures.length} de ${checks} controles de calidad:\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`✓ ${checks} controles de HTML por ruta, SEO, enlaces, evidencias, PWA, CSP y presupuesto completados.`);
}
