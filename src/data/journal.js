/**
 * Revista Científica Tesis20 (/revista): todo el contenido de la página en un
 * solo lugar. Sin JSX ni `window`: también lo importan el generador del HTML
 * prerenderizado y el control de calidad.
 *
 * Reglas que no se cambian sin el dueño:
 *  - Nunca anunciar la revista como indexada (Scopus, Web of Science, SciELO,
 *    Latindex…) mientras no lo esté: sería publicidad engañosa y no les sirve
 *    a los autores para titularse ni para RENACYT. `INDEXING` dice dónde está.
 *  - El envío y la revisión por pares no se cobran; el costo de publicación
 *    (APC) se paga solo si el artículo es aceptado y nunca decide la aceptación.
 *  - El monto se informa por WhatsApp (decisión del dueño, nov. 2026).
 */
export const JOURNAL = {
  name: "Revista Científica Tesis20",
  shortName: "Rev. Cient. Tesis20",
  call: "Convocatoria abierta · Volumen 1",
  intro:
    "Publica tu investigación en una revista con revisión por pares doble ciego y acceso abierto. Recibimos artículos originales, artículos derivados de tesis y revisiones de estudiantes, egresados y docentes de todas las áreas.",
  scope:
    "Difundimos investigaciones originales de estudiantes de pregrado y posgrado, egresados, docentes e investigadores del Perú y de Latinoamérica, con especial atención a los trabajos que nacen de una tesis. Cada artículo se evalúa por su rigor, su originalidad y su aporte al área.",
  contactEmail: "tesis.com20@gmail.com",
  emailSubject: "Manuscrito para la Revista Científica Tesis20",
  license: "CC BY 4.0",
  licenseName: "Creative Commons Atribución 4.0 Internacional",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.es",
};

export const JOURNAL_HIGHLIGHTS = [
  "Revisión por pares doble ciego",
  "Acceso abierto · CC BY 4.0",
  "Publicación continua",
  "Pagas solo si es aceptado",
];

/** Ficha de la revista (tarjeta del hero). La editorial se completa con el RUC. */
export const JOURNAL_FACTS = [
  ["Periodicidad", "Publicación continua: cada artículo sale al aprobarse"],
  ["Revisión", "Por pares, doble ciego"],
  ["Acceso", "Abierto y gratuito para los lectores"],
  ["Idioma", "Español, con título y resumen en inglés"],
  ["Envío y evaluación", "Sin costo"],
];

export const JOURNAL_AREAS = [
  "Ingeniería y tecnología",
  "Negocios, economía y gestión",
  "Salud y bienestar",
  "Ciencias exactas y naturales",
  "Ciencias sociales y humanidades",
  "Derecho y ciencia política",
  "Educación",
  "Arquitectura, diseño y artes",
  "Comunicación",
  "Agro, ambiente y veterinaria",
  "Turismo, hospitalidad y deporte",
  "Estudios interdisciplinarios",
];

export const ARTICLE_TYPES = [
  {
    name: "Artículo original",
    description:
      "Resultados de una investigación propia, cuantitativa, cualitativa o mixta, con estructura de introducción, método, resultados y discusión.",
    length: "4 000 a 8 000 palabras",
  },
  {
    name: "Artículo derivado de tesis",
    description:
      "Tu tesis de pregrado, maestría o doctorado convertida en artículo: problema, método, hallazgos y discusión, sin repetir el documento completo.",
    length: "4 000 a 8 000 palabras",
  },
  {
    name: "Artículo de revisión",
    description:
      "Revisión sistemática o de alcance de la literatura, con la búsqueda y la selección de estudios descritas paso a paso según PRISMA.",
    length: "5 000 a 9 000 palabras",
  },
];

export const EDITORIAL_PROCESS = [
  {
    title: "Envío",
    body: "Completas el formulario y nos envías el manuscrito en Word, sin nombres de autores, y una portada aparte con los datos de cada autor.",
    time: "Hoy mismo",
  },
  {
    title: "Revisión editorial",
    body: "Comprobamos que el tema encaje en la revista, que cumpla las normas y su nivel de similitud con otros textos. Si falta algo, te lo pedimos antes de seguir.",
    time: "Hasta 7 días hábiles",
  },
  {
    title: "Revisión por pares",
    body: "Dos especialistas del área evalúan el manuscrito sin conocer a los autores, y los autores tampoco conocen a los revisores.",
    time: "4 a 6 semanas",
  },
  {
    title: "Decisión y correcciones",
    body: "Recibes los dictámenes con la decisión: aceptado, aceptado con cambios o rechazado. Si hay cambios, envías la versión corregida.",
    time: "Según tus correcciones",
  },
  {
    title: "Pago y edición",
    body: "Si el artículo es aceptado, pagas el costo de publicación con tarjeta mediante un enlace de pago seguro. Corregimos el estilo, diagramamos y te enviamos la prueba final.",
    time: "1 a 2 semanas",
  },
  {
    title: "Publicación",
    body: "Tu artículo se publica en acceso abierto, con página propia, PDF descargable y constancia de publicación.",
    time: "Al aprobar la prueba final",
  },
];

export const AUTHOR_GUIDELINES = [
  {
    title: "Manuscrito",
    body: "Word (.docx), tamaño A4, Times New Roman 12, interlineado 1,5 y márgenes de 2,5 cm. Sin nombres ni datos de los autores: van en una portada aparte.",
  },
  {
    title: "Título",
    body: "En español y en inglés, claro y específico, de hasta 20 palabras.",
  },
  {
    title: "Resumen y palabras clave",
    body: "Resumen de 150 a 250 palabras (objetivo, método, resultados y conclusión) en español y en inglés, con 3 a 5 palabras clave.",
  },
  {
    title: "Estructura",
    body: "Introducción, método, resultados, discusión, conclusiones y referencias. Las revisiones describen además su estrategia de búsqueda y selección.",
  },
  {
    title: "Citas y referencias",
    body: "Normas APA, 7.ª edición. Toda obra citada aparece en la lista final y viceversa; incluye el DOI cuando exista.",
  },
  {
    title: "Tablas y figuras",
    body: "Numeradas, con título, nota y fuente; editables en Word o en imagen nítida.",
  },
  {
    title: "Autoría",
    body: "Cada autor contribuyó de verdad al trabajo y aprueba la versión enviada. Indica su institución, su correo y su ORCID (se crea gratis en orcid.org).",
  },
  {
    title: "Ética de la investigación",
    body: "Si el estudio trabajó con personas, menciona el consentimiento informado y, cuando corresponda, la aprobación de un comité de ética.",
  },
];

export const PUBLICATION_COST = {
  title: "Enviar es gratis; pagas solo si tu artículo es aceptado",
  intro:
    "El envío y la revisión por pares no tienen costo. Si tu artículo es aceptado, pagas el costo de publicación, que cubre la corrección de estilo, la diagramación, la publicación en acceso abierto y la constancia.",
  points: [
    "Te informamos el monto por WhatsApp antes de que envíes tu manuscrito.",
    "Pagas con tarjeta de crédito o débito mediante un enlace de pago seguro, con boleta o factura.",
    "Ningún pago influye en la decisión: la aceptación depende solo de la revisión por pares.",
  ],
};

export const EDITORIAL_POLICIES = [
  {
    title: "Originalidad y similitud",
    body: "Recibimos solo manuscritos inéditos que no estén en evaluación en otra revista. Cada envío pasa por un software de detección de similitud; el plagio, el autoplagio y la publicación duplicada son motivo de rechazo.",
  },
  {
    title: "Revisión por pares",
    body: "Doble ciego, con al menos dos revisores especialistas. El equipo editorial decide a partir de los dictámenes y responde a los autores con argumentos.",
  },
  {
    title: "Uso de inteligencia artificial",
    body: "Las herramientas de inteligencia artificial no pueden figurar como autoras. Si las usaste, por ejemplo para traducir o corregir la redacción, decláralo en el método o en los agradecimientos: los autores responden por todo el contenido.",
  },
  {
    title: "Conflictos de interés",
    body: "Autores, revisores y editores declaran cualquier conflicto de interés. Si un autor recibió asesoría de Tesis20, lo declara y su manuscrito se asigna a revisores sin relación con esa asesoría.",
  },
  {
    title: "Acceso abierto y derechos de autor",
    body: "Los artículos se publican en acceso abierto, sin costo para los lectores, con licencia Creative Commons Atribución 4.0 (CC BY 4.0): cualquiera puede leerlos, descargarlos y citarlos reconociendo a sus autores, que conservan sus derechos.",
  },
  {
    title: "Ética de publicación",
    body: "Seguimos las recomendaciones del Comité de Ética en Publicaciones (COPE). Si después de publicar se detecta un error o una falta grave, se publica una fe de erratas o una retractación.",
  },
  {
    title: "Datos personales",
    body: "Los datos de autores y revisores se usan solo para el proceso editorial, conforme a la Ley N.º 29733 de Protección de Datos Personales.",
  },
];

/** Dónde está la revista hoy y su hoja de ruta. Cambia solo cuando cada paso se cumpla. */
export const INDEXING = {
  title: "Una revista nueva, construida para indexarse",
  status:
    "La Revista Científica Tesis20 está empezando: todavía no está indexada en bases como Scopus, Web of Science, SciELO o Latindex, que evalúan revistas con varios años de publicación regular. Desde el primer artículo trabajamos con sus criterios y avanzamos por etapas:",
  steps: [
    "ISSN electrónico ante la Biblioteca Nacional del Perú.",
    "DOI para cada artículo, mediante Crossref.",
    "Postulación a Latindex Catálogo 2.0.",
    "Luego DOAJ, SciELO Perú y bases internacionales como Scopus.",
  ],
  note: "Cada artículo publicado tendrá su página propia con los datos que leen Google Académico y otros buscadores académicos.",
};

export const SUBMITTER_PROFILES = [
  "Estudiante de pregrado",
  "Estudiante de posgrado",
  "Egresado",
  "Docente",
  "Investigador",
];

export const JOURNAL_FAQS = [
  {
    question: "¿Quiénes pueden publicar?",
    answer:
      "Estudiantes de pregrado y posgrado, egresados, docentes e investigadores de cualquier universidad del Perú o del extranjero. Un artículo puede tener varios autores.",
  },
  {
    question: "¿Puedo publicar mi tesis?",
    answer:
      "Sí, en formato de artículo: un texto de 4 000 a 8 000 palabras con los aportes principales de tu tesis. Si necesitas ayuda para convertirla, Tesis20 ofrece asesoría para artículo científico; en ese caso lo declaras y tu manuscrito va a revisores sin relación con la asesoría.",
  },
  {
    question: "¿La revista está indexada en Scopus?",
    answer:
      "Todavía no. Es una revista nueva y Scopus solo evalúa revistas con varios años de publicación regular. Trabajamos con sus criterios desde el primer artículo y avanzamos por etapas: ISSN, DOI, Latindex y luego bases internacionales.",
  },
  {
    question: "¿Cuánto cuesta publicar?",
    answer:
      "Enviar y evaluar tu manuscrito es gratis. Si es aceptado, pagas el costo de publicación con tarjeta; te informamos el monto por WhatsApp antes de que envíes tu manuscrito.",
  },
  {
    question: "¿Cuánto demora?",
    answer:
      "Entre 6 y 10 semanas desde el envío hasta la publicación, según los dictámenes de los revisores y el tiempo que tomen tus correcciones.",
  },
  {
    question: "¿Recibo alguna constancia?",
    answer:
      "Sí: constancia de recepción al enviar, de aceptación cuando el artículo se aprueba y de publicación cuando aparece en la revista.",
  },
];
