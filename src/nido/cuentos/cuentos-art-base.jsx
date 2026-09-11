// Paletas, fondos y utilidades de dibujo para las escenas de los cuentos.
// Todo el arte es SVG propio: no depende de imágenes externas ni de librerías,
// así la ruta carga rápido y se ve nítida en cualquier pantalla.

export const VIEW_W = 1000;
export const VIEW_H = 640;

export const LIGHTS = {
  night: {
    sky: ["#101a3d", "#1d2c5e", "#39508f"],
    ground: "#111a35",
    haze: "#4b6bb0",
    stars: 1,
    warm: "#8fb0ff",
    shade: 0.55,
  },
  moonrise: {
    sky: ["#181f4c", "#3a3f7f", "#7d6aa4"],
    ground: "#1a1f42",
    haze: "#6f7fc4",
    stars: 0.8,
    warm: "#ffd98a",
    shade: 0.42,
  },
  dawn: {
    sky: ["#2a3467", "#7d6b9d", "#f3a880"],
    ground: "#3a3457",
    haze: "#c58fa0",
    stars: 0.3,
    warm: "#ffc48c",
    shade: 0.36,
  },
  day: {
    sky: ["#5fb4e8", "#a5dcf3", "#e9f7fb"],
    ground: "#5c8f57",
    haze: "#cfeaf6",
    stars: 0,
    warm: "#fff3cf",
    shade: 0.14,
  },
  dusk: {
    sky: ["#3c3a72", "#c1708f", "#f7b477"],
    ground: "#4a3f5c",
    haze: "#e0a08f",
    stars: 0.22,
    warm: "#ffcf9a",
    shade: 0.3,
  },
  mist: {
    sky: ["#9fb4bf", "#cfdde0", "#eef4f2"],
    ground: "#7d8f80",
    haze: "#e8f0ee",
    stars: 0,
    warm: "#ffffff",
    shade: 0.1,
  },
};

// Cada "set" define el terreno del cuento. Los colores se mezclan con la luz
// de la página para que la misma escenografía sirva de día y de noche.
export const SETS = {
  "andes-night": { far: "#3a4a7d", mid: "#27325c", near: "#1a2244", tint: "#5f77bd" },
  "amazon-river": { far: "#1f5147", mid: "#17403a", near: "#102e2b", tint: "#3f9e88" },
  "highland-day": { far: "#8fb87f", mid: "#6ba063", near: "#4f8250", tint: "#b9d99f" },
  "desert-night": { far: "#6a5a86", mid: "#54476d", near: "#3c3252", tint: "#a992c9" },
  "cloud-forest": { far: "#7fa88c", mid: "#5e8a70", near: "#456a56", tint: "#a9cdb2" },
  "mountain-day": { far: "#9db9d6", mid: "#7d99bb", near: "#5f7ea3", tint: "#d7e6f3" },
  "ocean-day": { far: "#3f9fc4", mid: "#2b83ad", near: "#e6d3a8", tint: "#7fd0e8" },
  "forest-dusk": { far: "#6b5a7d", mid: "#4f4363", near: "#39304b", tint: "#a98fbd" },
  // Pradera junto al bosque de «Los tres cerditos»: verdes claros y cálidos.
  "meadow-day": { far: "#9fcb7d", mid: "#74b060", near: "#54924a", tint: "#d3e9ae" },
  // Bosque de día de «Caperucita Roja»: verdes profundos con luz filtrada.
  "forest-day": { far: "#8fbf78", mid: "#5f9a55", near: "#3f7a42", tint: "#c8e2a8" },
};

export function mix(hexA, hexB, amount) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, amount));
  const c = [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((ch) => ch + ch).join("")
      : clean;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

// Ruido determinista: la misma página dibuja siempre lo mismo.
export function seeded(seed) {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function ridge(rand, baseY, amplitude, steps, width = VIEW_W) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const x = (width / steps) * i;
    const y = baseY - Math.abs(Math.sin(i * 1.7 + rand() * 3)) * amplitude - rand() * amplitude * 0.35;
    points.push([x, y]);
  }
  let d = `M -20 ${VIEW_H + 20} L -20 ${points[0][1]}`;
  points.forEach(([x, y]) => {
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  d += ` L ${VIEW_W + 20} ${VIEW_H + 20} Z`;
  return d;
}

function rollingHill(rand, baseY, amplitude) {
  let d = `M -20 ${VIEW_H + 20} L -20 ${baseY}`;
  let x = -20;
  while (x < VIEW_W + 20) {
    const step = 180 + rand() * 140;
    const peak = baseY - amplitude * (0.5 + rand() * 0.7);
    d += ` Q ${(x + step / 2).toFixed(1)} ${peak.toFixed(1)} ${(x + step).toFixed(1)} ${baseY.toFixed(1)}`;
    x += step;
  }
  d += ` L ${VIEW_W + 20} ${VIEW_H + 20} Z`;
  return d;
}

function dune(rand, baseY, amplitude) {
  let d = `M -20 ${VIEW_H + 20} L -20 ${baseY}`;
  let x = -20;
  while (x < VIEW_W + 20) {
    const step = 260 + rand() * 200;
    d += ` C ${(x + step * 0.35).toFixed(1)} ${(baseY - amplitude * (0.6 + rand() * 0.6)).toFixed(1)}, ${(x + step * 0.7).toFixed(1)} ${(baseY - amplitude * 0.2).toFixed(1)}, ${(x + step).toFixed(1)} ${baseY.toFixed(1)}`;
    x += step;
  }
  d += ` L ${VIEW_W + 20} ${VIEW_H + 20} Z`;
  return d;
}

function canopy(rand, baseY) {
  let d = `M -20 ${VIEW_H + 20} L -20 ${baseY}`;
  let x = -20;
  while (x < VIEW_W + 20) {
    const step = 90 + rand() * 70;
    const peak = baseY - 40 - rand() * 90;
    d += ` Q ${(x + step / 2).toFixed(1)} ${peak.toFixed(1)} ${(x + step).toFixed(1)} ${(baseY - rand() * 18).toFixed(1)}`;
    x += step;
  }
  d += ` L ${VIEW_W + 20} ${VIEW_H + 20} Z`;
  return d;
}

/** Fondo completo: cielo, capas de terreno y neblina, según set + luz. */
export function Backdrop({ set, light, seed, sky = true }) {
  const palette = SETS[set] || SETS["highland-day"];
  const lit = LIGHTS[light] || LIGHTS.day;
  const rand = seeded(`${seed}-backdrop`);
  const id = `bg-${seed}`.replace(/[^a-z0-9-]/gi, "");
  const shade = lit.shade;
  const far = mix(palette.far, lit.ground, shade);
  const mid = mix(palette.mid, lit.ground, shade * 0.85);
  const near = mix(palette.near, lit.ground, shade * 0.7);

  const isWater = set === "amazon-river" || set === "ocean-day";
  const horizon = isWater ? 400 : 430;

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lit.sky[0]} />
          <stop offset="55%" stopColor={lit.sky[1]} />
          <stop offset="100%" stopColor={lit.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="82%" r="62%">
          <stop offset="0%" stopColor={lit.warm} stopOpacity="0.5" />
          <stop offset="100%" stopColor={lit.warm} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lit.haze} stopOpacity="0" />
          <stop offset="100%" stopColor={lit.haze} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix(palette.far, lit.haze, 0.35)} />
          <stop offset="100%" stopColor={mix(palette.mid, "#04121f", 0.35)} />
        </linearGradient>
      </defs>

      {sky ? <rect x="-20" y="-20" width={VIEW_W + 40} height={VIEW_H + 40} fill={`url(#${id}-sky)`} /> : null}
      {sky ? <rect x="-20" y="-20" width={VIEW_W + 40} height={VIEW_H + 40} fill={`url(#${id}-glow)`} /> : null}

      {sky && lit.stars > 0 ? <Stars seed={`${seed}-stars`} opacity={lit.stars} /> : null}

      {set === "ocean-day" ? (
        <>
          <path d={rollingHill(seeded(`${seed}-a`), horizon - 40, 26)} fill={far} opacity="0.75" />
          <rect x="-20" y={horizon} width={VIEW_W + 40} height={VIEW_H - horizon + 40} fill={`url(#${id}-water)`} />
          {Array.from({ length: 7 }).map((unused, i) => (
            <path
              key={i}
              d={`M ${-40 + i * 40} ${horizon + 24 + i * 26} q 60 -14 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
              fill="none"
              stroke={mix(lit.haze, "#ffffff", 0.4)}
              strokeOpacity={0.22 - i * 0.02}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
          <path
            d={`M -20 ${VIEW_H - 60} Q 300 ${VIEW_H - 108} 620 ${VIEW_H - 66} T ${VIEW_W + 20} ${VIEW_H - 90} L ${VIEW_W + 20} ${VIEW_H + 20} L -20 ${VIEW_H + 20} Z`}
            fill={mix(palette.near, lit.ground, shade * 0.5)}
          />
        </>
      ) : set === "amazon-river" ? (
        <>
          <path d={canopy(seeded(`${seed}-a`), horizon - 30)} fill={far} />
          <path d={canopy(seeded(`${seed}-b`), horizon + 20)} fill={mid} />
          <rect x="-20" y={horizon + 40} width={VIEW_W + 40} height={VIEW_H} fill={`url(#${id}-water)`} />
          {Array.from({ length: 6 }).map((unused, i) => (
            <ellipse
              key={i}
              cx={120 + i * 160}
              cy={horizon + 90 + (i % 3) * 60}
              rx={110 - i * 6}
              ry={7}
              fill={mix(lit.haze, "#ffffff", 0.5)}
              opacity="0.16"
            />
          ))}
        </>
      ) : set === "desert-night" ? (
        <>
          <path d={dune(seeded(`${seed}-a`), horizon, 60)} fill={far} />
          <path d={dune(seeded(`${seed}-b`), horizon + 70, 70)} fill={mid} />
          <path d={dune(seeded(`${seed}-c`), horizon + 160, 60)} fill={near} />
        </>
      ) : set === "mountain-day" || set === "andes-night" ? (
        <>
          <path d={ridge(seeded(`${seed}-a`), horizon - 20, 190, 9)} fill={far} />
          <path d={ridge(seeded(`${seed}-b`), horizon + 50, 140, 7)} fill={mid} />
          {set === "mountain-day" ? <Snowcaps seed={`${seed}-snow`} baseY={horizon - 20} /> : null}
          <path d={rollingHill(seeded(`${seed}-c`), horizon + 140, 50)} fill={near} />
        </>
      ) : set === "cloud-forest" || set === "forest-dusk" ? (
        <>
          <path d={canopy(seeded(`${seed}-a`), horizon - 10)} fill={far} />
          <path d={canopy(seeded(`${seed}-b`), horizon + 60)} fill={mid} />
          <path d={rollingHill(seeded(`${seed}-c`), horizon + 150, 40)} fill={near} />
        </>
      ) : (
        <>
          <path d={rollingHill(seeded(`${seed}-a`), horizon - 30, 90)} fill={far} />
          <path d={rollingHill(seeded(`${seed}-b`), horizon + 60, 70)} fill={mid} />
          <path d={rollingHill(seeded(`${seed}-c`), horizon + 150, 46)} fill={near} />
        </>
      )}

      <rect
        x="-20"
        y={horizon - 90}
        width={VIEW_W + 40}
        height={180}
        fill={`url(#${id}-haze)`}
        opacity={light === "mist" ? 0.9 : 0.35}
      />
      {light === "mist" ? (
        <>
          {Array.from({ length: 5 }).map((unused, i) => (
            <ellipse
              key={i}
              cx={rand() * VIEW_W}
              cy={220 + i * 80}
              rx={280 + rand() * 160}
              ry={38}
              fill="#ffffff"
              opacity={0.3}
            />
          ))}
        </>
      ) : null}
    </g>
  );
}

function Snowcaps({ seed, baseY }) {
  const rand = seeded(seed);
  return (
    <g opacity="0.9">
      {Array.from({ length: 4 }).map((unused, i) => {
        const x = 120 + i * 240 + rand() * 60;
        const y = baseY - 120 - rand() * 50;
        return (
          <path
            key={i}
            d={`M ${x} ${y} l 42 58 l -26 -8 l -18 12 l -16 -14 l -22 6 Z`}
            fill="#f7fbff"
            opacity="0.92"
          />
        );
      })}
    </g>
  );
}

export function Stars({ seed, opacity = 1, count = 70 }) {
  const rand = seeded(seed);
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }).map((unused, i) => {
        const x = rand() * VIEW_W;
        const y = rand() * 380;
        const r = 0.9 + rand() * 1.9;
        return (
          <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={0.35 + rand() * 0.6}>
            <animate
              attributeName="opacity"
              values={`${0.25 + rand() * 0.3};1;${0.25 + rand() * 0.3}`}
              dur={`${2.4 + rand() * 3.6}s`}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </g>
  );
}
