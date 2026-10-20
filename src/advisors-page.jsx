import { useId, useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Breadcrumb } from "./site-core.jsx";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { AreaIcon } from "./area-icons.jsx";
import { CAREER_AREAS, CAREER_COUNT } from "./data/academic-directory.js";
import { FaqSection, trackInteraction } from "./platform-enhancements.jsx";
import "./page-hero.css";
import "./advisors-page.css";

const WHATSAPP_PHONE = "51918714054";

const WORK_TYPES = [
  "Proyecto de tesis (Tesis I)",
  "Tesis de titulación (Tesis II)",
  "Trabajo de suficiencia profesional",
  "Artículo científico",
  "Análisis estadístico con IBM SPSS",
  "Preparación de sustentación",
];

/** Lo que cubre un asesor de Tesis20, en el mismo orden en que avanza una tesis. */
const COVERAGE = [
  "Planteamiento del problema, objetivos e hipótesis",
  "Matriz de consistencia y operacionalización de variables",
  "Metodología cuantitativa, cualitativa y mixta",
  "Diseño y validación de instrumentos",
  "Procesamiento e interpretación de datos en IBM SPSS",
  "Revisión sistemática y artículos bajo el modelo PRISMA",
  "Redacción académica, citas y referencias en APA 7",
  "Simulación de sustentación y preguntas del jurado",
];

const STEPS = [
  {
    title: "Nos cuentas tu tema",
    body: "Carrera, tipo de trabajo, universidad y en qué etapa estás. Sin documentos ni datos sensibles.",
  },
  {
    title: "Te asignamos el asesor",
    body: "Elegimos al especialista por área de conocimiento y metodología, y acordamos alcance, entregables y fechas por escrito.",
  },
  {
    title: "Avanzas con seguimiento",
    body: "Sesiones en vivo, revisión de cada entrega y retroalimentación clara hasta la sustentación.",
  },
];

const FAQS = [
  {
    question: "¿Puedo elegir el perfil de mi asesor?",
    answer:
      "Sí. Cuéntanos tu carrera, tu tema y la metodología que exige tu universidad; con eso proponemos al especialista adecuado y lo confirmas antes de comenzar.",
  },
  {
    question: "¿Qué pasa si mi carrera no aparece en el listado?",
    answer:
      "El catálogo es orientativo y los nombres cambian entre universidades. Escríbenos con el nombre exacto de tu carrera y ubicamos el área equivalente.",
  },
  {
    question: "¿El asesor hace la tesis por mí?",
    answer:
      "No. Tesis20 orienta y acompaña: tú desarrollas y sustentas tu propio trabajo. La autoría y la responsabilidad académica son siempre del estudiante, como indica el contrato.",
  },
  {
    question: "¿Cómo se define el precio?",
    answer:
      "Depende del servicio y del alcance. Cada servicio tiene un precio referencial publicado; el monto final se confirma por escrito tras revisar tu avance.",
  },
];

function buildWhatsappHref({ workType, career, topic }) {
  const lines = [
    "¡Hola, Tesis20! Busco un asesor para mi trabajo académico.",
    "",
    `Tipo de trabajo: ${workType || "por definir"}`,
    `Carrera: ${career || "por definir"}`,
    `Tema o necesidad: ${topic.trim() || "por definir"}`,
    "",
    "¿Me orientan sobre el asesor y el servicio adecuados?",
  ];
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildAreaWhatsappHref(area) {
  const message = [
    `¡Hola, Tesis20! Busco un asesor en el área de ${area.name}.`,
    "",
    "Les cuento mi carrera y mi tema:",
  ].join("\n");
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

function AdvisorRequestForm() {
  const idPrefix = useId();
  const [workType, setWorkType] = useState("");
  const [career, setCareer] = useState("");
  const [topic, setTopic] = useState("");
  const href = useMemo(
    () => buildWhatsappHref({ workType, career, topic }),
    [career, topic, workType],
  );
  const isReady = Boolean(workType && career);

  return (
    <form
      className="advisor-request__form"
      aria-labelledby={`${idPrefix}-title`}
      onSubmit={(event) => {
        event.preventDefault();
        trackInteraction("whatsapp_click", { location: "advisor_request", page: "teachers" });
        window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      <div className="advisor-request__heading">
        <p>Solicitud guiada · 1 minuto</p>
        <h2 id={`${idPrefix}-title`}>Describe tu tema y te proponemos un asesor</h2>
        <span>
          Tres datos bastan para orientarte. Al enviar, se abre WhatsApp con el mensaje ya
          escrito; puedes editarlo antes de enviarlo.
        </span>
      </div>

      <div className="advisor-request__fields">
        <label className="advisor-field">
          <span>Tipo de trabajo</span>
          <select
            value={workType}
            onChange={(event) => setWorkType(event.target.value)}
            required
          >
            <option value="">Elige una opción</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="advisor-field">
          <span>Carrera</span>
          <select value={career} onChange={(event) => setCareer(event.target.value)} required>
            <option value="">Elige tu carrera</option>
            {CAREER_AREAS.map((area) => (
              <optgroup key={area.id} label={area.name}>
                {area.careers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="Otra carrera (la indico en el mensaje)">
              Otra carrera (la indico en el mensaje)
            </option>
          </select>
        </label>

        <label className="advisor-field advisor-field--wide">
          <span>Tema o necesidad</span>
          <textarea
            value={topic}
            onChange={(event) => setTopic(event.target.value.slice(0, 300))}
            rows={3}
            maxLength={300}
            placeholder="Ej.: clima organizacional y desempeño en una empresa de Lima; necesito ayuda con la metodología y el SPSS."
          />
          <small>{300 - topic.length} caracteres disponibles · no incluyas datos personales.</small>
        </label>
      </div>

      <div className="advisor-request__actions">
        <button
          type="submit"
          className="whatsapp-button whatsapp-button--dark advisor-request__submit"
          disabled={!isReady}
          aria-disabled={!isReady}
        >
          <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
          <span>Solicitar asesor por WhatsApp</span>
        </button>
        <p>
          {isReady
            ? "Se abre WhatsApp en una pestaña nueva con tu solicitud."
            : "Elige el tipo de trabajo y tu carrera para continuar."}
        </p>
      </div>
    </form>
  );
}

export function AdvisorsPage() {
  const [expandedArea, setExpandedArea] = useState(null);

  return (
    <main className="advisors-page" id="main-content" tabIndex="-1">
      <section className="page-hero" aria-labelledby="advisors-title">
        <div className="page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumb current="Asesores" />
            <p className="page-hero__eyebrow">Red de asesores Tesis20</p>
            <h1 id="advisors-title">Un asesor para tu carrera y tu tema</h1>
            <p className="page-hero__intro">
              Asignamos a cada estudiante un especialista según su área de conocimiento, la
              metodología que exige su universidad y la etapa en la que está. Cuéntanos tu tema y
              te proponemos el perfil adecuado.
            </p>
            <div className="page-hero__actions">
              <a className="whatsapp-button whatsapp-button--dark" href="#solicitar-asesor">
                <ArrowRight size={20} weight="bold" aria-hidden="true" />
                <span>Describir mi tema</span>
              </a>
              <a className="text-link" href="#areas">
                Ver áreas de especialidad <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className="page-hero__highlights" aria-label="Cobertura de la red de asesores">
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                {CAREER_AREAS.length} áreas de conocimiento
              </li>
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                {CAREER_COUNT} carreras orientativas
              </li>
              <li>
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                Metodología, SPSS y sustentación
              </li>
            </ul>
          </div>
          <aside className="page-hero__card" aria-labelledby="advisors-steps-title">
            <p>Cómo elegimos a tu asesor</p>
            <h2 id="advisors-steps-title">Tres pasos, sin compromiso</h2>
            <ol className="page-hero__steps">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <small>{step.body}</small>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="advisor-request" id="solicitar-asesor" aria-label="Solicitar un asesor">
        <div className="section-shell">
          <AdvisorRequestForm />
        </div>
      </section>

      <section className="advisor-areas" id="areas" aria-labelledby="advisor-areas-title">
        <div className="section-shell">
          <div className="section-heading section-heading--left">
            <p className="section-eyebrow">Áreas de especialidad</p>
            <h2 id="advisor-areas-title">Asesores por área de conocimiento</h2>
            <span className="section-heading__mark" aria-hidden="true" />
          </div>
          <p className="advisor-areas__intro">
            Cada área agrupa las carreras que atendemos con mayor frecuencia. Si tu carrera tiene
            otro nombre en tu universidad, ubicamos el área equivalente.
          </p>
          <div className="advisor-areas__grid">
            {CAREER_AREAS.map((area) => {
              const isExpanded = expandedArea === area.id;
              const visibleCareers = isExpanded ? area.careers : area.careers.slice(0, 5);
              const hiddenCount = area.careers.length - visibleCareers.length;
              const listId = `advisor-area-${area.id}`;
              return (
                <article className="advisor-area" key={area.id}>
                  <header className="advisor-area__header">
                    <span className="advisor-area__icon">
                      <AreaIcon area={area.id} size={26} />
                    </span>
                    <div>
                      <h3>{area.name}</h3>
                      <p>{area.description}</p>
                    </div>
                  </header>
                  <ul className="advisor-area__careers" id={listId}>
                    {visibleCareers.map((career) => (
                      <li key={career}>{career}</li>
                    ))}
                  </ul>
                  <div className="advisor-area__footer">
                    {area.careers.length > 5 ? (
                      <button
                        type="button"
                        className="advisor-area__toggle"
                        aria-expanded={isExpanded}
                        aria-controls={listId}
                        onClick={() => setExpandedArea(isExpanded ? null : area.id)}
                      >
                        {isExpanded ? "Ver menos" : `+${hiddenCount} carreras más`}
                      </button>
                    ) : (
                      <span />
                    )}
                    <a
                      className="advisor-area__cta"
                      href={buildAreaWhatsappHref(area)}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      aria-label={`Solicitar asesor en ${area.name} por WhatsApp (se abre en una pestaña nueva)`}
                      onClick={() =>
                        trackInteraction("whatsapp_click", {
                          location: "advisor_area",
                          page: "teachers",
                          category: area.id,
                        })
                      }
                    >
                      Solicitar asesor <ArrowRight size={16} weight="bold" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="advisor-coverage" aria-labelledby="advisor-coverage-title">
        <div className="section-shell advisor-coverage__inner">
          <div className="advisor-coverage__copy">
            <p className="section-eyebrow">Qué cubre tu asesor</p>
            <h2 id="advisor-coverage-title">Del planteamiento a la sustentación</h2>
            <p>
              El acompañamiento sigue el orden real de una tesis. Trabajamos sobre tu avance y el
              formato de tu universidad, con revisiones por etapa y sesiones en vivo.
            </p>
            <a className="text-link" href="/servicios">
              Ver servicios y precios referenciales <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <ul className="advisor-coverage__list">
            {COVERAGE.map((item) => (
              <li key={item}>
                <CheckCircle size={22} weight="fill" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection
        title="Preguntas sobre los asesores"
        items={FAQS}
        id="preguntas-asesores"
      />
    </main>
  );
}
