import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "./home-sections.jsx";

/**
 * Entrada solo para el build: scripts/home-hero-prerender.mjs la compila para
 * Node y escribe este marcado en el HTML de Inicio. No se importa desde la app.
 */
export function renderHomeHero() {
  return renderToStaticMarkup(<Hero />);
}
