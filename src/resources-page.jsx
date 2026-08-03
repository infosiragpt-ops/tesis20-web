import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { DownloadSimple } from "@phosphor-icons/react/DownloadSimple";
import { FileText } from "@phosphor-icons/react/FileText";
import {
  ACADEMIC_RESOURCE_DOCUMENT_COUNT,
  ACADEMIC_RESOURCES,
} from "./data/academic-resources.js";
import { trackInteraction } from "./platform-enhancements.jsx";

export default function ResourcesPage() {
  return (
    <main className="resources-page" id="main-content" tabIndex="-1">
      <section className="resources-hero" aria-labelledby="resources-page-title">
        <div className="resources-shell resources-hero__inner">
          <div className="resources-hero__copy">
            <p>Biblioteca académica</p>
            <h1 id="resources-page-title">Recursos por universidad</h1>
            <span>
              Consulta líneas de investigación, reglamentos, formatos y guías organizados
              por institución para ubicar rápidamente el documento que necesitas.
            </span>
            <a href="#documentos-disponibles">
              Explorar documentos
              <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section
        className="resources-library"
        id="documentos-disponibles"
        aria-labelledby="resources-library-title"
      >
        <div className="resources-shell">
          <header className="resources-library__heading">
            <div>
              <p>Fuentes organizadas</p>
              <h2 id="resources-library-title">Documentos disponibles</h2>
            </div>
            <span>
              {ACADEMIC_RESOURCE_DOCUMENT_COUNT}{" "}
              {ACADEMIC_RESOURCE_DOCUMENT_COUNT === 1 ? "resultado" : "resultados"}
            </span>
          </header>

          <div className="resources-university-list">
            {ACADEMIC_RESOURCES.map((institution) => (
              <article className="resources-university" key={institution.id}>
                <header className="resources-university__header">
                  <span aria-hidden="true">{institution.shortName}</span>
                  <div>
                    <p>Institución</p>
                    <h2>{institution.name}</h2>
                    <small>{institution.description}</small>
                  </div>
                  <a
                    href={institution.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    aria-label={`Visitar el sitio de ${institution.name} (se abre en una pestaña nueva)`}
                  >
                    Sitio institucional
                    <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
                  </a>
                </header>

                <div className="resources-document-list">
                  {institution.documents.map((document) => (
                    <section className="resources-document" key={document.id}>
                      <span className="resources-document__icon" aria-hidden="true">
                        <FileText size={30} weight="duotone" />
                      </span>
                      <div className="resources-document__content">
                        <p>{document.category}</p>
                        <h3>{document.title}</h3>
                        <span>{document.description}</span>
                        <div className="resources-document__meta">
                          <span>{document.format}</span>
                          <span>{document.pages} {document.pages === 1 ? "página" : "páginas"}</span>
                        </div>
                        <div className="resources-document__programs">
                          <strong>Programas incluidos</strong>
                          <ul>
                            {document.programs.map((program) => (
                              <li key={program}>
                                <CheckCircle size={15} weight="fill" aria-hidden="true" />
                                {program}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="resources-document__actions">
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${document.title} de ${institution.name} (se abre en una pestaña nueva)`}
                          onClick={() =>
                            trackInteraction("resource_document_open", {
                              institution: institution.id,
                              document: document.id,
                            })
                          }
                        >
                          Abrir PDF
                          <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
                        </a>
                        <a
                          href={document.href}
                          download={document.fileName}
                          onClick={() =>
                            trackInteraction("resource_document_download", {
                              institution: institution.id,
                              document: document.id,
                            })
                          }
                        >
                          Descargar
                          <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                        </a>
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="resources-validity-note">
            <CheckCircle size={26} weight="duotone" aria-hidden="true" />
            <div>
              <h2>Verifica siempre la versión vigente</h2>
              <p>
                Los documentos se publican como referencia académica y pertenecen a sus
                instituciones de origen. Antes de usarlos, confirma en la universidad si existe
                una edición más reciente o una norma específica para tu programa.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="resources-next" aria-labelledby="resources-next-title">
        <div className="resources-shell">
          <p>Próximas incorporaciones</p>
          <h2 id="resources-next-title">UPN, UCV, UTP y más universidades</h2>
          <span>
            La biblioteca crecerá a medida que se incorporen documentos verificados de cada
            institución: líneas de investigación, reglamentos, plantillas y guías de titulación.
          </span>
        </div>
      </section>
    </main>
  );
}
