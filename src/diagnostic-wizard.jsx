import { useMemo, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { WhatsappLogo } from "@phosphor-icons/react/WhatsappLogo";
import { trackInteraction } from "./platform-enhancements.jsx";

const WHATSAPP_PHONE = "51918714054";

const STEPS = [
  {
    key: "work",
    legend: "¿Qué trabajo estás desarrollando?",
    options: [
      { value: "proyecto", label: "Proyecto de tesis" },
      { value: "tesis", label: "Tesis de titulación" },
      { value: "suficiencia", label: "Suficiencia profesional" },
      { value: "articulo", label: "Artículo científico" },
    ],
  },
  {
    key: "stage",
    legend: "¿En qué etapa te encuentras?",
    options: [
      { value: "inicio", label: "Estoy comenzando" },
      { value: "desarrollo", label: "Ya tengo avances" },
      { value: "resultados", label: "Estoy trabajando datos y resultados" },
      { value: "sustentacion", label: "Me preparo para sustentar" },
    ],
  },
  {
    key: "deadline",
    legend: "¿Cuándo necesitas avanzar?",
    options: [
      { value: "urgente", label: "Durante las próximas 2 semanas" },
      { value: "mes", label: "Dentro de 1 mes" },
      { value: "trimestre", label: "En los próximos 3 meses" },
      { value: "planificar", label: "Quiero planificar sin una fecha fija" },
    ],
  },
];

const RECOMMENDATIONS = {
  articulo: { title: "Artículo científico", service: "articulo-cientifico" },
  proyecto: { title: "Tesis I – Proyecto", service: "tesis-i-proyecto" },
  tesis: { title: "Tesis II – De titulación", service: "tesis-ii-titulacion" },
  suficiencia: { title: "Suficiencia profesional", service: "suficiencia-profesional" },
  resultados: { title: "IBM SPSS Statistics", service: "ibm-spss-statistics" },
  sustentacion: { title: "Simulación de sustentación", service: "simulacion-sustentacion" },
};

function optionLabel(stepKey, value) {
  return STEPS.find((step) => step.key === stepKey)?.options.find((option) => option.value === value)?.label || value;
}

export function DiagnosticWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const step = STEPS[stepIndex];
  const selectedValue = answers[step?.key];

  const recommendation = useMemo(() => {
    if (answers.stage === "sustentacion") return RECOMMENDATIONS.sustentacion;
    if (answers.stage === "resultados") return RECOMMENDATIONS.resultados;
    return RECOMMENDATIONS[answers.work] || RECOMMENDATIONS.proyecto;
  }, [answers]);

  const selectOption = (value) => {
    setAnswers((current) => ({ ...current, [step.key]: value }));
    trackInteraction("diagnostic_answer", {
      category: step.key,
      type: value,
      position: stepIndex + 1,
    });
  };

  const continueWizard = () => {
    if (!selectedValue) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
      trackInteraction("diagnostic_step", { position: stepIndex + 2, total: STEPS.length });
      return;
    }

    setCompleted(true);
    trackInteraction("diagnostic_completed", { service: recommendation.service });
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
    setCompleted(false);
    trackInteraction("diagnostic_restart", { location: "diagnostic" });
  };

  const whatsappMessage = completed
    ? [
        "¡Hola! Completé el diagnóstico de Tesis20.",
        `Trabajo: ${optionLabel("work", answers.work)}.`,
        `Etapa: ${optionLabel("stage", answers.stage)}.`,
        `Plazo: ${optionLabel("deadline", answers.deadline)}.`,
        `Recomendación inicial: ${recommendation.title}.`,
        "Deseo recibir orientación para confirmar el alcance.",
      ].join(" ")
    : "¡Hola! Deseo orientación para elegir el servicio adecuado para mi investigación.";

  return (
    <section className="diagnostic-section" id="diagnostico" aria-labelledby="diagnostic-title">
      <div className="diagnostic-section__inner">
        <div className="diagnostic-section__intro">
          <p>Diagnóstico inicial · menos de 1 minuto</p>
          <h2 id="diagnostic-title">Encuentra una ruta para tu investigación</h2>
          <span>
            Responde tres preguntas generales. No solicitamos nombres, documentos ni información académica sensible.
          </span>
        </div>

        <div className="diagnostic-card" aria-live="polite">
          {!completed ? (
            <>
              <div className="diagnostic-progress" aria-label={`Paso ${stepIndex + 1} de ${STEPS.length}`}>
                <span style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
              </div>
              <p className="diagnostic-card__step">Paso {stepIndex + 1} de {STEPS.length}</p>
              <fieldset>
                <legend>{step.legend}</legend>
                <div className="diagnostic-options">
                  {step.options.map((option) => (
                    <label key={option.value} className={selectedValue === option.value ? "diagnostic-option diagnostic-option--selected" : "diagnostic-option"}>
                      <input
                        type="radio"
                        name={step.key}
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={() => selectOption(option.value)}
                      />
                      <span>{option.label}</span>
                      <CheckCircle size={22} weight={selectedValue === option.value ? "fill" : "regular"} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="diagnostic-actions">
                <button type="button" className="diagnostic-button diagnostic-button--secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
                  <ArrowLeft size={18} aria-hidden="true" /> Anterior
                </button>
                <button type="button" className="diagnostic-button" disabled={!selectedValue} onClick={continueWizard}>
                  {stepIndex === STEPS.length - 1 ? "Ver recomendación" : "Continuar"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className="diagnostic-result">
              <CheckCircle size={44} weight="fill" aria-hidden="true" />
              <p>Recomendación inicial</p>
              <h3>{recommendation.title}</h3>
              <span>
                Un asesor confirmará el alcance después de conocer las indicaciones de tu universidad y revisar tu etapa actual.
              </span>
              <a
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                onClick={() => trackInteraction("diagnostic_whatsapp_click", { service: recommendation.service })}
              >
                <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
                Confirmar por WhatsApp
              </a>
              <button type="button" onClick={restart}>Rehacer diagnóstico</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
