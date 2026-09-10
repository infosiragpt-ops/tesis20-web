// Elementos de escenografía. Cada prop se dibuja en coordenadas absolutas del
// lienzo (1000 x 640) y recibe el generador aleatorio de la página para variar
// un poco entre escenas sin dejar de ser determinista.

import { mix, LIGHTS, VIEW_W, VIEW_H } from "./cuentos-art-base.jsx";

const GROUND = 560;

function warm(light) {
  return (LIGHTS[light] || LIGHTS.day).warm;
}
function isDark(light) {
  return light === "night" || light === "moonrise" || light === "dawn";
}

/* ----------------------------- cielo ----------------------------- */

function Luna({ light }) {
  const glow = isDark(light) ? 0.5 : 0.18;
  return (
    <g>
      <circle cx="820" cy="120" r="120" fill="#ffe9a8" opacity={glow * 0.35} />
      <circle cx="820" cy="120" r="78" fill="#ffe9a8" opacity={glow * 0.55} />
      <circle cx="820" cy="120" r="54" fill="#fff5d2" />
      <circle cx="806" cy="112" r="9" fill="#f0dfae" opacity="0.7" />
      <circle cx="836" cy="136" r="6" fill="#f0dfae" opacity="0.6" />
      <circle cx="828" cy="102" r="4" fill="#f0dfae" opacity="0.6" />
      <path d="M 806 128 q 14 12 28 0" stroke="#d9c184" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="802" cy="118" r="3" fill="#c9ad70" />
      <circle cx="836" cy="118" r="3" fill="#c9ad70" />
    </g>
  );
}

function Sol({ light }) {
  const c = light === "dusk" ? "#ff9f5a" : "#ffe07a";
  return (
    <g>
      <circle cx="168" cy="126" r="110" fill={c} opacity="0.22" />
      <circle cx="168" cy="126" r="72" fill={c} opacity="0.35" />
      <circle cx="168" cy="126" r="46" fill={mix(c, "#ffffff", 0.35)} />
      {Array.from({ length: 12 }).map((unused, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={168 + Math.cos(a) * 58}
            y1={126 + Math.sin(a) * 58}
            x2={168 + Math.cos(a) * 76}
            y2={126 + Math.sin(a) * 76}
            stroke={c}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
        );
      })}
    </g>
  );
}

function Estrellas({ rand }) {
  return (
    <g>
      {Array.from({ length: 8 }).map((unused, i) => {
        const x = 60 + rand() * (VIEW_W - 120);
        const y = 40 + rand() * 240;
        const s = 0.7 + rand() * 0.9;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity="0.95">
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill="#fff6d8">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + rand() * 3}s`} repeatCount="indefinite" />
            </path>
          </g>
        );
      })}
    </g>
  );
}

function Nubes({ rand, light }) {
  const c = light === "dusk" ? "#f7c9a6" : light === "night" || light === "moonrise" ? "#5a6ba8" : "#ffffff";
  return (
    <g opacity={light === "night" ? 0.45 : 0.85}>
      {Array.from({ length: 4 }).map((unused, i) => {
        const x = 60 + i * 250 + rand() * 60;
        const y = 70 + rand() * 160;
        const s = 0.7 + rand() * 0.7;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
            <ellipse cx="0" cy="0" rx="62" ry="24" />
            <circle cx="-26" cy="-10" r="26" />
            <circle cx="10" cy="-20" r="32" />
            <circle cx="42" cy="-6" r="22" />
          </g>
        );
      })}
    </g>
  );
}

function Niebla() {
  return (
    <g opacity="0.55">
      {Array.from({ length: 4 }).map((unused, i) => (
        <ellipse key={i} cx={200 + i * 220} cy={330 + i * 60} rx={300} ry={30} fill="#ffffff" opacity="0.5">
          <animate attributeName="cx" values={`${200 + i * 220};${240 + i * 220};${200 + i * 220}`} dur={`${9 + i * 3}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </g>
  );
}

function Viento({ rand }) {
  return (
    <g stroke="#ffffff" strokeOpacity="0.5" strokeWidth="4" fill="none" strokeLinecap="round">
      {Array.from({ length: 5 }).map((unused, i) => {
        const y = 180 + i * 60 + rand() * 30;
        const x = 80 + rand() * 200;
        return (
          <path key={i} d={`M ${x} ${y} q 90 -22 180 0 q 40 10 66 -8`}>
            <animate attributeName="stroke-opacity" values="0.1;0.55;0.1" dur={`${3 + i}s`} repeatCount="indefinite" />
          </path>
        );
      })}
    </g>
  );
}

function Nieve({ rand }) {
  return (
    <g>
      {Array.from({ length: 40 }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = rand() * VIEW_H;
        return (
          <circle key={i} cx={x} cy={y} r={1.6 + rand() * 2.4} fill="#ffffff" opacity={0.5 + rand() * 0.4}>
            <animate attributeName="cy" values={`${y};${y + 60}`} dur={`${5 + rand() * 6}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </g>
  );
}

function Cometa({ rand }) {
  const x = 700 + rand() * 120;
  const y = 110 + rand() * 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(-16)`}>
      <path d="M 0 -46 L 34 0 L 0 62 L -34 0 Z" fill="#e2604f" />
      <path d="M 0 -46 L 0 62" stroke="#a83f33" strokeWidth="2.4" />
      <path d="M -34 0 L 34 0" stroke="#a83f33" strokeWidth="2.4" />
      <path d="M 0 -46 L 34 0 L 0 8 Z" fill="#f2f0e6" opacity="0.35" />
      <path d="M 0 62 q 22 30 -6 52 q -26 22 -2 48 q 22 24 -6 44" stroke="#f2c14e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g fill="#3f6fae">
        <circle cx="14" cy="86" r="6" />
        <circle cx="-8" cy="128" r="6" />
        <circle cx="10" cy="168" r="6" />
      </g>
      <animateTransform attributeName="transform" type="rotate" values="-16;-6;-16" dur="5s" additive="sum" repeatCount="indefinite" />
    </g>
  );
}

/* --------------------------- terreno ---------------------------- */

function Montanas({ rand, light }) {
  const c = isDark(light) ? "#2b3560" : "#8aa2c4";
  return (
    <g opacity="0.75">
      {Array.from({ length: 3 }).map((unused, i) => {
        const x = 90 + i * 320 + rand() * 80;
        const h = 120 + rand() * 90;
        return (
          <g key={i}>
            <path d={`M ${x - 150} 430 L ${x} ${430 - h} L ${x + 150} 430 Z`} fill={c} />
            <path d={`M ${x - 40} ${430 - h + 40} L ${x} ${430 - h} L ${x + 40} ${430 - h + 40} l -22 -6 l -18 8 z`} fill="#f2f7ff" opacity="0.85" />
          </g>
        );
      })}
    </g>
  );
}

function Dunas({ rand }) {
  return (
    <g stroke="#f2e0c4" strokeOpacity="0.22" fill="none" strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: 6 }).map((unused, i) => (
        <path key={i} d={`M ${-20 + rand() * 100} ${470 + i * 30} q 200 ${-16 - rand() * 16} 420 4 q 200 18 420 -8`} />
      ))}
    </g>
  );
}

function Pasto({ rand, light }) {
  const c = isDark(light) ? "#2c4a35" : "#4f8a4d";
  return (
    <g stroke={c} strokeWidth="4" strokeLinecap="round" fill="none">
      {Array.from({ length: 34 }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = 520 + rand() * 110;
        const h = 14 + rand() * 22;
        return <path key={i} d={`M ${x} ${y} q ${rand() * 10 - 5} ${-h * 0.6} ${rand() * 12 - 6} ${-h}`} />;
      })}
    </g>
  );
}

function Arena({ rand }) {
  return (
    <g fill="#e9d6ae">
      {Array.from({ length: 60 }).map((unused, i) => (
        <circle key={i} cx={rand() * VIEW_W} cy={520 + rand() * 120} r={1 + rand() * 2.4} opacity={0.35 + rand() * 0.4} />
      ))}
    </g>
  );
}

function Piedras({ rand, light }) {
  const c = isDark(light) ? "#413a52" : "#8d8577";
  return (
    <g>
      {Array.from({ length: 5 }).map((unused, i) => {
        const x = 70 + rand() * 260 + (i > 2 ? 560 : 0);
        const y = 520 + rand() * 70;
        const s = 0.6 + rand() * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx="0" cy="4" rx="40" ry="10" fill="#0b1226" opacity="0.2" />
            <path d="M -36 2 q 4 -30 34 -30 q 32 0 36 30 z" fill={c} />
            <path d="M -22 -8 q 12 -14 28 -12 q -14 2 -22 14 z" fill="#ffffff" opacity="0.2" />
          </g>
        );
      })}
    </g>
  );
}

function Roca({ light }) {
  const c = isDark(light) ? "#3a3450" : "#7a7266";
  return (
    <g transform="translate(830 470)">
      <path d="M -90 90 q -6 -96 60 -104 q 74 -8 84 104 z" fill={c} />
      <path d="M -50 20 q 26 -30 60 -24 q -30 6 -44 30 z" fill="#ffffff" opacity="0.18" />
      <ellipse cx="0" cy="92" rx="100" ry="14" fill="#0b1226" opacity="0.22" />
    </g>
  );
}

function Arboles({ rand, light }) {
  const trunk = isDark(light) ? "#2f2622" : "#6b4a33";
  const leaf = isDark(light) ? "#1f3a2c" : "#3f7a4a";
  return (
    <g>
      {Array.from({ length: 4 }).map((unused, i) => {
        const x = i < 2 ? 60 + rand() * 180 : 740 + rand() * 190;
        const s = 0.75 + rand() * 0.6;
        const y = 545 + rand() * 30;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx="0" cy="4" rx="46" ry="10" fill="#0b1226" opacity="0.22" />
            <path d="M -9 0 q -4 -70 4 -104 h 12 q 8 34 4 104 z" fill={trunk} />
            <circle cx="0" cy="-118" r="52" fill={leaf} />
            <circle cx="-36" cy="-96" r="34" fill={leaf} />
            <circle cx="36" cy="-100" r="32" fill={leaf} />
            <circle cx="-10" cy="-146" r="30" fill={mix(leaf, "#ffffff", 0.14)} />
          </g>
        );
      })}
    </g>
  );
}

function Selva({ rand, light }) {
  const leaf = isDark(light) ? "#16352c" : "#2f6b4f";
  const leaf2 = mix(leaf, "#ffffff", 0.16);
  const Frond = ({ x, y, r, s, fill }) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M 0 0 q 60 -30 150 -14 q -70 46 -150 14 z" fill={fill} />
      <path d="M 0 0 q 70 -14 150 -14" stroke="#0b1a14" strokeOpacity="0.25" strokeWidth="3" fill="none" />
    </g>
  );
  return (
    <g>
      <Frond x={-20} y={520} r={-24} s={1.3} fill={leaf} />
      <Frond x={-30} y={610} r={-6} s={1.5} fill={leaf2} />
      <Frond x={VIEW_W + 20} y={540} r={204} s={1.4} fill={leaf} />
      <Frond x={VIEW_W + 30} y={630} r={186} s={1.2} fill={leaf2} />
      <Frond x={110} y={200} r={150} s={0.9} fill={leaf} />
      <Frond x={VIEW_W - 110} y={170} r={30} s={0.85} fill={leaf} />
      {Array.from({ length: 3 }).map((unused, i) => (
        <path
          key={i}
          d={`M ${180 + i * 300 + rand() * 60} -10 q 12 120 -8 210`}
          stroke={leaf}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}
    </g>
  );
}

function Hojas({ rand, light }) {
  const c = light === "dusk" ? "#d99a5a" : "#6ba05f";
  return (
    <g>
      {Array.from({ length: 12 }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = 120 + rand() * 380;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rand() * 360})`}>
            <path d="M 0 0 q 16 -10 30 0 q -16 12 -30 0 z" fill={c} opacity={0.7 + rand() * 0.3}>
              <animateTransform attributeName="transform" type="rotate" values="0;24;0" dur={`${3 + rand() * 3}s`} repeatCount="indefinite" />
            </path>
          </g>
        );
      })}
    </g>
  );
}

function Musgo({ rand }) {
  return (
    <g fill="#6fa06a" opacity="0.85">
      {Array.from({ length: 14 }).map((unused, i) => (
        <ellipse key={i} cx={rand() * VIEW_W} cy={500 + rand() * 120} rx={16 + rand() * 26} ry={7 + rand() * 8} />
      ))}
    </g>
  );
}

function Raices({ light }) {
  const c = isDark(light) ? "#2a231f" : "#5c4231";
  return (
    <g stroke={c} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.9">
      <path d="M -20 600 q 120 -30 180 20 q 60 40 140 10" />
      <path d="M 1020 590 q -140 -20 -200 30 q -50 34 -120 12" />
      <path d="M 60 640 q 80 -50 190 -26" strokeWidth="9" />
    </g>
  );
}

function Tronco({ light }) {
  const c = isDark(light) ? "#3a2f26" : "#7a5738";
  return (
    <g transform="translate(760 540)">
      <ellipse cx="0" cy="34" rx="150" ry="14" fill="#0b1226" opacity="0.22" />
      <rect x="-150" y="-16" width="300" height="52" rx="26" fill={c} />
      <ellipse cx="-150" cy="10" rx="16" ry="26" fill={mix(c, "#ffffff", 0.25)} />
      <ellipse cx="-150" cy="10" rx="8" ry="14" fill={mix(c, "#000000", 0.2)} />
      <path d="M -110 -6 h 200" stroke={mix(c, "#000000", 0.25)} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Cueva({ light }) {
  return (
    <g transform="translate(150 470)">
      <path d="M -110 110 q 0 -130 110 -130 q 110 0 110 130 z" fill={isDark(light) ? "#0d1428" : "#33303f"} />
      <path d="M -80 110 q 0 -96 80 -96 q 80 0 80 96 z" fill="#060a16" />
      <ellipse cx="0" cy="110" rx="120" ry="12" fill="#0b1226" opacity="0.3" />
    </g>
  );
}

/* ---------------------------- agua ------------------------------ */

function Agua({ rand }) {
  return (
    <g stroke="#dff4ff" strokeOpacity="0.35" strokeWidth="3.4" fill="none" strokeLinecap="round">
      {Array.from({ length: 8 }).map((unused, i) => {
        const y = 470 + i * 22;
        const x = rand() * 200;
        return (
          <path key={i} d={`M ${x - 60} ${y} q 60 -9 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}>
            <animate attributeName="stroke-opacity" values="0.12;0.4;0.12" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
          </path>
        );
      })}
    </g>
  );
}

function Mar() {
  return (
    <g>
      <rect x="-20" y="392" width={VIEW_W + 40} height="16" fill="#ffffff" opacity="0.28" />
      {Array.from({ length: 6 }).map((unused, i) => (
        <ellipse key={i} cx={120 + i * 170} cy={420 + i * 14} rx={70} ry={4} fill="#ffffff" opacity="0.35" />
      ))}
    </g>
  );
}

function Olas({ rand }) {
  return (
    <g>
      {Array.from({ length: 4 }).map((unused, i) => {
        const y = 470 + i * 34;
        return (
          <g key={i}>
            <path
              d={`M -30 ${y} q 70 -26 140 0 q 70 26 140 0 q 70 -26 140 0 q 70 26 140 0 q 70 -26 140 0 q 70 26 140 0`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.5 - i * 0.08}
              strokeWidth={6}
              strokeLinecap="round"
            >
              <animate attributeName="stroke-opacity" values={`${0.2 - i * 0.03};${0.6 - i * 0.08};${0.2 - i * 0.03}`} dur={`${2.6 + i}s`} repeatCount="indefinite" />
            </path>
            {Array.from({ length: 5 }).map((u2, j) => (
              <circle key={j} cx={60 + j * 190 + rand() * 40} cy={y - 6} r={3 + rand() * 4} fill="#ffffff" opacity="0.5" />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function Arroyo() {
  return (
    <g>
      <path d="M -20 640 q 180 -90 320 -120 q 120 -26 190 -70" stroke="#8fd3e8" strokeWidth="44" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M -20 640 q 180 -90 320 -120 q 120 -26 190 -70" stroke="#e4f7ff" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.6" />
      {Array.from({ length: 5 }).map((unused, i) => (
        <ellipse key={i} cx={60 + i * 90} cy={600 - i * 44} rx={16} ry={5} fill="#ffffff" opacity="0.5">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${2 + i * 0.6}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </g>
  );
}

function Nenufar({ rand }) {
  return (
    <g>
      {Array.from({ length: 4 }).map((unused, i) => {
        const x = i < 2 ? 90 + rand() * 160 : 720 + rand() * 200;
        const y = 500 + rand() * 90;
        const s = 0.7 + rand() * 0.6;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M 0 0 a 56 22 0 1 0 0.1 0 z" fill="#3f8f5f" />
            <path d="M 0 0 l 26 -14" stroke="#2b6b45" strokeWidth="5" />
            <ellipse cx="-8" cy="-4" rx="30" ry="10" fill="#5aa870" opacity="0.7" />
            {i === 1 ? (
              <g transform="translate(6 -18)">
                <path d="M 0 0 q -14 -12 0 -22 q 14 10 0 22 z" fill="#f7d9e4" />
                <path d="M 0 0 q -22 -4 -18 -18 q 18 2 18 18 z" fill="#f2c3d4" />
                <path d="M 0 0 q 22 -4 18 -18 q -18 2 -18 18 z" fill="#f2c3d4" />
                <circle cx="0" cy="-8" r="5" fill="#f2c14e" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Canoa({ light }) {
  const c = isDark(light) ? "#5a3f2c" : "#8a5f3c";
  return (
    <g transform="translate(230 520)">
      <ellipse cx="0" cy="46" rx="140" ry="16" fill="#0b1226" opacity="0.22" />
      <path d="M -130 0 q 130 60 260 0 q -30 44 -130 44 q -100 0 -130 -44 z" fill={c} />
      <path d="M -112 6 q 112 46 224 0 q -26 30 -112 30 q -86 0 -112 -30 z" fill={mix(c, "#000000", 0.25)} />
      <path d="M -60 -4 l 140 -62" stroke={mix(c, "#ffffff", 0.2)} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="86" cy="-70" rx="20" ry="9" fill={mix(c, "#ffffff", 0.3)} transform="rotate(-24 86 -70)" />
      <g transform="translate(-46 -14)">
        <path d="M 0 0 q -12 -14 0 -22 q 12 8 0 22 z" fill="#f2c3d4" />
        <circle cx="0" cy="-8" r="4" fill="#f2c14e" />
      </g>
    </g>
  );
}

function Caracola() {
  return (
    <g transform="translate(760 560) rotate(-12)">
      <ellipse cx="0" cy="34" rx="66" ry="12" fill="#0b1226" opacity="0.22" />
      <path d="M -54 20 q -14 -70 40 -84 q 56 -14 66 46 q 8 48 -40 58 q -48 10 -66 -20 z" fill="#f7e2d0" />
      <path d="M -30 16 q -8 -46 26 -56 q 34 -8 40 30 q 6 32 -26 38 q -32 6 -40 -12 z" fill="#efc9b0" />
      <path d="M -8 8 q -4 -26 14 -32 q 18 -4 22 16 q 4 18 -14 22 q -18 4 -22 -6 z" fill="#e0aa93" />
      <path d="M -54 20 q 16 24 54 20" stroke="#d9a88c" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function EstrellaMar() {
  return (
    <g transform="translate(300 590)">
      <g fill="#f0895f">
        {Array.from({ length: 5 }).map((unused, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <ellipse
              key={i}
              cx={Math.cos(a) * 28}
              cy={Math.sin(a) * 18}
              rx="16"
              ry="9"
              transform={`rotate(${(i / 5) * 360} ${Math.cos(a) * 28} ${Math.sin(a) * 18})`}
            />
          );
        })}
      </g>
      <circle cx="0" cy="0" r="20" fill="#f2a077" />
      {Array.from({ length: 7 }).map((unused, i) => (
        <circle key={i} cx={-10 + i * 3.4} cy={-6 + (i % 3) * 7} r="2" fill="#d96f4c" />
      ))}
    </g>
  );
}

/* --------------------------- objetos ---------------------------- */

function Farol() {
  return (
    <g transform="translate(190 560)">
      <ellipse cx="0" cy="6" rx="46" ry="10" fill="#0b1226" opacity="0.25" />
      <circle cx="0" cy="-52" r="90" fill="#ffd98a" opacity="0.22">
        <animate attributeName="opacity" values="0.14;0.3;0.14" dur="3.4s" repeatCount="indefinite" />
      </circle>
      <path d="M -22 0 h 44 l -4 -12 h -36 z" fill="#6a5540" />
      <path d="M -20 -12 h 40 v -46 h -40 z" fill="#ffe9a8" opacity="0.9" />
      <path d="M -22 -58 h 44 l -22 -20 z" fill="#6a5540" />
      <path d="M -20 -12 v -46 M 0 -12 v -46 M 20 -12 v -46" stroke="#6a5540" strokeWidth="3.4" />
      <path d="M 0 -78 q 0 -14 -12 -16 q 16 -6 22 8" stroke="#6a5540" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-36" rx="9" ry="13" fill="#fff6d2" />
    </g>
  );
}

function Panal() {
  return (
    <g transform="translate(770 40)">
      <path d="M 0 0 v 70" stroke="#6b4a33" strokeWidth="5" />
      <path d="M -46 70 q 46 -22 92 0 q 6 72 -46 96 q -52 -24 -46 -96 z" fill="#e8b455" />
      {Array.from({ length: 8 }).map((unused, i) => {
        const cx = -26 + (i % 3) * 26;
        const cy = 96 + Math.floor(i / 3) * 26;
        return <path key={i} d={`M ${cx} ${cy - 11} l 10 6 v 11 l -10 6 l -10 -6 v -11 z`} fill="#c9913c" />;
      })}
      <g>
        <ellipse cx="66" cy="60" rx="9" ry="6" fill="#f2c14e" />
        <path d="M 60 60 h 12" stroke="#3a2b1e" strokeWidth="2.4" />
        <ellipse cx="66" cy="54" rx="8" ry="4" fill="#ffffff" opacity="0.7" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 18 -12; 0 0" dur="4s" repeatCount="indefinite" />
      </g>
    </g>
  );
}

function Puente({ light }) {
  const c = isDark(light) ? "#4a3a2c" : "#7a5a3c";
  return (
    <g>
      <path d="M -20 430 q 500 130 1040 -20" stroke={c} strokeWidth="9" fill="none" />
      <path d="M -20 380 q 500 130 1040 -20" stroke={c} strokeWidth="6" fill="none" opacity="0.8" />
      {Array.from({ length: 13 }).map((unused, i) => {
        const t = i / 12;
        const x = -20 + t * 1040;
        const y1 = 430 + Math.sin(Math.PI * t) * 62 - t * 20;
        const y2 = 380 + Math.sin(Math.PI * t) * 62 - t * 20;
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={c} strokeWidth="4" />
            <rect x={x - 24} y={y1} width="48" height="9" rx="3" fill={mix(c, "#ffffff", 0.18)} />
          </g>
        );
      })}
    </g>
  );
}

function Casa({ light }) {
  const wall = isDark(light) ? "#8a6f5c" : "#e2c39c";
  return (
    <g transform="translate(150 560) scale(1.05)">
      <ellipse cx="0" cy="6" rx="120" ry="12" fill="#0b1226" opacity="0.22" />
      <rect x="-86" y="-116" width="172" height="118" rx="8" fill={wall} />
      <path d="M -104 -116 L 0 -184 L 104 -116 Z" fill="#b8503f" />
      <path d="M -104 -116 h 208 v 12 h -208 z" fill="#9c412f" />
      <rect x="-26" y="-66" width="52" height="66" rx="6" fill="#7a5535" />
      <circle cx="14" cy="-32" r="4" fill="#f2c14e" />
      <rect x="-70" y="-98" width="34" height="30" rx="5" fill={isDark(light) ? "#ffd98a" : "#a9d4e8"} />
      <rect x="38" y="-98" width="34" height="30" rx="5" fill={isDark(light) ? "#ffd98a" : "#a9d4e8"} />
      <path d="M -70 -83 h 34 M -53 -98 v 30" stroke="#7a5535" strokeWidth="3" />
      <path d="M 38 -83 h 34 M 55 -98 v 30" stroke="#7a5535" strokeWidth="3" />
    </g>
  );
}

function Estacion({ light }) {
  const wall = isDark(light) ? "#7a6a5c" : "#f0e2c9";
  return (
    <g transform="translate(180 560)">
      <ellipse cx="0" cy="6" rx="130" ry="12" fill="#0b1226" opacity="0.22" />
      <rect x="-96" y="-104" width="192" height="106" rx="8" fill={wall} />
      <path d="M -116 -104 h 232 l -18 -30 h -196 z" fill="#4a6f8a" />
      <rect x="-30" y="-64" width="60" height="64" rx="5" fill="#6b4a33" />
      <rect x="-82" y="-88" width="38" height="32" rx="4" fill="#a9d4e8" />
      <rect x="46" y="-88" width="38" height="32" rx="4" fill="#a9d4e8" />
      <rect x="-58" y="-148" width="116" height="34" rx="8" fill="#3f6291" />
      <text x="0" y="-125" textAnchor="middle" fontSize="19" fontWeight="700" fill="#ffffff" fontFamily="system-ui, sans-serif">
        NIDO
      </text>
    </g>
  );
}

function Tren({ light }) {
  const body = "#c9483f";
  return (
    <g transform="translate(820 560) scale(0.7)">
      <ellipse cx="0" cy="26" rx="180" ry="14" fill="#0b1226" opacity="0.22" />
      <rect x="-170" y="10" width="340" height="9" rx="4" fill={isDark(light) ? "#4a4458" : "#8d8577"} />
      <rect x="-160" y="-70" width="120" height="72" rx="10" fill="#3f6291" />
      <rect x="-146" y="-56" width="40" height="34" rx="5" fill="#cfe8f5" />
      <rect x="-96" y="-56" width="40" height="34" rx="5" fill="#cfe8f5" />
      <rect x="-20" y="-84" width="150" height="86" rx="12" fill={body} />
      <rect x="-6" y="-70" width="46" height="40" rx="6" fill="#cfe8f5" />
      <rect x="52" y="-58" width="86" height="58" rx="10" fill={mix(body, "#000000", 0.15)} />
      <rect x="120" y="-40" width="26" height="40" rx="6" fill="#f2c14e" />
      <rect x="44" y="-128" width="34" height="48" rx="7" fill="#2f3b52" />
      <path d="M 40 -128 h 42 l -6 -14 h -30 z" fill="#2f3b52" />
      <g fill="#ffffff" opacity="0.85">
        <circle cx="62" cy="-160" r="20">
          <animate attributeName="cy" values="-160;-210" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="86" cy="-188" r="15">
          <animate attributeName="cy" values="-188;-236" dur="3s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="3s" begin="0.8s" repeatCount="indefinite" />
        </circle>
      </g>
      {[-130, -80, 10, 70, 120].map((x) => (
        <g key={x}>
          <circle cx={x} cy="8" r="20" fill="#2f3b52" />
          <circle cx={x} cy="8" r="8" fill="#8d8577" />
        </g>
      ))}
    </g>
  );
}

function Boleto() {
  return (
    <g transform="translate(300 300) rotate(-10)">
      <g>
        <rect x="-56" y="-32" width="112" height="64" rx="10" fill="#f7efdc" stroke="#c9a86c" strokeWidth="3" />
        <circle cx="-56" cy="0" r="8" fill="#f2eadb" stroke="#c9a86c" strokeWidth="3" />
        <circle cx="56" cy="0" r="8" fill="#f2eadb" stroke="#c9a86c" strokeWidth="3" />
        <path d="M -24 -32 v 64" stroke="#c9a86c" strokeWidth="2.6" strokeDasharray="6 6" />
        <path d="M -8 -14 h 46 M -8 0 h 46 M -8 14 h 30" stroke="#a98c5c" strokeWidth="4" strokeLinecap="round" />
        <path d="M -46 -8 l 8 8 l -8 8" stroke="#c9483f" strokeWidth="4" fill="none" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -12; 0 0" dur="4.5s" repeatCount="indefinite" />
      </g>
    </g>
  );
}

function Silbato() {
  return (
    <g transform="translate(300 250)">
      <g fill="#ffffff" opacity="0.8">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={60 + i * 44} cy={-10 - i * 18} r={14 + i * 7}>
            <animate attributeName="opacity" values="0.8;0" dur="2.6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="r" values={`${10 + i * 5};${22 + i * 9}`} dur="2.6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      <rect x="-40" y="-20" width="80" height="40" rx="12" fill="#c9a24a" />
      <rect x="-40" y="-6" width="80" height="10" fill="#a8842f" />
      <rect x="34" y="-12" width="26" height="24" rx="8" fill="#e0be6c" />
      <circle cx="-40" cy="0" r="12" fill="#e0be6c" />
    </g>
  );
}

function Campana({ light }) {
  const wall = isDark(light) ? "#8a7a68" : "#efe0c6";
  return (
    <g transform="translate(820 560)">
      <ellipse cx="0" cy="6" rx="92" ry="12" fill="#0b1226" opacity="0.22" />
      <rect x="-62" y="-200" width="124" height="200" rx="8" fill={wall} />
      <path d="M -76 -200 h 152 l -20 -34 h -112 z" fill="#b8503f" />
      <path d="M -40 -190 h 80 v 74 h -80 z" fill="#3a3140" />
      <g transform="translate(0 -150)">
        <path d="M -22 22 q 0 -44 22 -44 q 22 0 22 44 z" fill="#e0b24a" />
        <rect x="-26" y="22" width="52" height="9" rx="4" fill="#c99a35" />
        <circle cx="0" cy="34" r="6" fill="#c99a35" />
        <animateTransform attributeName="transform" type="rotate" values="-9 0 -172;9 0 -172;-9 0 -172" dur="2.4s" repeatCount="indefinite" additive="sum" />
      </g>
      <rect x="-34" y="-70" width="68" height="70" rx="6" fill="#7a5535" />
    </g>
  );
}

function Cactus({ light }) {
  const c = isDark(light) ? "#2f5c46" : "#4f8a5f";
  return (
    <g transform="translate(830 560)">
      <ellipse cx="0" cy="6" rx="56" ry="10" fill="#0b1226" opacity="0.25" />
      <rect x="-22" y="-180" width="44" height="182" rx="22" fill={c} />
      <path d="M -22 -110 q -44 0 -44 -40 v -24 q 0 -14 14 -14 t 14 14 v 20 q 0 18 16 18 z" fill={c} />
      <path d="M 22 -132 q 44 0 44 -40 v -18 q 0 -14 14 -14 t 14 14 v 22 q 0 54 -72 54 z" fill={c} />
      <g stroke={mix(c, "#ffffff", 0.35)} strokeWidth="3" strokeLinecap="round">
        <path d="M -8 -170 v 150 M 8 -170 v 150" />
      </g>
      <g transform="translate(0 -190)">
        <path d="M 0 0 q -16 -14 0 -26 q 16 12 0 26 z" fill="#f7f0e2" />
        <path d="M 0 0 q -24 -6 -20 -22 q 20 4 20 22 z" fill="#f2e6d2" />
        <path d="M 0 0 q 24 -6 20 -22 q -20 4 -20 22 z" fill="#f2e6d2" />
        <circle cx="0" cy="-10" r="5" fill="#f2c14e" />
      </g>
    </g>
  );
}

function Flores({ rand, light }) {
  const colors = ["#f2c14e", "#f0896f", "#e6e2f2", "#f7d9e4"];
  return (
    <g>
      {Array.from({ length: 16 }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = 530 + rand() * 100;
        const s = 0.5 + rand() * 0.7;
        const c = colors[Math.floor(rand() * colors.length)];
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={`M 0 0 q -3 -22 2 -30`} stroke={isDark(light) ? "#2c4a35" : "#4f8a4d"} strokeWidth="4" fill="none" strokeLinecap="round" />
            {[0, 1, 2, 3, 4].map((p) => {
              const a = (p / 5) * Math.PI * 2;
              return <ellipse key={p} cx={2 + Math.cos(a) * 9} cy={-30 + Math.sin(a) * 9} rx="7" ry="7" fill={c} />;
            })}
            <circle cx="2" cy="-30" r="5" fill="#f7efc9" />
          </g>
        );
      })}
    </g>
  );
}

function Orquidea() {
  return (
    <g transform="translate(250 500)">
      <path d="M 0 120 q -14 -70 6 -110" stroke="#4f7a52" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g transform="translate(6 -14)">
        <path d="M 0 0 q -34 -22 -22 -48 q 26 4 22 48 z" fill="#a97fc9" />
        <path d="M 0 0 q 34 -22 22 -48 q -26 4 -22 48 z" fill="#a97fc9" />
        <path d="M 0 0 q -40 6 -40 30 q 30 6 40 -30 z" fill="#c6a2e0" />
        <path d="M 0 0 q 40 6 40 30 q -30 6 -40 -30 z" fill="#c6a2e0" />
        <path d="M 0 4 q -16 24 0 34 q 16 -10 0 -34 z" fill="#f0dff7" />
        <circle cx="0" cy="2" r="7" fill="#f2c14e" />
      </g>
      <path d="M -6 60 q -46 -12 -60 -40 q 44 -2 60 40 z" fill="#4f7a52" />
    </g>
  );
}

function FlorCristal() {
  return (
    <g transform="translate(660 430)">
      <circle cx="0" cy="0" r="120" fill="#dff6ff" opacity="0.28">
        <animate attributeName="opacity" values="0.16;0.4;0.16" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <path d="M 0 130 q -10 -70 0 -110" stroke="#5f9a72" strokeWidth="9" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <path
            key={i}
            d={`M 0 0 q ${Math.cos(a - 0.4) * 62} ${Math.sin(a - 0.4) * 62} ${Math.cos(a) * 74} ${Math.sin(a) * 74} q ${Math.cos(a + 0.4) * 10} ${Math.sin(a + 0.4) * 10} ${-Math.cos(a) * 74} ${-Math.sin(a) * 74} z`}
            fill="#cdeefc"
            opacity="0.9"
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}
      <circle cx="0" cy="0" r="20" fill="#fff4c9" />
      <circle cx="0" cy="0" r="10" fill="#ffffff" />
      {Array.from({ length: 6 }).map((unused, i) => (
        <circle key={i} cx={Math.cos(i) * 80} cy={Math.sin(i * 2) * 70} r="3.6" fill="#ffffff">
          <animate attributeName="opacity" values="0;1;0" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

function Gota() {
  return (
    <g transform="translate(300 340)">
      <path d="M -120 20 q 90 -50 190 -16 q -80 44 -190 16 z" fill="#4f8a5f" />
      <path d="M -120 20 q 90 -46 190 -16" stroke="#2f6b45" strokeWidth="3" fill="none" />
      <g transform="translate(56 14)">
        <path d="M 0 -26 q 22 24 22 38 a 22 22 0 1 1 -44 0 q 0 -14 22 -38 z" fill="#bfe8fb" opacity="0.92" />
        <ellipse cx="-6" cy="8" rx="6" ry="9" fill="#ffffff" opacity="0.75" />
        <animateTransform attributeName="transform" type="translate" values="56 14; 56 22; 56 14" dur="3s" repeatCount="indefinite" additive="sum" />
      </g>
    </g>
  );
}

function Estrella() {
  return (
    <g transform="translate(700 540)">
      <circle cx="0" cy="0" r="90" fill="#ffe9a8" opacity="0.3">
        <animate attributeName="opacity" values="0.18;0.42;0.18" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="0" cy="26" rx="60" ry="10" fill="#0b1226" opacity="0.18" />
      <path d="M 0 -46 L 13 -14 L 46 -12 L 20 10 L 28 42 L 0 24 L -28 42 L -20 10 L -46 -12 L -13 -14 Z" fill="#ffeb9f" />
      <path d="M 0 -30 L 8 -10 L 28 -8 L 12 6 L 17 26 L 0 15 L -17 26 L -12 6 L -28 -8 L -8 -10 Z" fill="#fff8dd" />
      <circle cx="-8" cy="-4" r="3.4" fill="#c9a24a" />
      <circle cx="10" cy="-4" r="3.4" fill="#c9a24a" />
      <path d="M -6 6 q 7 7 14 0" stroke="#c9a24a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Luciernagas({ rand }) {
  return (
    <g>
      {Array.from({ length: 26 }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = 180 + rand() * 400;
        const d = 2 + rand() * 3;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={11} fill="#f7e08a" opacity="0.22">
              <animate attributeName="opacity" values="0;0.35;0" dur={`${d}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={3.4} fill="#fff6c9">
              <animate attributeName="opacity" values="0.1;1;0.1" dur={`${d}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${y};${y - 16};${y}`} dur={`${d * 3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </g>
  );
}

function Huellas({ rand }) {
  return (
    <g fill="#c9b08a" opacity="0.6">
      {Array.from({ length: 9 }).map((unused, i) => {
        const x = 80 + i * 95 + rand() * 20;
        const y = 600 - i * 12 + (i % 2) * 18;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(0.8)`}>
            <ellipse cx="0" cy="0" rx="10" ry="8" />
            <circle cx="-9" cy="-11" r="3.6" />
            <circle cx="-2" cy="-14" r="3.6" />
            <circle cx="6" cy="-12" r="3.6" />
          </g>
        );
      })}
    </g>
  );
}

function Vasija({ light }) {
  const c = isDark(light) ? "#8a5a44" : "#c08256";
  return (
    <g transform="translate(240 560)">
      <ellipse cx="0" cy="6" rx="52" ry="10" fill="#0b1226" opacity="0.25" />
      <path d="M -40 0 q -18 -60 10 -78 q -14 -12 0 -20 h 60 q 14 8 0 20 q 28 18 10 78 z" fill={c} />
      <path d="M -34 -34 h 68" stroke="#f0e2c9" strokeWidth="7" />
      <path d="M -30 -50 q 12 -8 22 0 q 12 8 22 0" stroke="#f0e2c9" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g fill="#f0e2c9">
        <path d="M -22 -16 l 12 -6 l -2 6 l 10 3 l -12 4 z" />
        <path d="M 8 -14 l 12 -6 l -2 6 l 10 3 l -12 4 z" />
      </g>
    </g>
  );
}

function Lineas() {
  return (
    <g opacity="0.55" transform="translate(500 545) scale(1.15)">
      <g stroke="#e6d3a8" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -150 0 q -30 -22 -6 -36 q 30 -16 66 4" />
        <path d="M -90 -32 q 40 -26 96 -8 q 20 6 34 -4" />
        <path d="M 40 -44 q 50 -6 84 22 q -40 12 -84 -6" />
        <path d="M 24 -30 q -14 30 -66 44 q 30 12 74 -14" />
        <path d="M 40 -36 l 96 -6" />
        <path d="M -18 -14 q -20 40 -74 56" />
      </g>
      <ellipse cx="0" cy="14" rx="230" ry="40" fill="#e6d3a8" opacity="0.08" />
    </g>
  );
}

function Quena() {
  return (
    <g transform="translate(280 520) rotate(-22)">
      <ellipse cx="0" cy="70" rx="70" ry="10" fill="#0b1226" opacity="0.22" />
      <rect x="-14" y="-90" width="28" height="160" rx="14" fill="#d9b87c" />
      <rect x="-14" y="-90" width="12" height="160" rx="6" fill="#efd7a4" />
      <g fill="#8a6b3c">
        <circle cx="0" cy="-52" r="5.4" />
        <circle cx="0" cy="-22" r="5.4" />
        <circle cx="0" cy="8" r="5.4" />
        <circle cx="0" cy="38" r="5.4" />
      </g>
      <path d="M -14 -90 q 14 -12 28 0" fill="#c9a86c" />
      <g opacity="0.75">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={30 + i * 26} cy={-110 - i * 22} r={6 + i * 3} fill="#ffffff">
            <animate attributeName="opacity" values="0.7;0" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </g>
  );
}

function Sombrero() {
  return (
    <g transform="translate(680 250) rotate(-18)">
      <ellipse cx="0" cy="0" rx="70" ry="22" fill="#e0be7c" />
      <path d="M -34 -4 q 4 -40 34 -40 q 30 0 34 40 q -34 12 -68 0 z" fill="#efd6a0" />
      <path d="M -34 -8 q 34 12 68 0 l -2 -10 q -32 10 -64 0 z" fill="#c9483f" />
      <animateTransform attributeName="transform" type="rotate" values="-18;-6;-18" dur="4.4s" additive="sum" repeatCount="indefinite" />
    </g>
  );
}

/* --------------------- casas de «Los tres cerditos» --------------------- */

function Paja({ light }) {
  const straw = isDark(light) ? "#a08a4a" : "#e9c96a";
  const strawDark = isDark(light) ? "#7e6b36" : "#c9a54a";
  return (
    <g transform="translate(780 560)">
      <ellipse cx="0" cy="6" rx="130" ry="12" fill="#0b1226" opacity="0.22" />
      <path d="M -120 0 q 0 -150 120 -190 q 120 40 120 190 z" fill={straw} />
      {[-70, -30, 10, 50, 90].map((x, i) => (
        <path key={x} d={`M ${x} -10 q ${-8 - i * 2} -70 ${-20 + i * 4} -130`} stroke={strawDark} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      ))}
      <path d="M -128 -8 q 128 -30 256 0" stroke={strawDark} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M -20 -104 q 20 -30 40 0" stroke={strawDark} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M -30 0 v -64 a 30 30 0 0 1 60 0 v 64 z" fill="#8a5a33" />
      <circle cx="16" cy="-30" r="4" fill="#f2c14e" />
    </g>
  );
}

function Madera({ light }) {
  const wood = isDark(light) ? "#7a5a3a" : "#c58a52";
  const woodDark = isDark(light) ? "#5b4229" : "#9c6a3c";
  return (
    <g transform="translate(780 560)">
      <ellipse cx="0" cy="6" rx="130" ry="12" fill="#0b1226" opacity="0.22" />
      <rect x="-100" y="-120" width="200" height="120" rx="6" fill={wood} />
      {[-96, -72, -48, -24, 0, 24, 48, 72].map((y) => (
        <path key={y} d={`M -100 ${y} h 200`} stroke={woodDark} strokeWidth="4" opacity="0.8" />
      ))}
      <path d="M -120 -120 L 0 -196 L 120 -120 Z" fill={woodDark} />
      <path d="M -120 -120 h 240 v 12 h -240 z" fill="#6f4a2a" />
      <rect x="-26" y="-68" width="52" height="68" rx="5" fill="#5b3d22" />
      <circle cx="14" cy="-34" r="4" fill="#f2c14e" />
      <rect x="40" y="-96" width="34" height="30" rx="4" fill={isDark(light) ? "#ffd98a" : "#a9d4e8"} />
      <path d="M 40 -81 h 34 M 57 -96 v 30" stroke="#5b3d22" strokeWidth="3" />
    </g>
  );
}

function Ladrillos({ light }) {
  const brick = isDark(light) ? "#8a4a3e" : "#c9634f";
  const mortar = isDark(light) ? "#a27a6c" : "#e8b9a6";
  const glass = isDark(light) ? "#ffd98a" : "#a9d4e8";
  const rows = [-104, -84, -64, -44, -24, -4, 16];
  return (
    <g transform="translate(780 560)">
      <ellipse cx="0" cy="6" rx="136" ry="12" fill="#0b1226" opacity="0.22" />
      <rect x="-104" y="-124" width="208" height="124" rx="6" fill={brick} />
      <g stroke={mortar} strokeWidth="3" opacity="0.8">
        {rows.map((y) => (
          <path key={y} d={`M -104 ${y} h 208`} />
        ))}
        {rows.map((y, i) =>
          [0, 1, 2, 3, 4].map((j) => <path key={`${y}-${j}`} d={`M ${-104 + (i % 2) * 22 + j * 44} ${y} v 20`} />),
        )}
      </g>
      <rect x="40" y="-190" width="26" height="50" fill={brick} />
      <rect x="36" y="-196" width="34" height="10" fill="#7d2f27" />
      <path d="M -122 -124 L 0 -200 L 122 -124 Z" fill="#a83f33" />
      <path d="M -122 -124 h 244 v 12 h -244 z" fill="#7d2f27" />
      <rect x="-26" y="-70" width="52" height="70" rx="5" fill="#6b4a33" />
      <circle cx="14" cy="-36" r="4" fill="#f2c14e" />
      <rect x="-80" y="-100" width="36" height="32" rx="4" fill={glass} />
      <rect x="44" y="-100" width="36" height="32" rx="4" fill={glass} />
      <path d="M -80 -84 h 36 M -62 -100 v 32 M 44 -84 h 36 M 62 -100 v 32" stroke="#6b4a33" strokeWidth="3" />
    </g>
  );
}

function Olla() {
  return (
    <g transform="translate(150 560)">
      <ellipse cx="0" cy="6" rx="70" ry="10" fill="#0b1226" opacity="0.22" />
      <path d="M -22 -6 q 12 -34 22 -4 q 10 -30 22 4 q -22 12 -44 0 z" fill="#ff9d3c">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="0.9s" repeatCount="indefinite" />
      </path>
      <path d="M -34 0 l 8 -26 M 34 0 l -8 -26 M 0 0 v -26" stroke="#2b2b33" strokeWidth="7" strokeLinecap="round" />
      <path d="M -58 -28 q 0 -66 58 -66 q 58 0 58 66 q -20 14 -58 14 q -38 0 -58 -14 z" fill="#3a3f4c" />
      <ellipse cx="0" cy="-94" rx="58" ry="13" fill="#2b2f3a" />
      <ellipse cx="0" cy="-94" rx="46" ry="8" fill="#e8a24a" />
      <path d="M -70 -80 q -16 -12 -2 -22 M 70 -80 q 16 -12 2 -22" stroke="#2b2f3a" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M -20 -110 q -10 -20 4 -34 q 12 -12 2 -28">
          <animate attributeName="stroke-opacity" values="0.15;0.6;0.15" dur="2.4s" repeatCount="indefinite" />
        </path>
        <path d="M 18 -114 q 12 -18 -2 -34 q -10 -12 4 -26">
          <animate attributeName="stroke-opacity" values="0.6;0.15;0.6" dur="2.8s" repeatCount="indefinite" />
        </path>
      </g>
    </g>
  );
}

/* ------------------------ «Caperucita Roja» ------------------------ */

// Interior de la casa de la abuelita: tapa el paisaje con pared, piso,
// ventana con cortinas y una mesita con lámpara.
function Cuarto({ light }) {
  const wall = isDark(light) ? "#a58c73" : "#f1dcc0";
  const floor = isDark(light) ? "#7a5236" : "#b07a4f";
  return (
    <g>
      <rect x="-20" y="-20" width="1040" height="680" fill={wall} />
      <rect x="-20" y="560" width="1040" height="100" fill={floor} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <path key={i} d={`M ${-20 + i * 110} 560 v 100`} stroke="#8f6340" strokeWidth="3" opacity="0.7" />
      ))}
      <rect x="-20" y="548" width="1040" height="14" fill="#c99a6a" />
      <rect x="640" y="120" width="220" height="200" rx="10" fill={isDark(light) ? "#2b3b6b" : "#8ec9f0"} />
      <path d="M 640 220 h 220 M 750 120 v 200" stroke="#ffffff" strokeWidth="8" />
      <rect x="630" y="110" width="240" height="220" rx="12" fill="none" stroke="#a5713f" strokeWidth="12" />
      <path d="M 612 106 q 44 110 0 232 h 34 q -30 -120 0 -232 z" fill="#d9524a" />
      <path d="M 888 106 q -44 110 0 232 h -34 q 30 -120 0 -232 z" fill="#d9524a" />
      <rect x="150" y="150" width="120" height="96" rx="6" fill="#f7efe1" stroke="#a5713f" strokeWidth="8" />
      <circle cx="210" cy="198" r="22" fill="#f7b4c4" />
      <circle cx="210" cy="198" r="8" fill="#f2c14e" />
      <rect x="392" y="446" width="76" height="114" rx="6" fill="#8a5a33" />
      <rect x="400" y="470" width="60" height="10" rx="3" fill="#6b4a33" />
      <path d="M 396 446 q 34 -70 68 0 z" fill="#f2c14e" />
      <rect x="426" y="400" width="8" height="46" fill="#6b4a33" />
    </g>
  );
}

// Sendero de tierra que cruza el prado: la regla de mamá es no salirse de él.
function Sendero({ light }) {
  const dirt = isDark(light) ? "#8a7454" : "#d9b981";
  return (
    <g>
      <path d="M -20 640 q 240 -60 500 -70 q 260 -10 540 -24 v 34 q -280 8 -540 26 q -260 18 -500 74 z" fill={dirt} opacity="0.9" />
      <path d="M 40 604 q 220 -44 460 -52 q 240 -8 500 -18" stroke={isDark(light) ? "#a08a66" : "#c7a56a"} strokeWidth="3" fill="none" strokeDasharray="14 18" strokeLinecap="round" />
    </g>
  );
}

const PROP_LIST = {
  luna: Luna,
  sol: Sol,
  estrellas: Estrellas,
  nubes: Nubes,
  niebla: Niebla,
  viento: Viento,
  nieve: Nieve,
  cometa: Cometa,
  montanas: Montanas,
  dunas: Dunas,
  pasto: Pasto,
  arena: Arena,
  piedras: Piedras,
  roca: Roca,
  arboles: Arboles,
  selva: Selva,
  hojas: Hojas,
  musgo: Musgo,
  raices: Raices,
  tronco: Tronco,
  cueva: Cueva,
  agua: Agua,
  mar: Mar,
  olas: Olas,
  arroyo: Arroyo,
  nenufar: Nenufar,
  canoa: Canoa,
  caracola: Caracola,
  "estrella-mar": EstrellaMar,
  farol: Farol,
  panal: Panal,
  puente: Puente,
  casa: Casa,
  estacion: Estacion,
  tren: Tren,
  boleto: Boleto,
  silbato: Silbato,
  campana: Campana,
  cactus: Cactus,
  flores: Flores,
  orquidea: Orquidea,
  "flor-cristal": FlorCristal,
  gota: Gota,
  estrella: Estrella,
  luciernagas: Luciernagas,
  huellas: Huellas,
  vasija: Vasija,
  lineas: Lineas,
  quena: Quena,
  sombrero: Sombrero,
  paja: Paja,
  madera: Madera,
  ladrillos: Ladrillos,
  olla: Olla,
  cuarto: Cuarto,
  sendero: Sendero,
};

// Orden de dibujo: cielo y fondo primero, suelo y objetos después.
const LAYER = {
  luna: 0, sol: 0, estrellas: 0, nubes: 1, cometa: 1, montanas: 2, dunas: 2,
  niebla: 8, viento: 8, nieve: 9, mar: 3, agua: 3, olas: 3, arroyo: 3,
  arboles: 4, selva: 9, raices: 6, tronco: 5, cueva: 3, piedras: 5, roca: 4,
  pasto: 5, arena: 4, flores: 6, musgo: 5, hojas: 8, nenufar: 6, canoa: 6,
  caracola: 6, "estrella-mar": 6, farol: 6, panal: 1, puente: 3, casa: 4,
  estacion: 4, tren: 5, boleto: 7, silbato: 7, campana: 4, cactus: 5,
  orquidea: 6, "flor-cristal": 6, gota: 7, estrella: 6, luciernagas: 7,
  huellas: 5, vasija: 6, lineas: 5, quena: 6, sombrero: 7,
  paja: 4, madera: 4, ladrillos: 4, olla: 5,
  cuarto: 0, sendero: 5,
};

export function propLayer(id) {
  return LAYER[id] ?? 6;
}

export function Prop({ id, rand, light, set }) {
  const Art = PROP_LIST[id];
  if (!Art) return null;
  return <Art rand={rand} light={light} set={set} />;
}

/* ------------------------ emblemas de souvenir ------------------- */
// Dibujos pequeños (caja de -40 a 40) para el álbum y la repisa.

const EMBLEMS = {
  caperuza: (
    <g>
      <path d="M -30 30 q 0 -54 30 -58 q 30 4 30 58 z" fill="#d63b3b" />
      <path d="M -22 -6 q 0 -30 22 -32 q 22 2 22 32 q -8 -14 -22 -14 q -14 0 -22 14 z" fill="#b12d2d" />
      <circle cx="0" cy="-2" r="13" fill="#f2c9a8" />
      <circle cx="-4" cy="-4" r="2.2" fill="#1b1b23" />
      <circle cx="5" cy="-4" r="2.2" fill="#1b1b23" />
      <path d="M -3 4 q 3 3 6 0" stroke="#b5637e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  canasta: (
    <g>
      <path d="M -30 -4 q 30 -40 60 0" stroke="#a5713f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M -32 -2 h 64 l -8 34 h -48 z" fill="#c9955c" />
      <path d="M -28 10 h 56 M -26 20 h 52" stroke="#a5713f" strokeWidth="2.5" />
      <ellipse cx="0" cy="-2" rx="32" ry="6" fill="#dcae74" />
      <rect x="-14" y="-16" width="28" height="14" rx="3" fill="#f7d9e4" />
      <circle cx="0" cy="-16" r="4" fill="#e2453b" />
    </g>
  ),
  pajarito: (
    <g>
      <path d="M -34 6 l -12 -12 l 20 4 z" fill="#c9634f" />
      <ellipse cx="-4" cy="6" rx="24" ry="17" fill="#e2453b" />
      <path d="M -14 4 q 8 -20 26 -8 q -12 4 -18 14 z" fill="#b12d2d" />
      <circle cx="18" cy="-10" r="13" fill="#e2453b" />
      <path d="M 30 -10 l 12 4 l -12 4 z" fill="#f2a13c" />
      <circle cx="20" cy="-13" r="3" fill="#1b1b23" />
      <path d="M -8 22 v 8 M 4 22 v 8" stroke="#f2a13c" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  ramo: (
    <g>
      <path d="M -12 34 l 4 -30 M 0 34 v -34 M 12 34 l -4 -30" stroke="#4f8a3a" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="-14" cy="-6" r="10" fill="#f2c14e" />
      <circle cx="4" cy="-18" r="11" fill="#f28fb1" />
      <circle cx="18" cy="-2" r="9" fill="#9fd0ff" />
      <circle cx="-14" cy="-6" r="3.5" fill="#c98b1f" />
      <circle cx="4" cy="-18" r="3.5" fill="#c7527f" />
      <circle cx="18" cy="-2" r="3" fill="#3f6fa8" />
      <path d="M -10 22 q 10 -6 20 0 q -6 6 -10 4 q -4 2 -10 -4 z" fill="#d63b3b" />
    </g>
  ),
  gorro: (
    <g>
      <path d="M -30 16 q -6 -48 36 -46 q 18 6 10 30 q -20 -6 -46 16 z" fill="#ffffff" stroke="#e5d9d9" strokeWidth="2" />
      <path d="M -32 18 q 32 -14 64 0 q -32 12 -64 0 z" fill="#f4e4c8" stroke="#e0c9a8" strokeWidth="2" />
      <circle cx="18" cy="-2" r="7" fill="#f2c14e" />
    </g>
  ),
  manzana: (
    <g>
      <circle cx="0" cy="6" r="28" fill="#e2453b" />
      <circle cx="-9" cy="-3" r="9" fill="#ffffff" opacity="0.28" />
      <path d="M 0 -20 q 2 -12 8 -16" stroke="#6b4a2a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 2 -24 q 18 -12 24 4 q -18 8 -24 -4 z" fill="#5cb56a" />
    </g>
  ),
  casita: (
    <g>
      <rect x="-26" y="-6" width="52" height="34" rx="3" fill="#c9634f" />
      <path d="M -32 -6 L 0 -30 L 32 -6 Z" fill="#a83f33" />
      <rect x="12" y="-26" width="8" height="14" fill="#c9634f" />
      <rect x="-7" y="10" width="14" height="18" rx="2" fill="#6b4a33" />
      <path d="M -26 8 h 52 M -26 20 h 52" stroke="#e8b9a6" strokeWidth="2" />
    </g>
  ),
  escalera: (
    <g stroke="#b98756" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M -14 32 L -6 -32 M 14 32 L 6 -32" />
      <path d="M -12 18 h 24 M -10 4 h 20 M -8 -10 h 16 M -7 -24 h 14" strokeWidth="4" />
    </g>
  ),
  olla: (
    <g>
      <path d="M -26 -4 q 0 -28 26 -28 q 26 0 26 28 q -8 8 -26 8 q -18 0 -26 -8 z" fill="#3a3f4c" />
      <ellipse cx="0" cy="-32" rx="26" ry="6" fill="#2b2f3a" />
      <ellipse cx="0" cy="-32" rx="20" ry="4" fill="#e8a24a" />
      <path d="M -30 -20 q -8 -6 -2 -12 M 30 -20 q 8 -6 2 -12" stroke="#2b2f3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M -12 16 q 8 -18 12 -4 q 4 -14 12 4 q -12 8 -24 0 z" fill="#ff9d3c" />
      <path d="M -8 -40 q -4 -8 2 -14 M 8 -40 q 4 -8 -2 -14" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  luna: (
    <g>
      <path d="M 12 -30 a 32 32 0 1 0 8 58 a 26 26 0 1 1 -8 -58 z" fill="#ffe9a8" />
      <circle cx="20" cy="-14" r="4" fill="#f0d489" />
    </g>
  ),
  farol: (
    <g>
      <path d="M -16 24 h 32 l -3 -8 h -26 z" fill="#6a5540" />
      <rect x="-15" y="-16" width="30" height="32" rx="3" fill="#ffe9a8" />
      <path d="M -17 -16 h 34 l -17 -14 z" fill="#6a5540" />
      <path d="M 0 -30 q 0 -8 -8 -10" stroke="#6a5540" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  panal: (
    <g>
      <path d="M -22 -14 q 22 -12 44 0 q 4 36 -22 48 q -26 -12 -22 -48 z" fill="#e8b455" />
      <path d="M -8 2 l 8 5 v 9 l -8 5 l -8 -5 v -9 z" fill="#c9913c" />
      <path d="M 10 -2 l 8 5 v 9 l -8 5 l -8 -5 v -9 z" fill="#c9913c" />
    </g>
  ),
  estrella: (
    <g>
      <path d="M 0 -32 L 9 -10 L 32 -8 L 14 7 L 20 30 L 0 17 L -20 30 L -14 7 L -32 -8 L -9 -10 Z" fill="#ffeb9f" />
    </g>
  ),
  nenufar: (
    <g>
      <path d="M 0 6 a 34 14 0 1 0 0.1 0 z" fill="#3f8f5f" />
      <path d="M 0 6 l 16 -9" stroke="#2b6b45" strokeWidth="4" />
      <path d="M -2 -6 q -10 -10 0 -18 q 10 8 0 18 z" fill="#f7d9e4" />
    </g>
  ),
  canoa: (
    <g>
      <path d="M -32 -6 q 32 20 64 0 q -8 20 -32 20 q -24 0 -32 -20 z" fill="#8a5f3c" />
      <path d="M -16 -8 l 34 -18" stroke="#c9a86c" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  luciernaga: (
    <g>
      <circle cx="0" cy="0" r="20" fill="#f7e08a" opacity="0.4" />
      <ellipse cx="0" cy="4" rx="10" ry="7" fill="#f2c14e" />
      <circle cx="0" cy="-8" r="6" fill="#3a3140" />
      <ellipse cx="-8" cy="-2" rx="10" ry="5" fill="#ffffff" opacity="0.7" />
      <ellipse cx="8" cy="-2" rx="10" ry="5" fill="#ffffff" opacity="0.7" />
    </g>
  ),
  cometa: (
    <g>
      <path d="M 0 -30 L 22 0 L 0 34 L -22 0 Z" fill="#e2604f" />
      <path d="M 0 -30 L 0 34 M -22 0 L 22 0" stroke="#a83f33" strokeWidth="2" />
      <path d="M 0 34 q 14 14 -4 26" stroke="#f2c14e" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  sombrero: (
    <g>
      <ellipse cx="0" cy="10" rx="34" ry="11" fill="#e0be7c" />
      <path d="M -17 6 q 2 -22 17 -22 q 15 0 17 22 q -17 7 -34 0 z" fill="#efd6a0" />
      <path d="M -17 3 q 17 7 34 0 l -1 -6 q -16 6 -32 0 z" fill="#c9483f" />
    </g>
  ),
  flor: (
    <g>
      {[0, 1, 2, 3, 4].map((p) => {
        const a = (p / 5) * Math.PI * 2;
        return <ellipse key={p} cx={Math.cos(a) * 14} cy={Math.sin(a) * 14} rx="11" ry="11" fill="#f2c14e" />;
      })}
      <circle cx="0" cy="0" r="8" fill="#f7efc9" />
    </g>
  ),
  campana: (
    <g>
      <path d="M -20 18 q 0 -38 20 -38 q 20 0 20 38 z" fill="#e0b24a" />
      <rect x="-24" y="18" width="48" height="8" rx="4" fill="#c99a35" />
      <circle cx="0" cy="30" r="5" fill="#c99a35" />
    </g>
  ),
  cactus: (
    <g>
      <rect x="-9" y="-20" width="18" height="46" rx="9" fill="#4f8a5f" />
      <path d="M -9 0 q -18 0 -18 -16 v -8 q 0 -6 6 -6 t 6 6 v 6 q 0 8 6 8 z" fill="#4f8a5f" />
      <path d="M 9 -6 q 18 0 18 -16 v -6 q 0 -6 6 -6 t 6 6 v 8 q 0 22 -30 22 z" fill="#4f8a5f" />
      <path d="M 0 -26 q -8 -7 0 -13 q 8 6 0 13 z" fill="#f7f0e2" />
    </g>
  ),
  vasija: (
    <g>
      <path d="M -20 20 q -9 -30 5 -39 q -7 -6 0 -10 h 30 q 7 4 0 10 q 14 9 5 39 z" fill="#c08256" />
      <path d="M -17 -3 h 34" stroke="#f0e2c9" strokeWidth="4" />
    </g>
  ),
  colibri: (
    <g>
      <path d="M -22 -6 q -14 -16 -30 -14 q 12 18 30 14 z" fill="#e6d3a8" />
      <ellipse cx="0" cy="0" rx="20" ry="13" fill="#e6d3a8" transform="rotate(-12)" />
      <circle cx="16" cy="-10" r="9" fill="#e6d3a8" />
      <path d="M 24 -10 q 18 2 26 8 q -18 4 -26 -2 z" fill="#c9b08a" />
      <path d="M -18 4 q -18 8 -26 20 q 18 2 28 -12 z" fill="#c9b08a" />
    </g>
  ),
  zorro: null,
  boleto: (
    <g>
      <rect x="-30" y="-18" width="60" height="36" rx="7" fill="#f7efdc" stroke="#c9a86c" strokeWidth="3" />
      <path d="M -12 -18 v 36" stroke="#c9a86c" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M -2 -6 h 22 M -2 4 h 14" stroke="#a98c5c" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  tren: (
    <g>
      <rect x="-30" y="-8" width="34" height="24" rx="6" fill="#c9483f" />
      <rect x="4" y="-2" width="26" height="18" rx="5" fill="#a83b33" />
      <rect x="-14" y="-26" width="12" height="18" rx="4" fill="#2f3b52" />
      <circle cx="-20" cy="18" r="7" fill="#2f3b52" />
      <circle cx="16" cy="18" r="7" fill="#2f3b52" />
    </g>
  ),
  puente: (
    <g>
      <path d="M -32 10 q 32 -30 64 0" stroke="#7a5a3c" strokeWidth="5" fill="none" />
      <path d="M -32 -8 q 32 -30 64 0" stroke="#7a5a3c" strokeWidth="4" fill="none" opacity="0.8" />
      {[-24, -8, 8, 24].map((x) => (
        <line key={x} x1={x} y1={-16 + Math.abs(x) * 0.35} x2={x} y2={2 + Math.abs(x) * 0.35} stroke="#7a5a3c" strokeWidth="3" />
      ))}
    </g>
  ),
  silbato: (
    <g>
      <rect x="-24" y="-12" width="44" height="24" rx="8" fill="#c9a24a" />
      <rect x="16" y="-7" width="16" height="14" rx="5" fill="#e0be6c" />
      <circle cx="-24" cy="0" r="8" fill="#e0be6c" />
      <circle cx="26" cy="-18" r="6" fill="#ffffff" opacity="0.7" />
    </g>
  ),
  gota: (
    <g>
      <path d="M 0 -22 q 18 20 18 32 a 18 18 0 1 1 -36 0 q 0 -12 18 -32 z" fill="#bfe8fb" />
      <ellipse cx="-5" cy="12" rx="5" ry="7" fill="#ffffff" opacity="0.8" />
    </g>
  ),
  orquidea: (
    <g>
      <path d="M 0 4 q -26 -16 -18 -36 q 20 4 18 36 z" fill="#a97fc9" />
      <path d="M 0 4 q 26 -16 18 -36 q -20 4 -18 36 z" fill="#a97fc9" />
      <path d="M 0 4 q -30 4 -30 22 q 22 4 30 -22 z" fill="#c6a2e0" />
      <path d="M 0 4 q 30 4 30 22 q -22 4 -30 -22 z" fill="#c6a2e0" />
      <circle cx="0" cy="6" r="6" fill="#f2c14e" />
    </g>
  ),
  "flor-cristal": (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return <ellipse key={i} cx={Math.cos(a) * 18} cy={Math.sin(a) * 18} rx="12" ry="8" transform={`rotate(${(i / 6) * 360} ${Math.cos(a) * 18} ${Math.sin(a) * 18})`} fill="#cdeefc" stroke="#ffffff" strokeWidth="1.6" />;
      })}
      <circle cx="0" cy="0" r="10" fill="#fff4c9" />
    </g>
  ),
  caracola: (
    <g>
      <path d="M -26 12 q -6 -34 20 -42 q 28 -8 32 24 q 4 24 -20 30 q -24 6 -32 -12 z" fill="#f7e2d0" />
      <path d="M -12 8 q -4 -22 12 -27 q 16 -4 18 14 q 3 16 -12 19 q -15 3 -18 -6 z" fill="#efc9b0" />
      <path d="M -2 4 q -2 -12 6 -14 q 8 -2 10 8" stroke="#e0aa93" strokeWidth="3" fill="none" />
    </g>
  ),
  ola: (
    <g>
      <path d="M -34 12 q 18 -28 36 -8 q 14 16 32 -4" stroke="#5fc8e8" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M -30 26 q 16 -14 32 0 q 16 14 32 0" stroke="#9fe0f5" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="-4" cy="-6" r="4" fill="#ffffff" />
    </g>
  ),
  "estrella-mar": (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <ellipse key={i} cx={Math.cos(a) * 18} cy={Math.sin(a) * 18} rx="10" ry="6" transform={`rotate(${(i / 5) * 360} ${Math.cos(a) * 18} ${Math.sin(a) * 18})`} fill="#f0895f" />;
      })}
      <circle cx="0" cy="0" r="12" fill="#f2a077" />
    </g>
  ),
  hoja: (
    <g>
      <path d="M -24 14 q 10 -40 48 -34 q 4 38 -48 34 z" fill="#6ba05f" />
      <path d="M -24 14 q 26 -22 48 -20" stroke="#3f7a4a" strokeWidth="3" fill="none" />
    </g>
  ),
  tambor: (
    <g>
      <rect x="-24" y="-14" width="48" height="30" rx="6" fill="#a86a3c" />
      <ellipse cx="0" cy="-14" rx="24" ry="9" fill="#f0e2c9" />
      <path d="M -22 -8 l 44 16 M 22 -8 l -44 16" stroke="#f0e2c9" strokeWidth="3" opacity="0.7" />
      <path d="M 18 -30 l 12 -12" stroke="#7a5535" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  quena: (
    <g transform="rotate(-24)">
      <rect x="-7" y="-30" width="14" height="60" rx="7" fill="#d9b87c" />
      <rect x="-7" y="-30" width="6" height="60" rx="3" fill="#efd7a4" />
      <circle cx="0" cy="-10" r="3.4" fill="#8a6b3c" />
      <circle cx="0" cy="4" r="3.4" fill="#8a6b3c" />
      <circle cx="0" cy="18" r="3.4" fill="#8a6b3c" />
    </g>
  ),
};

export function emblemFor(id) {
  return EMBLEMS[id] || null;
}
