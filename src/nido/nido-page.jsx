import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { Baby } from "@phosphor-icons/react/Baby";
import { BookOpen } from "@phosphor-icons/react/BookOpen";
import { CalendarBlank } from "@phosphor-icons/react/CalendarBlank";
import { ChalkboardTeacher } from "@phosphor-icons/react/ChalkboardTeacher";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Clock } from "@phosphor-icons/react/Clock";
import { Flask } from "@phosphor-icons/react/Flask";
import { Heart } from "@phosphor-icons/react/Heart";
import { IdentificationCard } from "@phosphor-icons/react/IdentificationCard";
import { Lock } from "@phosphor-icons/react/Lock";
import { MusicNotes } from "@phosphor-icons/react/MusicNotes";
import { PaintBrush } from "@phosphor-icons/react/PaintBrush";
import { PersonSimpleRun } from "@phosphor-icons/react/PersonSimpleRun";
import { PuzzlePiece } from "@phosphor-icons/react/PuzzlePiece";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { SignOut } from "@phosphor-icons/react/SignOut";
import { Sparkle } from "@phosphor-icons/react/Sparkle";
import { Star } from "@phosphor-icons/react/Star";
import { Student } from "@phosphor-icons/react/Student";
import { Sun } from "@phosphor-icons/react/Sun";
import { Trash } from "@phosphor-icons/react/Trash";
import { UsersThree } from "@phosphor-icons/react/UsersThree";
import { X } from "@phosphor-icons/react/X";
import { PlatformSwitcher } from "../platform-switcher.jsx";
import { NIDO_CLASSES, NIDO_FILTERS, NIDO_ROLES } from "./nido-data.js";
import "./nido-styles.css";

const SESSION_KEY = "tesis20.nido.demo-session";

const emptyFilters = {
  age: "",
  course: "",
  teacher: "",
  schedule: "",
};

const classIcons = {
  book: BookOpen,
  paint: PaintBrush,
  movement: PersonSimpleRun,
  science: Flask,
  music: MusicNotes,
  heart: Heart,
};

const roleIcons = {
  administrador: ShieldCheck,
  docente: ChalkboardTeacher,
  alumno: Student,
};

function getStoredSession() {
  if (typeof window === "undefined") return null;

  try {
    const storedSession = JSON.parse(window.sessionStorage.getItem(SESSION_KEY));
    const validRole = NIDO_ROLES.some((role) => role.id === storedSession?.role);
    if (!validRole) return null;
    return { role: storedSession.role };
  } catch {
    return null;
  }
}

function NidoIllustration() {
  return (
    <div className="nido-illustration" aria-hidden="true">
      <span className="nido-illustration__sun">
        <Sun size={28} weight="fill" />
      </span>
      <span className="nido-illustration__spark nido-illustration__spark--one">
        <Sparkle size={24} weight="fill" />
      </span>
      <span className="nido-illustration__spark nido-illustration__spark--two">
        <Star size={20} weight="fill" />
      </span>
      <div className="nido-illustration__cloud nido-illustration__cloud--one" />
      <div className="nido-illustration__cloud nido-illustration__cloud--two" />
      <div className="nido-illustration__board">
        <span className="nido-illustration__board-label">Hoy descubrimos</span>
        <div className="nido-illustration__board-icons">
          <span><BookOpen size={38} weight="duotone" /></span>
          <span><PuzzlePiece size={40} weight="duotone" /></span>
          <span><MusicNotes size={36} weight="duotone" /></span>
        </div>
      </div>
      <div className="nido-illustration__child nido-illustration__child--one">
        <span className="nido-illustration__head"><Baby size={46} weight="duotone" /></span>
        <span className="nido-illustration__body" />
      </div>
      <div className="nido-illustration__child nido-illustration__child--two">
        <span className="nido-illustration__head"><Baby size={46} weight="duotone" /></span>
        <span className="nido-illustration__body" />
      </div>
      <div className="nido-illustration__table">
        <span className="nido-illustration__paper" />
        <span className="nido-illustration__pencil" />
      </div>
    </div>
  );
}

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <label className="nido-filter" htmlFor={`nido-filter-${id}`}>
      <span>{label}</span>
      <select
        id={`nido-filter-${id}`}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ClassCard({ classItem, session, onOpenClass }) {
  const Icon = classIcons[classItem.icon] || BookOpen;

  return (
    <article className={`nido-class-card nido-class-card--${classItem.theme}`}>
      <div className="nido-class-card__cover">
        <span className="nido-class-card__eyebrow">Clase virtual</span>
        <span className="nido-class-card__icon" aria-hidden="true">
          <Icon size={54} weight="duotone" />
        </span>
        <span className="nido-class-card__age">{classItem.age}</span>
      </div>
      <div className="nido-class-card__body">
        <span className="nido-class-card__course">{classItem.course}</span>
        <h3>{classItem.title}</h3>
        <p>{classItem.summary}</p>
        <dl className="nido-class-card__details">
          <div>
            <dt><CalendarBlank size={18} aria-hidden="true" /> Horario</dt>
            <dd>{classItem.scheduleLabel}</dd>
          </div>
          <div>
            <dt><Clock size={18} aria-hidden="true" /> Duración</dt>
            <dd>{classItem.duration}</dd>
          </div>
          <div>
            <dt><ChalkboardTeacher size={18} aria-hidden="true" /> Docente</dt>
            <dd>{classItem.teacher}</dd>
          </div>
          <div>
            <dt><UsersThree size={18} aria-hidden="true" /> Cupos</dt>
            <dd>{classItem.seats} disponibles</dd>
          </div>
        </dl>
        <div className="nido-class-card__footer">
          {session ? (
            <p className="nido-class-card__price">
              <span>S/ {classItem.price}</span>
              <small>Precio referencial demo</small>
            </p>
          ) : (
            <p className="nido-class-card__locked">
              <Lock size={19} weight="fill" aria-hidden="true" />
              <span>Precio disponible al iniciar sesión</span>
            </p>
          )}
          <button type="button" onClick={() => onOpenClass(classItem)}>
            Ver clase
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function RoleWorkspace({ session, onExplore }) {
  const role = NIDO_ROLES.find((roleItem) => roleItem.id === session.role);
  const Icon = roleIcons[role.id];

  return (
    <section className="nido-workspace" id="mi-espacio" aria-labelledby="nido-workspace-title">
      <div className="nido-shell nido-workspace__inner">
        <div className="nido-workspace__heading">
          <span className="nido-workspace__icon" aria-hidden="true">
            <Icon size={34} weight="duotone" />
          </span>
          <div>
            <span className="nido-kicker">Mi espacio · {role.name}</span>
            <h2 id="nido-workspace-title">{role.workspaceTitle}</h2>
            <p>{role.workspaceDescription}</p>
          </div>
          <span className="nido-demo-badge">Demostración local</span>
        </div>
        <div className="nido-workspace__metrics" aria-label={`Resumen para ${role.name}`}>
          {role.metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
        <div className="nido-workspace__notice">
          <ShieldCheck size={22} weight="duotone" aria-hidden="true" />
          <p>
            Este contenido es ilustrativo. El acceso real requerirá autenticación y
            permisos seguros asignados desde el servidor.
          </p>
          <button type="button" onClick={onExplore}>Explorar clases</button>
        </div>
      </div>
    </section>
  );
}

function LoginDialog({
  open,
  onClose,
  onLogin,
  selectedRole,
  setSelectedRole,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusableElements = [
        ...dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (!focusableElements.length) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  const role = NIDO_ROLES.find((roleItem) => roleItem.id === selectedRole);

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ role: selectedRole });
  };

  return (
    <div
      className="nido-login"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="nido-login__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nido-login-title"
        aria-describedby="nido-login-description"
        ref={dialogRef}
      >
        <header className="nido-login__header">
          <div>
            <span className="nido-kicker">Acceso por perfil</span>
            <h2 id="nido-login-title">Ingresa a Tesis20 Nido</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar inicio de sesión"
            onClick={onClose}
            ref={closeButtonRef}
          >
            <X size={23} weight="bold" aria-hidden="true" />
          </button>
        </header>
        <p id="nido-login-description">
          Selecciona el perfil que deseas explorar en esta vista local.
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset className="nido-login__roles">
            <legend>Tipo de acceso</legend>
            {NIDO_ROLES.map((roleItem) => {
              const Icon = roleIcons[roleItem.id];
              return (
                <label
                  className={selectedRole === roleItem.id ? "is-selected" : ""}
                  key={roleItem.id}
                >
                  <input
                    type="radio"
                    name="nido-role"
                    value={roleItem.id}
                    checked={selectedRole === roleItem.id}
                    onChange={() => setSelectedRole(roleItem.id)}
                  />
                  <span className="nido-login__role-icon" aria-hidden="true">
                    <Icon size={25} weight="duotone" />
                  </span>
                  <span>
                    <strong>{roleItem.name}</strong>
                    <small>{roleItem.description}</small>
                  </span>
                  <CheckCircle
                    className="nido-login__role-check"
                    size={20}
                    weight="fill"
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </fieldset>

          <button className="nido-login__submit" type="submit">
            Entrar a la demo como {role?.name}
            <ArrowRight size={19} weight="bold" aria-hidden="true" />
          </button>
        </form>

        <div className="nido-login__demo-note">
          <IdentificationCard size={22} weight="duotone" aria-hidden="true" />
          <p>
            <strong>Vista de demostración local.</strong> No solicita credenciales,
            no crea una cuenta ni concede permisos reales.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function NidoPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [session, setSession] = useState(getStoredSession);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("alumno");
  const [statusMessage, setStatusMessage] = useState("");
  const catalogRef = useRef(null);

  const filteredClasses = useMemo(
    () =>
      NIDO_CLASSES.filter(
        (classItem) =>
          (!filters.age || classItem.age === filters.age) &&
          (!filters.course || classItem.course === filters.course) &&
          (!filters.teacher || classItem.teacher === filters.teacher) &&
          (!filters.schedule || classItem.schedule === filters.schedule),
      ),
    [filters],
  );

  const sessionRole = NIDO_ROLES.find((role) => role.id === session?.role);

  const scrollToElement = (element) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const scrollToCatalog = () => {
    scrollToElement(catalogRef.current);
  };

  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const openLogin = (role = selectedRole) => {
    setSelectedRole(role);
    setLoginOpen(true);
  };

  const handleLogin = (nextSession) => {
    const safeSession = { role: nextSession.role };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
    setSession(safeSession);
    setLoginOpen(false);
    const role = NIDO_ROLES.find((roleItem) => roleItem.id === safeSession.role);
    setStatusMessage(
      `Vista de demostración iniciada como ${role?.name}. Los precios referenciales ya están visibles.`,
    );
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setStatusMessage(
      "Sesión de demostración cerrada. Los precios vuelven a estar protegidos.",
    );
  };

  const handleOpenClass = (classItem) => {
    if (!session) {
      setStatusMessage(
        `Inicia sesión para conocer el precio referencial de ${classItem.title}.`,
      );
      openLogin("alumno");
      return;
    }

    setStatusMessage(
      `${classItem.title} está seleccionada en esta demostración. No se ha realizado ninguna reserva ni pago.`,
    );
    scrollToElement(document.getElementById("mi-espacio"));
  };

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
            <a href="#nido-inicio">Inicio</a>
            <a href="#clases">Clases</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          {session ? (
            <div className="nido-header__session">
              <a href="#mi-espacio">
                <span>Mi espacio</span>
                <strong>{sessionRole?.name}</strong>
              </a>
              <button type="button" onClick={handleLogout}>
                <SignOut size={19} weight="bold" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <button
              className="nido-header__login"
              id="iniciar-sesion"
              type="button"
              aria-label="Iniciar sesión"
              onClick={() => openLogin()}
            >
              <Lock size={18} weight="fill" aria-hidden="true" />
              Iniciar sesión
            </button>
          )}
        </div>
      </header>

      <main id="nido-main">
        <section className="nido-hero" id="nido-inicio" aria-labelledby="nido-hero-title">
          <div className="nido-shell nido-hero__inner">
            <div className="nido-hero__copy">
              <span className="nido-kicker">Aprendizaje temprano · clases virtuales</span>
              <h1 id="nido-hero-title">Aprender jugando, crecer con confianza</h1>
              <p>
                Experiencias en vivo, cercanas y creativas para acompañar cada etapa
                con docentes que convierten la curiosidad en aprendizaje.
              </p>
              <div className="nido-hero__actions">
                <button type="button" onClick={scrollToCatalog}>
                  Explorar clases
                  <ArrowRight size={20} weight="bold" aria-hidden="true" />
                </button>
                {!session ? (
                  <button type="button" onClick={() => openLogin("alumno")}>
                    Conocer mi acceso
                  </button>
                ) : (
                  <a href="#mi-espacio">Ir a mi espacio</a>
                )}
              </div>
              <ul className="nido-hero__benefits" aria-label="Beneficios de Tesis20 Nido">
                <li><CheckCircle weight="fill" aria-hidden="true" /> Grupos pequeños</li>
                <li><CheckCircle weight="fill" aria-hidden="true" /> Docentes cercanos</li>
                <li><CheckCircle weight="fill" aria-hidden="true" /> Aprendizaje activo</li>
              </ul>
            </div>
            <NidoIllustration />
          </div>
        </section>

        {session ? <RoleWorkspace session={session} onExplore={scrollToCatalog} /> : null}

        <section className="nido-catalog" id="clases" ref={catalogRef} aria-labelledby="nido-catalog-title">
          <div className="nido-shell">
            <header className="nido-section-heading">
              <div>
                <span className="nido-kicker">Elige a su ritmo</span>
                <h2 id="nido-catalog-title">Clases para descubrir y crear</h2>
              </div>
              <p>
                Filtra la propuesta por etapa, interés, docente u horario. Todo el
                catálogo es demostrativo.
              </p>
            </header>

            <div className="nido-filters" aria-label="Filtros de clases">
              <FilterSelect
                id="age"
                label="Edad"
                value={filters.age}
                options={NIDO_FILTERS.age}
                onChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
              />
              <FilterSelect
                id="course"
                label="Curso"
                value={filters.course}
                options={NIDO_FILTERS.course}
                onChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
              />
              <FilterSelect
                id="teacher"
                label="Docente"
                value={filters.teacher}
                options={NIDO_FILTERS.teacher}
                onChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
              />
              <FilterSelect
                id="schedule"
                label="Horario"
                value={filters.schedule}
                options={NIDO_FILTERS.schedule}
                onChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
              />
              <button
                className="nido-filters__clear"
                type="button"
                onClick={() => setFilters(emptyFilters)}
                disabled={Object.values(filters).every((filter) => !filter)}
              >
                <Trash size={18} aria-hidden="true" />
                Limpiar filtros
              </button>
            </div>

            <p className="nido-catalog__count" role="status" aria-live="polite">
              {filteredClasses.length} {filteredClasses.length === 1 ? "clase encontrada" : "clases encontradas"}
            </p>

            {filteredClasses.length ? (
              <div className="nido-class-grid">
                {filteredClasses.map((classItem) => (
                  <ClassCard
                    classItem={classItem}
                    session={session}
                    onOpenClass={handleOpenClass}
                    key={classItem.id}
                  />
                ))}
              </div>
            ) : (
              <div className="nido-empty">
                <PuzzlePiece size={40} weight="duotone" aria-hidden="true" />
                <h3>Aún no hay una clase con esos filtros</h3>
                <p>Prueba otra combinación para seguir explorando.</p>
                <button type="button" onClick={() => setFilters(emptyFilters)}>
                  Mostrar todas las clases
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="nido-how" id="como-funciona" aria-labelledby="nido-how-title">
          <div className="nido-shell">
            <header className="nido-section-heading nido-section-heading--centered">
              <span className="nido-kicker">Una ruta simple</span>
              <h2 id="nido-how-title">Así acompañamos su aprendizaje</h2>
              <p>Una experiencia clara para la familia, el alumno y el docente.</p>
            </header>
            <ol className="nido-how__steps">
              <li>
                <span>01</span>
                <div>
                  <strong>Encuentra su clase</strong>
                  <p>Filtra por edad, interés, docente y horario.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Conoce la dinámica</strong>
                  <p>Revisa el enfoque, la duración y los cupos de la sesión.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Aprende acompañado</strong>
                  <p>Ingresa con el perfil asignado y encuentra tus materiales.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="nido-faq" id="preguntas" aria-labelledby="nido-faq-title">
          <div className="nido-shell nido-faq__inner">
            <header>
              <span className="nido-kicker">Respuestas claras</span>
              <h2 id="nido-faq-title">Preguntas frecuentes</h2>
              <p>
                Esta primera versión permite conocer la experiencia antes de integrar
                el acceso institucional.
              </p>
            </header>
            <div>
              <details>
                <summary>¿Los precios son definitivos?</summary>
                <p>
                  No. Los importes visibles después de iniciar la demostración son
                  referenciales y no permiten reservar ni pagar.
                </p>
              </details>
              <details>
                <summary>¿Este inicio de sesión ya es real?</summary>
                <p>
                  No. Es una vista local de producto. La versión final requerirá
                  autenticación segura y roles asignados desde el servidor.
                </p>
              </details>
              <details>
                <summary>¿Qué perfiles tendrá la plataforma?</summary>
                <p>
                  Administrador, Docente y Alumno, cada uno con una experiencia y
                  permisos propios.
                </p>
              </details>
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

      <LoginDialog
        open={loginOpen}
        onClose={closeLogin}
        onLogin={handleLogin}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />
    </div>
  );
}
