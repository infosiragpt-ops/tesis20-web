// Dirección de arte de "Misión del Bosque": bosque de cuento a la hora dorada.
//
// Sigue funcionando como AnimationRegistry (cada personaje es una función
// (ctx, pose, t) sustituible por sprites/Rive sin tocar la lógica), pero el
// decorado pasa a ser un escenario por capas con perspectiva atmosférica:
//
//   cielo → nubes → cordillera lejana → bosque medio → arboleda cercana →
//   suelo → actores → maleza en primer plano → viñeta
//
// Las tres capas de vegetación son estáticas salvo por el desplazamiento, así
// que se pintan UNA vez en lienzos fuera de pantalla y luego se repiten con
// drawImage. Eso permite mucho más detalle (corteza, luz de contorno, bruma)
// sin pagarlo en cada fotograma. Cero imágenes descargadas: todo es canvas.

export const VIEW_W = 960;
export const VIEW_H = 540;

const TAU = Math.PI * 2;
const INK = "#12263f";

// Luz principal: sol cálido arriba a la derecha. Todo el sombreado y la luz de
// contorno del escenario apuntan a esta dirección para que la escena se lea
// como un único ambiente y no como recortes sueltos.
const SUN = Object.freeze({ x: 792, y: 104, r: 54 });

const PALETTE = Object.freeze({
  skyTop: "#63bdec",
  skyMid: "#a9dff5",
  skyLow: "#d9f2ee",
  skyHorizon: "#fdf1d2",
  ridgeFar: "#bcdae6",
  ridgeNear: "#a6cfcf",
  forestFar: "#7cc0a2",
  forestNear: "#5aa886",
  canopyLight: "#54c08a",
  canopyDark: "#2d8a60",
  canopyRim: "#b0f0cb",
  barkLight: "#a4714a",
  barkDark: "#754e31",
  grassTop: "#8ce4a6",
  grassHigh: "#74d492",
  grassLow: "#4fae6f",
  soilTop: "#bc8753",
  soilLow: "#8b5e39",
  scrub: "#245c46",
  fruitLight: "#ff8d7d",
  fruitDark: "#d8433c",
  gold: "#ffc94d",
});

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */

/** Módulo siempre positivo: evita saltos de parallax al retroceder. */
function mod(value, size) {
  return ((value % size) + size) % size;
}

/** PRNG determinista: el follaje no debe parpadear entre partidas. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Une varios círculos en una sola silueta sin costuras. El `moveTo` antes de
 * cada arco es imprescindible: sin él, el trazo que conecta un arco con el
 * siguiente recorta cuñas blancas dentro de la copa del árbol.
 */
function blobPath(ctx, blobs) {
  ctx.beginPath();
  for (const blob of blobs) {
    ctx.moveTo(blob.x + blob.r, blob.y);
    ctx.arc(blob.x, blob.y, blob.r, 0, TAU);
  }
}

/** Sombra de contacto: se abre y se aclara según la altura sobre el suelo. */
function contactShadow(ctx, x, groundY, radius, height = 0) {
  const lift = Math.max(0, Math.min(1, height / 160));
  ctx.fillStyle = `rgba(18,38,63,${0.22 * (1 - lift * 0.72)})`;
  ctx.beginPath();
  ctx.ellipse(x, groundY, radius * (1 + lift * 0.5), radius * 0.3, 0, 0, TAU);
  ctx.fill();
}

/** Lienzo fuera de pantalla ya escalado al dispositivo. */
function makeLayer(width, height, scale, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  paint(ctx, width, height);
  return { canvas, width, height };
}

/** Repite una capa horizontalmente hasta cubrir la vista. */
function blitLayer(ctx, layer, offset, y) {
  let x = -mod(offset, layer.width);
  while (x < VIEW_W) {
    ctx.drawImage(layer.canvas, x, y, layer.width, layer.height);
    x += layer.width;
  }
}

/* ------------------------------------------------------------------ *
 * Pintado de las capas cacheadas
 * ------------------------------------------------------------------ */

const RIDGE_W = 1280;
const RIDGE_H = 210;

/** Cordillera lejana: dos crestas suaves veladas por la bruma. */
function paintRidges(ctx, w, h) {
  const random = rng(0x51d3);
  const ridge = (baseY, amplitude, color, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-4, h);
    ctx.lineTo(-4, baseY);
    for (let x = -4; x <= w + 4; x += 80) {
      const peak = baseY - amplitude * (0.45 + random() * 0.55);
      ctx.quadraticCurveTo(x + 40, peak, x + 80, baseY - amplitude * 0.25);
    }
    ctx.lineTo(w + 4, h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  ridge(h - 46, 116, PALETTE.ridgeFar, 0.85);
  ridge(h - 14, 74, PALETTE.ridgeNear, 0.9);
  // Bruma que despega la cordillera del bosque medio.
  const haze = ctx.createLinearGradient(0, h - 70, 0, h);
  haze.addColorStop(0, "rgba(253,241,210,0)");
  haze.addColorStop(1, "rgba(253,241,210,0.75)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, h - 70, w, 70);
}

const MIDWOOD_W = 1280;
const MIDWOOD_H = 240;

/** Bosque intermedio: siluetas de copas apretadas, sin detalle. */
function paintMidwood(ctx, w, h) {
  const random = rng(0x2f81);
  const band = (baseY, scale, color, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const blobs = [];
    for (let x = -60; x < w + 60; x += 46 * scale) {
      const top = baseY - (52 + random() * 46) * scale;
      const r = (26 + random() * 16) * scale;
      blobs.push({ x, y: top, r });
      blobs.push({ x: x + 18 * scale, y: top + 22 * scale, r: r * 0.82 });
    }
    blobPath(ctx, blobs);
    ctx.fill();
    ctx.fillRect(0, baseY, w, h - baseY);
    ctx.globalAlpha = 1;
  };
  band(h - 58, 0.85, PALETTE.forestFar, 0.8);
  band(h - 18, 1, PALETTE.forestNear, 0.92);
  // Bruma solo sobre lo pintado (ver nota en paintGrove).
  ctx.globalCompositeOperation = "source-atop";
  const haze = ctx.createLinearGradient(0, h - 150, 0, h);
  haze.addColorStop(0, "rgba(233,246,232,0.5)");
  haze.addColorStop(1, "rgba(233,246,232,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

const GROVE_W = 1180;
const GROVE_H = 380;

/**
 * Arboleda cercana: árboles completos con tronco cónico, raíces, corteza,
 * copa unificada, sombra propia y luz de contorno del lado del sol.
 */
function paintGrove(ctx, w, h) {
  const random = rng(0x7ac1);
  const trees = [];
  for (let x = 40; x < w + 120; x += 150 + random() * 70) {
    trees.push({ x, scale: 0.82 + random() * 0.42, seed: random() });
  }
  // Los árboles que sobresalen por la derecha se repiten a la izquierda para
  // que el mosaico no muestre una costura al repetirse.
  for (const tree of [...trees]) {
    if (tree.x > w - 90) trees.push({ ...tree, x: tree.x - w });
  }
  trees.sort((a, b) => a.scale - b.scale);

  for (const tree of trees) {
    const s = tree.scale;
    const baseY = h - 6;
    const trunkH = 150 * s;
    const trunkW = 20 * s;
    const topY = baseY - trunkH;

    // Sombra proyectada hacia la izquierda (el sol está a la derecha).
    ctx.fillStyle = "rgba(18,38,63,0.10)";
    ctx.beginPath();
    ctx.ellipse(tree.x - 16 * s, baseY, 62 * s, 13 * s, 0, 0, TAU);
    ctx.fill();

    // Tronco cónico con ensanche de raíces.
    const bark = ctx.createLinearGradient(tree.x - trunkW, 0, tree.x + trunkW, 0);
    bark.addColorStop(0, PALETTE.barkDark);
    bark.addColorStop(0.62, PALETTE.barkLight);
    bark.addColorStop(1, "#c08f63");
    ctx.fillStyle = bark;
    ctx.beginPath();
    ctx.moveTo(tree.x - trunkW * 1.5, baseY);
    ctx.quadraticCurveTo(tree.x - trunkW * 0.72, baseY - 26 * s, tree.x - trunkW * 0.5, topY);
    ctx.lineTo(tree.x + trunkW * 0.5, topY);
    ctx.quadraticCurveTo(tree.x + trunkW * 0.72, baseY - 26 * s, tree.x + trunkW * 1.5, baseY);
    ctx.closePath();
    ctx.fill();

    // Vetas de corteza.
    ctx.strokeStyle = "rgba(84,55,33,0.32)";
    ctx.lineWidth = 1.6 * s;
    for (let index = 0; index < 3; index += 1) {
      const vx = tree.x + (index - 1) * trunkW * 0.5;
      ctx.beginPath();
      ctx.moveTo(vx, topY + 14 * s);
      ctx.quadraticCurveTo(vx + 3 * s, baseY - trunkH * 0.5, vx - 2 * s, baseY - 14 * s);
      ctx.stroke();
    }

    // Copa: cúmulo de lóbulos fundidos en una sola silueta.
    const local = rng(Math.floor(tree.seed * 100000) + 7);
    const crownY = topY - 22 * s;
    const blobs = [
      { x: tree.x, y: crownY - 26 * s, r: 46 * s },
      { x: tree.x - 44 * s, y: crownY - 2 * s, r: 36 * s },
      { x: tree.x + 44 * s, y: crownY - 6 * s, r: 38 * s },
      { x: tree.x - 20 * s, y: crownY + 26 * s, r: 33 * s },
      { x: tree.x + 22 * s, y: crownY + 28 * s, r: 32 * s },
    ];
    for (let index = 0; index < 3; index += 1) {
      blobs.push({
        x: tree.x + (local() - 0.5) * 96 * s,
        y: crownY + (local() - 0.5) * 60 * s,
        r: (20 + local() * 14) * s,
      });
    }

    blobPath(ctx, blobs);
    ctx.save();
    ctx.clip();
    // La luz de contorno se pinta como fondo y la copa la tapa desplazada en
    // dirección contraria al sol: queda una media luna limpia. (Perfilar con
    // stroke dibujaría también los arcos interiores de cada bola: aros feos.)
    ctx.fillStyle = PALETTE.canopyRim;
    ctx.fillRect(tree.x - 120 * s, crownY - 100 * s, 240 * s, 220 * s);
    const leaf = ctx.createLinearGradient(0, crownY - 70 * s, 0, crownY + 60 * s);
    leaf.addColorStop(0, PALETTE.canopyLight);
    leaf.addColorStop(1, PALETTE.canopyDark);
    ctx.fillStyle = leaf;
    blobPath(
      ctx,
      blobs.map((blob) => ({ ...blob, x: blob.x - 4 * s, y: blob.y + 4 * s })),
    );
    ctx.fill();
    // Sombra interior por debajo (volumen).
    ctx.fillStyle = "rgba(20,84,58,0.34)";
    ctx.beginPath();
    ctx.ellipse(tree.x - 12 * s, crownY + 58 * s, 82 * s, 44 * s, 0, 0, TAU);
    ctx.fill();
    // Racimos de hoja iluminados por arriba.
    ctx.fillStyle = "rgba(168,236,195,0.5)";
    for (let index = 0; index < 5; index += 1) {
      ctx.beginPath();
      ctx.ellipse(
        tree.x + (local() - 0.35) * 84 * s,
        crownY - (12 + local() * 46) * s,
        (12 + local() * 9) * s,
        (7 + local() * 5) * s,
        -0.4,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Velo de aire entre la arboleda y el plano de juego. `source-atop` lo limita
  // a los píxeles ya pintados: sin él, el velo teñiría el cielo transparente de
  // la capa y se vería una franja horizontal cortada en seco.
  ctx.globalCompositeOperation = "source-atop";
  const veil = ctx.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, "rgba(224,244,232,0.34)");
  veil.addColorStop(0.75, "rgba(224,244,232,0)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

/* ------------------------------------------------------------------ *
 * Escenario
 * ------------------------------------------------------------------ */

/**
 * Construye el decorado por capas para un contexto concreto. Las capas y los
 * degradados se cachean; `draw` solo desplaza y compone.
 *
 * @param {{ groundY: number, scale?: number }} options
 */
export function createScenery({ groundY, scale = 2 }) {
  let layers = null;
  let sky = null;
  let sunGlow = null;
  let vignette = null;
  let ground = null;

  const build = (ctx) => {
    layers = {
      ridges: makeLayer(RIDGE_W, RIDGE_H, 1, paintRidges),
      midwood: makeLayer(MIDWOOD_W, MIDWOOD_H, 1, paintMidwood),
      grove: makeLayer(GROVE_W, GROVE_H, scale, paintGrove),
    };
    sky = ctx.createLinearGradient(0, 0, 0, groundY + 20);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.42, PALETTE.skyMid);
    sky.addColorStop(0.76, PALETTE.skyLow);
    sky.addColorStop(1, PALETTE.skyHorizon);

    sunGlow = ctx.createRadialGradient(SUN.x, SUN.y, SUN.r * 0.5, SUN.x, SUN.y, SUN.r * 4.2);
    sunGlow.addColorStop(0, "rgba(255,240,196,0.85)");
    sunGlow.addColorStop(0.4, "rgba(255,226,150,0.28)");
    sunGlow.addColorStop(1, "rgba(255,226,150,0)");

    ground = ctx.createLinearGradient(0, groundY, 0, VIEW_H);
    ground.addColorStop(0, PALETTE.grassHigh);
    ground.addColorStop(0.42, PALETTE.grassLow);
    ground.addColorStop(0.43, PALETTE.soilTop);
    ground.addColorStop(1, PALETTE.soilLow);

    vignette = ctx.createRadialGradient(
      VIEW_W / 2,
      VIEW_H * 0.46,
      VIEW_H * 0.34,
      VIEW_W / 2,
      VIEW_H * 0.5,
      VIEW_W * 0.76,
    );
    vignette.addColorStop(0, "rgba(10,26,46,0)");
    vignette.addColorStop(1, "rgba(10,26,46,0.3)");
  };

  const drawSky = (ctx, t, reduced) => {
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = sunGlow;
    ctx.fillRect(SUN.x - SUN.r * 4.5, SUN.y - SUN.r * 4.5, SUN.r * 9, SUN.r * 9);

    // Haces de luz muy tenues, inclinados desde el sol.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(SUN.x, SUN.y);
    ctx.rotate(0.42 + (reduced ? 0 : Math.sin(t * 0.18) * 0.03));
    ctx.fillStyle = "rgba(255,244,208,0.11)";
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-90 + index * 130, 640);
      ctx.lineTo(-16 + index * 130, 640);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(SUN.x, SUN.y, SUN.r, 0, TAU);
    ctx.fill();
  };

  const drawClouds = (ctx, cameraX, t, reduced) => {
    const drift = reduced ? 0 : t * 5;
    const random = rng(0x9c21);
    for (let index = 0; index < 5; index += 1) {
      const span = VIEW_W + 420;
      const cx = mod(index * 268 + drift - cameraX * 0.06, span) - 210;
      const cy = 52 + (index % 3) * 44;
      const s = 0.72 + random() * 0.6;
      const blobs = [
        { x: cx, y: cy, r: 30 * s },
        { x: cx + 34 * s, y: cy + 6 * s, r: 24 * s },
        { x: cx - 32 * s, y: cy + 8 * s, r: 21 * s },
        { x: cx + 8 * s, y: cy - 14 * s, r: 22 * s },
      ];
      blobPath(ctx, blobs);
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "rgba(196,224,240,0.55)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 22 * s, 64 * s, 16 * s, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawGroundLayer = (ctx, cameraX) => {
    ctx.fillStyle = ground;
    ctx.fillRect(0, groundY, VIEW_W, VIEW_H - groundY);

    // Labio de hierba iluminado + flequillo de briznas sobre la línea.
    ctx.fillStyle = PALETTE.grassTop;
    ctx.fillRect(0, groundY, VIEW_W, 7);
    ctx.beginPath();
    const start = Math.floor(cameraX / 13) * 13;
    for (let x = start - 13; x < start + VIEW_W + 26; x += 13) {
      const sx = x - cameraX;
      ctx.moveTo(sx, groundY + 1);
      ctx.lineTo(sx + 6.5, groundY - 8 - ((x / 13) % 3) * 3);
      ctx.lineTo(sx + 13, groundY + 1);
    }
    ctx.fill();

    // Franja de sombra bajo la hierba, para separar hierba de tierra.
    ctx.fillStyle = "rgba(24,86,54,0.16)";
    ctx.fillRect(0, groundY + 22, VIEW_W, 8);

    // Guijarros, matas y florecillas: dispersión determinista.
    const random = rng(0x3b71);
    for (let index = 0; index < 42; index += 1) {
      const worldX = index * 118 + random() * 90;
      const sx = mod(worldX - cameraX, VIEW_W + 240) - 120;
      const kind = index % 3;
      if (kind === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        const fy = groundY + 14 + random() * 8;
        ctx.beginPath();
        for (let petal = 0; petal < 5; petal += 1) {
          const angle = (petal / 5) * TAU;
          ctx.moveTo(sx, fy);
          ctx.arc(sx + Math.cos(angle) * 3.4, fy + Math.sin(angle) * 3.4, 2.4, 0, TAU);
        }
        ctx.fill();
        ctx.fillStyle = PALETTE.gold;
        ctx.beginPath();
        ctx.arc(sx, fy, 1.8, 0, TAU);
        ctx.fill();
      } else if (kind === 1) {
        ctx.strokeStyle = "rgba(38,124,80,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let blade = -1; blade <= 1; blade += 1) {
          ctx.moveTo(sx + blade * 4, groundY + 6);
          ctx.quadraticCurveTo(sx + blade * 7, groundY - 4, sx + blade * 11, groundY - 9);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(150,110,74,0.55)";
        ctx.beginPath();
        ctx.ellipse(sx, groundY + 44 + random() * 26, 5, 3.2, 0, 0, TAU);
        ctx.fill();
      }
    }
  };

  return {
    /** Cielo + cordillera + bosque + arboleda + suelo. */
    drawBack(ctx, cameraX, t, reduced) {
      if (!layers) build(ctx);
      drawSky(ctx, t, reduced);
      drawClouds(ctx, cameraX, t, reduced);
      blitLayer(ctx, layers.ridges, cameraX * 0.1, groundY - RIDGE_H + 6);
      blitLayer(ctx, layers.midwood, cameraX * 0.26, groundY - MIDWOOD_H + 22);
      blitLayer(ctx, layers.grove, cameraX * 0.52, groundY - GROVE_H + 26);
      drawGroundLayer(ctx, cameraX);
    },

    /** Maleza oscura delante de los actores: encuadra y da profundidad. */
    drawForeground(ctx, cameraX, t, reduced) {
      const random = rng(0x64ae);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = PALETTE.scrub;
      for (let index = 0; index < 10; index += 1) {
        const worldX = index * 216 + random() * 120;
        const sx = mod(worldX - cameraX * 1.18, VIEW_W + 460) - 230;
        const s = 0.9 + random() * 0.7;
        const sway = reduced ? 0 : Math.sin(t * 1.3 + index) * 3;
        const baseY = VIEW_H + 12;
        ctx.beginPath();
        for (let frond = -3; frond <= 3; frond += 1) {
          const tipX = sx + frond * 20 * s + sway * (frond / 3);
          const tipY = baseY - (58 + Math.abs(3 - Math.abs(frond)) * 22) * s;
          ctx.moveTo(sx - 6, baseY);
          ctx.quadraticCurveTo(sx + frond * 14 * s, tipY + 26 * s, tipX, tipY);
          ctx.quadraticCurveTo(sx + frond * 18 * s, tipY + 30 * s, sx + 6, baseY);
        }
        ctx.fill();
      }
      ctx.restore();
    },

    /** Viñeta y calidez global: unifica el conjunto. */
    drawGrade(ctx) {
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    },
  };
}

/* ------------------------------------------------------------------ *
 * Elementos de juego
 * ------------------------------------------------------------------ */

/** Plataforma: tronco talado con césped encima y sombra proyectada. */
export function drawPlatform(ctx, platform, groundY) {
  const { x, y, w, h } = platform;

  ctx.fillStyle = "rgba(18,38,63,0.13)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, groundY, w * 0.42, 10, 0, 0, TAU);
  ctx.fill();

  // Enredadera colgante: ancla visualmente el tronco al aire.
  ctx.strokeStyle = "#3f9e6f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 16, y + h);
  ctx.quadraticCurveTo(x + 8, y + h + 30, x + 20, y + h + 52);
  ctx.stroke();
  ctx.fillStyle = "#4fbc85";
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.ellipse(x + 10 + index * 3, y + h + 16 + index * 16, 7, 4.4, -0.7, 0, TAU);
    ctx.fill();
  }

  const wood = ctx.createLinearGradient(0, y, 0, y + h);
  wood.addColorStop(0, "#c08f63");
  wood.addColorStop(0.5, PALETTE.barkLight);
  wood.addColorStop(1, PALETTE.barkDark);
  ctx.fillStyle = wood;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();

  // Anillos de la testa del tronco.
  ctx.fillStyle = "#8b6039";
  ctx.beginPath();
  ctx.ellipse(x + w, y + h / 2, 6, h / 2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(60,38,22,0.5)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(x + w, y + h / 2, 3, h / 2 - 4, 0, 0, TAU);
  ctx.stroke();

  // Césped encima con flequillo.
  ctx.fillStyle = PALETTE.grassHigh;
  roundRect(ctx, x - 5, y - 9, w + 10, 15, 7);
  ctx.fill();
  ctx.fillStyle = PALETTE.grassTop;
  ctx.beginPath();
  for (let bx = x - 4; bx < x + w + 4; bx += 11) {
    ctx.moveTo(bx, y - 5);
    ctx.lineTo(bx + 5.5, y - 15);
    ctx.lineTo(bx + 11, y - 5);
  }
  ctx.fill();
}

/** Arbusto: silueta unificada, volumen y bayas. */
export function drawBush(ctx, obstacle, groundY, t, reduced) {
  const sway = reduced ? 0 : Math.sin(t * 1.5 + obstacle.x) * 2;
  const cx = obstacle.x + obstacle.w / 2 + sway;
  const topY = groundY - obstacle.h;

  contactShadow(ctx, cx, groundY + 2, obstacle.w * 0.62);

  const blobs = [
    { x: cx - 18, y: topY + 18, r: 20 },
    { x: cx + 16, y: topY + 12, r: 24 },
    { x: cx, y: groundY - 16, r: 25 },
    { x: cx - 2, y: topY + 2, r: 18 },
  ];
  blobPath(ctx, blobs);
  ctx.save();
  ctx.clip();
  // Mismo truco que en las copas: luz de contorno de fondo, mata desplazada
  // encima. Sin aros interiores.
  ctx.fillStyle = "#a8ecc3";
  ctx.fillRect(cx - 60, topY - 30, 120, obstacle.h + 60);
  const leaf = ctx.createLinearGradient(0, topY - 12, 0, groundY);
  leaf.addColorStop(0, "#57c48d");
  leaf.addColorStop(1, "#2b7f58");
  ctx.fillStyle = leaf;
  blobPath(
    ctx,
    blobs.map((blob) => ({ ...blob, x: blob.x - 3, y: blob.y + 3 })),
  );
  ctx.fill();
  ctx.fillStyle = "rgba(20,84,58,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx - 8, groundY - 4, 44, 20, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ff8d7d";
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.arc(cx - 14 + index * 15, topY + 16 + (index % 2) * 12, 3.4, 0, TAU);
    ctx.fill();
  }
}

/** Manzana con hoja, brillo especular y sombra de contacto. */
export function drawFruit(ctx, fruit, t, highlighted, reduced, groundY) {
  const bob = reduced ? 0 : Math.sin(t * 2.2 + fruit.x * 0.05) * 3;
  const y = fruit.y + bob;
  const r = 15;

  if (groundY !== undefined && Math.abs(fruit.y - (groundY - 26)) < 4) {
    contactShadow(ctx, fruit.x, groundY + 1, 13, bob + 3);
  }

  if (highlighted) {
    const pulse = reduced ? 0.5 : 0.5 + Math.sin(t * 4) * 0.5;
    ctx.strokeStyle = `rgba(255,201,77,${0.35 + pulse * 0.45})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fruit.x, y, r + 8 + pulse * 5, 0, TAU);
    ctx.stroke();
    // Flecha que baja señalando la fruta.
    ctx.fillStyle = PALETTE.gold;
    const arrowY = y - 42 - (reduced ? 0 : Math.abs(Math.sin(t * 3)) * 6);
    ctx.beginPath();
    ctx.moveTo(fruit.x, arrowY + 12);
    ctx.lineTo(fruit.x - 8, arrowY);
    ctx.lineTo(fruit.x + 8, arrowY);
    ctx.closePath();
    ctx.fill();
  }

  // Cuerpo: dos lóbulos con hendidura superior.
  const skin = ctx.createRadialGradient(fruit.x - 5, y - 6, 2, fruit.x, y, r + 4);
  skin.addColorStop(0, PALETTE.fruitLight);
  skin.addColorStop(1, PALETTE.fruitDark);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(fruit.x, y - r * 0.72);
  ctx.bezierCurveTo(fruit.x - r * 0.5, y - r * 1.25, fruit.x - r * 1.35, y - r * 0.4, fruit.x - r, y + r * 0.28);
  ctx.bezierCurveTo(fruit.x - r * 0.8, y + r * 1.15, fruit.x - r * 0.24, y + r * 1.08, fruit.x, y + r * 0.82);
  ctx.bezierCurveTo(fruit.x + r * 0.24, y + r * 1.08, fruit.x + r * 0.8, y + r * 1.15, fruit.x + r, y + r * 0.28);
  ctx.bezierCurveTo(fruit.x + r * 1.35, y - r * 0.4, fruit.x + r * 0.5, y - r * 1.25, fruit.x, y - r * 0.72);
  ctx.fill();

  // Rabito y hoja.
  ctx.strokeStyle = "#6b4429";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(fruit.x, y - r * 0.7);
  ctx.quadraticCurveTo(fruit.x + 2, y - r * 1.35, fruit.x + 5, y - r * 1.5);
  ctx.stroke();
  ctx.fillStyle = "#4fbc85";
  ctx.beginPath();
  ctx.ellipse(fruit.x + 12, y - r * 1.28, 8, 4.6, -0.55, 0, TAU);
  ctx.fill();

  // Especular.
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(fruit.x - 5.5, y - 5, 4, 5.6, -0.5, 0, TAU);
  ctx.fill();
}

/** Cesta de mimbre con letrero de meta colgado. */
export function drawBasket(ctx, basket, delivered, target, glow, t, groundY) {
  const cx = basket.x + basket.w / 2;

  if (glow) {
    const pulse = 0.22 + Math.abs(Math.sin(t * 4)) * 0.2;
    const halo = ctx.createRadialGradient(cx, basket.y + 20, 12, cx, basket.y + 20, 96);
    halo.addColorStop(0, `rgba(255,201,77,${pulse})`);
    halo.addColorStop(1, "rgba(255,201,77,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 100, basket.y - 80, 200, 200);
  }

  if (groundY !== undefined) contactShadow(ctx, cx, groundY + 2, basket.w * 0.5);

  // Cuerpo trapezoidal.
  const body = new Path2D();
  body.moveTo(basket.x, basket.y + 6);
  body.lineTo(basket.x + basket.w, basket.y + 6);
  body.lineTo(basket.x + basket.w - 14, basket.y + basket.h);
  body.lineTo(basket.x + 14, basket.y + basket.h);
  body.closePath();

  const wicker = ctx.createLinearGradient(basket.x, 0, basket.x + basket.w, 0);
  wicker.addColorStop(0, "#a4714a");
  wicker.addColorStop(0.55, "#cf9a63");
  wicker.addColorStop(1, "#8b5e39");
  ctx.fillStyle = wicker;
  ctx.fill(body);

  // Trenzado del mimbre, recortado a la silueta.
  ctx.save();
  ctx.clip(body);
  ctx.strokeStyle = "rgba(94,60,34,0.4)";
  ctx.lineWidth = 2;
  for (let index = -4; index < 12; index += 1) {
    ctx.beginPath();
    ctx.moveTo(basket.x + index * 14, basket.y);
    ctx.lineTo(basket.x + index * 14 + 26, basket.y + basket.h + 4);
    ctx.moveTo(basket.x + index * 14 + 26, basket.y);
    ctx.lineTo(basket.x + index * 14, basket.y + basket.h + 4);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,236,208,0.28)";
  for (let index = 1; index < 4; index += 1) {
    ctx.beginPath();
    ctx.moveTo(basket.x - 6, basket.y + index * (basket.h / 4));
    ctx.lineTo(basket.x + basket.w + 6, basket.y + index * (basket.h / 4));
    ctx.stroke();
  }
  ctx.restore();

  // Frutas entregadas asomando por el borde.
  for (let index = 0; index < Math.min(delivered, 7); index += 1) {
    const fx = basket.x + 18 + index * 14;
    const fy = basket.y - 2 - (index % 2) * 4;
    const skin = ctx.createRadialGradient(fx - 3, fy - 3, 1, fx, fy, 11);
    skin.addColorStop(0, PALETTE.fruitLight);
    skin.addColorStop(1, PALETTE.fruitDark);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(fx, fy, 9, 0, TAU);
    ctx.fill();
  }

  // Aro superior.
  ctx.fillStyle = "#b07b4f";
  roundRect(ctx, basket.x - 6, basket.y - 2, basket.w + 12, 12, 6);
  ctx.fill();
  ctx.fillStyle = "rgba(255,236,208,0.35)";
  roundRect(ctx, basket.x - 4, basket.y - 1, basket.w + 8, 4, 2);
  ctx.fill();

  // Poste y letrero de meta.
  ctx.strokeStyle = "#8b5e39";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(basket.x + basket.w - 8, basket.y + 4);
  ctx.lineTo(basket.x + basket.w - 8, basket.y - 46);
  ctx.stroke();

  const signX = cx - 2;
  const signY = basket.y - 74;
  ctx.fillStyle = "#fffaf0";
  roundRect(ctx, signX - 40, signY, 80, 38, 11);
  ctx.fill();
  ctx.strokeStyle = "#8b5e39";
  ctx.lineWidth = 4;
  roundRect(ctx, signX - 40, signY, 80, 38, 11);
  ctx.stroke();
  ctx.fillStyle = delivered === target ? "#2b7f58" : INK;
  ctx.font = "900 22px 'Arial Rounded MT Bold', Avenir, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${delivered}/${target}`, signX, signY + 20);
  ctx.textBaseline = "alphabetic";
}

/* ------------------------------------------------------------------ *
 * Personajes
 * ------------------------------------------------------------------ */

/**
 * Niko, explorador jugable. Poses: idle | walk | run | jump | fall | grab |
 * celebrate | tryAgain (AnimationRegistry sustituible).
 *
 * `squash` (0..1) llega del host tras aterrizar y produce el aplastado y
 * estirado; la sombra de contacto se abre con la altura para que el salto se
 * lea aunque la cámara no se mueva.
 */
export function drawNiko(ctx, body, pose, t, carrying, groundY, squash = 0) {
  const cx = body.x + body.w / 2;
  const bottom = body.y + body.h;
  const facing = body.facing;
  const runPhase = Math.sin(t * 14);
  const walking = pose === "walk" || pose === "run";
  const grabbing = pose === "grab";
  const airborne = pose === "jump" || pose === "fall";

  if (groundY !== undefined) {
    contactShadow(ctx, cx, groundY + 2, 22, groundY - bottom);
  }

  ctx.save();
  ctx.translate(cx, bottom);
  // Aplastado al aterrizar / estirado al despegar.
  const stretch = airborne ? 1.07 : 1 - squash * 0.16;
  ctx.scale(facing * (airborne ? 0.94 : 1 + squash * 0.14), stretch);

  const lift = pose === "jump" ? -4 : pose === "fall" ? 3 : grabbing ? 3 : 0;
  const lean = grabbing ? 6 : 0;

  // Piernas y zapatillas.
  const legSwing = walking ? runPhase * 10 : 0;
  const tuck = airborne ? -8 : 0;
  const legs = [
    { x: -8 + legSwing * 0.6, y: tuck ? -12 : -2 },
    { x: 8 - legSwing * 0.6, y: tuck ? -14 : -2 },
  ];
  ctx.strokeStyle = "#2f3f57";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const leg of legs) {
    ctx.beginPath();
    ctx.moveTo(leg.x * 0.3, -26);
    ctx.lineTo(leg.x, leg.y);
    ctx.stroke();
  }
  for (const leg of legs) {
    ctx.fillStyle = "#3a4a63";
    ctx.beginPath();
    ctx.ellipse(leg.x + 3, leg.y + 1, 8, 5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f4f7fb";
    ctx.beginPath();
    ctx.ellipse(leg.x + 4, leg.y + 3, 6, 2.2, 0, 0, TAU);
    ctx.fill();
  }

  // Mochila (detrás del torso).
  ctx.fillStyle = "#e8a936";
  roundRect(ctx, -32, -58 + lift, 15, 30, 7);
  ctx.fill();
  ctx.fillStyle = "#c98d24";
  roundRect(ctx, -30, -49 + lift, 10, 10, 3);
  ctx.fill();

  // Torso.
  const shirt = ctx.createLinearGradient(-18, -63 + lift, 18, -21 + lift);
  shirt.addColorStop(0, "#ff9b8f");
  shirt.addColorStop(1, "#d8433c");
  ctx.fillStyle = shirt;
  roundRect(ctx, -18 + lean * 0.15, -63 + lift, 35, 42, 15);
  ctx.fill();
  // Tirantes de la mochila.
  ctx.strokeStyle = "rgba(200,141,36,0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, -60 + lift);
  ctx.lineTo(-10, -30 + lift);
  ctx.stroke();
  // Luz de contorno del lado del sol.
  ctx.strokeStyle = "rgba(255,236,200,0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(15, -58 + lift);
  ctx.quadraticCurveTo(19, -42 + lift, 13, -24 + lift);
  ctx.stroke();

  // Brazos.
  ctx.strokeStyle = "#f0b689";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  if (pose === "celebrate") {
    const wave = Math.sin(t * 10) * 6;
    ctx.beginPath();
    ctx.moveTo(-15, -52 + lift);
    ctx.lineTo(-26, -74 - wave + lift);
    ctx.moveTo(15, -52 + lift);
    ctx.lineTo(26, -74 + wave + lift);
    ctx.stroke();
  } else if (grabbing) {
    ctx.beginPath();
    ctx.moveTo(14, -52 + lift);
    ctx.lineTo(31, -33 + lift);
    ctx.moveTo(-14, -52 + lift);
    ctx.lineTo(-8, -39 + lift);
    ctx.stroke();
  } else if (carrying > 0) {
    // Brazos en alto sujetando la pila: las manos llegan hasta la fruta, si no
    // la carga parece flotar sola sobre la cabeza.
    ctx.beginPath();
    ctx.moveTo(-15, -52 + lift);
    ctx.lineTo(-25, -80 + lift);
    ctx.lineTo(-19, -108 + lift);
    ctx.moveTo(15, -52 + lift);
    ctx.lineTo(25, -80 + lift);
    ctx.lineTo(19, -108 + lift);
    ctx.stroke();
  } else {
    const swing = walking ? runPhase * 8 : 0;
    ctx.beginPath();
    ctx.moveTo(-15, -52 + lift);
    ctx.lineTo(-20 - swing * 0.4, -34 + lift);
    ctx.moveTo(15, -52 + lift);
    ctx.lineTo(20 + swing * 0.4, -34 + lift);
    ctx.stroke();
  }

  // Cabeza.
  const headBob = walking ? Math.abs(runPhase) * 1.6 : Math.sin(t * 2) * 1.2;
  const headY = -83 + lift - headBob;
  const headR = 23;
  const headX = lean;
  const skin = ctx.createRadialGradient(headX - 8, headY - 8, 3, headX, headY, headR + 3);
  skin.addColorStop(0, "#ffe0c0");
  skin.addColorStop(1, "#eaad7d");
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#f0b689";
  ctx.beginPath();
  ctx.ellipse(headX + headR - 2, headY + 3, 3.6, 5.2, 0, 0, TAU);
  ctx.fill();

  // Pelo con volumen.
  ctx.fillStyle = "#5b3a22";
  ctx.beginPath();
  ctx.moveTo(headX - headR - 1, headY - 1);
  ctx.quadraticCurveTo(headX - headR - 4, headY - 23, headX - 6, headY - 25);
  ctx.quadraticCurveTo(headX + 2, headY - 31, headX + 11, headY - 24);
  ctx.quadraticCurveTo(headX + headR + 5, headY - 20, headX + headR + 1, headY - 1);
  ctx.quadraticCurveTo(headX + 7, headY - 15, headX, headY - 12);
  ctx.quadraticCurveTo(headX - 7, headY - 16, headX - headR - 1, headY - 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#7a5230";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(headX + 3, headY - 27);
  ctx.quadraticCurveTo(headX + 10, headY - 33, headX + 6, headY - 22);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,240,220,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(headX + 4, headY - 15, 10, Math.PI * 1.15, Math.PI * 1.62);
  ctx.stroke();

  // Cara.
  const blink = Math.sin(t * 0.9) > 0.985;
  const eyeY = headY - 2;
  if (pose === "tryAgain") {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(headX + 7, eyeY, 2.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(headX + 9, eyeY + 11, 4.6, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.stroke();
  } else {
    if (blink) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(headX + 3, eyeY);
      ctx.lineTo(headX + 11, eyeY);
      ctx.stroke();
    } else {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(headX + 7, eyeY, 3, 3.6, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(headX + 8.4, eyeY - 1.4, 1.3, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    const smile = pose === "celebrate" || grabbing ? 7 : 4.6;
    ctx.arc(headX + 8, eyeY + 11, smile, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,138,128,0.45)";
    ctx.beginPath();
    ctx.ellipse(headX + 16, eyeY + 8, 4.2, 3, 0, 0, TAU);
    ctx.fill();
  }

  // Frutas en brazos, apiladas sobre la cabeza.
  if (carrying > 0) {
    const count = Math.min(carrying, 5);
    for (let index = 0; index < count; index += 1) {
      const offset = index - (count - 1) / 2;
      const fx = offset * 17;
      const fy = -116 + lift + Math.abs(offset) * 2;
      const skinFruit = ctx.createRadialGradient(fx - 3, fy - 3, 1, fx, fy, 12);
      skinFruit.addColorStop(0, PALETTE.fruitLight);
      skinFruit.addColorStop(1, PALETTE.fruitDark);
      ctx.fillStyle = skinFruit;
      ctx.beginPath();
      ctx.arc(fx, fy, 10, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(fx - 3.4, fy - 3.4, 2.6, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Luma, criatura luminosa narradora. Poses: idle | talk | cheer | think. */
export function drawLuma(ctx, x, y, pose, t, reduced) {
  const bob = reduced ? 0 : Math.sin(t * 2.2) * 6;
  ctx.save();
  ctx.translate(x, y + bob);

  // Aura en dos capas para que el resplandor no tenga borde duro.
  const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, 46);
  const pulse = reduced ? 0.42 : 0.42 + Math.sin(t * 2.6) * 0.12;
  aura.addColorStop(0, `rgba(255,232,168,${pulse})`);
  aura.addColorStop(1, "rgba(255,220,140,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(-48, -48, 96, 96);

  // Alas detrás del cuerpo.
  const flap = reduced ? 0 : Math.sin(t * 9) * (pose === "cheer" ? 11 : 5);
  ctx.fillStyle = "rgba(255,226,150,0.85)";
  ctx.beginPath();
  ctx.ellipse(-25, -3 - flap * 0.4, 12, 7, -0.5, 0, TAU);
  ctx.ellipse(25, -3 + flap * 0.4, 12, 7, 0.5, 0, TAU);
  ctx.fill();

  const orb = ctx.createRadialGradient(-6, -7, 2, 0, 0, 22);
  orb.addColorStop(0, "#fffdf2");
  orb.addColorStop(1, "#ffdf9c");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(196,140,42,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = INK;
  if (pose === "cheer") {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-6, -3, 3.2, Math.PI, 0);
    ctx.arc(6, -3, 3.2, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(-6, -3, 2.3, 2.9, 0, 0, TAU);
    ctx.ellipse(6, -3, 2.3, 2.9, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (pose === "talk") {
    const mouth = 2.4 + Math.abs(Math.sin(t * 12)) * 2.6;
    ctx.ellipse(0, 6, mouth, mouth * 0.9, 0, 0, TAU);
  } else {
    ctx.arc(0, 4, 4.2, Math.PI * 0.15, Math.PI * 0.85);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(255,160,140,0.4)";
  ctx.beginPath();
  ctx.ellipse(-12, 3, 3.4, 2.4, 0, 0, TAU);
  ctx.ellipse(12, 3, 3.4, 2.4, 0, 0, TAU);
  ctx.fill();

  if (pose === "cheer" && !reduced) {
    ctx.fillStyle = PALETTE.gold;
    for (let index = 0; index < 5; index += 1) {
      const angle = t * 3 + (index * TAU) / 5;
      star(ctx, Math.cos(angle) * 34, Math.sin(angle) * 34, 4.5);
    }
  }
  ctx.restore();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const radius = index % 2 === 0 ? r : r * 0.4;
    const angle = (index / 8) * TAU - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Partículas: confeti (`star`), chispas (`spark`) y polvo del suelo (`dust`).
 * El polvo se dibuja con mezcla normal y radio creciente para leerse como aire
 * levantado, no como bolitas.
 */
export function drawParticles(ctx, particles) {
  for (const particle of particles) {
    const alpha = Math.max(0, Math.min(1, particle.life));
    ctx.globalAlpha = alpha;
    if (particle.kind === "dust") {
      ctx.fillStyle = `rgba(214,200,174,${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (2.4 - alpha), 0, TAU);
      ctx.fill();
    } else if (particle.kind === "star") {
      ctx.fillStyle = particle.color;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.spin ?? 0);
      star(ctx, 0, 0, particle.size * 1.5);
      ctx.restore();
    } else {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** Motas de polen flotando: vida ambiental barata y constante. */
export function drawMotes(ctx, cameraX, t, reduced) {
  if (reduced) return;
  const random = rng(0x8fd2);
  ctx.fillStyle = "rgba(255,246,214,0.55)";
  for (let index = 0; index < 22; index += 1) {
    const seedX = random() * 2200;
    const seedY = 120 + random() * 320;
    const speed = 0.3 + random() * 0.5;
    const x = mod(seedX + t * 12 * speed - cameraX * 0.4, VIEW_W + 80) - 40;
    const y = seedY + Math.sin(t * speed + index) * 22;
    ctx.beginPath();
    ctx.arc(x, y, 1.4 + random() * 1.6, 0, TAU);
    ctx.fill();
  }
}
