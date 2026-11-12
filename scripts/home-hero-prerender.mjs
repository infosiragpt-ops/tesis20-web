/**
 * Hero de Inicio prerenderizado desde el mismo componente React.
 *
 * El HTML de Inicio se publica con el hero ya dibujado (titular, botón de
 * WhatsApp y foto): el visitante lo ve con el primer pintado, sin esperar a
 * que descargue y arranque la app, y el botón funciona desde ese momento.
 * Al montar, React lo reemplaza por un hero idéntico, así que no hay salto.
 *
 * El marcado sale de <Hero /> (src/home-sections.jsx) compilado para Node con
 * Vite: una sola fuente, no una copia a mano que pueda desalinearse.
 */
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const ROOT = process.cwd();
const ENTRY = resolve(ROOT, "src/home-hero-prerender.jsx");
// Dentro de node_modules: no se publica, no se versiona y resuelve react.
const OUTPUT_DIRECTORY = resolve(ROOT, "node_modules/.tesis20-prerender");

export async function renderHomeHeroMarkup() {
  await build({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    publicDir: false,
    plugins: [react()],
    build: {
      ssr: ENTRY,
      outDir: OUTPUT_DIRECTORY,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { format: "es", entryFileNames: "home-hero.mjs" } },
    },
  });

  try {
    const moduleUrl = `${pathToFileURL(resolve(OUTPUT_DIRECTORY, "home-hero.mjs")).href}?t=${Date.now()}`;
    const { renderHomeHero } = await import(moduleUrl);
    // React 19 antepone un <link rel="preload"> para la foto con prioridad alta;
    // el <head> ya trae esa precarga, así que aquí solo va la sección.
    // El estado de carga de SafeImage solo tiene sentido con la app montada.
    const markup = renderHomeHero()
      .replace(/^(?:<link\b[^>]*>)+/, "")
      .replace(' aria-busy="true" data-image-state="loading"', "");
    if (!/^<section class="hero"[\s\S]*<h1[\s\S]*<\/section>$/.test(markup)) {
      throw new Error(`El hero prerenderizado no tiene la forma esperada: ${markup.slice(0, 200)}`);
    }
    return markup;
  } finally {
    await rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
  }
}
