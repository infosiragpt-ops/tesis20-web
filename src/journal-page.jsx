import { useId, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { Breadcrumb } from "./site-core.jsx";
import { FaqSection, trackInteraction } from "./platform-enhancements.jsx";
import { buildWhatsappHref, whatsappMessages } from "./data/contact.js";
import { COMPANY } from "./data/company.js";
import {
  ARTICLE_TYPES,
  AUTHOR_GUIDELINES,
  EDITORIAL_POLICIES,
  EDITORIAL_PROCESS,
  INDEXING,
  JOURNAL,
  JOURNAL_AREAS,
  JOURNAL_FACTS,
  JOURNAL_FAQS,
  JOURNAL_HIGHLIGHTS,
  PUBLICATION_COST,
  SUBMITTER_PROFILES,
} from "./data/journal.js";
import "./page-hero.css";
import "./journal-page.css";

const EXTERNAL_LINK = {
  target: "_blank",
  rel: "noopener noreferrer",
  referrerPolicy: "no-referrer",
};

const EMPTY_SUBMISSION = {
  name: "",
  email: "",
  institution: "",
  profile: "",
  type: "",
  area: "",
  title: "",
};

function buildSubmissionMessage(values) {
  return [
    `¡Hola, Tesis20! Quiero enviar un manuscrito a la ${JOURNAL.name}.`,
    "",
    `Nombre: ${values.name.trim()}`,
    `Correo: ${values.email.trim()}`,
    `Institución: ${values.institution.trim()}`,
    `Perfil: ${values.profile}`,
    `Tipo de artículo: ${values.type}`,
    `Área: ${values.area}`,
    `Título: ${values.title.trim()}`,
    "",
    "Declaro que el manuscrito es original, inédito y no está en evaluación en otra revista, y acepto las normas y políticas de la revista.",
    "Adjunto el manuscrito en Word (sin nombres de autores) y la portada con los datos de cada autor.",
  ].join("\n");
}

const emailHref = `mailto:${JOURNAL.contactEmail}?subject=${encodeURIComponent(JOURNAL.emailSubject)}`;

/**
 * Envío de manuscritos: como en el resto de la web, el formulario no guarda
 * nada; arma el mensaje y abre WhatsApp, donde el autor adjunta su archivo.
 * La validación es la del navegador (campos y casillas obligatorios).
 */
function ManuscriptForm() {
  const idPrefix = useId();
  const [values, setValues] = useState(EMPTY_SUBMISSION);
  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  return (
    <form
      className="journal-form"
      aria-labelledby={`${idPrefix}-title`}
      onSubmit={(event) => {
        event.preventDefault();
        trackInteraction("whatsapp_click", {
          location: "journal_submission",
          page: "journal",
          category: values.type,
        });
        window.open(buildWhatsappHref(buildSubmissionMessage(values)), "_blank", "noopener,noreferrer");
      }}
    >
      <div className="journal-form__heading">
        <p>Envío de manuscritos · 2 minutos</p>
        <h2 id={`${idPrefix}-title`}>Envía tu manuscrito a la revista</h2>
        <span>
          Completa los datos y se abrirá WhatsApp con tu solicitud ya escrita. Ahí adjunta el
          manuscrito en Word, sin nombres de autores, y la portada con los datos de cada autor.
        </span>
        <span>
          ¿Prefieres correo? Escribe a{" "}
          <a href={emailHref}>{JOURNAL.contactEmail}</a> con el asunto «{JOURNAL.emailSubject}».
        </span>
      </div>

      <div className="journal-form__fields">
        <label className="journal-field">
          <span>Nombre y apellidos</span>
          <input
            type="text"
            value={values.name}
            onChange={update("name")}
            autoComplete="name"
            maxLength={90}
            required
          />
        </label>
        <label className="journal-field">
          <span>Correo electrónico</span>
          <input
            type="email"
            value={values.email}
            onChange={update("email")}
            autoComplete="email"
            maxLength={120}
            required
          />
        </label>
        <label className="journal-field">
          <span>Universidad o institución</span>
          <input
            type="text"
            value={values.institution}
            onChange={update("institution")}
            autoComplete="organization"
            maxLength={120}
            placeholder="Ej.: Universidad César Vallejo"
            required
          />
        </label>
        <label className="journal-field">
          <span>Perfil</span>
          <select value={values.profile} onChange={update("profile")} required>
            <option value="">Elige una opción</option>
            {SUBMITTER_PROFILES.map((profile) => (
              <option key={profile} value={profile}>
                {profile}
              </option>
            ))}
          </select>
        </label>
        <label className="journal-field">
          <span>Tipo de artículo</span>
          <select value={values.type} onChange={update("type")} required>
            <option value="">Elige una opción</option>
            {ARTICLE_TYPES.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label className="journal-field">
          <span>Área</span>
          <select value={values.area} onChange={update("area")} required>
            <option value="">Elige el área</option>
            {JOURNAL_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
        <label className="journal-field journal-field--wide">
          <span>Título del manuscrito</span>
          <textarea
            value={values.title}
            onChange={update("title")}
            rows={2}
            maxLength={250}
            required
          />
        </label>
        <label className="journal-check">
          <input type="checkbox" required />
          <span>
            Declaro que el manuscrito es original, inédito y no está en evaluación en otra revista.
          </span>
        </label>
        <label className="journal-check">
          <input type="checkbox" required />
          <span>
            Acepto las <a href="#normas">normas para autores</a> y las{" "}
            <a href="#politicas">políticas editoriales</a>.
          </span>
        </label>
      </div>

      <div className="journal-form__actions">
        <button type="submit" className="whatsapp-button whatsapp-button--dark journal-form__submit">
          <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
          <span>Enviar solicitud por WhatsApp</span>
        </button>
        <p>Se abre WhatsApp en una pestaña nueva. Tus datos se usan solo para el proceso editorial.</p>
      </div>
    </form>
  );
}

function SectionHeading({ eyebrow, title, id }) {
  return (
    <div className="section-heading section-heading--left">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <span className="section-heading__mark" aria-hidden="true" />
    </div>
  );
}

export function JournalPage() {
  const costHref = buildWhatsappHref(whatsappMessages.journal);

  return (
    <main className="journal-page" id="main-content" tabIndex="-1">
      <section className="page-hero" aria-labelledby="journal-title">
        <div className="page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumb current="Revista científica" />
            <p className="page-hero__eyebrow">{JOURNAL.call}</p>
            <h1 id="journal-title">{JOURNAL.name}</h1>
            <p className="page-hero__intro">{JOURNAL.intro}</p>
            <div className="page-hero__actions">
              <a className="whatsapp-button whatsapp-button--dark" href="#enviar">
                <ArrowRight size={20} weight="bold" aria-hidden="true" />
                <span>Enviar mi manuscrito</span>
              </a>
              <a className="text-link" href="#normas">
                Ver normas para autores <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className="page-hero__highlights" aria-label="Características de la revista">
              {JOURNAL_HIGHLIGHTS.map((item) => (
                <li key={item}>
                  <CheckCircle size={18} weight="fill" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="page-hero__card journal-facts" aria-labelledby="journal-facts-title">
            <p>Ficha de la revista</p>
            <h2 id="journal-facts-title">{JOURNAL.shortName}</h2>
            <dl>
              <div>
                <dt>Editorial</dt>
                <dd>
                  {COMPANY.name} · RUC {COMPANY.ruc}
                </dd>
              </div>
              {JOURNAL_FACTS.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>Licencia</dt>
                <dd>
                  <a href={JOURNAL.licenseUrl} {...EXTERNAL_LINK}>
                    {JOURNAL.license}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>{" "}
                  · {JOURNAL.licenseName}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="journal-section" id="enfoque" aria-labelledby="journal-scope-title">
        <div className="section-shell journal-scope">
          <div className="journal-scope__copy">
            <SectionHeading
              eyebrow="Enfoque y alcance"
              title="Una revista multidisciplinaria para investigadores en formación"
              id="journal-scope-title"
            />
            <p>{JOURNAL.scope}</p>
          </div>
          <div className="journal-scope__areas">
            <h3>Áreas que recibimos</h3>
            <ul>
              {JOURNAL_AREAS.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="journal-section journal-section--white" aria-labelledby="journal-types-title">
        <div className="section-shell">
          <SectionHeading eyebrow="Qué publicamos" title="Tres tipos de artículo" id="journal-types-title" />
          <div className="journal-types">
            {ARTICLE_TYPES.map((type) => (
              <article className="journal-type" key={type.name}>
                <h3>{type.name}</h3>
                <p>{type.description}</p>
                <span>{type.length}, sin contar referencias</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="journal-section" id="proceso" aria-labelledby="journal-process-title">
        <div className="section-shell">
          <SectionHeading eyebrow="Proceso editorial" title="Del envío a la publicación" id="journal-process-title" />
          <ol className="journal-process">
            {EDITORIAL_PROCESS.map((step, index) => (
              <li key={step.title}>
                <span className="journal-process__number" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <small>{step.time}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className="journal-note">
            Plazos referenciales: dependen de la disponibilidad de los revisores y de tus correcciones.
          </p>
        </div>
      </section>

      <section className="journal-section journal-section--white" id="normas" aria-labelledby="journal-guidelines-title">
        <div className="section-shell">
          <SectionHeading eyebrow="Normas para autores" title="Cómo preparar tu manuscrito" id="journal-guidelines-title" />
          <dl className="journal-guidelines">
            {AUTHOR_GUIDELINES.map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.body}</dd>
              </div>
            ))}
          </dl>
          <p className="journal-note">
            ¿Buscas antecedentes para tu artículo?{" "}
            <a className="text-link" href="/recursos">
              Usa el buscador de tesis <ArrowRight size={16} aria-hidden="true" />
            </a>
          </p>
        </div>
      </section>

      <section className="journal-cost" id="costo" aria-labelledby="journal-cost-title">
        <div className="section-shell journal-cost__inner">
          <div>
            <p className="journal-cost__eyebrow">Costo de publicación</p>
            <h2 id="journal-cost-title">{PUBLICATION_COST.title}</h2>
            <p>{PUBLICATION_COST.intro}</p>
          </div>
          <div className="journal-cost__side">
            <ul>
              {PUBLICATION_COST.points.map((point) => (
                <li key={point}>
                  <CheckCircle size={20} weight="fill" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <a
              className="journal-cost__cta"
              href={costHref}
              {...EXTERNAL_LINK}
              onClick={() =>
                trackInteraction("whatsapp_click", { location: "journal_cost", page: "journal" })
              }
            >
              <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
              <span>Consultar el costo por WhatsApp</span>
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </section>

      <section className="journal-section" id="politicas" aria-labelledby="journal-policies-title">
        <div className="section-shell journal-policies">
          <SectionHeading eyebrow="Políticas editoriales" title="Reglas claras para autores y revisores" id="journal-policies-title" />
          <div className="journal-policies__list">
            {EDITORIAL_POLICIES.map((policy, index) => (
              <details key={policy.title} name="journal-policies" open={index === 0}>
                <summary>
                  <span>{policy.title}</span>
                  <span className="journal-policies__icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{policy.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="journal-section journal-section--white" id="indexacion" aria-labelledby="journal-indexing-title">
        <div className="section-shell journal-indexing">
          <div>
            <SectionHeading eyebrow="Indexación" title={INDEXING.title} id="journal-indexing-title" />
            <p>{INDEXING.status}</p>
          </div>
          <div>
            <ol className="journal-roadmap">
              {INDEXING.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="journal-note">{INDEXING.note}</p>
          </div>
        </div>
      </section>

      <section className="journal-submit" id="enviar" aria-label="Enviar un manuscrito">
        <div className="section-shell">
          <ManuscriptForm />
        </div>
      </section>

      <FaqSection title="Preguntas sobre la revista" items={JOURNAL_FAQS} id="preguntas-revista" />
    </main>
  );
}
