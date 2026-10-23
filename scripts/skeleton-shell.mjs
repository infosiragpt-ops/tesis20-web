/**
 * Arranque sin destello del HTML prerenderizado.
 *
 * Cada página se publica con un HTML indexable (para buscadores y para quien
 * navega sin JavaScript). Antes, mientras cargaba la app, ese HTML se veía
 * como texto sin diseño durante ~1 s. Ahora:
 *  - la cabecera prerenderizada usa las mismas clases y el mismo marcado que
 *    la cabecera de React, así que se ve idéntica desde el primer cuadro;
 *  - el resto del contenido no se pinta mientras arranca la app: en su lugar
 *    se ve el fondo del hero. React reemplaza todo al montar;
 *  - respaldo: si la app no arranca en 4 s, el texto se muestra igual;
 *  - sin JavaScript (<noscript>) todo se ve como siempre y el menú es usable.
 * La CSP permite estilos en línea (style-src 'unsafe-inline'), no scripts.
 */
import { buildWhatsappHref, pageKeyForPath, PORTAL_URL, whatsappMessages } from "../src/data/contact.js";

// Mismos íconos que pinta @phosphor-icons/react en la cabecera real.
const svg = (size, path) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="${path}"></path></svg>`;
const USER_BOLD =
  "M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z";
const WHATSAPP_FILL =
  "M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z";
const LIST_REGULAR =
  "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z";

const NAVIGATION = [
  ["Inicio", "/", "home"],
  ["Servicios", "/servicios", "services"],
  ["Carreras", "/carreras", "careers"],
  ["Asesores", "/docentes", "teachers"],
  ["Evidencias", "/evidencias", "evidence"],
  ["Contrato", "/contrato", "contract"],
  ["Recursos", "/recursos", "resources"],
];

/** Interior de la cabecera, igual al que monta React para esta ruta. */
export function headerInnerMarkup(path) {
  // La 404 no marca ninguna pestaña; el resto, la de su sección.
  const page = path ? pageKeyForPath(path) : null;
  const links = NAVIGATION.map(([label, href, key]) =>
    key === page
      ? `<a class="nav-link nav-link--active" href="${href}" aria-current="page">${label}</a>`
      : `<a class="nav-link" href="${href}">${label}</a>`,
  ).join("");
  const whatsappHref = buildWhatsappHref(whatsappMessages[page || "home"]).replaceAll("&", "&amp;");
  const external = 'target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"';

  return `<div class="header-inner">` +
    `<a class="brand" href="/" aria-label="Tesis20 - Inicio"><img alt="Tesis20" width="300" height="300" decoding="async" fetchpriority="high" src="/assets/tesis20-logo.png"></a>` +
    `<nav class="desktop-navigation" aria-label="Navegación principal">${links}` +
    `<a class="nav-link nav-link--login" href="${PORTAL_URL}" ${external} aria-label="Login (se abre en una pestaña nueva)">${svg(16, USER_BOLD)}Login</a></nav>` +
    `<a class="whatsapp-button header-cta" href="${whatsappHref}" ${external} aria-label="Quiero orientación por WhatsApp (se abre en una pestaña nueva)">${svg(24, WHATSAPP_FILL)}<span>Quiero orientación</span></a>` +
    `<a class="header-login" href="${PORTAL_URL}" ${external} aria-label="Iniciar sesión en el portal del estudiante (se abre en una pestaña nueva)">${svg(17, USER_BOLD)}<span>Iniciar sesión</span></a>` +
    // Solo dibuja las tres rayitas: sin JavaScript no hay menú que abrir.
    `<span class="menu-button" aria-hidden="true">${svg(30, LIST_REGULAR)}</span>` +
    `</div>`;
}

/** Tipo de arranque: hero de Inicio, hero de página interior o Nido. */
export function shellKind(path) {
  if (path === "/nido") return "nido";
  return path === "/" ? "home" : "page";
}

const BOOT_CSS = `
[data-seo-shell]>main,[data-seo-shell]>footer,[data-seo-shell=nido]>header{visibility:hidden;animation:arranque-respaldo 1ms 4s forwards}
[data-seo-shell=home]>main,[data-seo-shell=page]>main{position:relative}
[data-seo-shell=home]>main::before,[data-seo-shell=page]>main::before{content:"";position:absolute;top:0;right:0;left:0;height:min(620px,calc(100vh - 72px));height:min(620px,calc(100svh - 72px));background:var(--hero-surface,#f5bd42);visibility:visible;animation:arranque-fin 1ms 4s forwards}
[data-seo-shell=home]>main::before{height:min(740px,calc(100vh - 72px));height:min(740px,calc(100svh - 72px))}
@media (max-width:930px){[data-seo-shell=home]>main::before,[data-seo-shell=page]>main::before{height:calc(100vh - 72px);height:calc(100svh - 72px)}}
@keyframes arranque-respaldo{to{visibility:visible}}
@keyframes arranque-fin{to{visibility:hidden}}
`.trim();

const NO_SCRIPT_CSS = `
[data-seo-shell]>*{visibility:visible!important;animation:none!important}
[data-seo-shell]>main::before{display:none!important}
[data-seo-header] .menu-button{display:none!important}
@media (max-width:930px){[data-seo-header] .header-inner{height:auto;padding:10px 0;flex-wrap:wrap}[data-seo-header] .desktop-navigation{width:100%;margin:0;display:flex;flex-wrap:wrap;gap:4px 18px;order:3}[data-seo-header] .nav-link{padding:8px 0}[data-seo-header] .nav-link::after{bottom:2px}}
`.trim();

/** Estilos de arranque (y su versión sin JavaScript) para el <head>. */
export const BOOT_HEAD_MARKUP =
  `<style id="arranque">${BOOT_CSS}</style>\n` +
  `    <noscript><style>${NO_SCRIPT_CSS}</style></noscript>`;
