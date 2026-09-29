// Emblemas de los souvenirs de los clásicos: objetos que no tenían dibujo en
// la biblioteca original (corona, zapatito de cristal, lámpara…). Mismo
// lenguaje que EMBLEMS de cuentos-art-props: formas planas en una caja de
// -50 a 50, un brillo blanco translúcido y trazos redondeados.

export const CLASSIC_EMBLEMS = {
  corona: (
    <g>
      <path d="M -30 16 l -4 -34 l 17 16 l 17 -26 l 17 26 l 17 -16 l -4 34 z" fill="#f0c043" />
      <rect x="-31" y="14" width="62" height="12" rx="4" fill="#d9a22c" />
      <circle cx="-34" cy="-20" r="5" fill="#f0c043" />
      <circle cx="0" cy="-30" r="5" fill="#f0c043" />
      <circle cx="34" cy="-20" r="5" fill="#f0c043" />
      <circle cx="-14" cy="20" r="4" fill="#e2453b" />
      <circle cx="0" cy="20" r="4" fill="#4f8fd6" />
      <circle cx="14" cy="20" r="4" fill="#5cb56a" />
    </g>
  ),
  zapatito: (
    <g>
      <path d="M 26 20 l 3 16" stroke="#8cc3dc" strokeWidth="5" strokeLinecap="round" />
      <path d="M -38 20 q -2 -14 14 -14 q 12 0 22 6 q 10 4 18 -6 q 6 -8 12 -18 q 6 4 4 16 l -2 16 z" fill="#cfeaf6" stroke="#8cc3dc" strokeWidth="3" strokeLinejoin="round" />
      <path d="M -30 12 q 2 -8 12 -8" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <circle cx="24" cy="-14" r="2.5" fill="#ffffff" />
      <circle cx="-6" cy="-14" r="2" fill="#ffffff" />
    </g>
  ),
  // La edición de Cenicienta de la biblioteca calza zapatillas de oro.
  "zapatito-oro": (
    <g>
      <path d="M 26 20 l 3 16" stroke="#c99a35" strokeWidth="5" strokeLinecap="round" />
      <path d="M -38 20 q -2 -14 14 -14 q 12 0 22 6 q 10 4 18 -6 q 6 -8 12 -18 q 6 4 4 16 l -2 16 z" fill="#f0c043" stroke="#c99a35" strokeWidth="3" strokeLinejoin="round" />
      <path d="M -30 12 q 2 -8 12 -8" stroke="#fff4c4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="-14" r="2.5" fill="#fff4c4" />
    </g>
  ),
  lampara: (
    <g>
      <path d="M -30 10 q 0 -16 22 -16 h 16 q 14 0 22 -10 l 6 4 q -6 12 -14 18 q -8 14 -30 14 q -22 0 -22 -10 z" fill="#e0b24a" />
      <path d="M -8 -6 q 2 -12 8 -14 q 6 2 8 14 z" fill="#c99a35" />
      <circle cx="0" cy="-22" r="3.5" fill="#c99a35" />
      <path d="M -38 6 q -10 -2 -8 -12 q 6 -6 10 2" stroke="#c99a35" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="-14" y="18" width="28" height="7" rx="3.5" fill="#c99a35" />
      <circle cx="-14" cy="0" r="5" fill="#ffffff" opacity="0.3" />
      <path d="M 40 -18 q 4 -8 0 -14 q 8 4 6 14" fill="#ffe28a" />
    </g>
  ),
  rosa: (
    <g>
      <path d="M 0 2 v 34" stroke="#4f9a5c" strokeWidth="4" strokeLinecap="round" />
      <path d="M 0 22 q -18 -4 -20 -14 q 14 -2 20 14 z" fill="#5cb56a" />
      <circle cx="0" cy="-10" r="18" fill="#d63b55" />
      <path d="M -10 -12 q 10 -14 20 0 q -10 10 -20 0 z" fill="#b12d45" />
      <path d="M -4 -12 q 4 -6 8 0" stroke="#e8687f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="-8" cy="-18" r="4" fill="#ffffff" opacity="0.3" />
    </g>
  ),
  perla: (
    <g>
      <path d="M -34 12 q 34 -26 68 0 q -34 26 -68 0 z" fill="#b99cd6" />
      <circle cx="0" cy="0" r="17" fill="#f7f2ee" />
      <circle cx="-6" cy="-6" r="6" fill="#ffffff" />
      <circle cx="6" cy="6" r="10" fill="#e6dbe8" opacity="0.6" />
    </g>
  ),
  habichuela: (
    <g>
      <path d="M -6 36 q -10 -20 4 -36 q 16 -18 4 -36" stroke="#4f9a5c" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 0 6 q 20 -10 24 4 q -14 8 -24 -4 z" fill="#5cb56a" />
      <path d="M -2 -18 q -22 -8 -24 6 q 14 6 24 -6 z" fill="#5cb56a" />
      <ellipse cx="-14" cy="28" rx="11" ry="7" fill="#a0673e" transform="rotate(-18 -14 28)" />
      <ellipse cx="-17" cy="26" rx="3" ry="2" fill="#ffffff" opacity="0.35" />
    </g>
  ),
  cofre: (
    <g>
      <rect x="-32" y="-4" width="64" height="32" rx="4" fill="#a5713f" />
      <path d="M -32 -4 q 0 -24 32 -24 q 32 0 32 24 z" fill="#b98756" />
      <rect x="-34" y="-8" width="68" height="8" rx="3" fill="#e0b24a" />
      <rect x="-6" y="-6" width="12" height="16" rx="3" fill="#e0b24a" />
      <circle cx="0" cy="3" r="2.5" fill="#6a5540" />
      <circle cx="-18" cy="-18" r="4" fill="#f0c043" />
      <circle cx="16" cy="-20" r="3" fill="#f0c043" />
    </g>
  ),
  carta: (
    <g>
      <rect x="-34" y="-22" width="68" height="44" rx="5" fill="#fff4dc" stroke="#d8c29a" strokeWidth="3" />
      <path d="M -34 -20 l 34 26 l 34 -26" stroke="#d8c29a" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <circle cx="0" cy="6" r="7" fill="#d63b3b" />
      <path d="M 18 -14 h 10 v 10 h -10 z" fill="#8cc3dc" />
    </g>
  ),
  castillo: (
    <g>
      <rect x="-26" y="-6" width="52" height="36" fill="#d9cbb5" />
      <rect x="-38" y="-18" width="16" height="48" fill="#c9b89d" />
      <rect x="22" y="-18" width="16" height="48" fill="#c9b89d" />
      <path d="M -40 -18 l 10 -18 l 10 18 z" fill="#4f8fd6" />
      <path d="M 20 -18 l 10 -18 l 10 18 z" fill="#4f8fd6" />
      <path d="M -26 -6 v -6 h 8 v 6 h 6 v -6 h 8 v 6 h 6 v -6 h 8 v 6 h 6 v -6 h 8 v 6 z" fill="#d9cbb5" />
      <path d="M -8 30 v -14 q 8 -10 16 0 v 14 z" fill="#8a5a3a" />
      <path d="M 30 -36 v -10 l 10 4 l -10 4" fill="#e2453b" />
    </g>
  ),
  torre: (
    <g>
      <rect x="-16" y="-14" width="32" height="50" fill="#c9b89d" />
      <path d="M -22 -14 l 22 -26 l 22 26 z" fill="#b25a4a" />
      <rect x="-6" y="-4" width="12" height="14" rx="6" fill="#6a5540" />
      <path d="M 6 4 q 18 10 10 32" stroke="#f0c043" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M -16 22 h 32 M -16 32 h 32" stroke="#b5a48a" strokeWidth="2" />
    </g>
  ),
  guisante: (
    <g>
      <path d="M -34 8 q 34 -22 68 0 q -6 18 -34 18 q -28 0 -34 -18 z" fill="#8cc467" />
      <path d="M -34 8 q 34 -10 68 0" stroke="#5c9a42" strokeWidth="3" fill="none" />
      <circle cx="-16" cy="8" r="8" fill="#6fb04a" />
      <circle cx="0" cy="10" r="8" fill="#6fb04a" />
      <circle cx="16" cy="8" r="8" fill="#6fb04a" />
      <circle cx="-18" cy="5" r="2.5" fill="#ffffff" opacity="0.5" />
      <circle cx="-2" cy="7" r="2.5" fill="#ffffff" opacity="0.5" />
      <circle cx="14" cy="5" r="2.5" fill="#ffffff" opacity="0.5" />
    </g>
  ),
  llave: (
    <g>
      <circle cx="-18" cy="0" r="16" fill="none" stroke="#e0b24a" strokeWidth="8" />
      <path d="M -2 0 h 38" stroke="#e0b24a" strokeWidth="8" strokeLinecap="round" />
      <path d="M 24 0 v 12 M 34 0 v 10" stroke="#e0b24a" strokeWidth="7" strokeLinecap="round" />
      <circle cx="-24" cy="-6" r="3" fill="#ffffff" opacity="0.45" />
    </g>
  ),
  espejo: (
    <g>
      <rect x="-5" y="18" width="10" height="20" rx="4" fill="#b98756" />
      <ellipse cx="0" cy="-6" rx="24" ry="28" fill="#e0b24a" />
      <ellipse cx="0" cy="-6" rx="18" ry="22" fill="#cfeaf6" />
      <path d="M -10 -16 q 4 -8 12 -10" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="-36" r="4" fill="#d63b55" />
    </g>
  ),
  huso: (
    <g>
      <path d="M 0 -38 v 76" stroke="#a5713f" strokeWidth="4" strokeLinecap="round" />
      <path d="M 0 -26 q 16 12 0 44 q -16 -32 0 -44 z" fill="#f2d4a8" />
      <path d="M -8 -6 q 8 4 16 0 M -9 4 q 9 4 18 0 M -7 14 q 7 3 14 0" stroke="#d9a95a" strokeWidth="2.5" fill="none" />
      <ellipse cx="0" cy="26" rx="10" ry="4" fill="#a5713f" />
    </g>
  ),
  pluma: (
    <g>
      <path d="M -26 34 q 4 -40 42 -70 q 8 30 -12 56 q -14 16 -30 14 z" fill="#fbfaf6" stroke="#d9d2c3" strokeWidth="2.5" />
      <path d="M -28 38 q 16 -30 40 -66" stroke="#c9bfa8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M -8 8 l -10 -4 M 0 -4 l -10 -6 M 6 -16 l -8 -6" stroke="#d9d2c3" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  calabaza: (
    <g>
      <ellipse cx="-14" cy="6" rx="16" ry="24" fill="#e8872c" />
      <ellipse cx="14" cy="6" rx="16" ry="24" fill="#e8872c" />
      <ellipse cx="0" cy="6" rx="16" ry="26" fill="#f59a3a" />
      <path d="M 0 -20 q 2 -10 8 -14" stroke="#4f9a5c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 4 -24 q 14 -10 20 2 q -12 6 -20 -2 z" fill="#5cb56a" />
      <circle cx="-6" cy="-6" r="5" fill="#ffffff" opacity="0.28" />
    </g>
  ),
  botas: (
    <g>
      <path d="M -30 -30 h 22 v 42 q 14 0 18 14 v 8 h -40 z" fill="#8a5a3a" />
      <path d="M -34 -34 h 30 v 10 h -30 z" fill="#6a4630" />
      <path d="M 4 -30 h 22 v 42 q 14 0 14 14 v 8 h -36 z" fill="#a5713f" />
      <path d="M 0 -34 h 30 v 10 h -30 z" fill="#8a5a3a" />
      <rect x="-30" y="26" width="40" height="6" rx="3" fill="#4a3226" />
      <rect x="4" y="26" width="36" height="6" rx="3" fill="#4a3226" />
    </g>
  ),
  trenza: (
    <g>
      <path d="M 0 -38 q -14 10 0 20 q 14 10 0 20 q -14 10 0 20 q 14 10 0 16" stroke="#f0c043" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 0 -38 q -14 10 0 20 q 14 10 0 20 q -14 10 0 20" stroke="#d9a22c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="36" r="6" fill="#d63b55" />
    </g>
  ),
  flecha: (
    <g>
      <path d="M -32 30 l 58 -58" stroke="#a5713f" strokeWidth="5" strokeLinecap="round" />
      <path d="M 30 -32 l -18 4 l 14 14 z" fill="#8a8f98" />
      <path d="M -32 30 l -2 -14 l 10 4 z M -32 30 l 14 2 l -4 -10 z" fill="#e2453b" />
    </g>
  ),
  ovillo: (
    <g>
      <circle cx="-4" cy="4" r="26" fill="#e2453b" />
      <path d="M -26 -6 q 22 -8 44 10 M -28 8 q 24 -10 50 6 M -18 24 q 18 -14 38 -2 M -14 -20 q 14 16 16 46" stroke="#b12d2d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 20 18 q 14 10 18 -6 q 2 -10 -6 -14" stroke="#e2453b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  regalo: (
    <g>
      <rect x="-28" y="-8" width="56" height="40" rx="4" fill="#4f8fd6" />
      <rect x="-32" y="-18" width="64" height="14" rx="4" fill="#6aa6e6" />
      <rect x="-5" y="-18" width="10" height="50" fill="#f0c043" />
      <path d="M 0 -18 q -22 -22 -24 -6 q 2 8 24 6 z M 0 -18 q 22 -22 24 -6 q -2 8 -24 6 z" fill="#f0c043" />
    </g>
  ),
  "huevo-oro": (
    <g>
      <path d="M 0 -34 C 18 -34 26 -4 26 10 C 26 26 14 34 0 34 C -14 34 -26 26 -26 10 C -26 -4 -18 -34 0 -34 z" fill="#f0c043" />
      <path d="M 16 14 q -2 12 -14 14" stroke="#d9a22c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="-9" cy="-10" rx="6" ry="10" fill="#ffffff" opacity="0.45" />
    </g>
  ),
  arpa: (
    <g>
      <path d="M -26 34 v -62 q 30 -8 44 18 q 10 22 -6 44 z" fill="none" stroke="#e0b24a" strokeWidth="7" strokeLinejoin="round" />
      <path d="M -18 -22 v 52 M -8 -24 v 56 M 2 -22 v 54 M 12 -14 v 44" stroke="#f7e7b4" strokeWidth="2" />
      <circle cx="-26" cy="-30" r="5" fill="#d9a22c" />
    </g>
  ),
  martillo: (
    <g>
      <path d="M -26 32 l 36 -36" stroke="#a5713f" strokeWidth="8" strokeLinecap="round" />
      <path d="M 2 -30 l 30 30 l -10 10 l -30 -30 z" fill="#8a8f98" />
      <path d="M 26 -6 l 8 8" stroke="#6b7078" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  espiga: (
    <g>
      <path d="M 0 38 q -2 -30 2 -70" stroke="#c99a35" strokeWidth="4" strokeLinecap="round" fill="none" />
      {[-24, -12, 0, 12].map((y) => (
        <g key={y}>
          <ellipse cx="-8" cy={y} rx="6" ry="10" fill="#e0b24a" transform={`rotate(-30 -8 ${y})`} />
          <ellipse cx="9" cy={y + 2} rx="6" ry="10" fill="#f0c043" transform={`rotate(30 9 ${y + 2})`} />
        </g>
      ))}
      <ellipse cx="1" cy="-36" rx="5" ry="9" fill="#f0c043" />
    </g>
  ),
  red: (
    <g>
      <path d="M -32 -28 q 32 -12 64 0 v 20 q -32 56 -64 0 z" fill="#e8dcc4" opacity="0.5" />
      <path d="M -32 -28 q 32 -12 64 0 M -32 -8 q 32 -12 64 0 M -26 12 q 26 -10 52 0 M -12 28 q 12 -6 24 0" stroke="#a5713f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M -32 -28 q 0 30 30 58 M -12 -32 q 0 30 6 62 M 12 -32 q 0 30 -6 62 M 32 -28 q 0 30 -30 58" stroke="#a5713f" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  reloj: (
    <g>
      <circle cx="0" cy="4" r="30" fill="#e0b24a" />
      <circle cx="0" cy="4" r="24" fill="#fff4dc" />
      <path d="M 0 4 v -16 M 0 4 l 10 6" stroke="#4a3226" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="-12" r="2" fill="#4a3226" />
      <rect x="-6" y="-34" width="12" height="8" rx="3" fill="#c99a35" />
      <circle cx="0" cy="4" r="3" fill="#d63b3b" />
    </g>
  ),
  anillo: (
    <g>
      <ellipse cx="0" cy="10" rx="26" ry="22" fill="none" stroke="#e0b24a" strokeWidth="8" />
      <path d="M -10 -14 l 10 -16 l 10 16 l -10 10 z" fill="#8fd3f0" stroke="#5aa9cf" strokeWidth="2" />
      <circle cx="-2" cy="-18" r="2.5" fill="#ffffff" />
    </g>
  ),
  trineo: (
    <g>
      <path d="M -30 -10 h 50 q 12 0 12 14 v 8 h -62 z" fill="#d63b3b" />
      <path d="M -30 -10 q -8 0 -8 -10" stroke="#d63b3b" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M -40 26 h 70 q 10 0 12 -10" stroke="#e0b24a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M -20 12 v 14 M 16 12 v 14" stroke="#e0b24a" strokeWidth="4" />
      <rect x="-20" y="-24" width="18" height="14" rx="2" fill="#5cb56a" />
      <path d="M -11 -24 v 14" stroke="#f0c043" strokeWidth="3" />
    </g>
  ),
  queso: (
    <g>
      <path d="M -34 20 l 60 -30 q 10 12 8 30 z" fill="#f5c542" />
      <path d="M -34 20 h 68 v 12 h -68 z" fill="#e0ad2e" />
      <circle cx="-4" cy="10" r="5" fill="#e0ad2e" />
      <circle cx="16" cy="4" r="4" fill="#e0ad2e" />
      <circle cx="12" cy="18" r="3" fill="#e0ad2e" />
    </g>
  ),
};

// Figura 3D que representa cada emblema en el escritorio. Los que no tienen
// figura propia se muestran como medalla de madera con el emblema pintado.
export const CLASSIC_EMBLEM_TOY = {
  zapatito: "zapatos",
  lampara: "lampara-magica",
  rosa: "rosa-encantada",
  perla: "perla",
  habichuela: "habichuela",
  cofre: "tesoro",
  carta: "carta",
  castillo: "castillo",
  torre: "torre",
  guisante: "cama-guisante",
};
