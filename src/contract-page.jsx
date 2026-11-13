import { useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CaretRight } from "@phosphor-icons/react/CaretRight";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { DownloadSimple } from "@phosphor-icons/react/DownloadSimple";
import { FileText } from "@phosphor-icons/react/FileText";
import { List } from "@phosphor-icons/react/List";
import { MapPin } from "@phosphor-icons/react/MapPin";
import { PencilSimpleLine } from "@phosphor-icons/react/PencilSimpleLine";
import { Printer } from "@phosphor-icons/react/Printer";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import contractTemplate from "./data/contract-template.json";
import { trackInteraction } from "./platform-enhancements.jsx";
import { Breadcrumb } from "./site-core.jsx";
import "./contract-page.css";

/**
 * /contrato: modelo general de contrato (Word editable y PDF). Vive en su
 * propio chunk con su CSS y el JSON del modelo, fuera de la carga de Inicio.
 * Los datos de Tesis20 (prestador, RUC, representante y oficinas) ya vienen
 * completos en data/contract-template.json; el cliente completa los suyos.
 */
// `?v=` cambia con cada edición del modelo: quien ya lo había descargado recibe
// el archivo nuevo en vez de la copia que guardó su navegador (caché de 1 día).
const contractDocxHref = "/downloads/contrato-general-asesoria-academica-tesis20.docx?v=2026-11";
const contractPdfHref = "/downloads/contrato-general-asesoria-academica-tesis20.pdf?v=2026-11";
const contractDocxFilename = "contrato-general-asesoria-academica-tesis20.docx";
const contractPdfFilename = "contrato-general-asesoria-academica-tesis20.pdf";

/** «PRIMERA. OBJETO Y NATURALEZA DEL SERVICIO» → ordinal + nombre legible. */
const clauses = contractTemplate.clauses.map((clause, index) => {
  const [ordinal, ...rest] = clause.title.split(". ");
  const name = rest.join(". ");
  const lower = name.toLocaleLowerCase("es");
  return {
    ...clause,
    id: `clausula-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    ordinal,
    name,
    label: lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1),
  };
});

/** Espacio que se completa a mano: una línea, no una fila de guiones bajos. */
function Blank({ wide = false }) {
  return (
    <span className={`contract-blank${wide ? " contract-blank--wide" : ""}`}>
      <span className="sr-only">(por completar)</span>
    </span>
  );
}

/** Texto de una cláusula: los «____» del modelo se dibujan como líneas. */
function ClauseText({ text }) {
  const parts = text.split(/_{3,}/);
  // El texto del modelo es fijo: el índice identifica cada tramo.
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? <Blank /> : null}
    </span>
  ));
}

function FieldList({ fields, className = "contract-party__fields" }) {
  return (
    <dl className={className}>
      {fields.map((field) => (
        <div key={field.label}>
          <dt>{field.label}</dt>
          <dd>{field.value ? field.value : <Blank wide />}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ContractPage() {
  // En escritorio el índice va abierto junto al documento; en celulares
  // empieza plegado para no alejar el contrato del inicio de la página.
  const [indexOpen, setIndexOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 931px)").matches,
  );

  const handlePrint = () => {
    trackInteraction("contract_print", { location: "contract_page" });
    window.print();
  };

  return (
    <main className="contract-page" id="main-content" tabIndex="-1">
      <section className="contract-hero" aria-labelledby="contract-page-title">
        <div className="contract-hero__inner">
          <div className="contract-hero__copy">
            <Breadcrumb current="Contrato" />
            <h1 id="contract-page-title">Contrato general de asesoría académica</h1>
            <p>
              Conoce por anticipado el alcance, las responsabilidades, los pagos y la
              protección de tu información. Puedes leer el modelo completo aquí o descargarlo
              en Word editable para completar tus datos, o en PDF para revisarlo con calma.
            </p>
            <div className="contract-hero__actions">
              <a
                className="contract-button contract-button--primary"
                href={contractDocxHref}
                download={contractDocxFilename}
                onClick={() => trackInteraction("contract_download", { location: "hero", format: "docx" })}
              >
                <DownloadSimple size={22} weight="bold" aria-hidden="true" />
                <span>Descargar contrato en Word</span>
              </a>
              <a
                className="contract-button contract-button--outline"
                href={contractPdfHref}
                download={contractPdfFilename}
                onClick={() => trackInteraction("contract_download", { location: "hero", format: "pdf" })}
              >
                <FileText size={21} weight="bold" aria-hidden="true" />
                <span>Descargar PDF</span>
              </a>
              <button className="contract-button contract-button--secondary" type="button" onClick={handlePrint}>
                <Printer size={21} weight="bold" aria-hidden="true" />
                <span>Imprimir o guardar</span>
              </button>
            </div>
          </div>

          <aside className="contract-summary" aria-label="Resumen del contrato">
            <span className="contract-summary__icon" aria-hidden="true">
              <FileText size={42} weight="light" />
            </span>
            <p>Modelo general para Perú</p>
            <h2>Word editable, listo para completar</h2>
            <ul>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> 12 cláusulas generales</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Campos para ambas partes</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Datos y RUC de Tesis20 ya completos</li>
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Autoría e integridad académica</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="contract-reader" aria-labelledby="contract-reader-title">
        <div className="contract-reader__inner">
          <div className="contract-aside">
            <aside className="contract-guide">
              <div className="contract-guide__heading">
                <ShieldCheck size={28} weight="light" aria-hidden="true" />
                <h2>Antes de firmar</h2>
              </div>
              <ol>
                <li>Revisa los datos de Tesis20, que ya vienen completos, y completa los tuyos.</li>
                <li>Adjunta la cotización con alcance, entregables, precio y fechas.</li>
                <li>Revisa cada cláusula y conserva una copia firmada.</li>
              </ol>
              <p>{contractTemplate.notice}</p>
              <div className="contract-guide__actions">
                <a
                  className="contract-guide__download contract-guide__download--primary"
                  href={contractDocxHref}
                  download={contractDocxFilename}
                  onClick={() => trackInteraction("contract_download", { location: "reader_guide", format: "docx" })}
                >
                  <DownloadSimple size={19} weight="bold" aria-hidden="true" />
                  Descargar contrato en Word
                </a>
                <a
                  className="contract-guide__download contract-guide__download--outline"
                  href={contractPdfHref}
                  download={contractPdfFilename}
                  onClick={() => trackInteraction("contract_download", { location: "reader_guide", format: "pdf" })}
                >
                  <FileText size={18} weight="bold" aria-hidden="true" />
                  Descargar PDF
                </a>
              </div>
            </aside>

            <nav className="contract-index" aria-label="Índice de cláusulas">
              <details open={indexOpen} onToggle={(event) => setIndexOpen(event.currentTarget.open)}>
                <summary>
                  <List size={20} weight="bold" aria-hidden="true" />
                  <span>Índice de cláusulas</span>
                  <small>{clauses.length}</small>
                  <CaretRight className="contract-index__caret" size={16} weight="bold" aria-hidden="true" />
                </summary>
                <ol>
                  {clauses.map((clause) => (
                    <li key={clause.id}>
                      <a
                        href={`#${clause.id}`}
                        onClick={() => trackInteraction("contract_index", { clause: clause.number })}
                      >
                        <span aria-hidden="true">{clause.number}</span>
                        {clause.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </nav>
          </div>

          <article className="contract-document">
            <header className="contract-document__header">
              <span>Tesis20 · Documento preestablecido</span>
              <h2 id="contract-reader-title">{contractTemplate.title}</h2>
              <p>{contractTemplate.version}</p>
            </header>

            <p className="contract-document__intro">{contractTemplate.intro}</p>

            <section className="contract-parties" aria-labelledby="contract-parties-title">
              <h3 id="contract-parties-title">Datos de las partes</h3>
              <FieldList fields={contractTemplate.meta} className="contract-meta" />
              <div className="contract-parties__grid">
                {contractTemplate.parties.map((party) => {
                  const filled = party.fields.every((field) => field.value);
                  return (
                    <section
                      className={`contract-party${filled ? " contract-party--filled" : ""}`}
                      key={party.role}
                      aria-label={`${party.role}: ${party.status.toLocaleLowerCase("es")}`}
                    >
                      <header>
                        <h4>{party.role}</h4>
                        <span className="contract-party__status">
                          {filled ? (
                            <CheckCircle size={15} weight="fill" aria-hidden="true" />
                          ) : (
                            <PencilSimpleLine size={15} weight="bold" aria-hidden="true" />
                          )}
                          {party.status}
                        </span>
                      </header>
                      <FieldList fields={party.fields} />
                    </section>
                  );
                })}
              </div>
            </section>

            <div className="contract-clauses">
              {clauses.map((clause) => (
                <section className="contract-clause" id={clause.id} key={clause.id}>
                  <h3>
                    <span className="contract-clause__number" aria-hidden="true">{clause.number}</span>
                    <span>
                      <span className="contract-clause__ordinal">{clause.ordinal}.</span> {clause.name}
                    </span>
                  </h3>
                  {clause.paragraphs.map((paragraph) => (
                    <p key={paragraph}>
                      <ClauseText text={paragraph} />
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <section className="contract-signatures" aria-label="Firmas del contrato">
              {contractTemplate.signatures.map((signature) => (
                <div className="contract-signature" key={signature.role}>
                  <h3>{signature.role}</h3>
                  <p className="contract-signature__line">
                    <span>Firma</span>
                  </p>
                  <FieldList fields={signature.fields} className="contract-signature__fields" />
                </div>
              ))}
            </section>

            <section className="contract-offices" aria-labelledby="contract-offices-title">
              <h3 id="contract-offices-title">{contractTemplate.offices.title}</h3>
              <ul>
                {contractTemplate.offices.items.map((office) => (
                  <li key={office.city}>
                    <MapPin size={20} weight="duotone" aria-hidden="true" />
                    <span>
                      <strong>{office.city}</strong>
                      {office.address}
                    </span>
                  </li>
                ))}
              </ul>
              <p>{contractTemplate.offices.note}</p>
            </section>

            <section className="contract-sources" aria-labelledby="contract-sources-title">
              <h3 id="contract-sources-title">Marco legal referencial</h3>
              <p>
                Estas fuentes oficiales sirven como referencia general para el modelo. La
                aplicación concreta depende de los datos y del servicio acordado.
              </p>
              <ul>
                {contractTemplate.legalSources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      aria-label={`${source.label} (se abre en una pestaña nueva)`}
                    >
                      <span>{source.label}</span>
                      <ArrowSquareOut size={15} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <p className="contract-document__notice">
              <strong>Importante:</strong> {contractTemplate.notice}
            </p>
          </article>
        </div>
      </section>

      <section className="contract-download" aria-labelledby="contract-download-title">
        <div>
          <FileText size={42} weight="light" aria-hidden="true" />
          <p>¿Listo para revisarlo fuera de la web?</p>
          <h2 id="contract-download-title">Descarga el modelo completo en Word editable</h2>
          <div className="contract-download__actions">
            <a
              className="contract-download__primary"
              href={contractDocxHref}
              download={contractDocxFilename}
              onClick={() => trackInteraction("contract_download", { location: "bottom_cta", format: "docx" })}
            >
              <DownloadSimple size={21} weight="bold" aria-hidden="true" />
              Descargar contrato en Word
            </a>
            <a
              className="contract-download__outline"
              href={contractPdfHref}
              download={contractPdfFilename}
              onClick={() => trackInteraction("contract_download", { location: "bottom_cta", format: "pdf" })}
            >
              <FileText size={20} weight="bold" aria-hidden="true" />
              Descargar PDF
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
