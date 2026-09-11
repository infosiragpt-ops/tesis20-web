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
  // Casita con techo a dos aguas y puerta (pared de «Los tres cerditos»).
  house(ctx, x, y, s, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.08;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.36, y - s * 0.02);
    ctx.lineTo(x, y - s * 0.4);
    ctx.lineTo(x + s * 0.36, y - s * 0.02);
    ctx.stroke();
    ctx.strokeRect(x - s * 0.28, y - s * 0.02, s * 0.56, s * 0.42);
    ctx.strokeRect(x - s * 0.08, y + s * 0.14, s * 0.16, s * 0.26);
  },
  // Corazón (pared de «Caperucita Roja»).
  heart(ctx, x, y, s, ink) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.34);
    ctx.bezierCurveTo(x - s * 0.5, y, x - s * 0.34, y - s * 0.38, x, y - s * 0.12);
    ctx.bezierCurveTo(x + s * 0.34, y - s * 0.38, x + s * 0.5, y, x, y + s * 0.34);
    ctx.fill();
  },
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
  default: { bg: "#75624f", ink: "#9b846a", accent: "#c9aa6d", motifs: ["kite", "bird", "star"] },
  kusi: { bg: "#3a4466", ink: "#5c6a95", accent: "#e0c46a", motifs: ["moon", "star", "star"] },
  amaru: { bg: "#2f5c52", ink: "#4d8a7c", accent: "#9fe0b0", motifs: ["leaf", "fish", "wave"] },
  sami: { bg: "#e8dcc0", ink: "#c9b28a", accent: "#e0704f", motifs: ["kite", "flower", "bird"] },
  killa: { bg: "#5a4a7a", ink: "#7d6ba0", accent: "#e8c98a", motifs: ["star", "cactus", "star"] },
  chaska: { bg: "#c8dcc4", ink: "#9fb896", accent: "#d97fa6", motifs: ["leaf", "flower", "bird"] },
  tico: { bg: "#c6d8e8", ink: "#93aec6", accent: "#e05a4f", motifs: ["mountain", "train", "star"] },
  ana: { bg: "#bfe0ec", ink: "#7fb9cf", accent: "#f0a35a", motifs: ["wave", "fish", "bird"] },
  wayra: { bg: "#d8c6d6", ink: "#b39ab3", accent: "#e0a54f", motifs: ["leaf", "star", "bird"] },
  // Pradera de los cerditos: verde claro con casitas y flores.
  cerditos: { bg: "#dbe8c4", ink: "#a9c58a", accent: "#e8837a", motifs: ["house", "flower", "leaf"] },
  // Bosque de Caperucita: verde profundo con hojas, corazones y pájaros.
  caperucita: { bg: "#4f7a4a", ink: "#7aa672", accent: "#e0574a", motifs: ["leaf", "heart", "bird"] },
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
      ctx.globalAlpha = 0.48;
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

export function observatoryWindowTexture(width = 1024, height = 768) {
  const c = canvas(width, height);
  const ctx = c.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#07132e");
  sky.addColorStop(0.58, "#183a68");
  sky.addColorStop(1, "#6f5672");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const rand = seededRandom(20260910);
  for (let i = 0; i < 150; i += 1) {
    const r = rand() * 2.4 + 0.7;
    ctx.fillStyle = rand() > 0.78 ? "#ffe7a8" : "#d9e8ff";
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    ctx.beginPath();
    ctx.arc(rand() * width, rand() * height * 0.7, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const moon = ctx.createRadialGradient(width * 0.72, height * 0.26, 4, width * 0.72, height * 0.26, 94);
  moon.addColorStop(0, "#fffce9");
  moon.addColorStop(0.62, "#f6e3a5");
  moon.addColorStop(1, "rgba(246,227,165,0)");
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.26, 98, 0, Math.PI * 2);
  ctx.fill();

  const mountains = ["#263957", "#1d2b45", "#162238"];
  mountains.forEach((color, layer) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    const base = height * (0.7 + layer * 0.07);
    for (let x = 0; x <= width; x += 70) {
      const peak = base - (80 + rand() * 150) * (1 - layer * 0.12);
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
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

const coverArtCache = new Map();

/**
 * Convierte la ilustración editorial de cada cuento en una portada nítida.
 * El arte vive como AVIF optimizado, mientras el título se compone aquí para
 * conservar español perfecto y la misma jerarquía en los ocho libros.
 */
export function coverArtTexture(book, width = 560, height = 840) {
  const key = `${book.id}:${book.cover.image}:${width}x${height}`;
  if (coverArtCache.has(key)) return coverArtCache.get(key);

  const promise = new Promise((resolve) => {
    const c = canvas(width, height);
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const paint = (img) => {
      ctx.fillStyle = book.accent;
      ctx.fillRect(0, 0, width, height);

      if (img) {
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        ctx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      }

      // Una ilustración que ya trae el título impreso (cover.titled) se deja
      // tal cual: sin sombreado superior ni título encima.
      const paintTitle = !book.cover.titled;
      const topShade = ctx.createLinearGradient(0, 0, 0, height * 0.48);
      topShade.addColorStop(0, "rgba(7,15,35,.86)");
      topShade.addColorStop(0.58, "rgba(7,15,35,.38)");
      topShade.addColorStop(1, "rgba(7,15,35,0)");
      if (paintTitle) {
        ctx.fillStyle = topShade;
        ctx.fillRect(0, 0, width, height * 0.5);
      }

      const bottomShade = ctx.createLinearGradient(0, height * 0.72, 0, height);
      bottomShade.addColorStop(0, "rgba(7,15,35,0)");
      bottomShade.addColorStop(1, "rgba(7,15,35,.72)");
      ctx.fillStyle = bottomShade;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(0,0,0,.48)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      let fontSize = book.title.length > 29 ? 77 : 88;
      let lines = [];
      do {
        ctx.font = `900 ${fontSize}px ui-rounded, "Trebuchet MS", system-ui, sans-serif`;
        lines = wrapWords(ctx, book.title, width * 0.82);
        fontSize -= 3;
      } while (lines.length > 3 && fontSize > 58);

      const lineHeight = (fontSize + 3) * 1.04;
      const startY = 112 + lineHeight / 2;
      (paintTitle ? lines.slice(0, 3) : []).forEach((line, index) => {
        ctx.lineWidth = 13;
        ctx.strokeStyle = "rgba(22,28,48,.82)";
        ctx.strokeText(line, width / 2, startY + index * lineHeight);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(222,169,72,.92)";
        ctx.strokeText(line, width / 2, startY + index * lineHeight);
        ctx.fillStyle = book.cover.ink;
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(10,20,40,.72)";
      ctx.fillRect(width * 0.27, height - 93, width * 0.46, 46);
      ctx.fillStyle = book.cover.ink;
      ctx.font = `800 24px ui-rounded, "Trebuchet MS", system-ui, sans-serif`;
      ctx.fillText("TESIS20 · NIDO", width / 2, height - 70);

      ctx.strokeStyle = "rgba(255,224,153,.72)";
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, width - 44, height - 44);
      ctx.strokeStyle = "rgba(255,255,255,.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(34, 34, width - 68, height - 68);

      tex.needsUpdate = true;
      resolve(tex);
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => paint(img);
    img.onerror = () => paint(null);
    img.src = book.cover.image;
  });

  coverArtCache.set(key, promise);
  return promise;
}

const storyTextureCache = new Map();

function wrapWords(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = [];
  words.forEach((word) => {
    const next = [...line, word].join(" ");
    if (line.length && ctx.measureText(next).width > maxWidth) {
      lines.push(line.join(" "));
      line = [word];
    } else {
      line.push(word);
    }
  });
  if (line.length) lines.push(line.join(" "));
  return lines;
}

/**
 * Página editorial que se imprime sobre la cara interior izquierda del libro.
 * El texto deja de vivir en una tarjeta flotante y pasa a formar parte del
 * objeto físico 3D, con una textura nítida incluso en pantallas Retina.
 */
export function storyPageTexture(book, page, pageIndex, totalPages) {
  const compact = typeof window !== "undefined" && window.matchMedia?.("(max-width: 760px)").matches;
  const key = `${book.id}:${pageIndex}:${compact ? "mobile" : "desktop"}`;
  if (storyTextureCache.has(key)) return storyTextureCache.get(key);

  const c = canvas(1024, 1448);
  const ctx = c.getContext("2d");
  const paper = ctx.createLinearGradient(0, 0, 1024, 1448);
  paper.addColorStop(0, "#fffaf0");
  paper.addColorStop(0.55, "#f7ecd5");
  paper.addColorStop(1, "#ead9b8");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, c.width, c.height);

  const rand = seededRandom(pageIndex * 7919 + book.id.length * 101);
  for (let i = 0; i < 2400; i += 1) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(91,62,30,.035)" : "rgba(255,255,255,.12)";
    const size = rand() * 2 + 0.5;
    ctx.fillRect(rand() * c.width, rand() * c.height, size, size);
  }

  ctx.strokeStyle = "rgba(178,133,62,.62)";
  ctx.lineWidth = 4;
  ctx.strokeRect(54, 54, 916, 1340);
  ctx.strokeStyle = "rgba(178,133,62,.26)";
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 70, 884, 1308);

  ctx.textAlign = "center";
  ctx.fillStyle = "#9a6b2f";
  ctx.font = `700 ${compact ? 34 : 30}px ui-rounded, "Trebuchet MS", sans-serif`;
  ctx.letterSpacing = "7px";
  ctx.fillText(`PÁGINA ${pageIndex + 1} DE ${totalPages}`, 512, 142);

  ctx.fillStyle = "#5a3b24";
  ctx.font = `900 ${compact ? 92 : 76}px ui-rounded, "Trebuchet MS", sans-serif`;
  const titleLines = wrapWords(ctx, page.t, 790).slice(0, 3);
  const titleStart = titleLines.length > 1 ? 250 : 285;
  titleLines.forEach((line, index) => ctx.fillText(line, 512, titleStart + index * 82));

  const ruleY = titleStart + titleLines.length * 82 + 22;
  ctx.strokeStyle = book.accent;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(360, ruleY);
  ctx.lineTo(664, ruleY);
  ctx.stroke();
  ctx.fillStyle = book.accent;
  ctx.save();
  ctx.translate(512, ruleY);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-12, -12, 24, 24);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "#3a2a21";
  ctx.font = `500 ${compact ? 88 : 53}px "Iowan Old Style", "Palatino Linotype", Georgia, serif`;
  const bodyLines = wrapWords(ctx, page.x, 790);
  const bodyStart = ruleY + (compact ? 102 : 115);
  const lineHeight = compact ? (bodyLines.length > 8 ? 82 : 96) : bodyLines.length > 7 ? 69 : 76;
  bodyLines.slice(0, 10).forEach((line, index) => {
    const y = bodyStart + index * lineHeight;
    ctx.fillText(line, 116, y);
    ctx.strokeStyle = "rgba(174,124,59,.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(116, y + 13);
    ctx.lineTo(Math.min(908, 116 + ctx.measureText(line).width), y + 13);
    ctx.stroke();
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(92,63,34,.58)";
  ctx.font = `600 ${compact ? 29 : 25}px ui-rounded, "Trebuchet MS", sans-serif`;
  ctx.fillText("Toca Léemelo para escuchar el cuento", 512, 1325);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  storyTextureCache.set(key, tex);
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
  coverArtCache.forEach((promise) => promise.then((tex) => tex.dispose()));
  coverArtCache.clear();
  storyTextureCache.forEach((tex) => tex.dispose());
  storyTextureCache.clear();
}
