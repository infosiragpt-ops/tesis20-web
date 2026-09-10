// Personajes de los cuentos. Cada uno se dibuja mirando a la derecha, con los
// pies en el origen (0, 0) y una altura cercana a 170 unidades, para que el
// compositor de escenas solo tenga que trasladar y escalar.

function Shadow({ rx = 54, ry = 11, opacity = 0.26 }) {
  return <ellipse cx="0" cy="6" rx={rx} ry={ry} fill="#0b1226" opacity={opacity} />;
}

function Eye({ x, y, r = 5, look = 0 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#1b1b23" />
      <circle cx={x + r * 0.36 + look} cy={y - r * 0.36} r={r * 0.34} fill="#ffffff" />
    </g>
  );
}

function Blush({ x, y, color = "#f39a9a" }) {
  return <ellipse cx={x} cy={y} rx="9" ry="5.5" fill={color} opacity="0.5" />;
}

function Oso() {
  return (
    <g>
      <Shadow rx={58} />
      <g className="cuento-breathe">
        <path d="M -46 -6 q -8 -34 6 -40 q 16 -4 18 34 z" fill="#3a2820" />
        <path d="M 40 -6 q 10 -34 -4 -40 q -16 -4 -20 34 z" fill="#3a2820" />
        <ellipse cx="0" cy="-58" rx="52" ry="54" fill="#4a3428" />
        <ellipse cx="-10" cy="-50" rx="34" ry="40" fill="#5b4132" opacity="0.75" />
        <circle cx="-20" cy="-152" r="15" fill="#3a2820" />
        <circle cx="30" cy="-156" r="15" fill="#3a2820" />
        <circle cx="-20" cy="-152" r="7" fill="#6b4c39" />
        <circle cx="30" cy="-156" r="7" fill="#6b4c39" />
        <circle cx="6" cy="-124" r="42" fill="#4a3428" />
        <ellipse cx="-16" cy="-138" rx="15" ry="16" fill="#f2ddb8" opacity="0.95" />
        <ellipse cx="32" cy="-141" rx="14" ry="15" fill="#f2ddb8" opacity="0.95" />
        <ellipse cx="24" cy="-108" rx="22" ry="17" fill="#e8cfa6" />
        <ellipse cx="30" cy="-114" rx="8" ry="6" fill="#3a2820" />
        <path d="M 26 -108 q 4 7 10 2" stroke="#3a2820" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <Eye x={-16} y={-138} r={5.5} look={1} />
        <Eye x={32} y={-141} r={5.5} look={1} />
        <ellipse cx="-52" cy="-58" rx="12" ry="22" fill="#3a2820" transform="rotate(-14 -52 -58)" />
        <ellipse cx="50" cy="-64" rx="12" ry="20" fill="#3a2820" transform="rotate(12 50 -64)" />
      </g>
    </g>
  );
}

function Buho() {
  return (
    <g>
      <Shadow rx={38} ry={8} />
      <g className="cuento-breathe">
        <path d="M -26 -4 l 8 -10 h 10 l -2 10 z" fill="#e0a24a" />
        <path d="M 26 -4 l -8 -10 h -10 l 2 10 z" fill="#e0a24a" />
        <path d="M 0 -150 q 44 0 44 -70 q 0 -64 -44 -64 q -44 0 -44 64 q 0 70 44 70 z" transform="translate(0,146)" fill="#7d5a3c" />
        <path d="M -2 -28 q 26 0 26 -44 q 0 -34 -26 -34 q -26 0 -26 34 q 0 44 26 44 z" fill="#c9a179" opacity="0.85" />
        <path d="M -40 -110 l -12 -26 l 22 10 z" fill="#7d5a3c" />
        <path d="M 40 -110 l 12 -26 l -22 10 z" fill="#7d5a3c" />
        <circle cx="-17" cy="-96" r="19" fill="#f6ead4" />
        <circle cx="19" cy="-96" r="19" fill="#f6ead4" />
        <Eye x={-16} y={-96} r={10} look={2} />
        <Eye x={20} y={-96} r={10} look={2} />
        <path d="M 1 -88 l 10 12 l -10 10 l -10 -10 z" fill="#e0a24a" />
        <path d="M -44 -70 q -12 26 4 46" stroke="#6a4a31" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M 44 -70 q 12 26 -4 46" stroke="#6a4a31" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Bufeo() {
  return (
    <g>
      <g className="cuento-float">
        <path
          d="M -120 -40 q 46 -46 116 -34 q 52 9 84 -6 q -14 26 -6 44 q 8 18 26 24 q -34 12 -62 -2 q -60 26 -122 4 q -44 -16 -36 -30 z"
          fill="#eda0b8"
        />
        <path d="M -110 -34 q 40 -34 96 -26 q 40 6 64 -2 q -10 18 -4 32 q -52 26 -114 8 q -36 -12 -42 -12 z" fill="#f7c2d2" opacity="0.75" />
        <path d="M -6 -78 q 18 -30 34 -22 q -6 12 -6 26 z" fill="#e08fa8" />
        <path d="M -120 -40 q -34 -6 -52 -22 q 16 30 12 44 q 22 -10 40 -12 z" fill="#eda0b8" />
        <path d="M -40 -12 q 16 22 44 20 q -18 -14 -20 -26 z" fill="#e08fa8" />
        <circle cx="52" cy="-48" r="4.6" fill="#3a1f2a" />
        <circle cx="53.4" cy="-49.4" r="1.6" fill="#ffffff" />
        <path d="M 62 -40 q 8 5 16 1" stroke="#c97c96" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Rana() {
  return (
    <g>
      <Shadow rx={30} ry={7} />
      <g className="cuento-breathe">
        <ellipse cx="0" cy="-26" rx="34" ry="26" fill="#5aa85c" />
        <ellipse cx="0" cy="-20" rx="24" ry="15" fill="#cbe89a" />
        <circle cx="-15" cy="-52" r="13" fill="#5aa85c" />
        <circle cx="15" cy="-52" r="13" fill="#5aa85c" />
        <Eye x={-15} y={-53} r={7} />
        <Eye x={15} y={-53} r={7} />
        <path d="M -12 -22 q 12 8 24 0" stroke="#2f6b36" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M -34 -14 q -16 4 -18 14 h 14" fill="#4d9450" />
        <path d="M 34 -14 q 16 4 18 14 h -14" fill="#4d9450" />
      </g>
    </g>
  );
}

function Pez() {
  return (
    <g>
      <g className="cuento-float">
        <path d="M -40 -30 q 34 -26 66 -2 q -32 26 -66 2 z" fill="#7fc9e8" />
        <path d="M -40 -30 q -22 -14 -30 -2 q 10 12 30 2 z" fill="#5fb0d4" />
        <path d="M 12 -50 q 22 -14 30 -34 q -24 4 -30 20" stroke="#9fe0f5" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="42" cy="-84" r="10" fill="#d9f6ff">
          <animate attributeName="r" values="9;12;9" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="42" cy="-84" r="18" fill="#9fe0f5" opacity="0.35" />
        <circle cx="18" cy="-32" r="4" fill="#22384a" />
        <circle cx="19" cy="-33" r="1.4" fill="#ffffff" />
      </g>
    </g>
  );
}

function personBody({ skin, hair, top, bottom, hat, hairStyle = "braids" }) {
  return (
    <g>
      <Shadow rx={38} ry={9} />
      <g className="cuento-breathe">
        <rect x="-20" y="-42" width="16" height="42" rx="7" fill="#3d3a52" />
        <rect x="6" y="-42" width="16" height="42" rx="7" fill="#3d3a52" />
        <ellipse cx="-12" cy="2" rx="13" ry="6" fill="#2b2838" />
        <ellipse cx="14" cy="2" rx="13" ry="6" fill="#2b2838" />
        <path d="M -34 -38 q -2 -62 34 -62 q 36 0 34 62 z" fill={bottom} />
        <path d="M -30 -74 q 0 -34 30 -34 q 30 0 30 34 q -30 12 -60 0 z" fill={top} />
        <path d="M -30 -74 q 30 12 60 0 l -3 -10 q -27 10 -54 0 z" fill="#ffffff" opacity="0.35" />
        <rect x="-42" y="-104" width="14" height="46" rx="7" fill={top} transform="rotate(8 -35 -80)" />
        <rect x="28" y="-104" width="14" height="46" rx="7" fill={top} transform="rotate(-8 35 -80)" />
        <circle cx="-36" cy="-60" r="7.5" fill={skin} />
        <circle cx="36" cy="-60" r="7.5" fill={skin} />
        <circle cx="2" cy="-132" r="30" fill={skin} />
        {hairStyle === "braids" ? (
          <>
            <path d="M -28 -140 q 4 -34 30 -34 q 26 0 30 34 q -30 -14 -60 0 z" fill={hair} />
            <path d="M -28 -136 q -12 26 -6 46 q 12 -4 12 -20 z" fill={hair} />
            <path d="M 32 -136 q 12 26 6 46 q -12 -4 -12 -20 z" fill={hair} />
          </>
        ) : hairStyle === "loose" ? (
          <path d="M -30 -136 q 2 -38 32 -38 q 30 0 32 38 q -6 34 -14 40 q 2 -26 -6 -34 q -24 10 -44 2 q -4 12 0 32 q -8 -8 -10 -40 z" fill={hair} />
        ) : (
          <path d="M -28 -142 q 6 -30 30 -30 q 24 0 30 30 q -30 -12 -60 0 z" fill={hair} />
        )}
        <Eye x={-9} y={-133} r={4.6} />
        <Eye x={14} y={-133} r={4.6} />
        <Blush x={-18} y={-122} />
        <Blush x={22} y={-122} />
        <path d="M -3 -120 q 6 7 12 0" stroke="#7a4a3a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {hat === "chullo" ? (
          <g>
            <path d="M -32 -146 q 4 -32 34 -32 q 30 0 34 32 z" fill="#d9524f" />
            <path d="M -32 -146 h 68 v 9 h -68 z" fill="#f2c14e" />
            <path d="M -30 -158 h 64" stroke="#3f7fb5" strokeWidth="6" strokeLinecap="round" />
            <path d="M -28 -146 q 0 26 -14 40" stroke="#d9524f" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M 32 -146 q 0 26 14 40" stroke="#d9524f" strokeWidth="9" fill="none" strokeLinecap="round" />
          </g>
        ) : hat === "gorra" ? (
          <g>
            <path d="M -30 -150 q 4 -28 32 -28 q 28 0 32 28 z" fill="#2f4f7a" />
            <path d="M -32 -150 h 46 q 16 0 16 8 h -62 z" fill="#24405f" />
          </g>
        ) : null}
      </g>
    </g>
  );
}

const Nina = () =>
  personBody({ skin: "#c98b62", hair: "#2a2030", top: "#e2604f", bottom: "#3f6fae", hairStyle: "braids" });

const Nina2 = () =>
  personBody({ skin: "#d8a172", hair: "#2f2431", top: "#f3f0e6", bottom: "#4fb0c0", hairStyle: "loose" });

const Nino = () =>
  personBody({ skin: "#c98b62", hair: "#241c28", top: "#f0b64d", bottom: "#3f5f8a", hat: "chullo", hairStyle: "short" });

function Maquinista() {
  return (
    <g>
      <Shadow rx={44} ry={10} />
      <g className="cuento-breathe">
        <rect x="-24" y="-56" width="20" height="56" rx="9" fill="#2f3b52" />
        <rect x="6" y="-56" width="20" height="56" rx="9" fill="#2f3b52" />
        <ellipse cx="-14" cy="2" rx="16" ry="7" fill="#20293a" />
        <ellipse cx="16" cy="2" rx="16" ry="7" fill="#20293a" />
        <path d="M -38 -52 q -4 -72 40 -72 q 44 0 40 72 z" fill="#3f6291" />
        <path d="M -14 -124 q 14 -6 28 0 l 0 60 q -14 6 -28 0 z" fill="#e8e3d6" opacity="0.5" />
        <rect x="-50" y="-118" width="16" height="54" rx="8" fill="#3f6291" transform="rotate(10 -42 -92)" />
        <rect x="34" y="-118" width="16" height="54" rx="8" fill="#3f6291" transform="rotate(-10 42 -92)" />
        <circle cx="-44" cy="-66" r="8" fill="#d8a172" />
        <circle cx="44" cy="-66" r="8" fill="#d8a172" />
        <circle cx="2" cy="-150" r="32" fill="#d8a172" />
        <path d="M -30 -160 q 2 -30 32 -30 q 30 0 32 30 z" fill="#2f4f7a" />
        <path d="M -33 -160 h 48 q 18 0 18 9 h -66 z" fill="#24405f" />
        <Eye x={-9} y={-150} r={4.6} />
        <Eye x={15} y={-150} r={4.6} />
        <path d="M -22 -132 q 24 14 48 0" stroke="#8a5b46" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M -20 -138 q 24 10 46 0 q -6 22 -23 22 q -17 0 -23 -22 z" fill="#e6e2da" opacity="0.75" />
      </g>
    </g>
  );
}

function Oveja() {
  return (
    <g>
      <Shadow rx={44} ry={9} />
      <g className="cuento-breathe">
        <rect x="-26" y="-28" width="10" height="28" rx="5" fill="#3a3340" />
        <rect x="-6" y="-28" width="10" height="28" rx="5" fill="#3a3340" />
        <rect x="14" y="-28" width="10" height="28" rx="5" fill="#3a3340" />
        <g fill="#f6f2e8">
          <circle cx="-30" cy="-52" r="22" />
          <circle cx="-4" cy="-64" r="26" />
          <circle cx="22" cy="-52" r="22" />
          <circle cx="-16" cy="-40" r="20" />
          <circle cx="10" cy="-38" r="20" />
        </g>
        <ellipse cx="42" cy="-66" rx="18" ry="20" fill="#453b4a" />
        <circle cx="30" cy="-84" r="10" fill="#f6f2e8" />
        <ellipse cx="56" cy="-82" rx="9" ry="6" fill="#3a3340" transform="rotate(24 56 -82)" />
        <Eye x={46} y={-70} r={4.4} />
        <ellipse cx="50" cy="-56" rx="7" ry="5" fill="#2b242f" />
      </g>
    </g>
  );
}

function Zorro() {
  return (
    <g>
      <Shadow rx={50} ry={9} />
      <g className="cuento-breathe">
        <path d="M -66 -18 q -34 -6 -44 -44 q 30 6 44 22 z" fill="#e0a566" />
        <path d="M -70 -22 q -22 -6 -32 -28 q 20 6 30 16 z" fill="#f6e6cf" />
        <rect x="-40" y="-32" width="13" height="32" rx="6" fill="#c98b4c" />
        <rect x="24" y="-32" width="13" height="32" rx="6" fill="#c98b4c" />
        <ellipse cx="-4" cy="-52" rx="52" ry="30" fill="#e0a566" />
        <path d="M -50 -44 q 44 22 92 -2 q -8 24 -46 24 q -38 0 -46 -22 z" fill="#f6e6cf" />
        <path d="M 30 -104 l -8 -34 l 26 20 z" fill="#e0a566" />
        <path d="M 62 -100 l 16 -32 l 6 30 z" fill="#e0a566" />
        <path d="M 33 -102 l -3 -20 l 14 12 z" fill="#f0c9a0" />
        <path d="M 64 -98 l 10 -18 l 3 17 z" fill="#f0c9a0" />
        <circle cx="52" cy="-80" r="30" fill="#e0a566" />
        <path d="M 40 -74 q 22 12 40 -2 q -6 20 -20 20 q -14 0 -20 -18 z" fill="#f6e6cf" />
        <ellipse cx="76" cy="-66" rx="8" ry="6" fill="#3a2b26" />
        <Eye x={44} y={-84} r={4.8} look={1} />
        <Eye x={66} y={-86} r={4.8} look={1} />
      </g>
    </g>
  );
}

function Picaflor() {
  return (
    <g>
      <g className="cuento-float">
        <path d="M -6 -70 q -40 -28 -62 -10 q 20 22 60 18 z" fill="#8fd8e8" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values="-14 -6 -70;14 -6 -70;-14 -6 -70" dur="0.28s" repeatCount="indefinite" />
        </path>
        <path d="M -6 -70 q -38 6 -50 32 q 28 8 54 -20 z" fill="#8fd8e8" opacity="0.55">
          <animateTransform attributeName="transform" type="rotate" values="16 -6 -70;-12 -6 -70;16 -6 -70" dur="0.28s" repeatCount="indefinite" />
        </path>
        <path d="M -40 -56 q -30 6 -46 26 q 26 6 44 -12 z" fill="#3f8f7a" />
        <ellipse cx="0" cy="-66" rx="30" ry="21" fill="#43a08a" transform="rotate(-14 0 -66)" />
        <path d="M -16 -58 q 22 12 40 -6 q -10 18 -26 18 q -12 0 -14 -12 z" fill="#f2d98c" />
        <circle cx="24" cy="-84" r="15" fill="#3f8f7a" />
        <path d="M 36 -84 q 30 4 44 12 q -30 6 -44 -4 z" fill="#2a2a33" />
        <Eye x={28} y={-88} r={4.2} look={1} />
      </g>
    </g>
  );
}

function Mariposa() {
  return (
    <g>
      <g className="cuento-float">
        <path d="M -4 -40 q -40 -40 -56 -10 q -10 34 52 24 z" fill="#f0973f">
          <animateTransform attributeName="transform" type="rotate" values="-12 -4 -40;10 -4 -40;-12 -4 -40" dur="1.6s" repeatCount="indefinite" />
        </path>
        <path d="M 4 -40 q 40 -40 56 -10 q 10 34 -52 24 z" fill="#f7b25f">
          <animateTransform attributeName="transform" type="rotate" values="12 4 -40;-10 4 -40;12 4 -40" dur="1.6s" repeatCount="indefinite" />
        </path>
        <circle cx="-34" cy="-42" r="6" fill="#4a2b1e" opacity="0.6" />
        <circle cx="34" cy="-42" r="6" fill="#4a2b1e" opacity="0.6" />
        <ellipse cx="0" cy="-38" rx="6" ry="20" fill="#4a2b1e" />
        <path d="M -3 -56 q -8 -12 -16 -14" stroke="#4a2b1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M 3 -56 q 8 -12 16 -14" stroke="#4a2b1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Vicuna() {
  return (
    <g>
      <Shadow rx={46} ry={9} />
      <g className="cuento-breathe">
        <rect x="-34" y="-56" width="12" height="56" rx="6" fill="#d9a367" />
        <rect x="-14" y="-56" width="12" height="56" rx="6" fill="#c48f57" />
        <rect x="14" y="-58" width="12" height="58" rx="6" fill="#d9a367" />
        <rect x="30" y="-58" width="12" height="58" rx="6" fill="#c48f57" />
        <ellipse cx="0" cy="-76" rx="48" ry="30" fill="#e0ad70" />
        <path d="M -44 -70 q 44 20 90 -4 q -8 24 -46 24 q -38 0 -44 -20 z" fill="#f7ead6" />
        <path d="M 30 -92 q 14 -26 22 -48 q 18 4 12 26 q -6 16 -12 30 z" fill="#e0ad70" />
        <ellipse cx="62" cy="-146" rx="20" ry="16" fill="#e0ad70" />
        <path d="M 54 -162 l -4 -22 l 12 18 z" fill="#e0ad70" />
        <path d="M 72 -162 l 6 -22 l 5 20 z" fill="#e0ad70" />
        <ellipse cx="80" cy="-140" rx="8" ry="6" fill="#f7ead6" />
        <ellipse cx="82" cy="-138" rx="4" ry="3" fill="#5b4030" />
        <Eye x={66} y={-149} r={4.4} look={1} />
      </g>
    </g>
  );
}

function Pelicano() {
  return (
    <g>
      <Shadow rx={40} ry={8} />
      <g className="cuento-breathe">
        <path d="M -12 -12 l -4 12 h 12 z" fill="#e6a03f" />
        <path d="M 12 -12 l -4 12 h 12 z" fill="#e6a03f" />
        <ellipse cx="0" cy="-58" rx="46" ry="36" fill="#eef1f4" />
        <path d="M -46 -58 q -22 6 -34 -8 q 22 -18 40 -14 z" fill="#d6dce3" />
        <circle cx="36" cy="-104" r="24" fill="#f7f9fb" />
        <path d="M 52 -100 q 44 4 52 22 q -6 22 -34 12 q -20 -8 -22 -24 z" fill="#e6a03f" />
        <path d="M 52 -100 q 40 6 48 20 q -22 6 -44 -6 z" fill="#f2b95e" />
        <Eye x={40} y={-110} r={4.6} look={1} />
      </g>
    </g>
  );
}

function Ballena() {
  return (
    <g>
      <g className="cuento-float">
        <path
          d="M -180 -30 q 60 -78 168 -62 q 74 12 118 -14 q -22 34 -10 60 q 12 26 36 34 q -50 16 -88 -6 q -86 34 -176 4 q -62 -22 -48 -16 z"
          fill="#3f6fa8"
        />
        <path d="M -160 -18 q 70 34 160 20 q 62 -10 100 -30 q -84 42 -180 30 q -48 -6 -80 -20 z" fill="#e9f2f7" opacity="0.85" />
        <path d="M -30 -84 q 22 -30 44 -20 q -10 12 -12 26 z" fill="#35608f" />
        <path d="M -60 -6 q 22 26 58 26 q -24 -18 -28 -32 z" fill="#35608f" />
        <path d="M -166 -48 q -30 -30 -44 -66 q 46 16 62 42 z" fill="#3f6fa8" />
        <circle cx="82" cy="-46" r="5.6" fill="#20303f" />
        <circle cx="83.6" cy="-47.6" r="2" fill="#ffffff" />
        <path d="M 94 -34 q 12 6 24 0" stroke="#2b4f78" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Carpintero() {
  return (
    <g>
      <g className="cuento-breathe">
        <ellipse cx="0" cy="-40" rx="20" ry="30" fill="#2b2b33" />
        <path d="M -14 -60 q 14 24 4 50 q -18 -14 -14 -44 z" fill="#f2f2f2" />
        <circle cx="4" cy="-76" r="17" fill="#2b2b33" />
        <path d="M -6 -88 q 14 -14 26 -2 q -12 8 -26 2 z" fill="#d9524f" />
        <path d="M 20 -76 l 26 6 l -26 8 z" fill="#e8e2d2" />
        <Eye x={10} y={-80} r={3.8} look={1} />
        <path d="M -18 -30 q -16 6 -16 18" stroke="#2b2b33" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ------------------------- Los tres cerditos ------------------------- */

// Cerdito base: los tres hermanos comparten cuerpo y cambian de ropa.
function Cerdito({ shirt = "#5aa0d8", hat = false, overalls = true }) {
  const tone = "#f7b4c4";
  const dark = "#e58fa6";
  return (
    <g>
      <Shadow rx={46} ry={9} />
      <g className="cuento-breathe">
        <rect x="-30" y="-30" width="16" height="30" rx="7" fill={tone} />
        <rect x="10" y="-30" width="16" height="30" rx="7" fill={tone} />
        <ellipse cx="-22" cy="-2" rx="11" ry="5" fill={dark} />
        <ellipse cx="18" cy="-2" rx="11" ry="5" fill={dark} />
        <path d="M -46 -72 q -16 -10 -10 -22 q 6 -8 14 -2" stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="-4" cy="-64" rx="44" ry="40" fill={tone} />
        {overalls ? (
          <g fill={shirt}>
            <path d="M -40 -70 q 36 20 72 0 v 38 q -36 16 -72 0 z" />
            <rect x="-22" y="-98" width="9" height="32" rx="4" />
            <rect x="6" y="-98" width="9" height="32" rx="4" />
            <rect x="-14" y="-62" width="20" height="14" rx="3" fill="#ffffff" opacity="0.35" />
          </g>
        ) : (
          <path d="M -46 -80 q 42 24 84 0 v 34 q -42 18 -84 0 z" fill={shirt} />
        )}
        <ellipse cx="-42" cy="-60" rx="13" ry="9" fill={tone} transform="rotate(-24 -42 -60)" />
        <ellipse cx="36" cy="-58" rx="13" ry="9" fill={tone} transform="rotate(22 36 -58)" />
        <circle cx="10" cy="-118" r="40" fill={tone} />
        <path d="M -20 -140 l -8 -32 l 26 16 z" fill={tone} />
        <path d="M 30 -146 l 12 -28 l 10 30 z" fill={tone} />
        <path d="M -18 -141 l -4 -18 l 14 9 z" fill={dark} />
        <path d="M 32 -144 l 8 -16 l 5 18 z" fill={dark} />
        <ellipse cx="34" cy="-106" rx="17" ry="12" fill={dark} />
        <circle cx="29" cy="-107" r="3.2" fill="#b5637e" />
        <circle cx="40" cy="-107" r="3.2" fill="#b5637e" />
        <Eye x={12} y={-126} r={5} look={1} />
        <Eye x={36} y={-128} r={5} look={1} />
        <Blush x={-8} y={-108} />
        <path d="M 14 -94 q 10 8 22 0" stroke="#b5637e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {hat ? (
          <g>
            <ellipse cx="8" cy="-152" rx="48" ry="10" fill="#dcb95f" />
            <path d="M -22 -152 q 6 -28 30 -28 q 24 0 30 28 z" fill="#f0d27f" />
            <path d="M -18 -158 h 52" stroke="#c98b4c" strokeWidth="4" strokeLinecap="round" />
          </g>
        ) : null}
      </g>
    </g>
  );
}

// Pipo: el juguetón, sombrero de paja y overol celeste.
function Pipo() {
  return <Cerdito shirt="#5aa0d8" hat />;
}

// Lolo: el glotón, camiseta verde.
function Lolo() {
  return <Cerdito shirt="#5cb56a" overalls={false} />;
}

// Tito: el trabajador, overol rojo.
function Tito() {
  return <Cerdito shirt="#d9483f" />;
}

// Lobo gris de pie, con panza clara, colmillo y cejas de pillo.
function Lobo() {
  const fur = "#7d8494";
  const furDark = "#5d6373";
  const cream = "#e6e6ea";
  return (
    <g>
      <Shadow rx={54} ry={10} />
      <g className="cuento-breathe">
        <path d="M -50 -66 q -48 -8 -62 -50 q 32 2 54 28 q 16 10 8 24 z" fill={furDark} />
        <rect x="-34" y="-36" width="16" height="36" rx="7" fill={furDark} />
        <rect x="8" y="-36" width="16" height="36" rx="7" fill={furDark} />
        <ellipse cx="-26" cy="-2" rx="12" ry="5" fill="#3f4452" />
        <ellipse cx="16" cy="-2" rx="12" ry="5" fill="#3f4452" />
        <ellipse cx="-6" cy="-84" rx="42" ry="52" fill={fur} />
        <ellipse cx="2" cy="-80" rx="24" ry="36" fill={cream} opacity="0.9" />
        <path d="M -40 -104 q -24 20 -10 46" stroke={fur} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 30 -100 q 26 16 16 46" stroke={fur} strokeWidth="14" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="-150" r="36" fill={fur} />
        <path d="M -14 -172 l -6 -40 l 30 22 z" fill={fur} />
        <path d="M 30 -178 l 12 -36 l 12 32 z" fill={fur} />
        <path d="M -12 -172 l -2 -24 l 16 14 z" fill="#c9a0b0" />
        <path d="M 32 -176 l 8 -22 l 6 20 z" fill="#c9a0b0" />
        <path d="M 28 -154 q 38 -8 50 10 q -10 20 -36 16 q -16 -6 -14 -26 z" fill={cream} />
        <ellipse cx="72" cy="-144" rx="8" ry="6" fill="#2b2b33" />
        <path d="M 40 -132 q 12 10 26 2" stroke="#2b2b33" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M 50 -129 l 3 8 l 3 -8 z" fill="#ffffff" />
        <Eye x={6} y={-158} r={5.2} look={1} />
        <Eye x={30} y={-160} r={5.2} look={1} />
        <path d="M -4 -172 l 18 6" stroke={furDark} strokeWidth="4" strokeLinecap="round" />
        <path d="M 22 -174 l 16 6" stroke={furDark} strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  );
}

export const CAST = {
  oso: { Art: Oso, h: 178 },
  buho: { Art: Buho, h: 150 },
  bufeo: { Art: Bufeo, h: 110, floats: true },
  rana: { Art: Rana, h: 70 },
  pez: { Art: Pez, h: 100, floats: true },
  nina: { Art: Nina, h: 166 },
  nina2: { Art: Nina2, h: 166 },
  nino: { Art: Nino, h: 172 },
  maquinista: { Art: Maquinista, h: 190 },
  oveja: { Art: Oveja, h: 96 },
  zorro: { Art: Zorro, h: 140 },
  picaflor: { Art: Picaflor, h: 100, floats: true },
  mariposa: { Art: Mariposa, h: 70, floats: true },
  vicuna: { Art: Vicuna, h: 180 },
  pelicano: { Art: Pelicano, h: 130 },
  ballena: { Art: Ballena, h: 140, floats: true },
  carpintero: { Art: Carpintero, h: 96, floats: true },
  pipo: { Art: Pipo, h: 178 },
  lolo: { Art: Lolo, h: 160 },
  tito: { Art: Tito, h: 160 },
  lobo: { Art: Lobo, h: 214 },
};
