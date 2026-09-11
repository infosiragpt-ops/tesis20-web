// Fondos pictóricos de cada página. La ilustración «premium» de la portada de
// cada libro (pintura completa, coherente con el cuento) se encuadra de forma
// distinta en cada página y se gradúa según la luz de la escena (noche,
// amanecer, día, atardecer, niebla, salida de luna); encima se pinta el cielo
// que pide la página (luna, sol, estrellas, nubes, luciérnagas) con luz suave.
// Sustituye a la escenografía plana en SVG dentro del libro: las figuras 3D y
// los objetos de la página quedan delante, como en un decorado de película.
import * as THREE from "three";

export const BACKDROP_W = 1000;
export const BACKDROP_H = 640;

// Gradación por luz: tinte (multiplicar), resplandor cálido, bruma, estrellas y viñeta.
const GRADES = {
  day: { tint: null, tintAlpha: 0, glow: "rgba(255,243,207,0.30)", haze: null, stars: 0, vignette: 0.22, ground: 0.18 },
  dusk: { tint: "#6a3a63", tintAlpha: 0.34, glow: "rgba(255,190,120,0.42)", haze: "rgba(224,160,143,0.18)", stars: 0.18, vignette: 0.34, ground: 0.28 },
  dawn: { tint: "#3d3a74", tintAlpha: 0.3, glow: "rgba(255,196,140,0.40)", haze: "rgba(197,143,160,0.2)", stars: 0.22, vignette: 0.34, ground: 0.26 },
  night: { tint: "#121b48", tintAlpha: 0.6, glow: "rgba(143,176,255,0.20)", haze: null, stars: 1, vignette: 0.5, ground: 0.42 },
  moonrise: { tint: "#1f2354", tintAlpha: 0.48, glow: "rgba(255,217,138,0.34)", haze: null, stars: 0.8, vignette: 0.44, ground: 0.36 },
  mist: { tint: "#cdd8da", tintAlpha: 0.2, glow: "rgba(255,255,255,0.26)", haze: "rgba(232,240,238,0.48)", stars: 0, vignette: 0.18, ground: 0.14 },
};

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i += 1) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Zonas de paisaje de cada portada (u0, v0, u1, v1 en fracciones de la
// imagen, v hacia abajo): cielo, montañas, bosque, mar… sin el protagonista,
// que ya está en 3D delante y no debe aparecer duplicado en el fondo.
// `null`: la portada no tiene paisaje aprovechable (personajes y rótulos por
// todas partes) y la página conserva su escenografía dibujada completa.
export const SCENERY = {
  cerditos: null,
  caperucita: null,
  kusi: [[0, 0, 1, 0.42], [0.6, 0.15, 1, 0.75]],
  amaru: [[0, 0, 1, 0.4], [0.66, 0.35, 1, 0.95]],
  sami: [[0, 0.02, 0.7, 0.4], [0.78, 0.45, 1, 0.9]],
  killa: [[0, 0, 1, 0.45], [0.6, 0.25, 1, 0.75]],
  chaska: [[0, 0, 1, 0.34], [0.55, 0.05, 1, 0.5]],
  tico: [[0, 0, 1, 0.38], [0.75, 0.35, 1, 0.8]],
  ana: [[0, 0, 1, 0.48]],
  wayra: [[0, 0, 1, 0.35], [0, 0.15, 0.35, 0.9]],
};
const DEFAULT_SCENERY = [[0, 0, 1, 0.45]];

/**
 * Encuadre de la pintura en una página: recorte `{ x, y, w, h }` (fracciones
 * de la imagen) con la relación del fondo, dentro de una zona de paisaje de
 * la portada. `ratio` es alto/ancho de la imagen. Determinista por libro y
 * página; la primera página es el plano más abierto de la primera zona y las
 * siguientes alternan zonas, lados y un poco de zoom para no repetirse.
 */
export function framingFor(book, pageIndex, ratio = 1.5) {
  const windows = SCENERY[book.id] || DEFAULT_SCENERY;
  const [u0, v0, u1, v1] = windows[pageIndex % windows.length];
  const rand = seededRandom(`${book.id}-${pageIndex}-frame`);
  const winW = u1 - u0;
  const winH = v1 - v0;
  const aspect = (BACKDROP_W / BACKDROP_H) * ratio;
  let w = winW;
  let h = w / aspect;
  if (h > winH) {
    h = winH;
    w = h * aspect;
  }
  const zoom = pageIndex === 0 ? 1 : 1.05 + rand() * 0.25;
  w /= zoom;
  h /= zoom;
  const side = pageIndex % 2 ? 1 : -1;
  const tx = pageIndex === 0 ? 0.5 : clamp(0.5 + side * (0.15 + rand() * 0.35), 0, 1);
  const ty = pageIndex === 0 ? 0.5 : rand();
  const x = u0 + (winW - w) * tx;
  const y = v0 + (winH - h) * ty;
  return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)), w: Number(w.toFixed(4)), h: Number(h.toFixed(4)), zoom: Number(zoom.toFixed(3)) };
}

const imageCache = new Map();
function loadCover(book) {
  const src = book.cover?.image;
  if (!src) return Promise.reject(new Error("sin portada"));
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`no se pudo cargar ${src}`));
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function drawCover(ctx, img, W, H, framing) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, framing.x * iw, framing.y * ih, framing.w * iw, framing.h * ih, 0, 0, W, H);
}

// Nitidez suave tras ampliar la pintura (máscara de enfoque 3×3).
function sharpen(ctx, W, H, amount = 0.45) {
  const image = ctx.getImageData(0, 0, W, H);
  const src = image.data;
  const out = new Uint8ClampedArray(src.length);
  const stride = W * 4;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * stride + x * 4;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) {
        out[i] = src[i];
        out[i + 1] = src[i + 1];
        out[i + 2] = src[i + 2];
        out[i + 3] = 255;
        continue;
      }
      for (let c = 0; c < 3; c += 1) {
        const center = src[i + c];
        const around = (src[i - 4 + c] + src[i + 4 + c] + src[i - stride + c] + src[i + stride + c]) / 4;
        out[i + c] = center + (center - around) * amount * 2;
      }
      out[i + 3] = 255;
    }
  }
  image.data.set(out);
  ctx.putImageData(image, 0, 0);
}

function softDisc(ctx, x, y, r, inner, outer) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function paintSky(ctx, W, H, page, grade, rand) {
  const props = new Set(page.props || []);
  const night = grade.stars > 0;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  if (props.has("estrellas") || grade.stars > 0.5) {
    const count = props.has("estrellas") ? 90 : 45;
    for (let i = 0; i < count; i += 1) {
      const x = rand() * W;
      const y = rand() * H * 0.55;
      const r = 0.8 + rand() * 1.8;
      const a = (0.35 + rand() * 0.6) * Math.max(grade.stars, 0.5);
      ctx.fillStyle = `rgba(255,250,235,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (r > 2.2) softDisc(ctx, x, y, r * 5, "rgba(255,250,235,0.35)", "rgba(255,250,235,0)");
    }
  }
  if (props.has("luna")) {
    const x = W * 0.78;
    const y = H * 0.2;
    softDisc(ctx, x, y, 150, "rgba(255,236,190,0.55)", "rgba(255,236,190,0)");
    ctx.fillStyle = "#fff4d2";
    ctx.beginPath();
    ctx.arc(x, y, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(230,215,180,0.55)";
    [[-14, -8, 9], [10, 12, 7], [16, -16, 5]].forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (props.has("sol") && !night) {
    const x = W * 0.8;
    const y = H * 0.18;
    softDisc(ctx, x, y, 220, "rgba(255,232,170,0.75)", "rgba(255,232,170,0)");
    ctx.fillStyle = "#fff6d6";
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
  }
  if (props.has("luciernagas")) {
    for (let i = 0; i < 46; i += 1) {
      const x = rand() * W;
      const y = H * (0.3 + rand() * 0.6);
      const r = 2 + rand() * 3;
      softDisc(ctx, x, y, r * 5, "rgba(255,226,120,0.55)", "rgba(255,226,120,0)");
      ctx.fillStyle = "rgba(255,244,170,0.95)";
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  if (props.has("nubes") || props.has("niebla")) {
    ctx.save();
    ctx.globalAlpha = props.has("niebla") ? 0.5 : 0.32;
    const tone = night ? "rgba(190,205,240," : "rgba(255,255,255,";
    for (let i = 0; i < (props.has("niebla") ? 7 : 4); i += 1) {
      const x = rand() * W;
      const y = props.has("niebla") ? H * (0.35 + rand() * 0.5) : H * (0.08 + rand() * 0.25);
      const w = 180 + rand() * 260;
      const g = ctx.createRadialGradient(x, y, 0, x, y, w);
      g.addColorStop(0, `${tone}0.85)`);
      g.addColorStop(0.55, `${tone}0.35)`);
      g.addColorStop(1, `${tone}0)`);
      ctx.fillStyle = g;
      ctx.save();
      ctx.scale(1, 0.42);
      ctx.fillRect(x - w, y / 0.42 - w, w * 2, w * 2);
      ctx.restore();
    }
    ctx.restore();
  }
}

function paintGrain(ctx, W, H, rand) {
  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let i = 0; i < 900; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    ctx.strokeStyle = rand() > 0.5 ? "#000000" : "#ffffff";
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 22, y + (rand() - 0.5) * 8);
    ctx.stroke();
  }
  ctx.restore();
}

const textureCache = new Map();

/**
 * Textura del fondo de una página: portada encuadrada + luz de la escena +
 * cielo + escenografía dibujada (`layer`, un canvas o imagen con fondo
 * transparente). Se cachea por libro y página; rechaza si la portada no
 * carga (el llamador cae a la escenografía SVG completa).
 */
export function paintedBackdropTexture(book, pageIndex, layer = null) {
  const key = `${book.id}:${pageIndex}`;
  if (textureCache.has(key)) return textureCache.get(key);
  if (SCENERY[book.id] === null) return Promise.reject(new Error("sin paisaje en la portada"));
  const promise = loadCover(book).then((img) => {
    const page = book.pages[pageIndex];
    const W = BACKDROP_W;
    const H = BACKDROP_H;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    const grade = GRADES[page.light] || GRADES.day;
    const rand = seededRandom(`${book.id}-${pageIndex}-sky`);

    drawCover(ctx, img, W, H, framingFor(book, pageIndex, img.naturalHeight / img.naturalWidth));
    sharpen(ctx, W, H, 0.45);

    // Gradación de la luz de la página.
    if (grade.tint) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = grade.tintAlpha;
      ctx.fillStyle = grade.tint;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (grade.haze) {
      const haze = ctx.createLinearGradient(0, H * 0.3, 0, H);
      haze.addColorStop(0, "rgba(0,0,0,0)");
      haze.addColorStop(1, grade.haze);
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);
    }
    // Resplandor cálido bajo, donde están las figuras.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.9, 0, W * 0.5, H * 0.9, W * 0.62);
    glow.addColorStop(0, grade.glow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    paintSky(ctx, W, H, page, grade, rand);

    // Escenografía dibujada de la página (colinas, suelo, árboles, casas…)
    // delante de la pintura del cielo: nítida y propia de cada página.
    if (layer) ctx.drawImage(layer, 0, 0, W, H);

    // Suelo más oscuro para que las figuras destaquen, y viñeta.
    const ground = ctx.createLinearGradient(0, H * 0.72, 0, H);
    ground.addColorStop(0, "rgba(10,8,20,0)");
    ground.addColorStop(1, `rgba(10,8,20,${grade.ground})`);
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);
    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.35, W * 0.5, H * 0.5, W * 0.72);
    vignette.addColorStop(0, "rgba(6,4,12,0)");
    vignette.addColorStop(1, `rgba(6,4,12,${grade.vignette})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    paintGrain(ctx, W, H, rand);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  });
  textureCache.set(key, promise);
  promise.catch(() => textureCache.delete(key));
  return promise;
}
