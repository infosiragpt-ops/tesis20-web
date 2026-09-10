// Compositor de escenas: junta fondo, escenografía, personajes y el souvenir
// escondido de cada página.

import { Backdrop, seeded, VIEW_W, VIEW_H } from "./cuentos-art-base.jsx";
import { CAST } from "./cuentos-art-cast.jsx";
import { Prop, propLayer, emblemFor } from "./cuentos-art-props.jsx";

const PLACE = {
  oso: { s: 1.15, y: 566 },
  buho: { s: 1.1, y: 552 },
  bufeo: { s: 1.05, y: 500 },
  rana: { s: 1.5, y: 578 },
  pez: { s: 1.2, y: 470 },
  nina: { s: 1.15, y: 570 },
  nina2: { s: 1.15, y: 570 },
  nino: { s: 1.15, y: 570 },
  maquinista: { s: 1, y: 570 },
  oveja: { s: 1.35, y: 574 },
  zorro: { s: 1.2, y: 570 },
  picaflor: { s: 1.5, y: 360 },
  mariposa: { s: 1.4, y: 320 },
  vicuna: { s: 1.05, y: 568 },
  pelicano: { s: 1.2, y: 556 },
  ballena: { s: 0.95, y: 500 },
  carpintero: { s: 1.5, y: 430 },
  pipo: { s: 1.15, y: 568 },
  lolo: { s: 1.15, y: 568 },
  tito: { s: 1.15, y: 568 },
  lobo: { s: 0.95, y: 568 },
};

const CAST_X = {
  1: [470],
  2: [300, 600],
  3: [230, 500, 780],
};

const PIN_SPOTS = [
  [148, 214],
  [862, 236],
  [206, 452],
  [884, 448],
  [512, 168],
  [318, 306],
  [706, 292],
  [128, 596],
  [898, 588],
  [396, 214],
];

function SceneBody({ book, pageIndex, foundPin, onPin, interactive, showPin = true, showCast = true }) {
  const page = book.pages[pageIndex];
  const seed = `${book.id}-${pageIndex}`;
  const props = [...(page.props || [])].sort((a, b) => propLayer(a) - propLayer(b));
  const cast = page.cast || [];
  const castRand = seeded(`${seed}-cast`);
  // Un solo personaje: se mueve un poco y a veces mira al otro lado, para
  // que las páginas no se sientan calcadas.
  const solo = cast.length === 1 && pageIndex > 0;
  const shift = solo ? (castRand() - 0.5) * 300 : 0;
  const flip = solo && castRand() > 0.62;
  const xs = (CAST_X[cast.length] || CAST_X[1]).map((x) => x + shift);

  const spotRand = seeded(`${seed}-pin`);
  const spot = PIN_SPOTS[Math.floor(spotRand() * PIN_SPOTS.length)];

  return (
    <>
      <Backdrop set={book.set} light={page.light} seed={seed} />
      {props
        .filter((id) => propLayer(id) <= 5)
        .map((id) => (
          <Prop key={id} id={id} rand={seeded(`${seed}-${id}`)} light={page.light} set={book.set} />
        ))}
      {showCast && cast.map((who, i) => {
        const entry = CAST[who];
        if (!entry) return null;
        const place = PLACE[who] || { s: 1.1, y: 566 };
        const Art = entry.Art;
        return (
          <g
            key={`${who}-${i}`}
            transform={`translate(${xs[i] || 500} ${place.y}) scale(${flip ? -place.s : place.s} ${place.s})`}
          >
            <Art />
          </g>
        );
      })}
      {props
        .filter((id) => propLayer(id) > 5)
        .map((id) => (
          <Prop key={id} id={id} rand={seeded(`${seed}-${id}`)} light={page.light} set={book.set} />
        ))}
      {page.pin && showPin ? (
        <PinToken
          id={page.pin}
          x={spot[0]}
          y={spot[1]}
          found={foundPin}
          onPin={onPin}
          interactive={interactive}
        />
      ) : null}
    </>
  );
}

export function Scene({ book, pageIndex, foundPin, onPin, interactive = true, showPin = true, showCast = true }) {
  const page = book.pages[pageIndex];
  return (
    <svg
      className="cuento-scene"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Ilustración: ${page.t}`}
    >
      <SceneBody book={book} pageIndex={pageIndex} foundPin={foundPin} onPin={onPin} interactive={interactive} showPin={showPin} showCast={showCast} />
    </svg>
  );
}

/** Posición (u, v en 0–1) del souvenir escondido de una página, o null. */
export function pinSpot(book, pageIndex) {
  const page = book.pages[pageIndex];
  if (!page?.pin) return null;
  const spotRand = seeded(`${book.id}-${pageIndex}-pin`);
  const spot = PIN_SPOTS[Math.floor(spotRand() * PIN_SPOTS.length)];
  return { u: spot[0] / VIEW_W, v: spot[1] / VIEW_H };
}

function PinToken({ id, x, y, found, onPin, interactive }) {
  const emblem = emblemFor(id);
  const fallback = CAST[id];
  const Art = fallback ? fallback.Art : null;

  return (
    <g
      className={`cuento-pin ${found ? "is-found" : ""}`}
      transform={`translate(${x} ${y})`}
      onClick={interactive && !found ? () => onPin?.(id) : undefined}
      role={interactive && !found ? "button" : undefined}
      tabIndex={interactive && !found ? 0 : undefined}
      aria-label={interactive && !found ? "Souvenir escondido" : undefined}
      onKeyDown={
        interactive && !found
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPin?.(id);
              }
            }
          : undefined
      }
    >
      <circle className="cuento-pin__halo" cx="0" cy="0" r="34" fill="#fff4c4" opacity="0.35" />
      <g transform={Art ? "scale(0.24)" : "scale(0.72)"}>{emblem || (Art ? <Art /> : null)}</g>
      <circle className="cuento-pin__hit" cx="0" cy="0" r="40" fill="transparent" />
      <g className="cuento-pin__sparks" fill="#ffffff">
        <circle cx="-22" cy="-18" r="3" />
        <circle cx="20" cy="-22" r="2.4" />
        <circle cx="16" cy="20" r="2.8" />
      </g>
    </g>
  );
}

/** Emblema aislado para el álbum y la repisa de souvenirs. */
export function Souvenir({ id, size = 54, locked = false }) {
  const emblem = emblemFor(id);
  const fallback = CAST[id];
  const Art = fallback ? fallback.Art : null;
  return (
    <svg
      className={`cuento-souvenir ${locked ? "is-locked" : ""}`}
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g transform={Art && !emblem ? "scale(0.3)" : "scale(1)"}>{emblem || (Art ? <Art /> : null)}</g>
    </svg>
  );
}

/** Portada editorial: arte original generado para el cuento + texto exacto. */
export function BookCover({ book, className = "" }) {
  const words = book.title.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    if ((current + " " + word).trim().length > 15) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  });
  if (current.trim()) lines.push(current.trim());

  return (
    <svg className={`cuento-cover ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 640" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cover-top-${book.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#071023" stopOpacity="0.9" />
          <stop offset="0.72" stopColor="#071023" stopOpacity="0.26" />
          <stop offset="1" stopColor="#071023" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cover-bottom-${book.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#071023" stopOpacity="0" />
          <stop offset="1" stopColor="#071023" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <rect width="440" height="640" fill={book.accent} />
      <image href={book.cover.image} x="0" y="0" width="440" height="660" preserveAspectRatio="xMidYMid slice" />
      <rect width="440" height="270" fill={`url(#cover-top-${book.id})`} />
      <rect y="450" width="440" height="190" fill={`url(#cover-bottom-${book.id})`} />
      <g>
        {lines.map((line, i) => (
          <text
            key={line}
            x="220"
            y={64 + i * 48}
            textAnchor="middle"
            fill={book.cover.ink}
            stroke="#131b31"
            strokeWidth="7"
            paintOrder="stroke"
            fontSize={lines.length > 3 ? 32 : lines.length > 2 ? 39 : 45}
            fontWeight="900"
            fontFamily="ui-rounded, 'Trebuchet MS', system-ui, sans-serif"
          >
            {line}
          </text>
        ))}
      </g>
      <text
        x="220"
        y="604"
        textAnchor="middle"
        fill={book.cover.sub}
        stroke="#10182c"
        strokeWidth="3"
        paintOrder="stroke"
        fontSize="18"
        letterSpacing="3"
        fontWeight="900"
        fontFamily="ui-rounded, 'Trebuchet MS', system-ui, sans-serif"
      >
        TESIS20 · NIDO
      </text>
      <rect x="10" y="10" width="420" height="620" rx="9" fill="none" stroke="#ffe3a2" strokeOpacity="0.72" strokeWidth="3" />
    </svg>
  );
}
