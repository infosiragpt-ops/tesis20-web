import { useCallback, useEffect, useRef, useState } from "react";
import { Baby } from "@phosphor-icons/react/Baby";
import { BookOpen } from "@phosphor-icons/react/BookOpen";
import { Books } from "@phosphor-icons/react/Books";
import { Buildings } from "@phosphor-icons/react/Buildings";
import { CaretDown } from "@phosphor-icons/react/CaretDown";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { X } from "@phosphor-icons/react/X";
import { trackInteraction } from "./platform-enhancements.jsx";

const platforms = [
  {
    id: "tesis",
    name: "Tesis",
    description: "Investigación, titulación y posgrado",
    href: "/#inicio",
    Icon: GraduationCap,
    available: true,
  },
  {
    id: "nido",
    name: "Nido",
    description: "Aprendizaje y estimulación temprana",
    href: "/nido",
    Icon: Baby,
    available: true,
  },
  {
    id: "escuela",
    name: "Escuela",
    description: "Educación primaria y acompañamiento escolar",
    Icon: BookOpen,
  },
  {
    id: "colegio",
    name: "Colegio",
    description: "Secundaria y preparación académica",
    Icon: Books,
  },
  {
    id: "universidad",
    name: "Universidad",
    description: "Formación superior y desarrollo profesional",
    Icon: Buildings,
  },
];

export function PlatformSwitcher({
  menuOpen = false,
  onCloseMenu = () => {},
  currentPlatform = "tesis",
}) {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const switcherRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const activePlatform =
    platforms.find((platform) => platform.id === currentPlatform) || platforms[0];

  const closeSwitcher = useCallback((restoreFocus = false) => {
    setOpen(false);
    setAnnouncement("");
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (menuOpen && open) closeSwitcher(false);
  }, [closeSwitcher, menuOpen, open]);

  useEffect(() => {
    if (!open) return undefined;

    const mobileQuery = window.matchMedia("(max-width: 930px)");
    const previousOverflow = document.body.style.overflow;
    const handlePointerDown = (event) => {
      if (!switcherRef.current?.contains(event.target)) closeSwitcher(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSwitcher(true);
        return;
      }

      if (event.key !== "Tab" || !mobileQuery.matches || !panelRef.current) return;
      const focusable = [
        triggerRef.current,
        ...panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter(Boolean);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    if (mobileQuery.matches) {
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(() => {
        panelRef.current?.querySelector("a[href], button:not([disabled])")?.focus();
      });
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSwitcher, open]);

  const toggleSwitcher = () => {
    const nextOpen = !open;
    if (nextOpen && menuOpen) onCloseMenu();
    setOpen(nextOpen);
    setAnnouncement("");
    trackInteraction("ecosystem_switcher_toggle", {
      state: nextOpen ? "open" : "closed",
      location: "header",
    });
  };

  const handleUpcomingPlatform = (platform) => {
    setAnnouncement(
      `Estamos preparando ${platform.name}. Por ahora permaneces en ${activePlatform.name}, tu plataforma activa de Tesis20.com.`,
    );
    trackInteraction("ecosystem_platform_interest", {
      platform: platform.id,
      location: "header",
    });
  };

  return (
    <div
      className={`platform-switcher ${open ? "platform-switcher--open" : ""}`}
      ref={switcherRef}
    >
      <button
        className="platform-switcher__trigger"
        type="button"
        aria-label={`Abrir plataformas de Tesis20.com. Plataforma actual: ${activePlatform.name}`}
        aria-expanded={open}
        aria-controls="platform-switcher-panel"
        onClick={toggleSwitcher}
        ref={triggerRef}
      >
        <CaretDown
          className="platform-switcher__arrow"
          size={30}
          weight="bold"
          aria-hidden="true"
        />
      </button>

      <button
        className={`platform-switcher__backdrop ${open ? "platform-switcher__backdrop--visible" : ""}`}
        type="button"
        aria-label="Cerrar selector de plataformas"
        aria-hidden={!open}
        tabIndex="-1"
        onClick={() => closeSwitcher(true)}
      />

      <section
        className="platform-switcher__panel"
        id="platform-switcher-panel"
        role="dialog"
        aria-labelledby="platform-switcher-title"
        aria-describedby="platform-switcher-description"
        aria-hidden={!open}
        inert={!open ? true : undefined}
        ref={panelRef}
      >
        <header className="platform-switcher__panel-header">
          <div>
            <span>Ecosistema Tesis20.com</span>
            <h2 id="platform-switcher-title">Aprende en cada etapa</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar selector de plataformas"
            onClick={() => closeSwitcher(true)}
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <p id="platform-switcher-description" className="platform-switcher__description">
          Elige la plataforma que corresponde a tu camino educativo.
        </p>

        <nav className="platform-switcher__options" aria-label="Plataformas de Tesis20.com">
          {platforms.map(({ Icon, ...platform }) => {
            const isCurrent = platform.id === activePlatform.id;

            return platform.available ? (
              <a
                className={`platform-option platform-option--available ${
                  isCurrent ? "platform-option--current" : ""
                }`}
                href={platform.href}
                aria-current={isCurrent ? "page" : undefined}
                key={platform.id}
                onClick={() => {
                  closeSwitcher(false);
                  trackInteraction("ecosystem_platform_select", {
                    platform: platform.id,
                    location: "header",
                  });
                }}
              >
                <span className="platform-option__icon" aria-hidden="true">
                  <Icon size={23} weight="duotone" />
                </span>
                <span className="platform-option__copy">
                  <strong>{platform.name}</strong>
                  <small>{platform.description}</small>
                </span>
                <span className="platform-option__status">
                  {isCurrent ? (
                    <CheckCircle size={16} weight="fill" aria-hidden="true" />
                  ) : null}
                  {isCurrent ? "Estás aquí" : "Ir a plataforma"}
                </span>
              </a>
            ) : (
              <button
                className="platform-option platform-option--upcoming"
                type="button"
                key={platform.id}
                onClick={() => handleUpcomingPlatform(platform)}
              >
                <span className="platform-option__icon" aria-hidden="true">
                  <Icon size={23} weight="duotone" />
                </span>
                <span className="platform-option__copy">
                  <strong>{platform.name}</strong>
                  <small>{platform.description}</small>
                </span>
                <span className="platform-option__status">Próximamente</span>
              </button>
            );
          })}
        </nav>

        <p
          className={`platform-switcher__announcement ${announcement ? "platform-switcher__announcement--visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {announcement}
        </p>

        <footer>
          Cada plataforma tendrá identidad, contenidos y aula virtual propios, unidos por
          Tesis20.com.
        </footer>
      </section>
    </div>
  );
}
