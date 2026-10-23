/**
 * Datos de contacto compartidos por la app (React) y el generador del HTML
 * prerenderizado (Node). Sin JSX ni `window`: se importa desde ambos lados.
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

/** Página de una ruta, para elegir el mensaje de WhatsApp y la analítica. */
export function pageKeyForPath(pathname = "/") {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path.startsWith("/servicios/")) return "services";
  return PAGE_BY_PATH[path] || "home";
}
