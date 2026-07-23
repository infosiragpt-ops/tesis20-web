import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DIST_DIRECTORY = resolve(process.cwd(), "dist");
const INDEX_PATH = resolve(DIST_DIRECTORY, "index.html");
const SITE_ORIGIN = "https://www.tesis20.com";
const SHARE_IMAGE = `${SITE_ORIGIN}/assets/hero-students.png`;

const services = [
  {
    name: "Artículo científico",
    price: 600,
    description:
      "Búsqueda, análisis y redacción científica con una estructura clara y orientación profesional.",
    anchor: "articulo-cientifico",
    seoTitle: "Asesoría para artículo científico | Tesis20",
    heading: "Asesoría para artículo científico",
    seoDescription:
      "Recibe asesoría para desarrollar tu artículo científico con búsqueda académica, revisión PRISMA, redacción, parafraseado y formato de citación.",
    details: [
      "Búsqueda académica en WoS, Scopus, SciELO y Redalyc",
      "Análisis de artículos relacionados con el tema",
      "Orientación para la estructura del artículo y el modelo PRISMA",
      "Revisión de parafraseado y formato de citación",
    ],
  },
  {
    name: "Tesis I – Proyecto",
    price: 650,
    description:
      "Acompañamiento para construir el proyecto de investigación desde el planteamiento inicial.",
    anchor: "tesis-i-proyecto",
    seoTitle: "Asesoría para proyecto de tesis | Tesis20",
    heading: "Asesoría para proyecto de tesis",
    seoDescription:
      "Organiza tu proyecto de tesis con asesoría en problema, objetivos, hipótesis, marco teórico, metodología y matriz de consistencia desde S/ 650.",
    details: [
      "Planteamiento del problema, objetivos e hipótesis",
      "Orientación para el marco teórico y la justificación",
      "Diseño metodológico de acuerdo con la investigación",
      "Matriz de consistencia y operacionalización",
    ],
  },
  {
    name: "Tesis II – De titulación",
    price: 1200,
    description:
      "Orientación integral para desarrollar la investigación hasta sus conclusiones y bibliografía.",
    anchor: "tesis-ii-titulacion",
    seoTitle: "Asesoría para tesis de titulación | Tesis20",
    heading: "Asesoría para tesis de titulación",
    seoDescription:
      "Avanza tu tesis de titulación con orientación metodológica, análisis de resultados, discusión, conclusiones, recomendaciones y bibliografía.",
    details: [
      "Revisión del planteamiento y la metodología",
      "Orientación para el análisis e interpretación de resultados",
      "Acompañamiento en discusión, conclusiones y recomendaciones",
      "Revisión de bibliografía y anexos según el alcance",
    ],
  },
  {
    name: "Trabajo de suficiencia profesional",
    price: 1900,
    description:
      "Acompañamiento para convertir la experiencia profesional en un trabajo académico sustentable.",
    anchor: "suficiencia-profesional",
    seoTitle: "Trabajo de suficiencia profesional | Tesis20",
    heading: "Asesoría para trabajo de suficiencia profesional",
    seoDescription:
      "Convierte tu experiencia laboral en un trabajo de suficiencia profesional con una estructura clara, análisis, conclusiones y preparación académica.",
    details: [
      "Selección y delimitación del tema profesional",
      "Organización del problema, objetivos y bases teóricas",
      "Orientación para metodología, análisis y resultados",
      "Revisión de conclusiones, bibliografía y anexos",
    ],
  },
  {
    name: "IBM SPSS Statistics",
    price: 450,
    description:
      "Procesamiento, análisis e interpretación de datos con orientación personalizada.",
    anchor: "ibm-spss-statistics",
    seoTitle: "Análisis estadístico con IBM SPSS | Tesis20",
    heading: "Análisis estadístico con IBM SPSS",
    seoDescription:
      "Recibe asesoría para preparar, procesar e interpretar datos de investigación con IBM SPSS Statistics y una explicación personalizada.",
    details: [
      "Revisión de la investigación y las variables",
      "Preparación y vaciado de la base de datos",
      "Procesamiento estadístico con IBM SPSS",
      "Orientación para interpretar y presentar resultados",
    ],
  },
  {
    name: "Simulación de sustentación",
    price: 250,
    description:
      "Práctica guiada, preguntas del jurado y retroalimentación para defender la investigación.",
    anchor: "simulacion-sustentacion",
    seoTitle: "Simulación de sustentación de tesis | Tesis20",
    heading: "Simulación de sustentación de tesis",
    seoDescription:
      "Prepárate para sustentar tu tesis mediante sesiones de simulación, preguntas de jurado y retroalimentación sobre tu exposición y presentación.",
    details: [
      "Revisión previa de la presentación de sustentación",
      "Dos sesiones de práctica guiada de 30 minutos",
      "Balotario referencial de preguntas del jurado",
      "Retroalimentación sobre respuestas, tiempo y claridad",
    ],
  },
];

const routeDefinitions = [
  {
    output: "index.html",
    path: "/",
    title: "Asesoría de tesis en Lima y todo el Perú | Tesis20",
    description:
      "Asesoría académica personalizada para tesis, proyectos, análisis estadístico y sustentación, con metodología por etapas y autoría del estudiante.",
    heading: "Asesoría y acompañamiento para tu tesis",
    schemaType: "WebPage",
    content: `
      <p class="eyebrow">Bienvenido a Tesis20</p>
      <h1>Asesoría y acompañamiento para tu tesis</h1>
      <p>Te guiamos paso a paso para que avances en tu tesis o proyecto con una ruta clara, orientación personalizada y seguimiento profesional.</p>
      <p><a href="https://api.whatsapp.com/send?phone=51918714054">Quiero orientación</a> <a href="/servicios">Conocer los servicios</a></p>
      <section aria-labelledby="static-services-title">
        <h2 id="static-services-title">Acompañamiento para cada etapa de tu investigación</h2>
        <p>Brindamos orientación en proyectos de tesis, trabajos de titulación, artículos científicos, análisis estadístico y preparación de sustentaciones.</p>
        <ul>
          ${services.map((service) => `<li><a href="/servicios/${service.anchor}">${service.name}</a>: ${service.description}</li>`).join("\n")}
        </ul>
      </section>
      <section aria-labelledby="static-method-title">
        <h2 id="static-method-title">Una ruta clara en tres etapas</h2>
        <ol>
          <li><strong>Diagnóstico inicial:</strong> revisamos el tema, los requisitos y el avance.</li>
          <li><strong>Plan de trabajo:</strong> organizamos etapas, entregables y un cronograma realista.</li>
          <li><strong>Acompañamiento experto:</strong> coordinamos sesiones y revisiones según el servicio.</li>
        </ol>
      </section>
      <section aria-labelledby="static-trust-title">
        <h2 id="static-trust-title">Información para decidir con confianza</h2>
        <p>Consulta nuestras <a href="/evidencias">evidencias anonimizadas</a> y revisa el <a href="/contrato">modelo general de contrato</a> antes de contratar.</p>
      </section>`,
  },
  {
    output: "servicios.html",
    path: "/servicios",
    title: "Servicios de asesoría académica | Tesis20",
    description:
      "Conoce los servicios de Tesis20 para artículos científicos, proyectos, tesis, suficiencia profesional, IBM SPSS y simulación de sustentación.",
    heading: "Elige el acompañamiento que necesitas",
    schemaType: "CollectionPage",
    content: `
      <p class="eyebrow">Servicios académicos</p>
      <h1>Elige el acompañamiento que necesitas</h1>
      <p>Compara alcances y precios referenciales. El servicio y precio final se confirman después de revisar tu avance, requisitos y fecha objetivo.</p>
      <section aria-labelledby="static-catalog-title">
        <h2 id="static-catalog-title">Servicios especializados de Tesis20</h2>
        ${services
          .map(
            (service) => `
              <article id="${service.anchor}">
                <h3>${service.name}</h3>
                <p><strong>Desde S/ ${service.price}</strong></p>
                <p>${service.description}</p>
                <p><a href="/servicios/${service.anchor}">Ver alcance de ${service.name}</a></p>
              </article>`,
          )
          .join("\n")}
      </section>
      <section aria-labelledby="static-services-process-title">
        <h2 id="static-services-process-title">Antes de comenzar</h2>
        <p>Realizamos una orientación inicial para identificar el servicio adecuado. Puedes leer el <a href="/contrato">modelo general de contrato</a> y resolver tus dudas antes de decidir.</p>
      </section>`,
  },
  {
    output: "evidencias.html",
    path: "/evidencias",
    title: "Evidencias y resultados académicos | Tesis20",
    description:
      "Revisa ejemplos anonimizados de acompañamiento y resultados compartidos por estudiantes, publicados para mostrar el proceso sin prometer resultados futuros.",
    heading: "Resultados que generan confianza",
    schemaType: "CollectionPage",
    content: `
      <p class="eyebrow">Evidencias anonimizadas</p>
      <h1>Resultados que generan confianza</h1>
      <p>Estas evidencias fueron compartidas durante procesos de acompañamiento. Los datos personales se ocultan y los resultados reportados no constituyen una promesa de resultados futuros.</p>
      <section aria-labelledby="static-evidence-title">
        <h2 id="static-evidence-title">Casos publicados con identidad protegida</h2>
        <article>
          <h3>Caso terminado en 672</h3>
          <p>Tres evidencias del mismo proceso: inicio, resultado reportado y calificación compartida.</p>
        </article>
        <article>
          <h3>Caso terminado en 407</h3>
          <p>Dos evidencias del mismo proceso: resultado reportado y seguimiento por audio.</p>
        </article>
        <article>
          <h3>Caso terminado en 267</h3>
          <p>Una evidencia anonimizada de calificación compartida por el estudiante.</p>
        </article>
      </section>
      <section aria-labelledby="static-evidence-privacy-title">
        <h2 id="static-evidence-privacy-title">Privacidad responsable</h2>
        <p>Nombres, fotografías, códigos y números de contacto se ocultan antes de publicar. Las capturas completas pueden revisarse en la galería interactiva.</p>
      </section>`,
  },
  {
    output: "contrato.html",
    path: "/contrato",
    title: "Contrato general de asesoría académica | Tesis20",
    description:
      "Lee y descarga el modelo general informativo de contrato de asesoría académica de Tesis20 para revisarlo antes de contratar.",
    heading: "Contrato general de asesoría académica",
    schemaType: "WebPage",
    content: `
      <p class="eyebrow">Lectura previa y transparente</p>
      <h1>Contrato general de asesoría académica</h1>
      <p>Consulta el modelo informativo que organiza el alcance, las responsabilidades, el cronograma y las condiciones del acompañamiento académico.</p>
      <p><a href="/downloads/contrato-general-asesoria-academica-tesis20.pdf" download>Descargar contrato general en PDF</a></p>
      <section aria-labelledby="static-contract-summary-title">
        <h2 id="static-contract-summary-title">Aspectos principales del modelo</h2>
        <ul>
          <li>El alcance y los entregables se completan antes de la aceptación.</li>
          <li>El estudiante conserva la autoría y responsabilidad de su investigación.</li>
          <li>Las partes acuerdan un cronograma y los canales de coordinación.</li>
          <li>La información académica se trata de forma confidencial.</li>
          <li>No se garantizan calificaciones ni decisiones de terceros.</li>
        </ul>
      </section>
      <section aria-labelledby="static-contract-notice-title">
        <h2 id="static-contract-notice-title">Aviso importante</h2>
        <p>Este modelo es informativo y debe completarse con los datos y condiciones aceptados por las partes. Se recomienda revisión legal antes de su uso definitivo.</p>
      </section>`,
  },
];

const serviceRouteDefinitions = services.map((service) => ({
  output: `servicios/${service.anchor}.html`,
  path: `/servicios/${service.anchor}`,
  title: service.seoTitle,
  description: service.seoDescription,
  heading: service.heading,
  schemaType: "WebPage",
  service,
  content: `
    <p class="eyebrow">Servicio especializado</p>
    <h1>${service.heading}</h1>
    <p>${service.seoDescription}</p>
    <p><strong>Precio referencial desde S/ ${service.price}</strong></p>
    <section aria-labelledby="static-service-scope-${service.anchor}">
      <h2 id="static-service-scope-${service.anchor}">¿Qué incluye este acompañamiento?</h2>
      <ul>${service.details.map((detail) => `<li>${detail}</li>`).join("\n")}</ul>
    </section>
    <section aria-labelledby="static-service-process-${service.anchor}">
      <h2 id="static-service-process-${service.anchor}">Una orientación adaptada a tu avance</h2>
      <p>Primero revisamos tu tema, requisitos, documentos y fecha objetivo. El alcance, cronograma y precio final se confirman antes de contratar.</p>
      <p><a href="https://api.whatsapp.com/send?phone=51918714054">Solicitar orientación sobre ${service.name}</a></p>
    </section>
    <p><a href="/servicios">Comparar todos los servicios</a> · <a href="/contrato">Revisar el contrato general</a></p>`,
}));

routeDefinitions.push(...serviceRouteDefinitions);

const notFoundDefinition = {
  output: "404.html",
  path: null,
  title: "Página no encontrada | Tesis20",
  description:
    "La dirección solicitada no está disponible. Regresa al inicio o revisa los servicios de Tesis20.",
  heading: "Esta página no está disponible",
  schemaType: null,
  content: `
    <p class="eyebrow">Error 404</p>
    <h1>Esta página no está disponible</h1>
    <p>Es posible que el enlace haya cambiado o que la dirección esté incompleta.</p>
    <p><a href="/">Volver al inicio</a> <a href="/servicios">Revisar los servicios</a></p>`,
};

function upsertMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `<meta(?=[^>]*${attribute}=["']${escapedKey}["'])(?:[^>]*)>`,
    "i",
  );
  const tag = `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(value)}" />`;

  if (!expression.test(html)) {
    return html.replace("</head>", `    ${tag}\n  </head>`);
  }

  return html.replace(expression, (existingTag) =>
    /content=["'][^"']*["']/i.test(existingTag)
      ? existingTag.replace(
          /content=["'][^"']*["']/i,
          `content="${escapeAttribute(value)}"`,
        )
      : existingTag.replace(/\s*\/?\s*>$/, ` content="${escapeAttribute(value)}" />`),
  );
}

function replaceLink(html, relation, href) {
  const expression = new RegExp(
    `<link(?=[^>]*rel=["']${relation}["'])(?:[^>]*)>`,
    "i",
  );
  return html.replace(expression, (tag) =>
    tag.replace(/href=["'][^"']*["']/i, `href="${escapeAttribute(href)}"`),
  );
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getCanonicalUrl(route) {
  return route.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route.path}`;
}

function createNavigation() {
  return `
    <header data-seo-header>
      <a href="/" aria-label="Tesis20, inicio">Tesis20</a>
      <nav aria-label="Navegación principal">
        <a href="/">Inicio</a>
        <a href="/servicios">Servicios</a>
        <a href="/evidencias">Evidencias</a>
        <a href="/contrato">Contrato</a>
      </nav>
    </header>`;
}

function createStaticMarkup(route) {
  return `
    <div data-seo-prerendered="true">
      ${createNavigation()}
      <main id="main-content">
        ${route.content}
      </main>
      <footer>
        <p><strong>Tesis20</strong> · Asesoría y acompañamiento académico en Lima y todo el Perú.</p>
        <address>Jr. Lincoln 638, Pueblo Libre, Lima – Perú · <a href="tel:+51918714054">(+51) 918 714 054</a></address>
      </footer>
    </div>`;
}

function createStructuredData(route) {
  if (!route.path) return "";

  const canonicalUrl = getCanonicalUrl(route);
  const graph = [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "Tesis20",
      url: `${SITE_ORIGIN}/`,
      logo: `${SITE_ORIGIN}/assets/tesis20-logo.png`,
      telephone: "+51 918 714 054",
      email: "tesis.com20@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jr. Lincoln 638",
        addressLocality: "Pueblo Libre",
        addressRegion: "Lima",
        addressCountry: "PE",
      },
      areaServed: { "@type": "Country", name: "Perú" },
      sameAs: [
        "https://www.facebook.com/tesisconluis",
        "https://www.instagram.com/tesis20.comm/",
        "https://www.youtube.com/@tesisasesoriaycapacitacion3499",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: "Tesis20",
      inLanguage: "es-PE",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    },
    {
      "@type": route.schemaType,
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: route.title,
      headline: route.heading,
      description: route.description,
      inLanguage: "es-PE",
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@id": `${SITE_ORIGIN}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: `${SITE_ORIGIN}/`,
        },
        ...(route.service
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: "Servicios",
                item: `${SITE_ORIGIN}/servicios`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: route.heading,
                item: canonicalUrl,
              },
            ]
          : route.path === "/"
            ? []
            : [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: route.heading,
                  item: canonicalUrl,
                },
              ]),
      ],
    },
  ];

  if (route.path === "/servicios") {
    graph.push({
      "@type": "ItemList",
      "@id": `${canonicalUrl}#services`,
      name: "Servicios académicos de Tesis20",
      numberOfItems: services.length,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_ORIGIN}/servicios/${service.anchor}`,
        item: {
          "@type": "Service",
          "@id": `${SITE_ORIGIN}/servicios/${service.anchor}#service`,
          name: service.name,
          description: service.description,
          provider: { "@id": `${SITE_ORIGIN}/#organization` },
          areaServed: { "@type": "Country", name: "Perú" },
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: "PEN",
            url: `${SITE_ORIGIN}/servicios/${service.anchor}`,
          },
        },
      })),
    });
  }

  if (route.service) {
    graph.push({
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: route.service.name,
      description: route.service.seoDescription,
      url: canonicalUrl,
      provider: { "@id": `${SITE_ORIGIN}/#organization` },
      areaServed: { "@type": "Country", name: "Perú" },
      offers: {
        "@type": "Offer",
        price: route.service.price,
        priceCurrency: "PEN",
        url: canonicalUrl,
        description:
          "Precio referencial desde el importe indicado; el alcance y precio final se confirman antes de contratar.",
      },
    });
  }

  if (route.path === "/contrato") {
    graph.push({
      "@type": "DigitalDocument",
      "@id": `${canonicalUrl}#document`,
      name: "Modelo general informativo de contrato de asesoría académica",
      url: `${SITE_ORIGIN}/downloads/contrato-general-asesoria-academica-tesis20.pdf`,
      inLanguage: "es-PE",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    });
  }

  return `<script id="tesis20-structured-data" type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  })}</script>`;
}

function renderRoute(template, route) {
  const isNotFound = !route.path;
  const canonicalUrl = isNotFound ? null : getCanonicalUrl(route);
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`);
  html = upsertMeta(html, "name", "description", route.description);
  html = html.replace(
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${
      isNotFound
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    }" />`,
  );
  const metaReplacements = [
    ["og:title", route.title],
    ["og:description", route.description],
    ["og:url", canonicalUrl || `${SITE_ORIGIN}/404`],
    ["og:image", SHARE_IMAGE],
    ["og:image:secure_url", SHARE_IMAGE],
    ["og:image:alt", "Estudiantes universitarios durante un proceso de acompañamiento académico"],
    ["twitter:title", route.title],
    ["twitter:description", route.description],
    ["twitter:image", SHARE_IMAGE],
    ["twitter:image:alt", "Estudiantes universitarios durante un proceso de acompañamiento académico"],
    ["twitter:url", canonicalUrl || `${SITE_ORIGIN}/404`],
  ];

  for (const [key, value] of metaReplacements) {
    const attribute = key.startsWith("og:") ? "property" : "name";
    html = upsertMeta(html, attribute, key, value);
  }

  html = html.replace(/<link\s+rel=["']alternate["'][^>]*>\s*/gi, "");
  if (isNotFound) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/i, "");
  } else {
    html = replaceLink(html, "canonical", canonicalUrl);
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      (canonicalTag) => `${canonicalTag}\n    <link rel="alternate" hreflang="es-PE" href="${canonicalUrl}" />\n    <link rel="alternate" hreflang="es" href="${canonicalUrl}" />\n    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`,
    );
  }

  const structuredData = createStructuredData(route);
  if (structuredData) {
    html = html.replace("</head>", `    ${structuredData}\n  </head>`);
  }

  html = html.replace(
    /<div\s+id=["']root["']>\s*<\/div>/i,
    `<div id="root">${createStaticMarkup(route)}</div>`,
  );

  return html;
}

async function generateStaticRoutes() {
  const template = await readFile(INDEX_PATH, "utf8");
  const assetReferences = [...template.matchAll(/(?:src|href)="(\/build-assets\/[^"]+)"/g)].map(
    ([, asset]) => asset,
  );

  if (assetReferences.length === 0) {
    throw new Error("No se encontraron los assets generados por Vite en dist/index.html.");
  }

  for (const route of [...routeDefinitions, notFoundDefinition]) {
    const rendered = renderRoute(template, route);
    for (const asset of assetReferences) {
      if (!rendered.includes(asset)) {
        throw new Error(`La salida ${route.output} perdió el asset ${asset}.`);
      }
    }
    const outputPath = resolve(DIST_DIRECTORY, route.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  }

  const sourceDate = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000)
    : new Date();
  const lastModified = sourceDate.toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routeDefinitions
  .map((route) => {
    const priority = route.path === "/" ? "1.0" : route.path === "/servicios" ? "0.9" : "0.8";
    return `  <url>
    <loc>${getCanonicalUrl(route)}</loc>
    <lastmod>${lastModified}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;
  await writeFile(resolve(DIST_DIRECTORY, "sitemap.xml"), sitemap, "utf8");

  console.log(
    `✓ HTML SEO generado: ${[...routeDefinitions, notFoundDefinition]
      .map((route) => route.output)
      .join(", ")}`,
  );
  console.log(`✓ Sitemap actualizado: ${routeDefinitions.length} URLs, lastmod ${lastModified}`);
}

await generateStaticRoutes();
