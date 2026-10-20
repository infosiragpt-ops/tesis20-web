import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/ClipboardText";
import { EnvelopeSimple } from "@phosphor-icons/react/EnvelopeSimple";
import { FileText } from "@phosphor-icons/react/FileText";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { LockKey } from "@phosphor-icons/react/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import { MapPin } from "@phosphor-icons/react/MapPin";
import { Phone } from "@phosphor-icons/react/Phone";
import { SealCheck } from "@phosphor-icons/react/SealCheck";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { UserFocus } from "@phosphor-icons/react/UserFocus";
import { VideoCamera } from "@phosphor-icons/react/VideoCamera";
import { SafeImage } from "./platform-enhancements.jsx";
import { PORTAL_URL, WhatsappButton } from "./site-core.jsx";

/**
 * Secciones de Inicio (diseño v2). Todo el contenido sale de hechos del
 * negocio: universidades del brief, precios del catálogo, módulos reales del
 * portal de gestión y cláusulas del contrato publicado. Las vistas del portal
 * son ilustraciones (se rotulan como tales), no capturas de alumnos reales.
 */

/** Capítulos de ejemplo con los mismos estados y colores del portal de gestión. */
export const CHAPTER_DEMO = [
  ["Excel", "Terminado", "done"],
  ["Introducción", "Terminado", "done"],
  ["Método", "En proceso", "progress"],
  ["Resultados", "Pendiente", "pending"],
  ["Discusión", "Pendiente", "pending"],
];

const reveal = (index, step = 70) => ({ "data-reveal": "", style: { "--reveal-delay": `${index * step}ms` } });

function SectionHead({ eyebrow, title, id, lead, center = false, children }) {
  return (
    <div className={`section-head${center ? " section-head--center" : ""}`} data-reveal="">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {lead ? <p className="section-head__lead">{lead}</p> : null}
      {children}
    </div>
  );
}

/** Tarjetas flotantes del hero: ilustran el portal y casos reales (decorativas). */
export function HeroFloats() {
  return (
    <>
      <div className="hero-float hero-float--progress" aria-hidden="true">
        <div className="hero-float__head">
          <span className="hero-float__logo">T20</span>
          <span>
            <strong>Mi avance</strong>
            <small>Tesis 1 · por capítulo</small>
          </span>
        </div>
        <ul className="chapter-list">
          {CHAPTER_DEMO.slice(1, 4).map(([name, state, tone]) => (
            <li key={name} data-tone={tone}>
              <span>{name}</span>
              <em>{state}</em>
            </li>
          ))}
        </ul>
        <span className="hero-float__meter">
          <i />
        </span>
      </div>
      <div className="hero-float hero-float--grade" aria-hidden="true">
        <small>Resultado reportado</small>
        <strong>19</strong>
        <span>promedio · caso anonimizado</span>
      </div>
      <div className="hero-float hero-float--live" aria-hidden="true">
        <span className="live-dot" />
        <span>
          <strong>Clase en vivo</strong>
          <small>con tu asesor</small>
        </span>
        <VideoCamera size={20} weight="duotone" />
      </div>
    </>
  );
}

const UNIVERSITIES = [
  ["UPN", "Universidad Privada del Norte"],
  ["UCV", "Universidad César Vallejo"],
  ["UTP", "Universidad Tecnológica del Perú"],
];

export function UniversityStrip() {
  return (
    <section className="uni-strip" aria-labelledby="uni-strip-title">
      <div className="section-shell uni-strip__inner">
        <p id="uni-strip-title">Acompañamos a estudiantes de</p>
        <ul>
          {UNIVERSITIES.map(([short, name]) => (
            <li key={short}>
              <strong>{short}</strong>
              <span>{name}</span>
            </li>
          ))}
          <li className="uni-strip__more">
            <strong>+</strong>
            <span>Otras universidades del Perú y Latinoamérica</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function ServicesPreview({ services }) {
  return (
    <section className="services-preview" id="servicios-destacados" aria-labelledby="services-preview-title">
      <div className="section-shell">
        <SectionHead
          eyebrow="Servicios y precios referenciales"
          title="Un servicio para cada etapa de tu investigación"
          id="services-preview-title"
          lead="Precios desde el monto publicado. El alcance exacto se confirma por escrito después de revisar tu avance."
        />
        <ul className="service-tiles">
          {services.map(({ id, title, price, category, summary, Icon }, index) => (
            <li key={id} {...reveal(index)}>
              <a className="service-tile" href={`/servicios/${id}`}>
                <span className="service-tile__top">
                  <span className="service-tile__icon">
                    <Icon size={26} weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="service-tile__category">{category}</span>
                </span>
                <h3>{title}</h3>
                <p>{summary}</p>
                <span className="service-tile__footer">
                  <span className="service-tile__price">
                    <small>Desde</small>
                    {price}
                  </span>
                  <span className="service-tile__arrow" aria-hidden="true">
                    <ArrowRight size={18} weight="bold" />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="section-foot">
          <a className="button-outline" href="/servicios">
            Comparar todos los servicios <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

const PROCESS = [
  {
    title: "Diagnóstico inicial",
    body: "Revisamos tu tema, los requisitos de tu universidad y tu avance actual.",
    deliverable: "Ruta recomendada",
    Icon: MagnifyingGlass,
  },
  {
    title: "Plan y contrato",
    body: "Acordamos alcance, entregables, cronograma y precio por escrito antes de empezar.",
    deliverable: "Cronograma y contrato",
    Icon: ClipboardText,
  },
  {
    title: "Acompañamiento por etapas",
    body: "Clases en vivo, revisión de cada capítulo y preparación para tu sustentación.",
    deliverable: "Revisiones por capítulo",
    Icon: UserFocus,
  },
];

export function ProcessSection() {
  return (
    <section className="process" id="metodo" aria-labelledby="process-title">
      <div className="section-shell">
        <SectionHead
          center
          eyebrow="Cómo trabajamos"
          title="Una ruta clara en tres etapas"
          id="process-title"
          lead="Sabes qué recibes en cada paso, quién te acompaña y cuándo."
        />
        <ol className="process__steps">
          {PROCESS.map(({ title, body, deliverable, Icon }, index) => (
            <li className="process-step" key={title} {...reveal(index, 110)}>
              <span className="process-step__node" aria-hidden="true">
                <Icon size={26} weight="duotone" />
              </span>
              <span className="process-step__index">Etapa {index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="process-step__deliverable">
                <CheckCircle size={16} weight="fill" aria-hidden="true" />
                Entregable: {deliverable}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Luz que sigue al puntero dentro de cada tarjeta del bento (solo punteros finos). */
function trackSpotlight(event) {
  const card = event.target.closest?.(".bento-card");
  if (!card || event.pointerType !== "mouse") return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  card.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

const BENTO_SMALL = [
  {
    title: "Contrato por escrito",
    body: "12 cláusulas generales en Word editable: alcance, pagos, plazos y autoría.",
    Icon: FileText,
    link: ["/contrato", "Leer el contrato"],
  },
  {
    title: "Autoría del estudiante",
    body: "Tú desarrollas y sustentas tu propio trabajo; promovemos buenas prácticas de citación.",
    Icon: ShieldCheck,
  },
  {
    title: "Confidencialidad",
    body: "Tu información y tus archivos se tratan con reserva; las evidencias públicas se anonimizan.",
    Icon: LockKey,
    wide: true,
  },
];

export function WhyBento() {
  return (
    <section className="why" aria-labelledby="why-title">
      <div className="section-shell">
        <SectionHead
          eyebrow="Por qué Tesis20"
          title="Acompañamiento humano, método claro y reglas por escrito"
          id="why-title"
        />
        <div className="bento" onPointerMove={trackSpotlight}>
          <article className="bento-card bento-card--photo" {...reveal(0)}>
            <SafeImage
              className="bento-card__photo"
              src="/assets/support-session.jpg"
              alt="Estudiante recibiendo asesoría personalizada para su tesis"
              width="1511"
              height="1041"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 760px) 92vw, 48vw"
              draggable="false"
            />
            <div className="bento-card__overlay">
              <span className="bento-chip">
                <VideoCamera size={16} weight="fill" aria-hidden="true" /> Clases en vivo
              </span>
              <h3>Sesiones en vivo y feedback constante</h3>
              <p>Un especialista revisa tu avance contigo y resuelve tus dudas de forma directa.</p>
            </div>
          </article>

          <article className="bento-card bento-card--ink bento-card--wide" {...reveal(1)}>
            <div>
              <h3>Seguimiento por capítulos</h3>
              <p>Cada capítulo avanza con su estado y su responsable, y tú lo ves en tu portal.</p>
            </div>
            <ul className="chapter-list chapter-list--dark" aria-hidden="true">
              {CHAPTER_DEMO.map(([name, state, tone]) => (
                <li key={name} data-tone={tone}>
                  <span>{name}</span>
                  <em>{state}</em>
                </li>
              ))}
            </ul>
          </article>

          {BENTO_SMALL.map(({ title, body, Icon, link, wide }, index) => (
            <article className={`bento-card${wide ? " bento-card--wide" : ""}`} key={title} {...reveal(index + 2)}>
              <span className="bento-card__icon">
                <Icon size={24} weight="duotone" aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              {link ? (
                <a className="bento-card__link" href={link[0]}>
                  {link[1]} <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </a>
              ) : null}
            </article>
          ))}

          <article className="bento-card bento-card--yellow bento-card--wide" {...reveal(5)}>
            <span className="bento-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <h3>IBM SPSS y estadística</h3>
            <p>Procesamiento, análisis e interpretación de tus datos con orientación personalizada.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

const PORTAL_FEATURES = [
  ["Avance por capítulo", "Estado y responsable de cada capítulo, al día.", ClipboardText],
  ["Archivos con versiones", "Tu documento y su historial, con vista previa.", FileText],
  ["Estado financiero", "Tus pagos y vouchers en un solo lugar.", SealCheck],
  ["Recursos de tu fase", "Videos y materiales asignados según tu etapa.", GraduationCap],
];

export function PortalShowcase() {
  return (
    <section className="portal" aria-labelledby="portal-title">
      <div className="section-shell portal__inner">
        <div className="portal__copy" data-reveal="">
          <p className="section-eyebrow">Portal del estudiante</p>
          <h2 id="portal-title">Tu tesis, visible en todo momento</h2>
          <p className="portal__lead">
            Con tu usuario entras a tu propio portal: sigues el avance de cada capítulo, revisas
            tus archivos y tienes tus pagos ordenados, sin depender de preguntar por WhatsApp.
          </p>
          <ul className="portal__features">
            {PORTAL_FEATURES.map(([title, body, Icon]) => (
              <li key={title}>
                <span>
                  <Icon size={20} weight="duotone" aria-hidden="true" />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{body}</small>
                </div>
              </li>
            ))}
          </ul>
          <div className="portal__actions">
            <a
              className="button-light"
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label="Ingresar al portal del estudiante (se abre en una pestaña nueva)"
            >
              Ingresar al portal <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
            </a>
            <WhatsappButton className="portal__whatsapp" location="portal">
              Quiero orientación
            </WhatsappButton>
          </div>
        </div>

        <figure className="portal__visual" data-reveal="">
          <div className="portal-mock" aria-hidden="true">
            <div className="portal-mock__bar">
              <span />
              <span />
              <span />
              <em>gestion.tesis20.com</em>
            </div>
            <div className="portal-mock__body">
              <div className="portal-mock__side">
                <b>T20</b>
                <ul>
                  <li className="is-active">Mi progreso</li>
                  <li>Mis archivos</li>
                  <li>Estado financiero</li>
                  <li>Mis recursos</li>
                </ul>
              </div>
              <div className="portal-mock__main">
                <div className="portal-mock__head">
                  <span>
                    <small>Tesis 1 · Ciclo 2026-2</small>
                    <strong>Mi progreso</strong>
                  </span>
                  <em>En curso</em>
                </div>
                <div className="portal-mock__meter">
                  <span>2 de 5 capítulos terminados</span>
                  <span className="portal-mock__segments">
                    {CHAPTER_DEMO.map(([name, , tone]) => (
                      <i key={name} data-tone={tone} />
                    ))}
                  </span>
                </div>
                <ul className="chapter-list chapter-list--rows">
                  {CHAPTER_DEMO.map(([name, state, tone]) => (
                    <li key={name} data-tone={tone}>
                      <span>{name}</span>
                      <small>Resp.: tu asesor</small>
                      <em>{state}</em>
                    </li>
                  ))}
                </ul>
                <div className="portal-mock__cards">
                  <span>
                    <FileText size={18} weight="duotone" />
                    <b>
                      Tesis.docx<small>Versión 3 · actualizada hoy</small>
                    </b>
                  </span>
                  <span>
                    <SealCheck size={18} weight="duotone" />
                    <b>
                      Estado financiero<small>Al día</small>
                    </b>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <figcaption>Vista ilustrativa del portal del estudiante.</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="cta-final" aria-labelledby="final-cta-title">
      <div className="section-shell">
        <div className="cta-final__card" data-reveal="">
          <div className="cta-final__copy">
            <p className="section-eyebrow">Empieza hoy, sin compromiso</p>
            <h2 id="final-cta-title">¿Listo para avanzar con tu propia investigación?</h2>
            <p>
              Cuéntanos en qué etapa estás y recibe orientación personalizada por WhatsApp. La
              orientación inicial no te obliga a contratar.
            </p>
            <div className="cta-final__actions">
              <WhatsappButton className="cta-final__primary" location="final_cta">
                Quiero orientación
              </WhatsappButton>
              <a className="button-ghost" href="/servicios">
                Ver servicios y precios <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
          <ul className="cta-final__contact">
            <li>
              <Phone size={20} weight="duotone" aria-hidden="true" />
              <a href="tel:+51918714054">(+51) 918 714 054</a>
            </li>
            <li>
              <EnvelopeSimple size={20} weight="duotone" aria-hidden="true" />
              <a href="mailto:tesis.com20@gmail.com">tesis.com20@gmail.com</a>
            </li>
            <li>
              <MapPin size={20} weight="duotone" aria-hidden="true" />
              <span>Jr. Lincoln 638, Pueblo Libre, Lima</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
