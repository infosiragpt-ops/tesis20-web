import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { CaretRight } from "@phosphor-icons/react/CaretRight";
import { trackInteraction } from "./platform-enhancements.jsx";

/**
 * Piezas compartidas por la página principal y las secciones de Inicio:
 * enlaces de WhatsApp con el mensaje de cada página y migas de pan.
 * Vive aparte de App.jsx para que las secciones nuevas no lo importen
 * (evita dependencias circulares).
 */
export const WHATSAPP_PHONE = "51918714054";
export const PORTAL_URL = "https://www.gestion.tesis20.com";

export function buildWhatsappHref(message) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  home: "¡Hola! Deseo orientación para avanzar con mi propia tesis o proyecto junto a Tesis20.",
  services: "¡Hola! Deseo orientación para elegir el servicio adecuado para mi investigación.",
  evidence: "¡Hola! Revisé los resultados reportados por estudiantes y deseo información sobre el acompañamiento de Tesis20.",
  contract: "¡Hola! Revisé el contrato general de Tesis20 y deseo orientación antes de comenzar.",
  resources: "¡Hola! Revisé los recursos y el repositorio de tesis y deseo orientación para mi investigación.",
  careers: "¡Hola! Revisé el catálogo de carreras de Tesis20 y deseo ayuda para ubicar mi especialidad.",
  teachers: "¡Hola! Busco un asesor para mi tesis según mi carrera y mi tema. ¿Me orientan?",
};

const PAGE_BY_PATH = {
  "/servicios": "services",
  "/evidencias": "evidence",
  "/contrato": "contract",
  "/recursos": "resources",
  "/carreras": "careers",
  "/docentes": "teachers",
};

/** Página actual solo para elegir el mensaje de WhatsApp y la analítica. */
export function pageKeyFromPath(pathname = window.location.pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path.startsWith("/servicios/")) return "services";
  return PAGE_BY_PATH[path] || "home";
}

export function WhatsappButton({ children, className = "", dark = false, message, location }) {
  const page = pageKeyFromPath();
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

/** Migas de pan de las páginas interiores (Inicio › Página actual). */
export function Breadcrumb({ current, parent }) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      <ol>
        <li>
          <a href="/">Inicio</a>
          <CaretRight size={12} weight="bold" aria-hidden="true" />
        </li>
        {parent ? (
          <li>
            <a href={parent.href}>{parent.label}</a>
            <CaretRight size={12} weight="bold" aria-hidden="true" />
          </li>
        ) : null}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
