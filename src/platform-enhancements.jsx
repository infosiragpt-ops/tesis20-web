import { Component, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ArrowUp } from "@phosphor-icons/react/ArrowUp";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { X } from "@phosphor-icons/react/X";

const PAGE_META = {
  home: {
    title: "Tesis20 | Elaboración y asesoría de tesis",
    description:
      "Asesoría personalizada para tesis, proyectos de investigación, análisis estadístico y sustentación, con acompañamiento experto en Lima y todo el Perú.",
    path: "/",
  },
  services: {
    title: "Servicios de asesoría académica | Tesis20",
    description:
      "Conoce los servicios de Tesis20 para artículos científicos, proyectos, tesis, suficiencia profesional, IBM SPSS y simulación de sustentación.",
    path: "/servicios",
  },
  evidence: {
    title: "Evidencias y resultados académicos | Tesis20",
    description:
      "Revisa evidencias completas y anonimizadas de acompañamiento, calificaciones y resultados compartidos por estudiantes de Tesis20.",
    path: "/evidencias",
  },
  contract: {
    title: "Contrato general de asesoría académica | Tesis20",
    description:
      "Lee y descarga el modelo general de contrato de asesoría académica e investigación de Tesis20, preparado para completar antes de contratar.",
    path: "/contrato",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "EducationalOrganization"],
  name: "Tesis20",
  url: "https://tesis20.com",
  logo: "https://tesis20.com/assets/tesis20-logo.png",
  image: "https://tesis20.com/assets/hero-students.png",
  telephone: "+51 918 714 054",
  email: "tesis.com20@gmail.com",
  priceRange: "S/ 250 - S/ 1900",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jr. Lincoln 638",
    addressLocality: "Pueblo Libre",
    addressRegion: "Lima",
    addressCountry: "PE",
  },
  areaServed: {
    "@type": "Country",
    name: "Perú",
  },
  sameAs: [
    "https://www.facebook.com/tesisconluis",
    "https://www.instagram.com/tesisis.com20/",
    "https://www.youtube.com/channel/UCf-D2F5J3MzIWHSAp8YWDcQ",
  ],
};

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export function SeoManager({ currentPage, faqItems = [] }) {
  useEffect(() => {
    const meta = PAGE_META[currentPage] || PAGE_META.home;
    const canonicalUrl = `https://tesis20.com${meta.path}`;

    document.documentElement.lang = "es-PE";
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: "index, follow, max-image-preview:large",
    });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "es_PE" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: "https://tesis20.com/assets/hero-students.png",
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: meta.title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: meta.description,
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        organizationSchema,
        {
          "@type": "WebPage",
          name: meta.title,
          description: meta.description,
          url: canonicalUrl,
          inLanguage: "es-PE",
          isPartOf: { "@type": "WebSite", name: "Tesis20", url: "https://tesis20.com" },
        },
        ...(faqItems.length
          ? [
              {
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
            ]
          : []),
      ],
    };

    let structuredData = document.head.querySelector("#tesis20-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "tesis20-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(schema);
  }, [currentPage, faqItems]);

  return null;
}

export function RouteAnnouncer({ currentPage }) {
  const labels = {
    home: "Página de inicio cargada",
    services: "Página de servicios cargada",
    evidence: "Página de evidencias cargada",
    contract: "Página de contrato cargada",
  };

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {labels[currentPage]}
    </p>
  );
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
        frame = 0;
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </span>
  );
}

export function QuickFacts() {
  const facts = [
    { value: "6", label: "servicios especializados" },
    { value: "15", label: "calificaciones publicadas" },
    { value: "3", label: "etapas de acompañamiento" },
  ];

  return (
    <section className="quick-facts" aria-label="Tesis20 en cifras">
      <div className="quick-facts__inner">
        {facts.map((fact) => (
          <article key={fact.label}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </article>
        ))}
        <p>
          <ShieldCheck size={22} weight="fill" aria-hidden="true" />
          <span>Evidencias anonimizadas para proteger la privacidad.</span>
        </p>
      </div>
    </section>
  );
}

export function FaqSection({ eyebrow = "Preguntas frecuentes", title, items, id = "preguntas" }) {
  return (
    <section className="faq-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="section-shell faq-section__inner">
        <div className="faq-section__heading">
          <p>{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <span>Resolvemos las dudas más habituales antes de comenzar.</span>
        </div>
        <div className="faq-list">
          {items.map((item, index) => (
            <details key={item.question} name={`${id}-faq`} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <span className="faq-list__icon" aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SafeImage({ fallbackLabel = "Imagen no disponible", onError, ...props }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [props.src]);

  if (failed) {
    return (
      <span className="image-fallback" role="img" aria-label={fallbackLabel}>
        <GraduationCap size={42} weight="light" aria-hidden="true" />
        <span>{fallbackLabel}</span>
      </span>
    );
  }

  return (
    <img
      {...props}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}

export function ImageLightbox({ items, index, onChange, onClose, returnFocusRef, label }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const item = items[index];
  const hasMultiple = items.length > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultiple) {
        onChange((index - 1 + items.length) % items.length);
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        onChange((index + 1) % items.length);
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll("button")].filter(
          (element) => !element.disabled,
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultiple, index, items.length, onChange, onClose]);

  if (!item) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="image-lightbox__panel" ref={panelRef}>
        <div className="image-lightbox__toolbar">
          <div>
            <span>{label}</span>
            <strong aria-live="polite">
              {index + 1} de {items.length}
            </strong>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar imagen ampliada">
            <X size={26} aria-hidden="true" />
          </button>
        </div>
        <div className="image-lightbox__media">
          {hasMultiple ? (
            <button
              className="image-lightbox__nav image-lightbox__nav--previous"
              type="button"
              aria-label="Ver imagen anterior"
              onClick={() => onChange((index - 1 + items.length) % items.length)}
            >
              <ArrowLeft size={25} aria-hidden="true" />
            </button>
          ) : null}
          <SafeImage src={item.src} alt={item.alt} decoding="async" />
          {hasMultiple ? (
            <button
              className="image-lightbox__nav image-lightbox__nav--next"
              type="button"
              aria-label="Ver imagen siguiente"
              onClick={() => onChange((index + 1) % items.length)}
            >
              <ArrowRight size={25} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 650);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      className={`back-to-top ${visible ? "back-to-top--visible" : ""}`}
      type="button"
      aria-label="Volver al inicio"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        })
      }
    >
      <ArrowUp size={23} weight="bold" aria-hidden="true" />
    </button>
  );
}

export function MobileContactBar({ href }) {
  return (
    <aside className="mobile-contact-bar" aria-label="Acceso rápido a orientación">
      <div>
        <CheckCircle size={18} weight="fill" aria-hidden="true" />
        <span>Orientación personalizada</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackInteraction("whatsapp_click", { location: "mobile_bar" })}
      >
        <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
        <span>Consultar</span>
      </a>
    </aside>
  );
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <img src="/assets/tesis20-logo.png" alt="Tesis20" />
          <h1>No pudimos cargar esta sección</h1>
          <p>La información está segura. Recarga la página para continuar.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export function trackInteraction(action, detail = {}) {
  window.dispatchEvent(
    new CustomEvent("tesis20:interaction", {
      detail: { action, timestamp: Date.now(), ...detail },
    }),
  );
}
