import { useEffect, useState } from "react";
import { PlatformSwitcher } from "../platform-switcher.jsx";
import { NidoMascot } from "./illustrations/nido-mascot.jsx";
import { NidoGamesExperience } from "./nido-games.jsx";
import { createNidoIcon } from "./nido-icon-map";
import "./nido-styles.css";

const Baby = createNidoIcon("Baby");

const PLAY_MECHANICS = [
  {
    icon: "☝️",
    title: "Toca",
    text: "Observa la escena y selecciona directamente una figura, emoción u objeto.",
  },
  {
    icon: "🧩",
    title: "Arrastra",
    text: "Mueve la pieza al destino. En móvil también puedes tocar la pieza y luego soltarla.",
  },
  {
    icon: "↔️",
    title: "Ordena",
    text: "Acomoda tamaños y secuencias con arrastre, toques o flechas accesibles.",
  },
  {
    icon: "🔗",
    title: "Empareja",
    text: "Une la tarjeta guía con su pareja correcta: animal, palabra, cantidad o imagen.",
  },
  {
    icon: "🐣",
    title: "Camina",
    text: "Guía al personaje por un recorrido hasta la respuesta, con controles grandes y teclado.",
  },
];

const AGE_PLAY = [
  {
    age: "2–3 años",
    title: "Explorar con ayuda",
    text: "Dos opciones, piezas grandes, encaje fácil, caminos de 3×3 y narración pausada.",
  },
  {
    age: "4–5 años",
    title: "Relacionar y descubrir",
    text: "Hasta tres opciones, primeros obstáculos, parejas guiadas y orden de tres piezas.",
  },
  {
    age: "6 años",
    title: "Resolver en dos pasos",
    text: "Hasta cuatro opciones, secuencias, caminos de 5×5 y menos pistas visuales.",
  },
];

export default function NidoPage() {
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (window.location.hash !== "#como-jugar") return undefined;
    let active = true;
    let resizeObserver = null;
    const scrollToHowToPlay = () => {
      if (!active) return;
      document
        .getElementById("como-jugar")
        ?.scrollIntoView({ block: "start", behavior: "auto" });
    };
    const frame = window.requestAnimationFrame(scrollToHowToPlay);
    const retries = [120, 360, 720, 1400, 2400].map((delay) =>
      window.setTimeout(scrollToHowToPlay, delay),
    );
    const stopTracking = () => {
      active = false;
      resizeObserver?.disconnect();
    };
    const stopTimer = window.setTimeout(
      () => resizeObserver?.disconnect(),
      2800,
    );
    window.addEventListener("load", scrollToHowToPlay);
    for (const eventName of ["pointerdown", "touchstart", "wheel", "keydown"]) {
      window.addEventListener(eventName, stopTracking, {
        once: true,
        passive: true,
      });
    }
    if ("ResizeObserver" in window) {
      resizeObserver = new window.ResizeObserver(scrollToHowToPlay);
      const main = document.getElementById("nido-main");
      if (main) resizeObserver.observe(main);
    }
    void document.fonts?.ready?.then(scrollToHowToPlay);
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      retries.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(stopTimer);
      resizeObserver?.disconnect();
      window.removeEventListener("load", scrollToHowToPlay);
      for (const eventName of ["pointerdown", "touchstart", "wheel", "keydown"]) {
        window.removeEventListener(eventName, stopTracking);
      }
    };
  }, []);

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
              <h2 id="nido-steps-title">Cinco formas de aprender jugando</h2>
              <p>
                Cada ruta propone una acción distinta y siempre ofrece una
                alternativa táctil, accesible y guiada por voz.
              </p>
            </header>
            <ol className="nido-steps__grid nido-steps__grid--mechanics">
              {PLAY_MECHANICS.map((mechanic, index) => (
                <li key={mechanic.title}>
                  <span className="nido-steps__mechanic-art" aria-hidden="true">
                    {mechanic.icon}
                  </span>
                  <div className="nido-steps__copy">
                    <span className="nido-steps__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <strong>{mechanic.title}</strong>
                    <p>{mechanic.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="nido-steps__ages" aria-label="Juegos adaptados por edad">
              {AGE_PLAY.map((profile) => (
                <article key={profile.age}>
                  <span>{profile.age}</span>
                  <strong>{profile.title}</strong>
                  <p>{profile.text}</p>
                </article>
              ))}
            </div>
            <div className="nido-steps__cta">
              <NidoMascot pose="think" size={96} aria-hidden="true" />
              <div>
                <strong>La profesora guía cada paso</strong>
                <p>
                  No necesitan saber leer: cada consigna se narra en voz alta,
                  puede repetirse y está escrita con lenguaje amable para niñas
                  y niños.
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
