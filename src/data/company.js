/**
 * Nombre, RUC y oficinas de Tesis20: lo que la app muestra en el pie y en las
 * preguntas frecuentes. Sin JSX ni `window`: también lo importan los scripts.
 *
 * Los demás datos legales (representante, domicilio, contacto) y el JSON-LD de
 * la organización viven en scripts/company-schema.mjs: solo se usan al generar
 * el HTML, así no viajan en el JavaScript de la web. El contrato (web, Word y
 * PDF) repite estos datos en data/contract-template.json, que es lo que leen
 * los generadores en Python; scripts/quality-check.mjs comprueba que coincidan.
 */
export const COMPANY = { name: "Tesis20", ruc: "20616782348" };

/**
 * Oficinas de atención. `street` vacío = la oficina existe pero su dirección
 * aún no se publica: se muestra la ciudad y la visita se coordina por WhatsApp
 * (nunca se inventa una dirección).
 */
export const OFFICES = [
  { id: "lima", city: "Lima", region: "Lima", street: "Av. Arequipa 2491" },
  { id: "cajamarca", city: "Cajamarca", region: "Cajamarca", street: "Av. Hoyos Rubio 1540" },
  { id: "trujillo", city: "Trujillo", region: "La Libertad", street: "" },
];

const joinWithY = (items) => `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

/** «Lima, Cajamarca y Trujillo». */
export const OFFICE_CITIES_LABEL = joinWithY(OFFICES.map((office) => office.city));

/** «Lima (Av. Arequipa 2491), Cajamarca (Av. Hoyos Rubio 1540) y Trujillo». */
export const OFFICE_ADDRESSES_LABEL = joinWithY(
  OFFICES.map((office) => (office.street ? `${office.city} (${office.street})` : office.city)),
);

/** Enlace «Cómo llegar» (Google Maps). Sin dirección publicada no hay enlace. */
export function officeMapsHref(office) {
  return office.street
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.street}, ${office.city}, Perú`)}`
    : null;
}
