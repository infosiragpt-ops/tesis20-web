import { Component, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "@phosphor-icons/react/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ArrowUp } from "@phosphor-icons/react/ArrowUp";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { X } from "@phosphor-icons/react/X";

const SITE_ORIGIN = "https://www.tesis20.com";
const SITE_NAME = "Tesis20";
const DEFAULT_SHARE_IMAGE = `${SITE_ORIGIN}/assets/hero-students.png`;

const PAGE_META = {
  home: {
    title: "Asesoría de tesis en Lima y todo el Perú | Tesis20",
    description:
      "Asesoría académica personalizada para tesis, proyectos, análisis estadístico y sustentación, con metodología por etapas y autoría del estudiante.",
    path: "/",
    schemaType: "WebPage",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Estudiantes universitarios durante un proceso de acompañamiento académico",
  },
  services: {
    title: "Asesoría de tesis, SPSS y sustentación | Tesis20",
    description:
      "Conoce los servicios de Tesis20 para artículos científicos, proyectos, tesis, suficiencia profesional, IBM SPSS y simulación de sustentación.",
    path: "/servicios",
    schemaType: "CollectionPage",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Servicios de acompañamiento académico de Tesis20",
  },
  evidence: {
    title: "Evidencias y resultados académicos | Tesis20",
    description:
      "Revisa ejemplos anonimizados de acompañamiento y resultados compartidos por estudiantes, publicados para mostrar el proceso sin prometer resultados futuros.",
    path: "/evidencias",
    schemaType: "CollectionPage",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Galería de evidencias académicas anonimizadas de Tesis20",
  },
  contract: {
    title: "Contrato general de asesoría académica | Tesis20",
    description:
      "Lee y descarga el modelo general informativo de contrato de asesoría académica de Tesis20 para revisarlo antes de contratar.",
    path: "/contrato",
    schemaType: "WebPage",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Modelo general informativo de contrato de Tesis20",
  },
  "not-found": {
    title: "Página no encontrada | Tesis20",
    description:
      "La dirección solicitada no está disponible. Regresa al inicio o revisa los servicios de Tesis20.",
    path: "/",
    schemaType: "WebPage",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Tesis20, acompañamiento académico",
  },
};

const organizationSchema = {
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "Tesis20",
  url: SITE_ORIGIN,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_ORIGIN}/assets/tesis20-logo.png`,
  },
  image: DEFAULT_SHARE_IMAGE,
  description:
    "Servicio de orientación y acompañamiento académico para proyectos de investigación y tesis.",
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
    "https://www.instagram.com/tesis20.comm/",
    "https://www.youtube.com/@tesisasesoriaycapacitacion3499",
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

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function getSafePageKey(pathname = window.location.pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const pageByPath = {
    "/": "home",
    "/index.html": "home",
    "/servicios": "services",
    "/evidencias": "evidence",
    "/contrato": "contract",
  };

  return pageByPath[normalizedPath] || "not-found";
}

function getLightboxPortalRoot() {
  if (typeof document === "undefined") return null;
  let root = document.getElementById("tesis20-lightbox-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "tesis20-lightbox-root";
    root.setAttribute("data-portal", "image-lightbox");
    document.body.appendChild(root);
  }
  return root;
}

function getLightboxItemLabel(item, position) {
  return item?.label || item?.title || item?.alt || `Imagen ${position + 1}`;
}

export function SeoManager({
  currentPage,
  faqItems = [],
  serviceId = null,
  serviceItem = null,
  serviceItems = [],
}) {
  useEffect(() => {
    const pageKey = PAGE_META[currentPage] ? currentPage : "not-found";
    const isServiceDetail =
      pageKey === "services" &&
      typeof serviceId === "string" &&
      serviceId.length > 0 &&
      serviceItem?.id === serviceId;
    const servicePrice = isServiceDetail
      ? Number(String(serviceItem.price || "").replace(/[^\d.]/g, ""))
      : null;
    const meta = isServiceDetail
      ? {
          title: `${serviceItem.title}: asesoría académica | Tesis20`,
          description: `${serviceItem.summary} Precio referencial desde ${serviceItem.price}; el alcance final se confirma después de revisar tu caso.`,
          path: `/servicios/${encodeURIComponent(serviceId)}`,
          schemaType: "WebPage",
          image: DEFAULT_SHARE_IMAGE,
          imageAlt: `Servicio de asesoría académica en ${serviceItem.title}`,
        }
      : PAGE_META[pageKey];
    const isNotFound = pageKey === "not-found";
    const safeFaqItems = Array.isArray(faqItems) ? faqItems : [];
    const safeServiceItems = Array.isArray(serviceItems) ? serviceItems : [];
    const canonicalUrl = isNotFound
      ? `${SITE_ORIGIN}${window.location.pathname}`
      : `${SITE_ORIGIN}${meta.path}`;
    const pageLabels = {
      home: "Inicio",
      services: "Servicios",
      evidence: "Evidencias",
      contract: "Contrato",
      "not-found": "Página no encontrada",
    };

    document.documentElement.lang = "es-PE";
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: isNotFound
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });
    upsertMeta('meta[name="author"]', { name: "author", content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "es_PE" });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: meta.image,
    });
    upsertMeta('meta[property="og:image:secure_url"]', {
      property: "og:image:secure_url",
      content: meta.image,
    });
    upsertMeta('meta[property="og:image:type"]', {
      property: "og:image:type",
      content: "image/png",
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: meta.imageAlt,
    });
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: "800",
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: "999",
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
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: meta.image,
    });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: "twitter:image:alt",
      content: meta.imageAlt,
    });
    upsertMeta('meta[name="twitter:url"]', {
      name: "twitter:url",
      content: canonicalUrl,
    });

    if (isNotFound) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head
        .querySelectorAll('link[rel="alternate"][hreflang]')
        .forEach((link) => link.remove());
    } else {
      upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
      ["es-PE", "es", "x-default"].forEach((language) => {
        upsertLink(`link[rel="alternate"][hreflang="${language}"]`, {
          rel: "alternate",
          hreflang: language,
          href: canonicalUrl,
        });
      });
    }

    const breadcrumbs = {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: `${SITE_ORIGIN}/`,
        },
        ...(pageKey === "home"
          ? []
          : [
              {
                "@type": "ListItem",
                position: 2,
                name: pageLabels[pageKey],
                item: isServiceDetail ? `${SITE_ORIGIN}/servicios` : canonicalUrl,
              },
            ]),
        ...(isServiceDetail
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: serviceItem.title,
                item: canonicalUrl,
              },
            ]
          : []),
      ],
    };
    const primaryImage = {
      "@type": "ImageObject",
      "@id": `${canonicalUrl}#primaryimage`,
      url: meta.image,
      contentUrl: meta.image,
      caption: meta.imageAlt,
      width: 800,
      height: 999,
    };
    const websiteSchema = {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      inLanguage: "es-PE",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    };
    const webpageSchema = {
      "@type": meta.schemaType,
      "@id": `${canonicalUrl}#webpage`,
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      inLanguage: "es-PE",
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@id": `${SITE_ORIGIN}/#organization` },
      breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
      primaryImageOfPage: { "@id": `${canonicalUrl}#primaryimage` },
    };
    const servicesCatalog =
      pageKey === "services" && !isServiceDetail && safeServiceItems.length
        ? {
            "@type": "ItemList",
            "@id": `${canonicalUrl}#services`,
            name: "Servicios académicos de Tesis20",
            numberOfItems: safeServiceItems.length,
            itemListElement: safeServiceItems.map((service, index) => {
              const serviceUrl = `${SITE_ORIGIN}/servicios/${encodeURIComponent(service.id)}`;
              const price = Number(String(service.price || "").replace(/[^\d.]/g, ""));
              return {
                "@type": "ListItem",
                position: index + 1,
                url: serviceUrl,
                item: {
                  "@type": "Service",
                  "@id": serviceUrl,
                  name: service.title,
                  description: service.summary,
                  serviceType: service.category,
                  provider: { "@id": `${SITE_ORIGIN}/#organization` },
                  areaServed: { "@type": "Country", name: "Perú" },
                  ...(Number.isFinite(price) && price > 0
                    ? {
                        offers: {
                          "@type": "Offer",
                          price,
                          priceCurrency: "PEN",
                          url: serviceUrl,
                          description:
                            "Monto referencial desde el importe indicado; el alcance y precio final se confirman antes de contratar.",
                        },
                      }
                    : {}),
                },
              };
            }),
          }
        : null;
    const selectedServiceSchema = isServiceDetail
      ? {
          "@type": "Service",
          "@id": `${canonicalUrl}#service`,
          name: serviceItem.title,
          description: serviceItem.summary,
          serviceType: serviceItem.category,
          url: canonicalUrl,
          provider: { "@id": `${SITE_ORIGIN}/#organization` },
          areaServed: { "@type": "Country", name: "Perú" },
          ...(Number.isFinite(servicePrice) && servicePrice > 0
            ? {
                offers: {
                  "@type": "Offer",
                  price: servicePrice,
                  priceCurrency: "PEN",
                  url: canonicalUrl,
                  availability: "https://schema.org/InStock",
                  description:
                    "Precio referencial desde el importe indicado; el alcance, cronograma y monto final se confirman antes de contratar.",
                },
              }
            : {}),
        }
      : null;
    const contractDocument =
      pageKey === "contract"
        ? {
            "@type": "DigitalDocument",
            "@id": `${canonicalUrl}#document`,
            name: "Modelo general informativo de contrato de asesoría académica",
            description:
              "Documento informativo para lectura previa; sus condiciones deben completarse y aceptarse por las partes antes de contratar.",
            url: `${SITE_ORIGIN}/downloads/contrato-general-asesoria-academica-tesis20.pdf`,
            inLanguage: "es-PE",
            isAccessibleForFree: true,
            publisher: { "@id": `${SITE_ORIGIN}/#organization` },
          }
        : null;
    const faqSchema =
      !isNotFound && safeFaqItems.length > 0
        ? {
            "@type": "FAQPage",
            "@id": `${canonicalUrl}#faq`,
            mainEntity: safeFaqItems.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }
        : null;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        organizationSchema,
        websiteSchema,
        ...(!isNotFound ? [primaryImage, webpageSchema, breadcrumbs] : []),
        ...(servicesCatalog ? [servicesCatalog] : []),
        ...(selectedServiceSchema ? [selectedServiceSchema] : []),
        ...(contractDocument ? [contractDocument] : []),
        ...(faqSchema ? [faqSchema] : []),
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
    trackInteraction("page_view", {
      page: isServiceDetail ? "service_detail" : pageKey,
      ...(isServiceDetail ? { service: serviceId } : {}),
    });
  }, [currentPage, faqItems, serviceId, serviceItem, serviceItems]);

  return null;
}

export function RouteAnnouncer({ currentPage }) {
  const labels = {
    home: "Página de inicio cargada",
    services: "Página de servicios cargada",
    evidence: "Página de evidencias cargada",
    contract: "Página de contrato cargada",
    "not-found": "Página no encontrada cargada",
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

export function QuickFacts({ servicesCount, resultsCount, stagesCount }) {
  const idPrefix = useId();
  const facts = [
    { value: servicesCount, label: "servicios especializados" },
    { value: resultsCount, label: "imágenes de calificaciones" },
    { value: stagesCount, label: "etapas de acompañamiento" },
  ];

  return (
    <section className="quick-facts" aria-label="Tesis20 en cifras">
      <div className="quick-facts__inner">
        <dl style={{ display: "contents", margin: 0 }}>
          {facts.map((fact, index) => {
            const termId = `${idPrefix}-quick-fact-${index + 1}`;
            return (
              <div key={fact.label} style={{ display: "contents" }}>
                <dt className="sr-only" id={termId}>{fact.label}</dt>
                <dd
                  aria-labelledby={termId}
                  style={{ display: "contents", margin: 0 }}
                >
                  <article>
                    <strong>{fact.value}</strong>
                    <span aria-hidden="true">{fact.label}</span>
                  </article>
                </dd>
              </div>
            );
          })}
        </dl>
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
            <details
              key={item.question}
              name={`${id}-faq`}
              open={index === 0}
            >
              <summary
                onClick={(event) => {
                  if (event.currentTarget.parentElement?.open) return;
                  trackInteraction("faq_open", {
                    faqId: id,
                    faqIndex: index + 1,
                    page: getSafePageKey(),
                  });
                }}
              >
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

export function SafeImage({
  fallbackLabel = "Imagen no disponible",
  onError,
  onLoad,
  src,
  alt = "",
  ...props
}) {
  const hasSource = typeof src === "string" && src.trim().length > 0;
  const [status, setStatus] = useState(hasSource ? "loading" : "failed");

  useEffect(() => setStatus(hasSource ? "loading" : "failed"), [hasSource, src]);

  if (!hasSource || status === "failed") {
    return (
      <span
        className={["image-fallback", props.className].filter(Boolean).join(" ")}
        style={props.style}
        role="img"
        aria-label={fallbackLabel || alt || "Imagen no disponible"}
        data-image-state="failed"
      >
        <GraduationCap size={42} weight="light" aria-hidden="true" />
        <span>{fallbackLabel || "Imagen no disponible"}</span>
      </span>
    );
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      aria-busy={status === "loading" ? "true" : undefined}
      data-image-state={status}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("failed");
        onError?.(event);
      }}
    />
  );
}

export function ImageLightbox({
  items = [],
  index = 0,
  onChange,
  onClose,
  returnFocusRef,
  label,
}) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const swipeStartRef = useRef(null);
  const descriptionId = useId();
  const [portalRoot] = useState(getLightboxPortalRoot);
  const item = items[index];
  const hasMultiple = items.length > 1;
  const isActive = Boolean(item && portalRoot);
  const previousIndex = (index - 1 + items.length) % items.length;
  const nextIndex = (index + 1) % items.length;
  const itemLabel = getLightboxItemLabel(item, index);

  const changeItem = (nextItemIndex, direction) => {
    onChange(nextItemIndex);
    trackInteraction("lightbox_navigate", {
      direction,
      position: nextItemIndex + 1,
      total: items.length,
      page: getSafePageKey(),
    });
  };

  useEffect(() => {
    if (!isActive) return undefined;
    const previousOverflow = document.body.style.overflow;
    const backgroundNodes = [...document.body.children]
      .filter((element) => element !== portalRoot)
      .filter((element) => !["SCRIPT", "STYLE", "LINK"].includes(element.tagName));
    const previousBackgroundState = backgroundNodes.map((element) => ({
      element,
      inert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    backgroundNodes.forEach((element) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      previousBackgroundState.forEach(({ element, inert, ariaHidden }) => {
        if (!inert) element.removeAttribute("inert");
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      const trigger = returnFocusRef?.current;
      if (trigger?.isConnected) window.requestAnimationFrame(() => trigger.focus());
    };
  }, [isActive, portalRoot, returnFocusRef]);

  useEffect(() => {
    if (!item || !hasMultiple || typeof window.Image !== "function") return undefined;
    [...new Set([items[previousIndex]?.src, items[nextIndex]?.src])]
      .filter(Boolean)
      .forEach((src) => {
        const preloader = new window.Image();
        preloader.decoding = "async";
        preloader.src = src;
      });
  }, [hasMultiple, items, nextIndex, previousIndex]);

  useEffect(() => {
    if (!item) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowLeft" && hasMultiple) {
        event.preventDefault();
        onChange(previousIndex);
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        event.preventDefault();
        onChange(nextIndex);
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = [
          ...panelRef.current.querySelectorAll(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((element) => !element.hasAttribute("aria-hidden"));
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
  }, [hasMultiple, item, nextIndex, onChange, onClose, previousIndex]);

  if (!item || !portalRoot) return null;

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label || "Imagen ampliada"}
      aria-describedby={descriptionId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="image-lightbox__panel" ref={panelRef}>
        <p
          className="sr-only"
          id={descriptionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {itemLabel}. Imagen {index + 1} de {items.length}.
        </p>
        <div className="image-lightbox__toolbar">
          <div>
            <span>{label}</span>
            <strong>{index + 1} de {items.length}</strong>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar imagen ampliada">
            <X size={26} aria-hidden="true" />
          </button>
        </div>
        <div
          className="image-lightbox__media"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target.closest?.("button")) return;
            swipeStartRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
            };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerUp={(event) => {
            const start = swipeStartRef.current;
            swipeStartRef.current = null;
            if (!hasMultiple || !start || start.pointerId !== event.pointerId) return;
            const deltaX = event.clientX - start.x;
            const deltaY = event.clientY - start.y;
            const threshold = Math.max(48, event.currentTarget.clientWidth * 0.12);
            if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) {
              return;
            }
            changeItem(deltaX > 0 ? previousIndex : nextIndex, deltaX > 0 ? "previous" : "next");
          }}
          onPointerCancel={() => {
            swipeStartRef.current = null;
          }}
        >
          {hasMultiple ? (
            <button
              className="image-lightbox__nav image-lightbox__nav--previous"
              type="button"
              aria-label={`Ver imagen anterior: ${getLightboxItemLabel(items[previousIndex], previousIndex)}`}
              onClick={() => changeItem(previousIndex, "previous")}
            >
              <ArrowLeft size={25} aria-hidden="true" />
            </button>
          ) : null}
          <SafeImage
            src={item.src}
            alt={item.alt || itemLabel}
            fallbackLabel="No se pudo cargar esta evidencia"
            decoding="async"
            draggable="false"
          />
          {hasMultiple ? (
            <button
              className="image-lightbox__nav image-lightbox__nav--next"
              type="button"
              aria-label={`Ver imagen siguiente: ${getLightboxItemLabel(items[nextIndex], nextIndex)}`}
              onClick={() => changeItem(nextIndex, "next")}
            >
              <ArrowRight size={25} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    portalRoot,
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
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        trackInteraction("back_to_top_click", { page: getSafePageKey() });
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }}
    >
      <ArrowUp size={23} weight="bold" aria-hidden="true" />
    </button>
  );
}

export function ConnectionStatus({
  offlineMessage = "Sin conexión. Puedes seguir revisando el contenido ya cargado.",
}) {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      trackInteraction("connection_status", { online: true });
    };
    const handleOffline = () => {
      setOnline(false);
      trackInteraction("connection_status", { online: false });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <p
      className="connection-status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      hidden={online}
    >
      {online ? "" : offlineMessage}
    </p>
  );
}

export function MobileContactBar({ href, page }) {
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
        referrerPolicy="no-referrer"
        aria-label="Consultar por WhatsApp (se abre en una pestaña nueva)"
        onClick={() => trackInteraction("whatsapp_click", { location: "mobile_bar", page })}
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

  componentDidCatch(error, info) {
    trackInteraction("app_error", {
      errorName: error?.name || "Error",
      hasComponentStack: Boolean(info?.componentStack),
    });
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

const SAFE_TRACKING_KEYS = new Set([
  "audioId",
  "category",
  "direction",
  "errorName",
  "expanded",
  "faqId",
  "faqIndex",
  "hasComponentStack",
  "index",
  "location",
  "online",
  "page",
  "position",
  "queryLength",
  "rate",
  "results",
  "service",
  "total",
  "type",
  "variant",
]);

const PRIVATE_VALUE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d[\s().-]*){8,}/,
  /\b(?:https?:\/\/|www\.)\S+/i,
];

function sanitizeTrackingDetail(detail) {
  return Object.fromEntries(
    Object.entries(detail).flatMap(([key, value]) => {
      if (!SAFE_TRACKING_KEYS.has(key)) return [];
      if (typeof value === "boolean") return [[key, value]];
      if (typeof value === "number") {
        return Number.isFinite(value) ? [[key, value]] : [];
      }
      if (typeof value !== "string") return [];
      const normalized = value.trim().replace(/\s+/g, " ").slice(0, 96);
      if (!normalized || PRIVATE_VALUE_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return [];
      }
      return [[key, normalized]];
    }),
  );
}

export function trackInteraction(action, detail = {}) {
  const safeAction = String(action || "interaction")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .slice(0, 64) || "interaction";
  const safeDetail = sanitizeTrackingDetail(detail);
  const payload = { action: safeAction, timestamp: Date.now(), ...safeDetail };

  if (typeof window === "undefined") return payload;

  window.dispatchEvent(
    new CustomEvent("tesis20:interaction", {
      detail: payload,
    }),
  );

  try {
    const storageKey = "tesis20:session-events";
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "[]");
    const events = Array.isArray(stored) ? stored : [];
    events.push(payload);
    window.sessionStorage.setItem(storageKey, JSON.stringify(events.slice(-80)));
  } catch {
    // La navegación sigue funcionando si el almacenamiento está deshabilitado.
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: `tesis20_${safeAction}`, ...safeDetail });
  }

  return payload;
}
