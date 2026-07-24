import { useState } from "react";
import { PlatformSwitcher } from "../platform-switcher.jsx";
import { NidoMascot, STEP_SCENES } from "./illustrations/nido-mascot.jsx";
import { NidoGamesExperience } from "./nido-games.jsx";
import { createNidoIcon } from "./nido-icon-map";
import "./nido-styles.css";

const Baby = createNidoIcon("Baby");

const STEP_COPY = [
  {
    title: "Elige su edad",
    text: "Toca la tarjeta de 2–3, 4–5 o 6 años y verás solo juegos pensados para esa etapa.",
  },
  {
    title: "Escucha a Nido",
    text: "Nuestro tucán guía lee cada consigna en voz alta y puedes repetirla las veces que quieras.",
  },
  {
    title: "Toca tu respuesta",
    text: "Todo se resuelve tocando tarjetas grandes con dibujos: sin teclado y sin necesidad de leer.",
  },
  {
    title: "Gana estrellas",
    text: "Cada acierto suena ¡tirirí!, suma estrellas y avanza hasta completar los 20 retos de la ruta.",
  },
];

export default function NidoPage() {
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <div className="nido-app">
      <a className="nido-skip-link" href="#nido-main">Saltar al contenido</a>
      <header className="nido-header">
        <div className="nido-shell nido-header__inner">
          <div className="nido-header__brand-group">
            <PlatformSwitcher currentPlatform="nido" />
            <a className="nido-brand" href="/nido" aria-label="Tesis20 Nido, inicio">
              <span className="nido-brand__mark" aria-hidden="true">
                <Baby size={29} weight="duotone" />
              </span>
              <span>
                <small>Tesis20</small>
                <strong>Nido</strong>
              </span>
            </a>
          </div>
          <nav className="nido-nav" aria-label="Navegación de Nido">
            <a href="#clases">Juegos</a>
            <a href="#como-jugar">Cómo se juega</a>
          </nav>
        </div>
      </header>

      <main id="nido-main">
        <NidoGamesExperience onStatus={setStatusMessage} />

        <section
          className="nido-steps"
          id="como-jugar"
          aria-labelledby="nido-steps-title"
        >
          <div className="nido-shell">
            <header className="nido-section-heading nido-section-heading--centered">
              <span className="nido-kicker">Para nuestros peques</span>
              <h2 id="nido-steps-title">¿Cómo lo usan los alumnos?</h2>
              <p>
                Cuatro pasos tan simples que pueden jugarlos solos o acompañados
                por su familia.
              </p>
            </header>
            <ol className="nido-steps__grid">
              {STEP_SCENES.map((step, index) => {
                const copy = STEP_COPY[index];
                return (
                  <li key={step.id}>
                    <step.Component
                      className="nido-steps__scene"
                      aria-hidden="true"
                    />
                    <div className="nido-steps__copy">
                      <span className="nido-steps__number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <strong>{copy.title}</strong>
                      <p>{copy.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="nido-steps__cta">
              <NidoMascot pose="think" size={96} aria-hidden="true" />
              <div>
                <strong>No necesitan saber leer</strong>
                <p>
                  Cada consigna se narra en voz alta y las respuestas son
                  tarjetas grandes con dibujos, pensadas para deditos pequeños.
                </p>
              </div>
              <a className="nido-steps__button" href="#clases">
                Probar un juego
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="nido-footer">
        <div className="nido-shell">
          <a className="nido-brand nido-brand--footer" href="/nido">
            <span className="nido-brand__mark" aria-hidden="true">
              <Baby size={26} weight="duotone" />
            </span>
            <span><small>Tesis20</small><strong>Nido</strong></span>
          </a>
          <p>Aprendizaje temprano con juego, tecnología y acompañamiento.</p>
          <a href="/">Volver a Tesis20</a>
        </div>
      </footer>

      <p className="nido-status" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </div>
  );
}
