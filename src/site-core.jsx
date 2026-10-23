import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { CaretRight } from "@phosphor-icons/react/CaretRight";
import { trackInteraction } from "./platform-enhancements.jsx";
import {
  buildWhatsappHref,
  pageKeyForPath,
  PORTAL_URL,
  WHATSAPP_PHONE,
  whatsappMessages,
} from "./data/contact.js";

/**
 * Piezas compartidas por la página principal y las secciones de Inicio:
 * enlaces de WhatsApp con el mensaje de cada página y migas de pan.
 * Vive aparte de App.jsx para que las secciones nuevas no lo importen
 * (evita dependencias circulares). Los datos de contacto viven en
 * data/contact.js, que también usa el generador del HTML prerenderizado.
 */

export { buildWhatsappHref, PORTAL_URL, WHATSAPP_PHONE, whatsappMessages };

/** Página actual solo para elegir el mensaje de WhatsApp y la analítica. */
export function pageKeyFromPath(pathname = window.location.pathname) {
  return pageKeyForPath(pathname);
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
