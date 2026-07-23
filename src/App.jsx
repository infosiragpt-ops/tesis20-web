import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CaretRight } from "@phosphor-icons/react/CaretRight";
import { ChatCircleText } from "@phosphor-icons/react/ChatCircleText";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/ClipboardText";
import { Clock } from "@phosphor-icons/react/Clock";
import { EnvelopeSimple } from "@phosphor-icons/react/EnvelopeSimple";
import { FacebookLogo } from "@phosphor-icons/react/FacebookLogo";
import { FileText } from "@phosphor-icons/react/FileText";
import { DownloadSimple } from "@phosphor-icons/react/DownloadSimple";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { InstagramLogo } from "@phosphor-icons/react/InstagramLogo";
import { List } from "@phosphor-icons/react/List";
import { LockKey } from "@phosphor-icons/react/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import { MapPin } from "@phosphor-icons/react/MapPin";
import { Phone } from "@phosphor-icons/react/Phone";
import { Printer } from "@phosphor-icons/react/Printer";
import { SealCheck } from "@phosphor-icons/react/SealCheck";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { Star } from "@phosphor-icons/react/Star";
import { User } from "@phosphor-icons/react/User";
import { UserFocus } from "@phosphor-icons/react/UserFocus";
import { VideoCamera } from "@phosphor-icons/react/VideoCamera";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { X } from "@phosphor-icons/react/X";
import { YoutubeLogo } from "@phosphor-icons/react/YoutubeLogo";
import {
  BackToTop,
  ConnectionStatus,
  FaqSection,
  ImageLightbox,
  MobileContactBar,
  QuickFacts,
  RouteAnnouncer,
  SafeImage,
  ScrollProgress,
  SeoManager,
  trackInteraction,
} from "./platform-enhancements.jsx";
import { AudioPlayer } from "./audio-player.jsx";
import { DiagnosticWizard } from "./diagnostic-wizard.jsx";
import { PlatformSwitcher } from "./platform-switcher.jsx";
import contractTemplate from "./data/contract-template.json";
import presentationTranscript from "../audio-scripts/presentacion.txt?raw";
import articleTranscript from "../audio-scripts/articulo-cientifico.txt?raw";
import thesisOneTranscript from "../audio-scripts/tesis-i-proyecto.txt?raw";
import thesisTwoTranscript from "../audio-scripts/tesis-ii-titulacion.txt?raw";
import professionalTranscript from "../audio-scripts/suficiencia-profesional.txt?raw";
import spssTranscript from "../audio-scripts/ibm-spss-statistics.txt?raw";
import defenseTranscript from "../audio-scripts/simulacion-sustentacion.txt?raw";

const NidoPage = lazy(() => import("./nido/nido-page.jsx"));

const whatsappPhone = "51918714054";

function buildWhatsappHref(message) {
  return `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(message)}`;
}

const whatsappMessages = {
  home: "¡Hola! Deseo orientación para avanzar con mi propia tesis o proyecto junto a Tesis20.",
  services: "¡Hola! Deseo orientación para elegir el servicio adecuado para mi investigación.",
  evidence: "¡Hola! Revisé los resultados reportados por estudiantes y deseo información sobre el acompañamiento de Tesis20.",
  contract: "¡Hola! Revisé el contrato general de Tesis20 y deseo orientación antes de comenzar.",
};

function getPageFromPathname(pathname = window.location.pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const pageByPath = {
    "/": "home",
    "/index.html": "home",
    "/servicios": "services",
    "/evidencias": "evidence",
    "/contrato": "contract",
    "/nido": "nido",
  };

  if (getServiceIdFromPathname(normalizedPath)) return "services";
  return pageByPath[normalizedPath] || "not-found";
}

function getServiceIdFromPathname(pathname = window.location.pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const match = normalizedPath.match(/^\/servicios\/([a-z0-9-]+)$/);
  if (!match) return null;
  return services.some((service) => service.id === match[1]) ? match[1] : null;
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function prefetchInternalPage(href) {
  if (!href || href.startsWith("#") || href.startsWith("http")) return;
  const absoluteUrl = new URL(href, window.location.origin);
  if (absoluteUrl.origin !== window.location.origin) return;
  const selector = `link[data-prefetch-route="${absoluteUrl.pathname}"]`;
  if (document.head.querySelector(selector)) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = absoluteUrl.pathname;
  link.as = "document";
  link.dataset.prefetchRoute = absoluteUrl.pathname;
  document.head.appendChild(link);
}

function internalNavigationProps(item, currentPage) {
  const href = getNavigationHref(item, currentPage);
  if (item.external || href.startsWith("#")) return {};
  return {
    onMouseEnter: () => prefetchInternalPage(href),
    onFocus: () => prefetchInternalPage(href),
    onTouchStart: () => prefetchInternalPage(href),
  };
}

const navigation = [
  { label: "Inicio", href: "#inicio", servicesHref: "/#inicio", page: "home" },
  { label: "Servicios", href: "/servicios", page: "services" },
  {
    label: "Evidencias",
    href: "/evidencias",
    page: "evidence",
  },
  {
    label: "Pagos",
    href: "https://www.gestion.tesis20.com",
    external: true,
  },
  { label: "Contrato", href: "/contrato", page: "contract" },
];

const contractDownloadHref = "/downloads/contrato-general-asesoria-academica-tesis20.pdf";

const evidenceGroups = [
  {
    id: "caso-672",
    phone: "+51 *** *** 672",
    phoneSuffix: "672",
    publicationAuthorized: true,
    images: [
      {
        src: "/assets/evidence/case-672-payment-full.jpg",
        thumbnail: "/assets/thumbnails/evidence/case-672-payment-full.jpg",
        alt: "Captura completa y anonimizada de un pago compartido durante el proceso",
        label: "Inicio del proceso",
        width: 1994,
        height: 1662,
      },
      {
        src: "/assets/evidence/case-672-reported-result-full.jpg",
        thumbnail: "/assets/thumbnails/evidence/case-672-reported-result-full.jpg",
        alt: "Captura completa y anonimizada de estudiante que reporta una calificación de 19",
        label: "Resultado reportado",
        width: 1280,
        height: 1658,
      },
      {
        src: "/assets/evidence/case-672-grade-full.jpg",
        thumbnail: "/assets/thumbnails/evidence/case-672-grade-full.jpg",
        alt: "Captura completa y anonimizada de calificaciones con promedio final 19",
        label: "Calificación compartida",
        width: 1280,
        height: 1658,
      },
    ],
  },
  {
    id: "caso-407",
    phone: "+51 *** *** 407",
    phoneSuffix: "407",
    publicationAuthorized: true,
    images: [
      {
        src: "/assets/evidence/case-407-reported-result-full.jpg",
        thumbnail: "/assets/thumbnails/evidence/case-407-reported-result-full.jpg",
        alt: "Captura completa y anonimizada de estudiante que reporta una calificación de 17",
        label: "Resultado reportado",
        width: 1280,
        height: 1662,
      },
      {
        src: "/assets/evidence/case-407-audio-feedback-full.png",
        thumbnail: "/assets/thumbnails/evidence/case-407-audio-feedback-full.jpg",
        alt: "Captura completa y anonimizada del seguimiento por audio y un resultado académico reportado",
        label: "Seguimiento por audio",
        width: 1992,
        height: 1724,
      },
    ],
  },
  {
    id: "caso-267",
    phone: "+51 *** *** 267",
    phoneSuffix: "267",
    publicationAuthorized: true,
    images: [
      {
        src: "/assets/evidence/case-267-grade-result-full.jpg",
        thumbnail: "/assets/thumbnails/evidence/case-267-grade-result-full.jpg",
        alt: "Captura completa y anonimizada de estudiante que comparte una calificación de 17",
        label: "Calificación compartida",
        width: 1346,
        height: 1169,
      },
    ],
  },
];

const publishedEvidenceGroups = evidenceGroups.filter(
  (group) => group.publicationAuthorized === true,
);

const serviceSearchAliases = {
  "articulo-cientifico": "paper prisma revista publicacion scopus wos redalyc scielo",
  "tesis-i-proyecto": "tesis 1 tesis uno plan proyecto metodologia matriz consistencia",
  "tesis-ii-titulacion": "tesis 2 tesis dos informe resultados discusion conclusiones",
  "suficiencia-profesional": "experiencia laboral titulacion trabajo profesional informe",
  "ibm-spss-statistics": "spss estadistica estadisticas datos base analisis encuesta",
  "simulacion-sustentacion": "defensa exposicion jurado preguntas ppt diapositivas",
};

const services = [
  {
    id: "articulo-cientifico",
    title: "Artículo científico",
    price: "S/ 600",
    category: "Publicación",
    summary: "Asesoría en búsqueda, análisis y estructuración de un artículo científico.",
    audio: "/assets/audio/servicio-articulo-cientifico.mp3",
    audioDuration: 54.4,
    transcript: articleTranscript,
    Icon: FileText,
    benefits: [
      "Búsqueda avanzada: +300 artículos de WoS, Scopus, SciELO y Redalyc",
      "Análisis avanzado de 30 artículos",
      "Orientación para redactar el artículo científico bajo el modelo PRISMA",
      "Revisión de parafraseado, citación y referencias",
      "Formato en APA, Vancouver, ISO, MLA, etc.",
    ],
  },
  {
    id: "tesis-i-proyecto",
    title: "Tesis I – Proyecto",
    price: "S/ 650",
    category: "Tesis",
    summary: "Asesoría para estructurar tu proyecto de investigación desde el planteamiento inicial.",
    audio: "/assets/audio/servicio-tesis-1-proyecto.mp3",
    audioDuration: 56.4,
    transcript: thesisOneTranscript,
    Icon: ClipboardText,
    benefits: [
      "Introducción",
      "Problema general",
      "Objetivo general + objetivos específicos",
      "Hipótesis general + hipótesis específicas",
      "Marco teórico",
      "Justificación teórica, práctica y metodológica",
      "Metodología",
      "Matriz de consistencia y operacionalidad",
      "Pruebas no paramétricas",
    ],
  },
  {
    id: "tesis-ii-titulacion",
    title: "Tesis II – De titulación",
    price: "S/ 1200",
    category: "Tesis",
    summary: "Asesoría por etapas para desarrollar tu investigación hasta conclusiones y bibliografía.",
    audio: "/assets/audio/servicio-tesis-2-titulacion.mp3",
    audioDuration: 56.6,
    transcript: thesisTwoTranscript,
    Icon: GraduationCap,
    benefits: [
      "Planteamiento del título",
      "Introducción",
      "Problema general",
      "Objetivo general + objetivos específicos",
      "Marco teórico",
      "Metodología",
      "Matriz de consistencia y operacionalidad",
      "Análisis y resultados estadísticos y discusión",
      "Conclusiones y recomendaciones",
      "Materiales y presupuesto",
      "Bibliografía",
    ],
  },
  {
    id: "suficiencia-profesional",
    title: "Trabajo de suficiencia profesional",
    price: "S/ 1900",
    category: "Titulación",
    summary: "Acompañamiento completo para convertir tu experiencia en un trabajo sustentable.",
    audio: "/assets/audio/servicio-suficiencia-profesional.mp3",
    audioDuration: 55.1,
    transcript: professionalTranscript,
    Icon: UserFocus,
    benefits: [
      "Selección del título",
      "Introducción",
      "Problema general",
      "Objetivo general + objetivos específicos",
      "Hipótesis + hipótesis específicas",
      "Marco teórico",
      "Metodología",
      "Matriz de consistencia y operacionalidad",
      "Análisis y resultados estadísticos y discusión",
      "Llenado de datos en IBM SPSS",
      "Pruebas no paramétricas",
      "Conclusiones y recomendaciones",
      "Bases teóricas",
      "Validez y confiabilidad de instrumentos",
      "Bibliografía",
      "Anexos",
    ],
  },
  {
    id: "ibm-spss-statistics",
    title: "IBM SPSS Statistics",
    price: "S/ 450",
    category: "Estadística",
    summary: "Procesamiento, análisis e interpretación de datos con orientación personalizada.",
    audio: "/assets/audio/servicio-ibm-spss-statistics.mp3",
    audioDuration: 54.9,
    transcript: spssTranscript,
    Icon: MagnifyingGlass,
    benefits: [
      "Reunión para analizar su trabajo",
      "Vaciado de datos en IBM SPSS",
      "Análisis de datos en IBM SPSS",
      "Interpretación de datos",
      "Asesoría personalizada sobre su tema",
    ],
  },
  {
    id: "simulacion-sustentacion",
    title: "Simulación de sustentación",
    price: "S/ 250",
    category: "Sustentación",
    summary: "Práctica guiada, preguntas del jurado y retroalimentación para defender tu trabajo.",
    audio: "/assets/audio/servicio-simulacion-sustentacion.mp3",
    audioDuration: 50,
    transcript: defenseTranscript,
    Icon: VideoCamera,
    benefits: [
      "Subir sus PPT para la sustentación",
      "1.ª sustentación de 30 min",
      "2.ª sustentación de 30 min",
      "Balotario de 30 preguntas del jurado",
      "Retroalimentación de la sustentación",
    ],
  },
];

const gradeImages = [
  {
    image: "/assets/grade-results/grade-01-average-19.png",
    thumbnail: "/assets/thumbnails/grade-results/grade-01-average-19.jpg",
    width: 1134,
    height: 534,
    average: "19",
    partial: "20",
    final: "18",
  },
  {
    image: "/assets/grade-results/grade-02-average-17.png",
    thumbnail: "/assets/thumbnails/grade-results/grade-02-average-17.jpg",
    width: 1138,
    height: 528,
    average: "17",
    partial: "15",
    final: "18",
  },
  {
    image: "/assets/grade-results/grade-03-average-18.png",
    thumbnail: "/assets/thumbnails/grade-results/grade-03-average-18.jpg",
    width: 1140,
    height: 534,
    average: "18",
    partial: "18",
    final: "18",
  },
  {
    image: "/assets/grade-results/grade-04-average-06.png",
    thumbnail: "/assets/thumbnails/grade-results/grade-04-average-06.jpg",
    width: 1142,
    height: 528,
    average: "06",
    partial: "16",
    final: "00",
  },
  {
    image: "/assets/grade-results/grade-05-average-17.png",
    thumbnail: "/assets/thumbnails/grade-results/grade-05-average-17.jpg",
    width: 1138,
    height: 542,
    average: "17",
    partial: "18",
    final: "17",
  },
];

const GRADE_GALLERY_SIZE = 15;
const gradeResults = Array.from({ length: GRADE_GALLERY_SIZE }, (_, index) => {
  const sourceIndex = index % gradeImages.length;

  return {
    id: `resultado-${String(index + 1).padStart(2, "0")}`,
    captureNumber: sourceIndex + 1,
    ...gradeImages[sourceIndex],
  };
});

const gradeLightboxItems = gradeResults.map((result, index) => ({
  src: result.image,
  alt: `Resultado ${index + 1}: promedio ${result.average}, examen parcial ${result.partial} y examen final ${result.final}`,
}));

const trustItems = [
  {
    title: "Confidencialidad responsable",
    body: "Tratamos tu información con medidas de privacidad.",
    Icon: ShieldCheck,
  },
  {
    title: "Asesoría personalizada",
    body: "Un asesor te acompaña según tu tema y etapa.",
    Icon: User,
  },
  {
    title: "Clases en vivo",
    body: "Sesiones directas con especialistas.",
    Icon: VideoCamera,
  },
  {
    title: "Calidad cuidada",
    body: "Revisamos cada entrega según el alcance acordado.",
    Icon: SealCheck,
  },
];

const journeySteps = [
  {
    title: "Diagnóstico inicial",
    body: "Revisamos tu tema, requisitos y avance para identificar lo que necesitas.",
    Icon: MagnifyingGlass,
  },
  {
    title: "Plan de trabajo",
    body: "Diseñamos una ruta clara con etapas, entregables y un cronograma realista.",
    Icon: ClipboardText,
  },
  {
    title: "Acompañamiento por etapas",
    body: "Te orientamos con asesoría, clases en vivo y revisiones para que desarrolles y sustentes tu propio trabajo.",
    Icon: UserFocus,
  },
];

const commitmentItems = [
  {
    title: "Originalidad",
    body: "Promovemos investigación propia y buenas prácticas de citación.",
    Icon: FileText,
  },
  {
    title: "Confianza",
    body: "Tu información se trata con cuidado y confidencialidad.",
    Icon: LockKey,
  },
  {
    title: "Seguimiento continuo",
    body: "Sesiones y revisiones de acuerdo con el servicio contratado.",
    Icon: Clock,
  },
  {
    title: "Calidad",
    body: "Revisamos claridad, coherencia y formato según el alcance acordado.",
    Icon: Star,
  },
];

const homeFaqs = [
  {
    question: "¿Cómo sé qué tipo de asesoría necesito?",
    answer:
      "Primero revisamos tu tema, el formato de tu universidad y tu avance actual. Con ese diagnóstico te orientamos hacia el servicio y la ruta más adecuados.",
  },
  {
    question: "¿El acompañamiento es personalizado?",
    answer:
      "Sí. La orientación se adapta a tu tema, objetivos, metodología, cronograma y observaciones académicas.",
  },
  {
    question: "¿Pueden ayudarme con análisis estadístico?",
    answer:
      "Sí. Contamos con un servicio de IBM SPSS que incluye revisión, procesamiento, interpretación de resultados y asesoría sobre tu investigación.",
  },
  {
    question: "¿Cómo protegen mi información?",
    answer:
      "Tratamos la documentación de forma confidencial y anonimizamos las evidencias públicas para retirar nombres, códigos, fotografías y datos personales.",
  },
  {
    question: "¿Quién conserva la autoría de la investigación?",
    answer:
      "El estudiante conserva la autoría y la responsabilidad académica de su investigación. Tesis20 brinda orientación metodológica, revisión, capacitación y acompañamiento para que desarrolle su propio trabajo.",
  },
];

const servicesFaqs = [
  {
    question: "¿Los precios publicados son finales?",
    answer:
      "Son precios referenciales desde el monto indicado. El alcance exacto se confirma después de revisar tu avance, requisitos y fecha objetivo.",
  },
  {
    question: "¿Puedo solicitar solo una etapa del trabajo?",
    answer:
      "Sí. Cuéntanos qué parte necesitas y revisaremos si corresponde a un servicio completo o a un alcance personalizado.",
  },
  {
    question: "¿La orientación inicial tiene compromiso de compra?",
    answer:
      "No. Puedes escribirnos para identificar el servicio adecuado y resolver dudas antes de decidir.",
  },
  {
    question: "¿Cómo se coordinan las revisiones?",
    answer:
      "La coordinación se realiza directamente con el equipo para organizar avances, observaciones y sesiones de acompañamiento según el servicio elegido.",
  },
];

const nidoFaqs = [
  {
    question: "¿Los precios son definitivos?",
    answer:
      "No. Los importes visibles después de iniciar la demostración son referenciales y no permiten reservar ni pagar.",
  },
  {
    question: "¿Este inicio de sesión ya es real?",
    answer:
      "No. Es una vista local de producto. La versión final requerirá autenticación segura y roles asignados desde el servidor.",
  },
  {
    question: "¿Qué perfiles tendrá la plataforma?",
    answer:
      "Administrador, Docente y Alumno, cada uno con una experiencia y permisos propios.",
  },
];

const noFaqs = [];

function WhatsappButton({ children, className = "", dark = false, message, location }) {
  const page = getPageFromPathname();
  const href = buildWhatsappHref(message || whatsappMessages[page] || whatsappMessages.home);

  return (
    <a
      className={`whatsapp-button ${dark ? "whatsapp-button--dark" : ""} ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      aria-label={`${children} por WhatsApp (se abre en una pestaña nueva)`}
      onClick={() =>
        trackInteraction("whatsapp_click", {
          location: location || className || "content",
          page,
        })
      }
    >
      <WhatsappLogo size={24} weight="fill" aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

function getNavigationHref(item, currentPage) {
  if (currentPage !== "home" && item.servicesHref) return item.servicesHref;
  return item.href;
}

function Header({ menuOpen, onMenuToggle, onNavigate, currentPage, isScrolled }) {
  const menuButtonRef = useRef(null);
  const firstMobileLinkRef = useRef(null);
  const mobileNavigationRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onMenuToggle();
        return;
      }

      if (event.key === "Tab" && mobileNavigationRef.current) {
        const focusable = [
          menuButtonRef.current,
          ...mobileNavigationRef.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter(Boolean);
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

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => firstMobileLinkRef.current?.focus());

    return () => {
      const shouldRestoreFocus = Boolean(
        mobileNavigationRef.current?.contains(document.activeElement),
      );
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (shouldRestoreFocus) {
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };
  }, [menuOpen, onMenuToggle]);

  return (
    <header className={`site-header ${isScrolled ? "site-header--scrolled" : ""}`}>
      <div className="header-inner">
        <div className="brand-ecosystem">
          <PlatformSwitcher
            menuOpen={menuOpen}
            onCloseMenu={onNavigate}
            currentPlatform="tesis"
          />
          <a
            className="brand"
            href={currentPage === "home" ? "#inicio" : "/#inicio"}
            aria-label="Tesis20 - Inicio"
            onClick={onNavigate}
          >
            <img
              src="/assets/tesis20-logo.png"
              alt="Tesis20"
              width="300"
              height="300"
              decoding="async"
              fetchPriority="high"
            />
          </a>
        </div>

        <nav className="desktop-navigation" aria-label="Navegación principal">
          {navigation.map((item) => (
            <a
              className={item.page === currentPage ? "nav-link nav-link--active" : "nav-link"}
              href={getNavigationHref(item, currentPage)}
              key={item.label}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-current={item.page === currentPage ? "page" : undefined}
              aria-label={item.external ? `${item.label} (se abre en una pestaña nueva)` : undefined}
              referrerPolicy={item.external ? "no-referrer" : undefined}
              onClick={() => trackInteraction("navigation_click", { page: item.page || "external", location: "desktop" })}
              {...internalNavigationProps(item, currentPage)}
            >
              {item.label}
              {item.external ? <ArrowSquareOut size={14} aria-hidden="true" /> : null}
            </a>
          ))}
        </nav>

        <WhatsappButton className="header-cta">Quiero orientación</WhatsappButton>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={onMenuToggle}
          ref={menuButtonRef}
        >
          {menuOpen ? <X size={28} aria-hidden="true" /> : <List size={30} aria-hidden="true" />}
        </button>
      </div>

      <button
        className={`mobile-navigation__backdrop ${menuOpen ? "mobile-navigation__backdrop--visible" : ""}`}
        type="button"
        aria-label="Cerrar menú"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={onNavigate}
      />

      <nav
        className={`mobile-navigation ${menuOpen ? "mobile-navigation--open" : ""}`}
        id="mobile-navigation"
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
        ref={mobileNavigationRef}
      >
        <div className="mobile-navigation__inner">
          {navigation.map((item, index) => (
            <a
              href={getNavigationHref(item, currentPage)}
              key={item.label}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={onNavigate}
              ref={index === 0 ? firstMobileLinkRef : undefined}
              aria-current={item.page === currentPage ? "page" : undefined}
              aria-label={item.external ? `${item.label} (se abre en una pestaña nueva)` : undefined}
              referrerPolicy={item.external ? "no-referrer" : undefined}
              {...internalNavigationProps(item, currentPage)}
            >
              <span>{item.label}</span>
              {item.external ? (
                <ArrowSquareOut size={18} aria-hidden="true" />
              ) : (
                <CaretRight size={18} aria-hidden="true" />
              )}
            </a>
          ))}
          <WhatsappButton className="mobile-navigation__cta">Quiero orientación</WhatsappButton>
        </div>
      </nav>
    </header>
  );
}

function SectionHeading({ eyebrow, children, align = "center", id }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{children}</h2>
      <span className="section-heading__mark" aria-hidden="true" />
    </div>
  );
}

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!hero || !finePointer.matches || reducedMotion.matches) return undefined;

    let frameId = 0;

    const handlePointerMove = (event) => {
      if (frameId) return;

      const { clientX, clientY } = event;
      frameId = window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((clientY - rect.top) / rect.height - 0.5) * 2;

        hero.style.setProperty("--hero-shift-x", `${x * 18}px`);
        hero.style.setProperty("--hero-shift-y", `${y * 12}px`);
        frameId = 0;
      });
    };

    const resetPointer = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      hero.style.setProperty("--hero-shift-x", "0px");
      hero.style.setProperty("--hero-shift-y", "0px");
    };

    const handleWindowPointerMove = (event) => {
      if (!hero.contains(event.target)) resetPointer();
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);
    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    window.addEventListener("scroll", resetPointer, { passive: true });
    window.addEventListener("blur", resetPointer);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("scroll", resetPointer);
      window.removeEventListener("blur", resetPointer);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="hero" id="inicio" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">Bienvenido a Tesis20</p>
          <h1 id="hero-title">
            <span>Asesoría y acompañamiento</span>
            {" "}
            <span>para tu tesis</span>
          </h1>
          <p className="hero-intro">
            Te guiamos paso a paso para que desarrolles tu investigación con una ruta
            clara, manteniendo tu autoría y responsabilidad académica.
          </p>
          <div className="hero-actions">
            <WhatsappButton>Quiero orientación</WhatsappButton>
            <a className="text-link" href="#metodo">
              <span>Conoce cómo funciona</span>
              <ArrowRight size={19} aria-hidden="true" />
            </a>
          </div>
          <ul className="hero-proof-points" aria-label="Beneficios del acompañamiento">
            <li>
              <CheckCircle size={18} weight="fill" aria-hidden="true" />
              <span>Diagnóstico inicial</span>
            </li>
            <li>
              <CheckCircle size={18} weight="fill" aria-hidden="true" />
              <span>Plan por etapas</span>
            </li>
            <li>
              <CheckCircle size={18} weight="fill" aria-hidden="true" />
              <span>Seguimiento continuo</span>
            </li>
          </ul>
        </div>

        <div
          className="hero-visual"
          role="group"
          aria-label="Estudiantes avanzando con apoyo de Tesis20"
        >
          <SafeImage
            className="hero-students"
            src="/assets/hero-students.png"
            srcSet="/assets/hero-students.avif 800w"
            alt="Grupo de estudiantes universitarios"
            width="800"
            height="999"
            decoding="async"
            fetchPriority="high"
            sizes="(max-width: 930px) 92vw, 46vw"
            draggable="false"
          />
          <div className="hero-journey" role="list" aria-label="Ruta de acompañamiento">
            <div className="hero-journey__item" role="listitem">
              <span className="hero-journey__number">1</span>
              <MagnifyingGlass size={29} aria-hidden="true" />
              <div>
                <strong>Diagnóstico</strong>
                <span>Entendemos tu tema y objetivos.</span>
              </div>
            </div>
            <div className="hero-journey__item" role="listitem">
              <span className="hero-journey__number">2</span>
              <ClipboardText size={29} aria-hidden="true" />
              <div>
                <strong>Plan</strong>
                <span>Trazamos tu ruta y cronograma.</span>
              </div>
            </div>
            <div className="hero-journey__item" role="listitem">
              <span className="hero-journey__number">3</span>
              <UserFocus size={29} aria-hidden="true" />
              <div>
                <strong>Acompañamiento</strong>
                <span>Te preparamos para sustentar tu propio trabajo.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Compromisos principales">
      <div className="trust-strip__inner">
        {trustItems.map(({ title, body, Icon }) => (
          <article className="trust-item" key={title}>
            <Icon size={38} weight="light" aria-hidden="true" />
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MethodSection() {
  return (
    <section className="method-section" id="metodo" aria-labelledby="metodo-title">
      <div className="section-shell">
        <SectionHeading eyebrow="Ruta clara en tres etapas" id="metodo-title">
          Así avanzamos contigo
        </SectionHeading>
        <div className="journey-grid" role="list" aria-label="Tres etapas del acompañamiento">
          {journeySteps.map(({ title, body, Icon }, index) => (
            <div className="journey-grid__group" key={title} role="listitem">
              <article className="journey-step">
                <span className="journey-step__number">{index + 1}</span>
                <span className="journey-step__icon">
                  <Icon size={58} weight="light" aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
              {index < journeySteps.length - 1 ? (
                <span className="journey-arrow" aria-hidden="true">
                  <ArrowRight size={34} weight="light" />
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const [selectedResult, setSelectedResult] = useState(null);
  const resultTriggerRef = useRef(null);
  const closeResult = useCallback(() => setSelectedResult(null), []);

  return (
    <>
      <section className="proof-section" id="resultados" aria-labelledby="resultados-title">
        <div className="proof-section__inner">
          <div className="results-proof">
            <div className="results-proof__header">
              <h2 id="resultados-title">Resultados reportados por estudiantes</h2>
              <p className="results-proof__disclaimer">
                Galería de 15 imágenes organizada con 5 capturas anonimizadas de casos
                individuales. Los resultados fueron reportados por estudiantes y no
                constituyen una garantía de resultados futuros; cada experiencia depende
                de su desempeño y participación.
              </p>
            </div>
            <div
              className="results-grid"
              role="list"
              aria-label={`Galería de ${GRADE_GALLERY_SIZE} imágenes de resultados académicos`}
            >
              {gradeResults.map((result, index) => (
                <figure
                  className="result-photo"
                  key={result.id}
                  role="listitem"
                  aria-posinset={index + 1}
                  aria-setsize={GRADE_GALLERY_SIZE}
                >
                  <button
                    className="result-photo__button"
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`Ampliar imagen ${index + 1} de ${GRADE_GALLERY_SIZE}, captura ${result.captureNumber}: promedio ${result.average}, examen parcial ${result.partial} y examen final ${result.final}`}
                    onClick={(event) => {
                      resultTriggerRef.current = event.currentTarget;
                      trackInteraction("grade_evidence_open", { index: index + 1 });
                      setSelectedResult(index);
                    }}
                  >
                    <SafeImage
                      src={result.thumbnail}
                      alt={`Imagen ${index + 1} de ${GRADE_GALLERY_SIZE}, captura ${result.captureNumber}: promedio ${result.average}, examen parcial ${result.partial} y examen final ${result.final}`}
                      width={result.width}
                      height={result.height}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 720px) 92vw, 46vw"
                      draggable="false"
                    />
                  </button>
                  <figcaption className="sr-only">
                    Imagen {index + 1} de {GRADE_GALLERY_SIZE}, correspondiente a la captura{" "}
                    {result.captureNumber}: promedio {result.average}, parcial {result.partial} y
                    final {result.final}. Pulsa para ver la imagen completa.
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedResult !== null ? (
        <ImageLightbox
          items={gradeLightboxItems}
          index={selectedResult}
          onChange={setSelectedResult}
          onClose={closeResult}
          returnFocusRef={resultTriggerRef}
          label="Resultados reportados por estudiantes"
        />
      ) : null}
    </>
  );
}

function AudioIntroduction() {
  return (
    <section className="audio-introduction" aria-labelledby="audio-introduction-title">
      <div className="section-shell audio-introduction__inner">
        <div className="audio-introduction__copy">
          <p>Presentación en audio</p>
          <h2 id="audio-introduction-title">Escucha cómo te acompañamos</h2>
          <span>
            Conoce el enfoque de Tesis20 y la orientación que brindamos durante tu
            proceso académico.
          </span>
        </div>
        <AudioPlayer
          src="/assets/audio/tesis20-presentacion.mp3"
          title="Presentación de Tesis20"
          variant="featured"
          durationHint={60.3}
          transcript={presentationTranscript}
        />
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="support-section" id="clases" aria-labelledby="support-title">
      <div className="section-shell support-grid">
        <div className="support-photo-wrap">
          <SafeImage
            className="support-photo"
            src="/assets/support-session.jpg"
            alt="Estudiante recibiendo asesoría personalizada para su tesis"
            width="1511"
            height="1041"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 760px) 92vw, 48vw"
            draggable="false"
          />
        </div>
        <div className="support-copy">
          <SectionHeading align="left" eyebrow="Acompañamiento humano" id="support-title">
            Clases en vivo y feedback constante
          </SectionHeading>
          <p>
            No estás solo. Nuestro equipo te acompaña con clases en directo, revisión de avances
            y retroalimentación clara para que sigas progresando con seguridad.
          </p>
          <ul>
            <li>
              <CheckCircle size={22} weight="fill" aria-hidden="true" />
              <span>Sesiones en vivo con profesores especialistas.</span>
            </li>
            <li>
              <CheckCircle size={22} weight="fill" aria-hidden="true" />
              <span>Retroalimentación personalizada en cada etapa.</span>
            </li>
            <li>
              <CheckCircle size={22} weight="fill" aria-hidden="true" />
              <span>Resolución de dudas de forma directa y oportuna.</span>
            </li>
          </ul>
          <WhatsappButton className="support-copy__cta" dark>
            Consultar mi caso
          </WhatsappButton>
        </div>
      </div>
    </section>
  );
}

function CommitmentSection() {
  return (
    <section className="commitment-section" aria-labelledby="commitment-title">
      <div className="section-shell">
        <SectionHeading id="commitment-title">Nuestro compromiso contigo</SectionHeading>
        <div className="commitment-grid">
          {commitmentItems.map(({ title, body, Icon }) => (
            <article className="commitment-item" key={title}>
              <span className="commitment-item__icon">
                <Icon size={40} weight="light" aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__inner">
        <GraduationCap size={74} weight="light" aria-hidden="true" />
        <div className="final-cta__title">
          <h2 id="final-cta-title">¿Listo para avanzar con tu propia investigación?</h2>
        </div>
        <p>Cuéntanos en qué etapa estás y recibe orientación personalizada por WhatsApp.</p>
        <WhatsappButton>Quiero orientación</WhatsappButton>
      </div>
    </section>
  );
}

function serviceWhatsappHref(service) {
  const message = `¡Hola! Deseo más información sobre el servicio ${service.title}, desde ${service.price}.`;
  return buildWhatsappHref(message);
}

function ServiceCard({ service, index, expandedByDefault = false, showDetailLink = true }) {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const Icon = service.Icon;
  const initialBenefits = 4;
  const hasMoreBenefits = service.benefits.length > initialBenefits;
  const visibleBenefits = expanded
    ? service.benefits
    : service.benefits.slice(0, initialBenefits);

  return (
    <article
      className="service-card"
      id={service.id}
      data-category={service.category}
      aria-labelledby={`${service.id}-title`}
      itemScope
      itemType="https://schema.org/Service"
    >
      <div className="service-card__header">
        <span className="service-card__icon" aria-hidden="true">
          <Icon size={34} weight="light" />
        </span>
        <div className="service-card__heading">
          <span>
            Servicio {String(index + 1).padStart(2, "0")} · {service.category}
          </span>
          <h3 id={`${service.id}-title`} itemProp="name">{service.title}</h3>
        </div>
        <p className="service-card__price" aria-label={`Precio referencial desde ${service.price}`}>
          <span>Desde</span>
          <strong>{service.price}</strong>
          <small>alcance a confirmar</small>
        </p>
      </div>

      <div className="service-card__body">
        <p className="service-card__summary" itemProp="description">{service.summary}</p>
        <meta itemProp="areaServed" content="Perú" />
        <meta itemProp="serviceType" content={service.category} />
        <div className="service-card__includes">
          <span>Este servicio incluye</span>
          <strong>{service.benefits.length} puntos</strong>
        </div>
        <ul id={`${service.id}-beneficios`}>
          {visibleBenefits.map((benefit) => (
            <li key={benefit}>
              <CheckCircle size={20} weight="bold" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {hasMoreBenefits ? (
          <button
            className={`service-card__toggle ${expanded ? "service-card__toggle--open" : ""}`}
            type="button"
            aria-expanded={expanded}
            aria-controls={`${service.id}-beneficios`}
            onClick={() =>
              setExpanded((current) => {
                const nextExpanded = !current;
                trackInteraction("service_details_toggle", {
                  service: service.id,
                  expanded: nextExpanded,
                });
                return nextExpanded;
              })
            }
          >
            <span>
              {expanded
                ? "Mostrar menos"
                : `Ver ${service.benefits.length - initialBenefits} detalles más`}
            </span>
            <CaretRight size={18} weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <span className="service-card__toggle-spacer" aria-hidden="true" />
        )}

        {service.audio ? (
          <AudioPlayer
            src={service.audio}
            title={service.title}
            durationHint={service.audioDuration}
            transcript={service.transcript}
          />
        ) : null}

        <div className="service-card__trust-links" aria-label={`Información adicional sobre ${service.title}`}>
          {showDetailLink ? (
            <a href={`/servicios/${service.id}`}>Ver servicio completo</a>
          ) : null}
          <a href="/evidencias">Ver evidencias</a>
          <a href="/contrato">Leer condiciones</a>
        </div>

        <a
          className="service-card__cta"
          href={serviceWhatsappHref(service)}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          aria-label={`Consultar ${service.title} por WhatsApp (se abre en una pestaña nueva)`}
          onClick={() => trackInteraction("service_whatsapp_click", { service: service.id })}
        >
          <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
          <span>Consultar {service.title}</span>
        </a>
        <p className="service-card__price-note">Precio referencial sujeto a revisión del alcance.</p>
      </div>
    </article>
  );
}

function ServiceDetailPage({ service }) {
  const Icon = service.Icon;
  const relatedServices = services.filter((item) => item.id !== service.id);
  const whatsappMessage = `¡Hola! Revisé el servicio ${service.title}, desde ${service.price}, y deseo una orientación para confirmar el alcance de mi caso.`;

  return (
    <main className="services-page service-detail" id="main-content" tabIndex="-1">
      <section className="services-hero" aria-labelledby="service-detail-title">
        <div className="services-hero__inner">
          <div className="services-hero__copy">
            <p className="services-hero__eyebrow">
              <a href="/servicios">Servicios</a> · {service.category}
            </p>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>{service.summary}</p>
            <a className="services-hero__cta" href="#alcance-servicio">
              <span>Revisar alcance</span>
              <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </a>
            <ul className="services-hero__assurances" aria-label="Condiciones principales del servicio">
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Tu autoría se mantiene</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Alcance a confirmar</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Orientación personalizada</li>
            </ul>
          </div>

          <aside className="services-hero__guide" aria-label={`Precio y orientación para ${service.title}`}>
            <span className="services-hero__guide-icon" aria-hidden="true">
              <Icon size={36} weight="light" />
            </span>
            <p>Precio referencial</p>
            <h2>Desde {service.price}</h2>
            <span>
              Revisamos tu avance, requisitos y fecha objetivo antes de confirmar el alcance,
              cronograma y precio final.
            </span>
            <WhatsappButton
              dark
              location={`service_detail_hero_${service.id}`}
              message={whatsappMessage}
            >
              Consultar este servicio
            </WhatsappButton>
          </aside>
        </div>
      </section>

      <section
        className="services-catalog"
        id="alcance-servicio"
        aria-labelledby="service-scope-title"
      >
        <div className="services-catalog__inner">
          <div className="services-catalog__heading">
            <p>Alcance del acompañamiento</p>
            <h2 id="service-scope-title">Qué incluye {service.title}</h2>
            <span>
              Revisa los componentes previstos. La propuesta final se adapta a tu avance y
              requisitos; tú conservas la autoría y responsabilidad académica de tu trabajo.
            </span>
          </div>
          <div className="services-grid service-detail__scope">
            <ServiceCard
              service={service}
              index={services.findIndex((item) => item.id === service.id)}
              expandedByDefault
              showDetailLink={false}
            />
          </div>
        </div>
      </section>

      <section className="service-process" aria-labelledby="service-integrity-title">
        <div className="section-shell">
          <SectionHeading eyebrow="Acompañamiento responsable" id="service-integrity-title">
            Tu autoría e integridad primero
          </SectionHeading>
          <div className="service-process__grid" role="list" aria-label="Principios del servicio">
            <article role="listitem">
              <span>01</span>
              <h3>Tu investigación</h3>
              <p>
                Tú tomas las decisiones académicas y conservas la autoría y responsabilidad
                sobre el contenido presentado a tu institución.
              </p>
            </article>
            <article role="listitem">
              <span>02</span>
              <h3>Datos auténticos</h3>
              <p>
                Trabajamos con la información que proporcionas y no fabricamos datos,
                fuentes, resultados ni evidencias académicas.
              </p>
            </article>
            <article role="listitem">
              <span>03</span>
              <h3>Alcance transparente</h3>
              <p>
                Acordamos entregables, revisiones, sesiones y cronograma antes de iniciar,
                sin prometer calificaciones ni resultados institucionales.
              </p>
            </article>
          </div>
        </div>
      </section>

      <nav className="service-detail__related" aria-labelledby="related-services-title">
        <div className="section-shell">
          <SectionHeading eyebrow="También puedes revisar" id="related-services-title">
            Otros servicios académicos
          </SectionHeading>
          <div className="service-detail__related-links">
            <a href="/servicios">Volver al catálogo</a>
            {relatedServices.map((item) => (
              <a href={`/servicios/${item.id}`} key={item.id}>{item.title}</a>
            ))}
          </div>
        </div>
      </nav>
    </main>
  );
}

function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const lastEvidenceTriggerRef = useRef(null);
  const evidenceItems = useMemo(
    () =>
      publishedEvidenceGroups.flatMap((group, groupIndex) =>
        group.images.map((image, imageIndex) => ({
          src: image.src,
          alt: image.alt,
          title: `Caso ${groupIndex + 1} · ${image.label}`,
          context: `Paso ${imageIndex + 1} de ${group.images.length} · número terminado en ${group.phoneSuffix}`,
        })),
      ),
    [],
  );
  const closeEvidence = useCallback(() => setSelectedEvidence(null), []);

  const openEvidence = (image, trigger) => {
    lastEvidenceTriggerRef.current = trigger;
    trackInteraction("evidence_open", { type: image.label });
    setSelectedEvidence(evidenceItems.findIndex((item) => item.src === image.src));
  };

  return (
    <main className="evidence-page" id="main-content" tabIndex="-1">
      <section className="evidence-hero" aria-labelledby="evidence-page-title">
        <div className="evidence-hero__inner">
          <div className="evidence-hero__copy">
            <p>Casos compartidos por estudiantes</p>
            <h1 id="evidence-page-title">Evidencias de acompañamiento y resultados reportados</h1>
            <span>
              Organizamos cada caso por estudiante y mostramos sus capturas completas con
              datos anonimizados. Son experiencias individuales y no garantizan resultados futuros.
            </span>
            <ul className="evidence-hero__facts" aria-label="Resumen de evidencias">
              <li><strong>{publishedEvidenceGroups.length}</strong><span>casos agrupados</span></li>
              <li><strong>{evidenceItems.length}</strong><span>capturas completas</span></li>
              <li><ShieldCheck size={22} weight="fill" aria-hidden="true" /><span>datos protegidos</span></li>
            </ul>
          </div>

          <aside className="evidence-privacy" id="privacidad" aria-label="Protección de datos personales">
            <span className="evidence-privacy__icon" aria-hidden="true">
              <ShieldCheck size={38} weight="light" />
            </span>
            <div>
              <p>Privacidad protegida</p>
              <h2>Datos personales anonimizados</h2>
              <span>
                Números, fotografías, nombres, códigos y conversaciones privadas fueron
                retirados de las copias públicas.
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="evidence-catalog" aria-labelledby="evidence-catalog-title">
        <div className="evidence-catalog__inner">
          <div className="evidence-catalog__heading">
            <p>Casos agrupados</p>
            <h2 id="evidence-catalog-title">Casos de acompañamiento y resultados reportados</h2>
            <span>
              Explora cada caso como una secuencia del proceso. Las capturas de un mismo
              grupo pertenecen al mismo estudiante y preservan su identidad. El resultado
              depende del trabajo, las decisiones y la participación de cada persona.
            </span>
          </div>

          <div className="evidence-groups">
            {publishedEvidenceGroups.map((group, groupIndex) => (
              <article className="evidence-group" key={group.id}>
                <header className="evidence-group__header">
                  <div>
                    <span>Evidencia {String(groupIndex + 1).padStart(2, "0")}</span>
                    <h3>
                      <span aria-hidden="true">{group.phone}</span>
                      <span className="sr-only">
                        Número terminado en {group.phoneSuffix}; los dígitos anteriores están protegidos
                      </span>
                    </h3>
                  </div>
                  <p>
                    <ShieldCheck size={18} weight="fill" aria-hidden="true" />
                    <span>Identidad protegida · {group.images.length} {group.images.length === 1 ? "captura" : "capturas"}</span>
                  </p>
                </header>

                <div
                  className={`evidence-gallery evidence-gallery--${group.images.length}`}
                  role="list"
                  aria-label={`Secuencia del caso ${groupIndex + 1}`}
                >
                  {group.images.map((image, imageIndex) => (
                    <figure className="evidence-item" key={image.src} role="listitem">
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        aria-label={`Ampliar paso ${imageIndex + 1} de ${group.images.length}: ${image.label.toLowerCase()} del caso ${groupIndex + 1}`}
                        onClick={(event) => openEvidence(image, event.currentTarget)}
                      >
                        <SafeImage
                          src={image.thumbnail}
                          alt={image.alt}
                          width={image.width}
                          height={image.height}
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 720px) 92vw, 46vw"
                          draggable="false"
                        />
                      </button>
                      <figcaption>
                        <span>{String(imageIndex + 1).padStart(2, "0")}</span>
                        <strong>{image.label}</strong>
                        <small>Paso {imageIndex + 1} de {group.images.length}</small>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />

      {selectedEvidence !== null ? (
        <ImageLightbox
          items={evidenceItems}
          index={selectedEvidence}
          onChange={setSelectedEvidence}
          onClose={closeEvidence}
          returnFocusRef={lastEvidenceTriggerRef}
          label="Evidencias anonimizadas"
        />
      ) : null}
    </main>
  );
}

function ServicesPage() {
  const searchInputRef = useRef(null);
  const categoryRefs = useRef([]);
  const [serviceQuery, setServiceQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || "",
  );
  const [activeCategory, setActiveCategory] = useState(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("categoria");
    return services.some((service) => service.category === requestedCategory)
      ? requestedCategory
      : "Todos";
  });
  const [announcedCount, setAnnouncedCount] = useState(services.length);
  const categories = useMemo(
    () => ["Todos", ...new Set(services.map((service) => service.category))],
    [],
  );
  const filteredServices = useMemo(() => {
    const normalizedQuery = normalizeSearchText(serviceQuery.trim());
    return services.filter((service) => {
      const matchesCategory = activeCategory === "Todos" || service.category === activeCategory;
      const searchableText = normalizeSearchText(
        [
          service.title,
          service.category,
          service.summary,
          serviceSearchAliases[service.id] || "",
          ...service.benefits,
        ].join(" "),
      );
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeCategory, serviceQuery]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category,
          category === "Todos"
            ? services.length
            : services.filter((service) => service.category === category).length,
        ]),
      ),
    [categories],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (serviceQuery.trim()) url.searchParams.set("q", serviceQuery.trim());
    else url.searchParams.delete("q");
    if (activeCategory !== "Todos") url.searchParams.set("categoria", activeCategory);
    else url.searchParams.delete("categoria");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activeCategory, serviceQuery]);

  useEffect(() => {
    const restoreFilters = () => {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("categoria");
      setServiceQuery(params.get("q") || "");
      setActiveCategory(
        services.some((service) => service.category === nextCategory)
          ? nextCategory
          : "Todos",
      );
    };
    window.addEventListener("popstate", restoreFilters);
    return () => window.removeEventListener("popstate", restoreFilters);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setAnnouncedCount(filteredServices.length),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [filteredServices.length]);

  useEffect(() => {
    const focusSearch = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackInteraction("service_filter", {
        category: activeCategory,
        queryLength: serviceQuery.trim().length,
        results: filteredServices.length,
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [activeCategory, filteredServices.length, serviceQuery]);

  const resetFilters = () => {
    setServiceQuery("");
    setActiveCategory("Todos");
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const selectCategory = (category, { addHistory = true } = {}) => {
    setActiveCategory(category);
    if (addHistory) {
      const url = new URL(window.location.href);
      if (category === "Todos") url.searchParams.delete("categoria");
      else url.searchParams.set("categoria", category);
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const handleCategoryKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % categories.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + categories.length) % categories.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = categories.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    selectCategory(categories[nextIndex]);
    categoryRefs.current[nextIndex]?.focus();
    categoryRefs.current[nextIndex]?.scrollIntoView({ inline: "center", block: "nearest" });
  };

  return (
    <main className="services-page" id="main-content" tabIndex="-1">
      <section className="services-hero" id="servicios-inicio" aria-labelledby="services-page-title">
        <div className="services-hero__inner">
          <div className="services-hero__copy">
            <p className="services-hero__eyebrow">Servicios académicos</p>
            <h1 id="services-page-title">Elige el acompañamiento que necesitas</h1>
            <p>
              Encuentra asesoría profesional para desarrollar tu investigación, analizar tus
              resultados y prepararte para la sustentación con una ruta clara.
            </p>
            <a className="services-hero__cta" href="#catalogo-servicios">
              <span>Explorar servicios</span>
              <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </a>
            <ul className="services-hero__assurances" aria-label="Ventajas de la orientación">
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Revisión inicial</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Alcance claro</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Atención personalizada</li>
            </ul>
          </div>

          <aside className="services-hero__guide" aria-label="Orientación para elegir un servicio">
            <span className="services-hero__guide-icon" aria-hidden="true">
              <ChatCircleText size={36} weight="light" />
            </span>
            <p>¿No sabes cuál elegir?</p>
            <h2>Revisamos tu avance y te orientamos</h2>
            <span>
              Cuéntanos en qué etapa estás para ayudarte a identificar el servicio adecuado.
            </span>
            <WhatsappButton dark>Quiero orientación</WhatsappButton>
          </aside>
        </div>
      </section>

      <section className="services-catalog" id="catalogo-servicios" aria-labelledby="services-catalog-title">
        <div className="services-catalog__inner">
          <div className="services-catalog__heading">
            <p>Nuestros servicios</p>
            <h2 id="services-catalog-title">Soluciones para cada etapa de tu investigación</h2>
            <span>
              Revisa lo que incluye cada servicio y solicita información directamente por WhatsApp.
            </span>
          </div>

          <form
            className="service-finder"
            role="search"
            aria-labelledby="service-finder-title"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="service-finder__search">
              <label id="service-finder-title" htmlFor="service-search">Buscar por necesidad</label>
              <span className="service-finder__input">
                <MagnifyingGlass size={20} aria-hidden="true" />
                <input
                  id="service-search"
                  ref={searchInputRef}
                  type="search"
                  value={serviceQuery}
                  onChange={(event) => setServiceQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && serviceQuery) {
                      event.preventDefault();
                      setServiceQuery("");
                    }
                  }}
                  placeholder="Ej.: SPSS, metodología, sustentación"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  enterKeyHint="search"
                  maxLength="80"
                  aria-keyshortcuts="/"
                  aria-controls="services-grid"
                  aria-describedby="service-finder-help"
                />
                {serviceQuery ? (
                  <button
                    className="service-finder__clear"
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                      setServiceQuery("");
                      searchInputRef.current?.focus();
                    }}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            </div>
            <p className="sr-only" id="service-finder-help">
              Escribe una necesidad o presiona la tecla diagonal para enfocar este buscador.
            </p>
            <div
              className="service-finder__categories"
              role="group"
              aria-labelledby="service-categories-title"
            >
              <span className="sr-only" id="service-categories-title">Filtrar por categoría</span>
              {categories.map((category, index) => (
                <button
                  type="button"
                  key={category}
                  ref={(element) => {
                    categoryRefs.current[index] = element;
                  }}
                  aria-pressed={activeCategory === category}
                  aria-controls="services-grid"
                  aria-label={`${category}: ${categoryCounts[category]} ${categoryCounts[category] === 1 ? "servicio" : "servicios"}`}
                  onClick={() => selectCategory(category)}
                  onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                >
                  {category}
                </button>
              ))}
            </div>
            <p
              className="service-finder__count"
              id="service-finder-count"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {announcedCount} {announcedCount === 1 ? "servicio disponible" : "servicios disponibles"}
            </p>
          </form>

          {filteredServices.length ? (
            <div className="services-grid" id="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  service={service}
                  index={services.findIndex((item) => item.id === service.id)}
                  key={service.id}
                />
              ))}
            </div>
          ) : (
            <div className="service-empty" id="services-grid">
              <MagnifyingGlass size={36} weight="light" aria-hidden="true" />
              <div role="status" aria-live="polite">
                <h3>No encontramos un servicio con esos filtros</h3>
                <p>Prueba con otra palabra o vuelve a ver el catálogo completo.</p>
              </div>
              <div className="service-empty__actions">
                <button type="button" onClick={resetFilters}>Ver todos los servicios</button>
                <WhatsappButton
                  dark
                  className="service-empty__cta"
                  location="service_empty"
                  message="¡Hola! No encontré el servicio que necesito y deseo orientación personalizada."
                >
                  Consultar mi caso
                </WhatsappButton>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="service-process" aria-labelledby="service-process-title">
        <div className="section-shell">
          <SectionHeading eyebrow="Antes de comenzar" id="service-process-title">
            Una decisión clara en tres pasos
          </SectionHeading>
          <div className="service-process__grid" role="list" aria-label="Proceso de orientación">
            <article role="listitem">
              <span>01</span>
              <h3>Cuéntanos tu avance</h3>
              <p>Comparte tu etapa, requisitos y principales dudas.</p>
            </article>
            <article role="listitem">
              <span>02</span>
              <h3>Revisamos el alcance</h3>
              <p>Identificamos el servicio y los puntos que realmente necesitas.</p>
            </article>
            <article role="listitem">
              <span>03</span>
              <h3>Definimos la ruta</h3>
              <p>Recibes una orientación clara antes de iniciar el acompañamiento.</p>
            </article>
          </div>
        </div>
      </section>

      <TrustStrip />
      <FaqSection
        id="preguntas-servicios"
        title="Todo claro antes de elegir"
        items={servicesFaqs}
      />
      <FinalCta />
    </main>
  );
}

function ContractPage() {
  const handlePrint = () => {
    trackInteraction("contract_print", { location: "contract_page" });
    window.print();
  };

  return (
    <main className="contract-page" id="main-content" tabIndex="-1">
      <section className="contract-hero" aria-labelledby="contract-page-title">
        <div className="contract-hero__inner">
          <div className="contract-hero__copy">
            <h1 id="contract-page-title">Contrato general de asesoría académica</h1>
            <p>
              Conoce por anticipado el alcance, las responsabilidades, los pagos y la
              protección de tu información. Puedes leer el modelo completo aquí o descargarlo
              en PDF para revisarlo con calma.
            </p>
            <div className="contract-hero__actions">
              <a
                className="contract-button contract-button--primary"
                href={contractDownloadHref}
                download="contrato-general-asesoria-academica-tesis20.pdf"
                onClick={() => trackInteraction("contract_download", { location: "hero" })}
              >
                <DownloadSimple size={22} weight="bold" aria-hidden="true" />
                <span>Descargar contrato en PDF</span>
              </a>
              <button className="contract-button contract-button--secondary" type="button" onClick={handlePrint}>
                <Printer size={21} weight="bold" aria-hidden="true" />
                <span>Imprimir o guardar</span>
              </button>
            </div>
          </div>

          <aside className="contract-summary" aria-label="Resumen del contrato">
            <span className="contract-summary__icon" aria-hidden="true">
              <FileText size={42} weight="light" />
            </span>
            <p>Modelo general para Perú</p>
            <h2>Dos páginas, claras y listas para completar</h2>
            <ul>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> 12 cláusulas generales</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Campos para ambas partes</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Autoría e integridad académica</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="contract-reader" aria-labelledby="contract-reader-title">
        <div className="contract-reader__inner">
          <aside className="contract-guide">
            <div className="contract-guide__heading">
              <ShieldCheck size={28} weight="light" aria-hidden="true" />
              <h2>Antes de firmar</h2>
            </div>
            <ol>
              <li>Completa los datos del prestador y del cliente.</li>
              <li>Adjunta la cotización con alcance, entregables, precio y fechas.</li>
              <li>Revisa cada cláusula y conserva una copia firmada.</li>
            </ol>
            <p>{contractTemplate.notice}</p>
            <a
              href={contractDownloadHref}
              download="contrato-general-asesoria-academica-tesis20.pdf"
              onClick={() => trackInteraction("contract_download", { location: "reader_guide" })}
            >
              <DownloadSimple size={19} weight="bold" aria-hidden="true" />
              Descargar PDF de 2 páginas
            </a>
          </aside>

          <article className="contract-document">
            <header className="contract-document__header">
              <span>Tesis20 · Documento preestablecido</span>
              <h2 id="contract-reader-title">{contractTemplate.title}</h2>
              <p>{contractTemplate.version}</p>
            </header>

            <p className="contract-document__intro">{contractTemplate.intro}</p>

            <div className="contract-fields" aria-label="Datos que deben completar las partes">
              {contractTemplate.fields.map((field) => (
                <p key={field}>{field}</p>
              ))}
            </div>

            <div className="contract-clauses">
              {contractTemplate.clauses.map((clause) => (
                <section className="contract-clause" key={clause.title}>
                  <h3>{clause.title}</h3>
                  {clause.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <div className="contract-signatures" aria-label="Firmas del contrato">
              {contractTemplate.signatures.map((signature) => (
                <div key={signature}>
                  {signature.split("\n").map((line) => <p key={line}>{line}</p>)}
                </div>
              ))}
            </div>

            <section className="contract-sources" aria-labelledby="contract-sources-title">
              <h3 id="contract-sources-title">Marco legal referencial</h3>
              <p>
                Estas fuentes oficiales sirven como referencia general para el modelo. La
                aplicación concreta depende de los datos y del servicio acordado.
              </p>
              <ul>
                {contractTemplate.legalSources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      aria-label={`${source.label} (se abre en una pestaña nueva)`}
                    >
                      <span>{source.label}</span>
                      <ArrowSquareOut size={15} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <p className="contract-document__notice">
              <strong>Importante:</strong> {contractTemplate.notice}
            </p>
          </article>
        </div>
      </section>

      <section className="contract-download" aria-labelledby="contract-download-title">
        <div>
          <FileText size={42} weight="light" aria-hidden="true" />
          <p>¿Listo para revisarlo fuera de la web?</p>
          <h2 id="contract-download-title">Descarga el modelo completo en PDF</h2>
          <a
            href={contractDownloadHref}
            download="contrato-general-asesoria-academica-tesis20.pdf"
            onClick={() => trackInteraction("contract_download", { location: "bottom_cta" })}
          >
            <DownloadSimple size={21} weight="bold" aria-hidden="true" />
            Descargar contrato
          </a>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contacto">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/assets/tesis20-logo.png"
            alt="Tesis20"
            width="300"
            height="300"
            loading="lazy"
            decoding="async"
          />
          <p>Tu tesis, con una ruta clara y acompañamiento real.</p>
          <WhatsappButton className="footer-brand__cta">Solicitar orientación</WhatsappButton>
        </div>
        <nav className="footer-column" aria-labelledby="footer-links-title">
          <h2 id="footer-links-title">Enlaces rápidos</h2>
          <a href="/servicios">Servicios</a>
          <a href="/evidencias">Evidencias</a>
          <a href="/contrato">Contrato</a>
          <a
            href="https://www.gestion.tesis20.com"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            aria-label="Pagos (se abre en una pestaña nueva)"
          >
            Pagos
          </a>
        </nav>
        <address className="footer-column footer-contact">
          <h2>Contáctanos</h2>
          <a href="tel:+51918714054">
            <Phone size={20} aria-hidden="true" />
            <span>(+51) 918 714 054</span>
          </a>
          <a href="mailto:tesis.com20@gmail.com">
            <EnvelopeSimple size={20} aria-hidden="true" />
            <span>tesis.com20@gmail.com</span>
          </a>
          <p>
            <MapPin size={20} aria-hidden="true" />
            <span>Jr. Lincoln 638, Pueblo Libre, Lima – Perú</span>
          </p>
        </address>
        <div className="footer-column footer-social">
          <h2>Síguenos</h2>
          <div className="social-links">
            <a href="https://www.facebook.com/tesisconluis" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label="Facebook (se abre en una pestaña nueva)">
              <FacebookLogo size={24} weight="fill" aria-hidden="true" />
            </a>
            <a href="https://www.instagram.com/tesis20.comm/" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label="Instagram oficial de Tesis20 (se abre en una pestaña nueva)">
              <InstagramLogo size={24} aria-hidden="true" />
            </a>
            <a
              href="https://www.youtube.com/@tesisasesoriaycapacitacion3499"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label="YouTube oficial de Tesis20 (se abre en una pestaña nueva)"
            >
              <YoutubeLogo size={24} weight="fill" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        <details>
          <summary>Privacidad y uso de evidencias</summary>
          <p>
            Las evidencias públicas se muestran anonimizadas para proteger la identidad y los
            datos personales. Los resultados fueron reportados por estudiantes, corresponden a
            casos individuales y no constituyen una garantía de resultados futuros. La plataforma
            utiliza medición agregada y sin cookies para conocer páginas visitadas, rendimiento y
            acciones generales; los eventos excluyen correos, teléfonos y direcciones web. Para consultas
            sobre acceso, rectificación o eliminación de datos,
            escribe a <a href="mailto:tesis.com20@gmail.com?subject=Solicitud%20sobre%20datos%20personales">tesis.com20@gmail.com</a>.
          </p>
        </details>
      </div>
      <div className="footer-bottom">© {currentYear} Tesis20. Todos los derechos reservados.</div>
    </footer>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found-page" id="main-content" tabIndex="-1">
      <section aria-labelledby="not-found-title">
        <p>Error 404</p>
        <h1 id="not-found-title">Esta página no está disponible</h1>
        <span>
          El enlace puede haber cambiado. Puedes volver al inicio o revisar nuestros servicios.
        </span>
        <div>
          <a href="/#inicio">Volver al inicio</a>
          <a href="/servicios">
            Ver servicios <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currentPage = getPageFromPathname();
  const serviceId = getServiceIdFromPathname();
  const selectedService = serviceId
    ? services.find((service) => service.id === serviceId) || null
    : null;
  const pageWhatsappMessage = selectedService
    ? `¡Hola! Deseo orientación sobre el servicio ${selectedService.title}, desde ${selectedService.price}, y confirmar el alcance para mi caso.`
    : whatsappMessages[currentPage] || whatsappMessages.home;
  const pageWhatsappHref = buildWhatsappHref(pageWhatsappMessage);
  const toggleMenu = useCallback(() => setMenuOpen((current) => !current), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const faqItems = currentPage === "services" ? servicesFaqs : currentPage === "home" ? homeFaqs : noFaqs;

  useEffect(() => {
    if (!menuOpen) return undefined;

    const backgroundElements = [
      document.querySelector("#main-content"),
      document.querySelector(".site-footer"),
      document.querySelector(".floating-whatsapp"),
      document.querySelector(".back-to-top"),
      document.querySelector(".mobile-contact-bar"),
    ].filter(Boolean);
    const previousStates = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    return () => {
      previousStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [menuOpen]);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 24);
        frame = 0;
      });
    };
    const closeDesktopMenu = () => {
      if (window.innerWidth > 930) setMenuOpen(false);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", closeDesktopMenu, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", closeDesktopMenu);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (currentPage === "nido") {
    return (
      <>
        <SeoManager
          currentPage={currentPage}
          faqItems={nidoFaqs}
          serviceId={null}
          serviceItem={null}
          serviceItems={services}
        />
        <RouteAnnouncer currentPage={currentPage} />
        <ConnectionStatus />
        <Suspense
          fallback={
            <main
              id="main-content"
              aria-busy="true"
              aria-live="polite"
              style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                padding: "2rem",
                background: "#f4fbff",
                color: "#13223a",
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
              }}
            >
              Preparando Tesis20 Nido…
            </main>
          }
        >
          <NidoPage />
        </Suspense>
      </>
    );
  }

  return (
    <div className="site-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.scrollIntoView({ block: "start" });
          main?.focus({ preventScroll: true });
          window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}#main-content`);
        }}
      >
        Saltar al contenido principal
      </a>
      <SeoManager
        currentPage={currentPage}
        faqItems={faqItems}
        serviceId={serviceId}
        serviceItem={selectedService}
        serviceItems={services}
      />
      <RouteAnnouncer currentPage={currentPage} />
      <ConnectionStatus />
      <ScrollProgress />
      <Header
        menuOpen={menuOpen}
        onMenuToggle={toggleMenu}
        onNavigate={closeMenu}
        currentPage={currentPage}
        isScrolled={isScrolled}
      />
      {currentPage === "services" ? (
        selectedService ? <ServiceDetailPage service={selectedService} /> : <ServicesPage />
      ) : currentPage === "evidence" ? (
        <EvidencePage />
      ) : currentPage === "contract" ? (
        <ContractPage />
      ) : currentPage === "not-found" ? (
        <NotFoundPage />
      ) : (
        <main id="main-content" tabIndex="-1">
          <Hero />
          <TrustStrip />
          <DiagnosticWizard />
          <ProofSection />
          <QuickFacts
            servicesCount={services.length}
            resultsCount={gradeResults.length}
            stagesCount={3}
          />
          <AudioIntroduction />
          <MethodSection />
          <SupportSection />
          <CommitmentSection />
          <FaqSection title="Respuestas antes de comenzar" items={homeFaqs} />
          <FinalCta />
        </main>
      )}
      <Footer />
      <a
        className="floating-whatsapp"
        href={pageWhatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        aria-label="Contactar a Tesis20 por WhatsApp (se abre en una pestaña nueva)"
        onClick={() =>
          trackInteraction("whatsapp_click", { location: "floating", page: currentPage })
        }
      >
        <WhatsappLogo size={34} weight="fill" aria-hidden="true" />
      </a>
      <BackToTop />
      <MobileContactBar href={pageWhatsappHref} page={currentPage} />
    </div>
  );
}
