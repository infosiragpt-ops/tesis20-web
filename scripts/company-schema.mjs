import { COMPANY, OFFICE_CITIES_LABEL, OFFICES } from "../src/data/company.js";

/**
 * Datos legales de Tesis20 que solo hacen falta al generar el HTML (pie
 * prerenderizado, página del contrato y datos estructurados) y al validar el
 * build. No se importan desde la app: no viajan en el JavaScript de la web.
 */
export const COMPANY_DETAILS = {
  ...COMPANY,
  representative: "Jorge Luis Carrera Salas",
  representativeDni: "72792992",
  domicile: { street: "Jr. Lincoln 638", district: "Pueblo Libre", region: "Lima" },
  phone: "(+51) 918 714 054",
  phoneHref: "tel:+51918714054",
  phoneE164: "+51 918 714 054",
  email: "tesis.com20@gmail.com",
  social: [
    "https://www.facebook.com/tesisconluis",
    "https://www.instagram.com/tesis20.comm/",
    "https://www.youtube.com/@tesisasesoriaycapacitacion3499",
  ],
};

/** «Jr. Lincoln 638, Pueblo Libre, Lima – Perú». */
export const DOMICILE_LINE = `${COMPANY_DETAILS.domicile.street}, ${COMPANY_DETAILS.domicile.district}, ${COMPANY_DETAILS.domicile.region} – Perú`;

/** «Av. Arequipa 2491, Lima» o, sin dirección publicada, «Trujillo, La Libertad». */
export function officeLine(office) {
  return office.street ? `${office.street}, ${office.city}` : `${office.city}, ${office.region}`;
}

function postalAddress(street, locality, region) {
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: locality,
    addressRegion: region,
    addressCountry: "PE",
  };
}

/**
 * Nodo Organization del JSON-LD de todas las páginas: RUC, domicilio, oficinas
 * y contacto. La app (SeoManager) conserva este mismo nodo del HTML
 * prerenderizado en lugar de armar otro.
 */
export function buildOrganizationSchema(siteOrigin) {
  const { domicile } = COMPANY_DETAILS;
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${siteOrigin}/#organization`,
    name: COMPANY_DETAILS.name,
    url: `${siteOrigin}/`,
    logo: { "@type": "ImageObject", url: `${siteOrigin}/assets/tesis20-logo.png` },
    image: `${siteOrigin}/assets/hero-students.png`,
    description: `Asesoría y acompañamiento académico para proyectos de investigación y tesis, con oficinas en ${OFFICE_CITIES_LABEL} y atención en línea en todo el Perú.`,
    telephone: COMPANY_DETAILS.phoneE164,
    email: COMPANY_DETAILS.email,
    taxID: COMPANY_DETAILS.ruc,
    priceRange: "S/ 200 - S/ 1800",
    address: postalAddress(domicile.street, domicile.district, domicile.region),
    location: OFFICES.map((office) => ({
      "@type": "Place",
      "@id": `${siteOrigin}/#oficina-${office.id}`,
      name: `Tesis20 – Oficina ${office.city}`,
      address: postalAddress(office.street, office.city, office.region),
    })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: COMPANY_DETAILS.phoneE164,
      email: COMPANY_DETAILS.email,
      availableLanguage: "es",
      areaServed: "PE",
    },
    areaServed: [
      { "@type": "Country", name: "Perú" },
      ...OFFICES.map((office) => ({ "@type": "City", name: office.city })),
    ],
    sameAs: COMPANY_DETAILS.social,
  };
}
