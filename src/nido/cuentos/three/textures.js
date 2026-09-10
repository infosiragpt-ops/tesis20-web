// Texturas generadas en canvas: madera, papel tapiz por cuento, lomos y
// rasterizado de los SVG (portadas y escenas) a texturas.

import * as THREE from "three";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function seededRandom(seed) {
  let value = seed >>> 0 || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function woodTexture({ base = "#c48a52", dark = "#8f5a2b", light = "#e0b07a", size = 1024, seed = 7, repeat = [1, 1] } = {}) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  const rand = seededRandom(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // Vetas: bandas onduladas de distinta intensidad.
  for (let i = 0; i < 90; i += 1) {
    const y = rand() * size;
    const amp = 4 + rand() * 14;
    const freq = 0.004 + rand() * 0.01;
    const width = 1 + rand() * 5;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const yy = y + Math.sin(x * freq + i) * amp + Math.sin(x * 0.03 + i * 3) * 2;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = rand() > 0.5 ? dark : light;
    ctx.globalAlpha = 0.08 + rand() * 0.16;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  // Nudos.
  for (let i = 0; i < 4; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    for (let r = 26; r > 2; r -= 5) {
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.6, r, 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = dark;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  // Espejado: la veta no es periódica, así no se nota la costura entre repeticiones.
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Motivos del papel tapiz. Cada cuento tiene su patrón y sus colores.
const MOTIFS = {
  kite(ctx, x, y, s, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.5);
    ctx.lineTo(x + s * 0.32, y);
    ctx.lineTo(x, y + s * 0.62);
    ctx.lineTo(x - s * 0.32, y);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.62);
    ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.9, x - s * 0.1, y + s * 1.1);
    ctx.stroke();
  },
  star(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? s * 0.5 : s * 0.2;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  },
  moon(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x + s * 0.22, y - s * 0.1, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  },
  leaf(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y + s * 0.3);
    ctx.quadraticCurveTo(x, y - s * 0.7, x + s * 0.5, y - s * 0.3);
    ctx.quadraticCurveTo(x, y + s * 0.7, x - s * 0.5, y + s * 0.3);
    ctx.fill();
  },
  wave(ctx, x, y, s, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y);
    ctx.quadraticCurveTo(x - s * 0.3, y - s * 0.4, x, y);
    ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.4, x + s * 0.6, y);
    ctx.stroke();
  },
  fish(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.45, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.4, y);
    ctx.lineTo(x + s * 0.65, y - s * 0.25);
    ctx.lineTo(x + s * 0.65, y + s * 0.25);
    ctx.closePath();
    ctx.fill();
  },
  mountain(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y + s * 0.4);
    ctx.lineTo(x, y - s * 0.5);
    ctx.lineTo(x + s * 0.6, y + s * 0.4);
    ctx.closePath();
    ctx.fill();
  },
  bird(ctx, x, y, s, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y);
    ctx.quadraticCurveTo(x - s * 0.25, y - s * 0.4, x, y);
    ctx.quadraticCurveTo(x + s * 0.25, y - s * 0.4, x + s * 0.5, y);
    ctx.stroke();
  },
  flower(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * s * 0.28, y + Math.sin(a) * s * 0.28, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  cactus(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.fillRect(x - s * 0.12, y - s * 0.5, s * 0.24, s);
    ctx.fillRect(x - s * 0.42, y - s * 0.2, s * 0.14, s * 0.45);
    ctx.fillRect(x + s * 0.28, y - s * 0.32, s * 0.14, s * 0.45);
    ctx.fillRect(x - s * 0.42, y + 0.18 * s, s * 0.32, s * 0.12);
    ctx.fillRect(x + s * 0.1, y + 0.06 * s, s * 0.32, s * 0.12);
  },
  train(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.fillRect(x - s * 0.5, y - s * 0.1, s * 0.7, s * 0.35);
    ctx.fillRect(x + s * 0.2, y - s * 0.35, s * 0.3, s * 0.6);
    ctx.fillRect(x - s * 0.35, y - s * 0.35, s * 0.12, s * 0.25);
    ctx.beginPath();
    ctx.arc(x - s * 0.3, y + s * 0.32, s * 0.1, 0, Math.PI * 2);
    ctx.arc(x + s * 0.1, y + s * 0.32, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  },
};

export const WALL_THEMES = {
  default: { bg: "#d5dbc3", ink: "#a9b393", accent: "#c9b06a", motifs: ["kite", "bird", "star"] },
  kusi: { bg: "#3a4466", ink: "#5c6a95", accent: "#e0c46a", motifs: ["moon", "star", "star"] },
  amaru: { bg: "#2f5c52", ink: "#4d8a7c", accent: "#9fe0b0", motifs: ["leaf", "fish", "wave"] },
  sami: { bg: "#e8dcc0", ink: "#c9b28a", accent: "#e0704f", motifs: ["kite", "flower", "bird"] },
  killa: { bg: "#5a4a7a", ink: "#7d6ba0", accent: "#e8c98a", motifs: ["star", "cactus", "star"] },
  chaska: { bg: "#c8dcc4", ink: "#9fb896", accent: "#d97fa6", motifs: ["leaf", "flower", "bird"] },
  tico: { bg: "#c6d8e8", ink: "#93aec6", accent: "#e05a4f", motifs: ["mountain", "train", "star"] },
  ana: { bg: "#bfe0ec", ink: "#7fb9cf", accent: "#f0a35a", motifs: ["wave", "fish", "bird"] },
  wayra: { bg: "#d8c6d6", ink: "#b39ab3", accent: "#e0a54f", motifs: ["leaf", "star", "bird"] },
};

export function wallpaperTexture(theme = WALL_THEMES.default, size = 512) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);
  // Textura de tela: rayado fino diagonal.
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  for (let i = -size; i < size * 2; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const rand = seededRandom(theme.bg.length * 131 + theme.motifs.join("").length);
  const cells = 4;
  const step = size / cells;
  for (let gx = 0; gx < cells; gx += 1) {
    for (let gy = 0; gy < cells; gy += 1) {
      const motif = theme.motifs[(gx + gy * 2) % theme.motifs.length];
      const x = gx * step + step / 2 + (rand() - 0.5) * step * 0.3;
      const y = gy * step + step / 2 + (rand() - 0.5) * step * 0.3;
      const s = step * (0.32 + rand() * 0.14);
      const ink = (gx + gy) % 3 === 0 ? theme.accent : theme.ink;
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.translate(x, y);
      ctx.rotate((rand() - 0.5) * 0.5);
      MOTIFS[motif]?.(ctx, 0, 0, s, ink);
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function paperTexture(size = 256) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f6ecd6";
  ctx.fillRect(0, 0, size, size);
  const rand = seededRandom(99);
  for (let i = 0; i < 1400; i += 1) {
    ctx.fillStyle = rand() > 0.5 ? "#e9dcc0" : "#fff8e8";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(rand() * size, rand() * size, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Textura de canto de páginas: rayitas horizontales. */
export function pagesEdgeTexture(size = 128) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f3e7cf";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#d8c8a6";
  ctx.lineWidth = 1;
  for (let y = 1; y < size; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function spineTexture(book, w = 128, h = 768) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, shade(book.accent, -0.55));
  grad.addColorStop(0.5, shade(book.accent, -0.35));
  grad.addColorStop(1, shade(book.accent, -0.6));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = book.cover.ink;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(w * 0.2, h * 0.05, w * 0.6, 6);
  ctx.fillRect(w * 0.2, h * 0.95, w * 0.6, 6);
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(w * 0.42)}px ui-rounded, "Trebuchet MS", system-ui, sans-serif`;
  ctx.fillStyle = book.cover.ink;
  ctx.fillText(book.title.length > 26 ? `${book.title.slice(0, 24)}…` : book.title, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function flatTexture(color, size = 8) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function shade(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amount < 0 ? v * amount : (255 - v) * amount))));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/* ------------------- SVG (React) → textura ------------------- */

let hiddenHost = null;
let hiddenRoot = null;

/** Serializa un elemento React SVG a markup, sin el renderer de servidor. */
export function svgMarkup(element) {
  if (!hiddenHost) {
    hiddenHost = document.createElement("div");
    hiddenHost.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;";
    document.body.appendChild(hiddenHost);
    hiddenRoot = createRoot(hiddenHost);
  }
  flushSync(() => hiddenRoot.render(element));
  const svg = hiddenHost.querySelector("svg");
  if (!svg) return "";
  return new XMLSerializer().serializeToString(svg);
}

const nextTask = () => new Promise((resolve) => window.setTimeout(resolve, 0));

/**
 * Convierte un elemento React SVG en textura. Espera a salir del ciclo de
 * React antes de renderizar (flushSync no puede vaciar otra raíz mientras
 * React está en medio de un commit) y reintenta si el markup sale vacío.
 */
export async function svgElementToTexture(key, element, width, height) {
  if (textureCache.has(key)) return textureCache.get(key);
  let markup = "";
  for (let attempt = 0; attempt < 4 && !markup; attempt += 1) {
    await nextTask();
    markup = svgMarkup(element);
  }
  return svgToTexture(key, markup, width, height);
}

const textureCache = new Map();

/**
 * Rasteriza markup SVG en una textura. Devuelve una promesa con la textura;
 * las llamadas repetidas con la misma clave reutilizan el resultado.
 */
export function svgToTexture(key, markup, width, height) {
  if (textureCache.has(key)) return textureCache.get(key);
  const promise = new Promise((resolve) => {
    const c = canvas(width, height);
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const img = new Image();
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      tex.needsUpdate = true;
      URL.revokeObjectURL(url);
      resolve(tex);
    };
    img.onerror = () => {
      ctx.fillStyle = "#3a4466";
      ctx.fillRect(0, 0, width, height);
      tex.needsUpdate = true;
      URL.revokeObjectURL(url);
      resolve(tex);
    };
    img.src = url;
  });
  textureCache.set(key, promise);
  return promise;
}

export function disposeTextureCache() {
  textureCache.forEach((promise) => promise.then((tex) => tex.dispose()));
  textureCache.clear();
}
