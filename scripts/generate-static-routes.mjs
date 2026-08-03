import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { CAREER_AREAS, CAREER_COUNT, TEACHERS } from "../src/data/academic-directory.js";
import { ACADEMIC_RESOURCES } from "../src/data/academic-resources.js";
import { assignTeacherPortraits, teacherMediaMarkup } from "../src/teacher-portrait.js";

const DIST_DIRECTORY = resolve(process.cwd(), "dist");
const INDEX_PATH = resolve(DIST_DIRECTORY, "index.html");
const SITE_ORIGIN = "https://www.tesis20.com";
const SHARE_IMAGE = `${SITE_ORIGIN}/assets/hero-students.png`;
const TEACHER_PAGE_SIZE = 24;

function buildTeacherWhatsAppUrl(teacher) {
  const message = [
    "¡Hola, Tesis20! Quiero consultar por un asesor con un perfil similar a esta referencia demostrativa:",
    "",
    `Código del perfil: ${teacher.profileCode}`,
    `Nombre: ${teacher.name}`,
    `Especialidades: ${(teacher.specialties || []).join(", ")}`,
    `Carrera(s): ${teacher.careers.join(", ")}`,
    `Universidad donde enseña: ${teacher.universities.join(", ")}`,
    `País: ${teacher.country}`,
    `Precio referencial por hora: S/ ${teacher.price}`,
    `Trayectoria referencial simulada: ${teacher.experienceYears} años`,
    `Perfil: ${teacher.description}`,
    "",
    "Este perfil es demostrativo. Tesis20 confirmará identidad, experiencia, disponibilidad y tarifa.",
    "",
    "Por favor, confirmen su disponibilidad y el precio final para mi tema.",
  ].join("\n");

  return `https://api.whatsapp.com/send?phone=51918714054&text=${encodeURIComponent(message)}`;
}

function teacherSearchCorpus(teacher) {
  return [
    teacher.name,
    teacher.country,
    teacher.description,
    ...(teacher.specialties || []),
    ...(teacher.searchTerms || []),
    ...teacher.careers,
    ...teacher.universities,
  ].join(" ");
}

function teacherCardMarkup(teacher, portraitIndex) {
  const specialties = (teacher.specialties || [])
    .map((specialty) => `<li>${escapeAttribute(specialty)}</li>`)
    .join("");

  return `<article class="teacher-card" data-teacher-card data-name="${escapeAttribute(teacher.name)}" data-search="${escapeAttribute(teacherSearchCorpus(teacher))}" data-careers="${escapeAttribute(teacher.careers.join("|"))}" data-universities="${escapeAttribute(teacher.universities.join("|"))}">
    ${teacherMediaMarkup(teacher, portraitIndex)}
    <div class="teacher-card__body"><div class="teacher-card__title"><div><p>Perfil de referencia · no es una persona real</p><h2>${escapeAttribute(teacher.name)}</h2></div><span>${escapeAttribute(teacher.country)}</span></div>
    <p class="teacher-card__description">${escapeAttribute(teacher.description)}</p>
    <dl><div><dt>Experiencia simulada</dt><dd>${teacher.experienceYears} años de trayectoria referencial · ${escapeAttribute(teacher.profileCode)}</dd></div><div><dt>Especialidades</dt><dd><ul class="teacher-card__tags">${specialties}</ul></dd></div><div><dt>Carreras</dt><dd>${teacher.careers.map(escapeAttribute).join(" · ")}</dd></div><div><dt>Universidad</dt><dd>${teacher.universities.map(escapeAttribute).join(" · ")}</dd></div></dl>
    <div class="teacher-card__footer"><p><small>Precio referencial por hora</small><strong>S/ ${teacher.price}</strong></p><a href="${escapeAttribute(buildTeacherWhatsAppUrl(teacher))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Solicitar a Tesis20 un asesor real similar al perfil demostrativo de ${escapeAttribute(teacher.name)}">Solicitar asesor real similar</a></div></div>
  </article>`;
}

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
    output: "carreras.html",
    path: "/carreras",
    directory: "careers",
    title: "Carreras universitarias por áreas | Tesis20",
    description:
      "Explora un catálogo internacional de carreras organizado por ingeniería, negocios, salud, ciencias, humanidades y otras áreas de conocimiento.",
    heading: "Encuentra tu carrera por área de conocimiento",
    schemaType: "CollectionPage",
    content: `
      <div class="directory-page" data-academic-directory="careers">
        <section class="directory-hero" aria-labelledby="directory-page-title">
          <div class="directory-shell directory-hero__inner">
            <div class="directory-hero__copy">
              <p>Explorador académico internacional</p>
              <h1 id="directory-page-title">Encuentra tu carrera por área de conocimiento</h1>
              <span>Consulta un mapa amplio de carreras universitarias y campos emergentes. Los nombres y especialidades pueden variar según cada país y universidad.</span>
              <a class="directory-hero__link" href="/docentes">Buscar docentes por carrera <span aria-hidden="true">→</span></a>
            </div>
            <div class="directory-hero__stat" aria-label="${CAREER_COUNT} carreras orientativas"><strong>${CAREER_COUNT}</strong><span>carreras orientativas</span><i aria-hidden="true">T20</i></div>
          </div>
        </section>
        <section class="directory-search" aria-labelledby="career-search-title">
          <div class="directory-shell">
            <div class="directory-search__heading"><div><p>Busca y compara</p><h2 id="career-search-title">Catálogo de carreras</h2></div><span data-directory-count aria-live="polite">${CAREER_COUNT} carreras encontradas</span></div>
            <div class="directory-filters" role="search">
              <label><span>Nombre de la carrera</span><span class="directory-field"><input id="career-query" type="search" placeholder="Ej.: Ingeniería, Psicología, Marketing…"></span></label>
              <label><span>Área de conocimiento</span><span class="directory-field"><select id="career-area"><option value="">Todas las áreas</option>${CAREER_AREAS.map((area) => `<option value="${area.id}">${area.name}</option>`).join("")}</select></span></label>
              <button type="button" class="directory-clear" data-directory-clear disabled>Limpiar</button>
            </div>
            <div class="career-area-grid">
              ${CAREER_AREAS.map((area) => `<article class="career-area-card" data-career-area="${area.id}">
                <header><span aria-hidden="true">T20</span><div><h2>${area.name}</h2><p>${area.description}</p></div><strong>${area.careers.length}</strong></header>
                <ul>${area.careers.map((career) => `<li><span>${career}</span></li>`).join("")}</ul>
              </article>`).join("\n")}
            </div>
            <div class="directory-empty" data-directory-empty hidden><span aria-hidden="true">⌕</span><h2>No encontramos esa carrera</h2><p>Prueba con otra palabra o revisa todas las áreas disponibles.</p></div>
            <aside class="directory-note"><strong>Catálogo internacional orientativo</strong><p>La denominación de una carrera cambia entre países y universidades. Si no encuentras el nombre exacto, Tesis20 puede ayudarte a ubicar el área equivalente.</p></aside>
          </div>
        </section>
      </div>`,
  },
  {
    output: "docentes.html",
    path: "/docentes",
    directory: "teachers",
    title: "Docentes y asesores por carrera | Tesis20",
    description:
      "Busca docentes por necesidad, especialidad, carrera o universidad, revisa su perfil y solicita orientación mediante el WhatsApp oficial de Tesis20.",
    heading: "Encuentra un docente para tu tema",
    schemaType: "CollectionPage",
    image: `${SITE_ORIGIN}/assets/docentes/docentes-grid-v1.jpg`,
    imageAlt: "Directorio ilustrativo de docentes asesores de Tesis20",
    imageType: "image/jpeg",
    imageWidth: 1672,
    imageHeight: 941,
    noindex: true,
    content: `
      <div class="directory-page" data-academic-directory="teachers">
        <section class="directory-hero" aria-labelledby="directory-page-title">
          <div class="directory-shell directory-hero__inner">
            <div class="directory-hero__copy">
              <p>Red académica Tesis20</p>
              <h1 id="directory-page-title">Encuentra un docente para tu tema</h1>
              <span>Describe lo que necesitas —por ejemplo, derecho penal, metodología cualitativa o SPSS— y encuentra docentes por especialidad, carrera y universidad.</span>
              <a class="directory-hero__link" href="/carreras">Explorar todas las carreras <span aria-hidden="true">→</span></a>
            </div>
            <div class="directory-hero__stat" aria-label="${TEACHERS.length} perfiles demostrativos"><strong>${TEACHERS.length}</strong><span>perfiles demostrativos</span><i aria-hidden="true">T20</i></div>
          </div>
        </section>
        <section class="directory-search teacher-directory" aria-labelledby="teacher-search-title">
          <div class="directory-shell">
            <div class="directory-search__heading"><div><p>Directorio académico</p><h2 id="teacher-search-title">Perfiles docentes demostrativos</h2></div><span data-directory-count aria-live="polite">${TEACHERS.length} perfiles encontrados</span></div>
            <form class="directory-filters directory-filters--teachers" role="search" aria-label="Buscar docentes por necesidad" data-directory-teacher-form>
              <label class="directory-need-field"><span>¿Qué asesoría necesitas?</span><span class="directory-field"><input id="teacher-need" type="search" placeholder="Ej.: derecho penal, SPSS, tesis cualitativa…" autocomplete="off"></span><small class="directory-field-hint">Busca por tema, especialidad, metodología, software o nombre del docente.</small></label>
              <label><span>Carrera</span><span class="directory-field"><select id="teacher-career"><option value="">Todas las carreras</option>${[...new Set(TEACHERS.flatMap((teacher) => teacher.careers))].sort((a, b) => a.localeCompare(b, "es")).map((career) => `<option value="${escapeAttribute(career)}">${career}</option>`).join("")}</select></span></label>
              <label><span>Universidad donde enseña</span><span class="directory-field"><select id="teacher-university"><option value="">Todas las universidades</option>${[...new Set(TEACHERS.flatMap((teacher) => teacher.universities))].sort((a, b) => a.localeCompare(b, "es")).map((university) => `<option value="${escapeAttribute(university)}">${university}</option>`).join("")}</select></span></label>
              <div class="directory-actions"><button type="submit" class="directory-search-button" aria-controls="teacher-results">Buscar docentes</button><button type="button" class="directory-clear" data-directory-clear disabled>Limpiar</button></div>
            </form>
            <aside class="directory-note directory-note--warning"><strong>Directorio demostrativo</strong><p>Estos 4,000 perfiles, sus nombres, imágenes sintéticas generadas con IA, universidades, experiencia y precios son referencias simuladas: no corresponden a profesionales disponibles ni a personas reales. Tesis20 confirmará la identidad, experiencia, disponibilidad y tarifa de un asesor real antes de coordinar.</p></aside>
            <div class="directory-note directory-note--warning" data-directory-load-warning hidden role="status"><strong>Catálogo temporalmente incompleto</strong><p>No pudimos cargar todos los perfiles. Reintenta en unos momentos para buscar en el directorio completo.</p></div>
            <div class="teacher-grid" id="teacher-results" data-teacher-results tabindex="-1">
              ${assignTeacherPortraits(TEACHERS.slice(0, TEACHER_PAGE_SIZE)).map(({ teacher, portraitIndex }) => teacherCardMarkup(teacher, portraitIndex)).join("\n")}
            </div>
            <div class="directory-empty" data-directory-empty hidden><span aria-hidden="true">⌕</span><h2>No encontramos perfiles con esos filtros</h2><p>Prueba otra necesidad, especialidad, carrera o universidad.</p></div>
            <nav class="directory-results-more" data-directory-pagination${TEACHERS.length <= TEACHER_PAGE_SIZE ? " hidden" : ""} aria-label="Paginación de docentes"><button type="button" data-directory-previous disabled>← Anterior</button><span data-directory-range aria-live="polite">Mostrando 1–${Math.min(TEACHERS.length, TEACHER_PAGE_SIZE)} de ${TEACHERS.length} perfiles</span><button type="button" data-directory-next disabled>Siguiente →</button></nav>
          </div>
        </section>
      </div>`,
  },
  {
    output: "nido.html",
    path: "/nido",
    title: "Videojuegos educativos para niños | Tesis20 Nido",
    description:
      "Videojuegos educativos para niñas y niños de 2 a 6 años: lógica, matemáticas, atención y memoria, habla en inglés, con narración profesional.",
    heading: "Aprender jugando, crecer con confianza",
    schemaType: "CollectionPage",
    image: `${SITE_ORIGIN}/assets/nido/nido-platform-preview.jpg`,
    imageAlt: "Catálogo de juegos educativos de Tesis20 Nido",
    imageWidth: 1536,
    imageHeight: 1024,
    faqItems: [
      {
        question: "¿Necesito crear una cuenta para jugar?",
        answer:
          "No. Los juegos de Tesis20 Nido se juegan directamente desde el navegador, sin registro ni datos del menor.",
      },
      {
        question: "¿Los niños necesitan saber leer?",
        answer:
          "No. Cada consigna se narra en voz alta y las respuestas son tarjetas grandes con dibujos, pensadas para deditos pequeños.",
      },
      {
        question: "¿Qué edades cubre la plataforma?",
        answer:
          "Rutas adaptadas a tres etapas: 2–3, 4–5 y 6 años, con dificultad y ayudas propias de cada una.",
      },
    ],
    content: `
      <p class="eyebrow">Tesis20 Nido</p>
      <h1>Aprender jugando, crecer con confianza</h1>
      <p>Videojuegos educativos para niñas y niños, organizados por edad y área de aprendizaje.</p>
      <p><a href="/nido#clases">Explorar juegos</a></p>
      <section id="clases" aria-labelledby="static-nido-classes-title">
        <h2 id="static-nido-classes-title">Juegos pensados para aprender haciendo</h2>
        <p>Rutas de lógica, matemáticas, atención y memoria, desarrollo del habla e inglés, más la Misión del Bosque: un videojuego de exploración y matemáticas.</p>
        <ul>
          <li>Lógica: observar, relacionar, clasificar y resolver patrones.</li>
          <li>Matemáticas: comparar, contar y reconocer relaciones numéricas.</li>
          <li>Misión del Bosque: correr, saltar y recolectar para aprender a contar en movimiento.</li>
        </ul>
      </section>
      <section id="como-jugar" aria-labelledby="static-nido-steps-title">
        <h2 id="static-nido-steps-title">Cinco formas de aprender jugando</h2>
        <ol>
          <li>Tocar y seleccionar directamente figuras, emociones u objetos.</li>
          <li>Arrastrar y soltar piezas, con alternativa de tocar pieza y destino.</li>
          <li>Ordenar tamaños y completar secuencias.</li>
          <li>Emparejar palabras, cantidades, animales e imágenes.</li>
          <li>Caminar por recorridos hasta la respuesta correcta.</li>
        </ol>
        <p>Los juegos se adaptan a 2–3, 4–5 y 6 años, con piezas, recorridos y ayudas adecuados para cada etapa. No necesitan saber leer: cada consigna se narra y puede repetirse.</p>
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
  {
    output: "recursos.html",
    path: "/recursos",
    title: "Recursos académicos por universidad | Tesis20",
    description:
      "Consulta líneas de investigación, reglamentos, formatos y guías académicas en PDF, organizados por universidad e institución educativa.",
    heading: "Recursos por universidad",
    schemaType: "CollectionPage",
    content: `
      <p class="eyebrow">Biblioteca académica</p>
      <h1>Recursos por universidad</h1>
      <p>Consulta líneas de investigación, reglamentos, formatos y guías organizados por institución para ubicar rápidamente el documento que necesitas.</p>
      <section aria-labelledby="static-resources-title">
        <h2 id="static-resources-title">Documentos disponibles</h2>
        ${ACADEMIC_RESOURCES.map(
          (institution) => `<article>
            <h3>${escapeAttribute(institution.name)}</h3>
            <p>${escapeAttribute(institution.description)}</p>
            <p><a href="${escapeAttribute(institution.sourceUrl)}" target="_blank" rel="noopener noreferrer">Visitar sitio institucional</a></p>
            ${institution.documents.map(
              (document) => `<section>
                <h4>${escapeAttribute(document.title)}</h4>
                <p><strong>${escapeAttribute(document.category)}</strong> · ${escapeAttribute(document.format)} · ${document.pages} página</p>
                <p>${escapeAttribute(document.description)}</p>
                <p>Programas incluidos: ${document.programs.map(escapeAttribute).join("; ")}.</p>
                <p><a href="${escapeAttribute(document.href)}" target="_blank" rel="noopener noreferrer">Abrir PDF</a> · <a href="${escapeAttribute(document.href)}" download="${escapeAttribute(document.fileName)}">Descargar documento</a></p>
              </section>`,
            ).join("\n")}
          </article>`,
        ).join("\n")}
      </section>
      <section aria-labelledby="static-resources-validity-title">
        <h2 id="static-resources-validity-title">Verifica siempre la versión vigente</h2>
        <p>Los documentos se publican como referencia académica y pertenecen a sus instituciones de origen. Confirma con la universidad si existe una edición más reciente o una norma específica para tu programa.</p>
      </section>
      <section aria-labelledby="static-resources-next-title">
        <h2 id="static-resources-next-title">UPN, UCV, UTP y más universidades</h2>
        <p>La biblioteca crecerá con líneas de investigación, reglamentos, plantillas y guías de titulación verificadas de cada institución.</p>
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

function createNavigation(route) {
  if (route.path === "/nido") {
    return `
      <header data-seo-header>
        <a href="/nido" aria-label="Tesis20 Nido, inicio">Tesis20 Nido</a>
        <nav aria-label="Navegación principal de Nido">
          <a href="/nido">Inicio</a>
          <a href="/nido#clases">Juegos</a>
          <a href="/nido#como-jugar">Cómo se juega</a>
          <a href="/">Tesis20.com</a>
        </nav>
      </header>`;
  }

  if (route.directory) {
    return `
      <header class="site-header" data-seo-header>
        <div class="header-inner">
          <a class="brand" href="/" aria-label="Tesis20, inicio"><img src="/assets/tesis20-logo.png" alt="Tesis20" width="74" height="83"></a>
          <nav class="desktop-navigation" aria-label="Navegación principal">
            <a class="nav-link" href="/">Inicio</a>
            <a class="nav-link" href="/servicios">Servicios</a>
            <a class="nav-link${route.path === "/carreras" ? " nav-link--active" : ""}" href="/carreras"${route.path === "/carreras" ? ' aria-current="page"' : ""}>Carreras</a>
            <a class="nav-link${route.path === "/docentes" ? " nav-link--active" : ""}" href="/docentes"${route.path === "/docentes" ? ' aria-current="page"' : ""}>Docentes</a>
            <a class="nav-link" href="/evidencias">Evidencias</a>
            <a class="nav-link" href="/contrato">Contrato</a>
            <a class="nav-link" href="/recursos">Recursos</a>
          </nav>
          <a class="whatsapp-button header-cta" href="https://api.whatsapp.com/send?phone=51918714054">Quiero orientación</a>
        </div>
      </header>`;
  }

  return `
    <header data-seo-header>
      <a href="/" aria-label="Tesis20, inicio">Tesis20</a>
      <nav aria-label="Navegación principal">
        <a href="/">Inicio</a>
        <a href="/servicios">Servicios</a>
        <a href="/carreras">Carreras</a>
        <a href="/docentes">Docentes</a>
        <a href="/evidencias">Evidencias</a>
        <a href="/contrato">Contrato</a>
        <a href="/recursos">Recursos</a>
      </nav>
    </header>`;
}

function createStaticMarkup(route) {
  const footer =
    route.path === "/nido"
      ? `<footer>
          <p><strong>Tesis20 Nido</strong> · Aprendizaje creativo en una experiencia local de demostración.</p>
          <p><a href="/">Volver a la plataforma Tesis de Tesis20.com</a></p>
        </footer>`
      : route.directory
        ? `<footer data-static-directory-footer>
            <div><strong>Tesis20</strong><span>Asesoría y acompañamiento académico</span><nav aria-label="Enlaces del pie"><a href="/carreras">Carreras</a><a href="/docentes">Docentes</a><a href="/contrato">Contrato</a><a href="/recursos">Recursos</a></nav></div>
            <p><a href="/nido">Nido20</a> · plataforma infantil independiente.</p>
          </footer>`
        : `<footer>
          <p><strong>Tesis20</strong> · Asesoría y acompañamiento académico en Lima y todo el Perú.</p>
          <address>Jr. Lincoln 638, Pueblo Libre, Lima – Perú · <a href="tel:+51918714054">(+51) 918 714 054</a></address>
          <p><a href="/nido">Nido20</a> · plataforma infantil independiente.</p>
        </footer>`;

  return `
    <div data-seo-prerendered="true">
      ${createNavigation(route)}
      <main id="main-content">
        ${route.content}
      </main>
      ${footer}
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
    ...(route.path === "/nido"
      ? [
          {
            "@type": "Organization",
            "@id": `${SITE_ORIGIN}/nido#organization`,
            name: "Tesis20 Nido",
            url: `${SITE_ORIGIN}/nido`,
            description:
              "Plataforma de videojuegos educativos para el aprendizaje temprano, con rutas organizadas por edad y área de aprendizaje.",
            parentOrganization: { "@id": `${SITE_ORIGIN}/#organization` },
          },
        ]
      : []),
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
      about: {
        "@id":
          route.path === "/nido"
            ? `${SITE_ORIGIN}/nido#organization`
            : `${SITE_ORIGIN}/#organization`,
      },
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

  if (route.path === "/recursos") {
    const documents = ACADEMIC_RESOURCES.flatMap((institution) =>
      institution.documents.map((document) => ({ institution, document })),
    );
    graph.push({
      "@type": "ItemList",
      "@id": `${canonicalUrl}#documents`,
      name: "Recursos académicos por universidad",
      numberOfItems: documents.length,
      itemListElement: documents.map(({ institution, document }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_ORIGIN}${document.href}`,
        item: {
          "@type": "DigitalDocument",
          name: `${document.title} de ${institution.name}`,
          description: document.description,
          url: `${SITE_ORIGIN}${document.href}`,
          encodingFormat: "application/pdf",
          inLanguage: "es-PE",
          isAccessibleForFree: true,
        },
      })),
    });
  }

  if (Array.isArray(route.faqItems) && route.faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: route.faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
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
  const shareImage = route.image || SHARE_IMAGE;
  const shareImageAlt =
    route.imageAlt ||
    "Estudiantes universitarios durante un proceso de acompañamiento académico";
  const shareImageWidth = String(route.imageWidth || 800);
  const shareImageHeight = String(route.imageHeight || 999);
  const shareImageType =
    route.imageType || (shareImage.endsWith(".jpg") ? "image/jpeg" : "image/png");
  let html = template;

  if (route.directory) {
    html = html.replace(
      "</head>",
      '    <link rel="stylesheet" href="/assets/academic-directory-v1.css?v=20260802-syntheticphotosv2" />\n  </head>',
    );
    html = html.replace(
      "</body>",
      '    <script type="module" src="/assets/academic-directory-v1.js?v=20260802-syntheticphotosv2"></script>\n  </body>',
    );
  }

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`);
  html = upsertMeta(html, "name", "description", route.description);
  html = html.replace(
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${
      isNotFound
        ? "noindex, nofollow"
        : route.noindex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    }" />`,
  );
  const metaReplacements = [
    ["og:title", route.title],
    ["og:description", route.description],
    ["og:url", canonicalUrl || `${SITE_ORIGIN}/404`],
    ["og:image", shareImage],
    ["og:image:secure_url", shareImage],
    ["og:image:type", shareImageType],
    ["og:image:alt", shareImageAlt],
    ["og:image:width", shareImageWidth],
    ["og:image:height", shareImageHeight],
    ["twitter:title", route.title],
    ["twitter:description", route.description],
    ["twitter:image", shareImage],
    ["twitter:image:alt", shareImageAlt],
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

  const directoryDataPath = resolve(DIST_DIRECTORY, "data/academic-directory.json");
  await mkdir(dirname(directoryDataPath), { recursive: true });
  await writeFile(
    directoryDataPath,
    JSON.stringify({ careerAreas: CAREER_AREAS, careerCount: CAREER_COUNT, teachers: TEACHERS }),
    "utf8",
  );
  const portraitAssetPath = resolve(DIST_DIRECTORY, "assets/teacher-portrait-v1.js");
  await mkdir(dirname(portraitAssetPath), { recursive: true });
  await writeFile(
    portraitAssetPath,
    await readFile(resolve(process.cwd(), "src/teacher-portrait.js"), "utf8"),
    "utf8",
  );

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
  .filter((route) => !route.noindex)
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
  console.log(`✓ Sitemap actualizado: ${routeDefinitions.filter((route) => !route.noindex).length} URLs, lastmod ${lastModified}`);
}

await generateStaticRoutes();
