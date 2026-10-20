import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { DownloadSimple } from "@phosphor-icons/react/DownloadSimple";
import { FileText } from "@phosphor-icons/react/FileText";
import { Printer } from "@phosphor-icons/react/Printer";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import contractTemplate from "./data/contract-template.json";
import { trackInteraction } from "./platform-enhancements.jsx";
import { Breadcrumb } from "./site-core.jsx";
import "./contract-page.css";

/**
 * /contrato: modelo general de contrato (Word editable y PDF). Vive en su
 * propio chunk con su CSS y el JSON del modelo, fuera de la carga de Inicio.
 */
const contractDocxHref = "/downloads/contrato-general-asesoria-academica-tesis20.docx";
const contractPdfHref = "/downloads/contrato-general-asesoria-academica-tesis20.pdf";
const contractDocxFilename = "contrato-general-asesoria-academica-tesis20.docx";
const contractPdfFilename = "contrato-general-asesoria-academica-tesis20.pdf";

export function ContractPage() {
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
              <li><CheckCircle size={18} weight="fill" aria-hidden="true" /> Autoría e integridad académica</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="contract-reader" aria-labelledby="contract-reader-title">
        <div className="contract-reader__inner">
          <aside className="contract-guide">
            <div className="contract-guide__heading">
              <ShieldCheck size={28} weight="light" aria-hidden="true" />
              <h2>Antes de firmar</h2>
            </div>
            <ol>
              <li>Completa los datos del prestador y del cliente.</li>
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

          <article className="contract-document">
            <header className="contract-document__header">
              <span>Tesis20 · Documento preestablecido</span>
              <h2 id="contract-reader-title">{contractTemplate.title}</h2>
              <p>{contractTemplate.version}</p>
            </header>

            <p className="contract-document__intro">{contractTemplate.intro}</p>

            <div className="contract-fields" aria-label="Datos que deben completar las partes">
              {contractTemplate.fields.map((field) => (
                <p key={field}>{field}</p>
              ))}
            </div>

            <div className="contract-clauses">
              {contractTemplate.clauses.map((clause) => (
                <section className="contract-clause" key={clause.title}>
                  <h3>{clause.title}</h3>
                  {clause.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <div className="contract-signatures" aria-label="Firmas del contrato">
              {contractTemplate.signatures.map((signature) => (
                <div key={signature}>
                  {signature.split("\n").map((line) => <p key={line}>{line}</p>)}
                </div>
              ))}
            </div>

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
