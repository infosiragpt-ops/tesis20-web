import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import { SpeedInsights } from "@vercel/speed-insights/react";

const PUBLIC_PATHS = new Set(["/", "/servicios", "/evidencias", "/contrato"]);
const SERVICE_DETAIL_PATH =
  /^\/servicios\/(articulo-cientifico|tesis-i-proyecto|tesis-ii-titulacion|suficiencia-profesional|ibm-spss-statistics|simulacion-sustentacion)$/;

function isPublicPath(pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PUBLIC_PATHS.has(normalizedPath) || SERVICE_DETAIL_PATH.test(normalizedPath);
}

function normalizePublicUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return window.location.origin;
  }
}

function allowPublicMeasurement(event) {
  try {
    const url = new URL(event.url, window.location.origin);
    if (!isPublicPath(url.pathname)) return null;
    return { ...event, url: normalizePublicUrl(url) };
  } catch {
    return null;
  }
}

export function Observability() {
  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;

    const forwardInteraction = (event) => {
      const payload = event.detail;
      if (!payload || typeof payload.action !== "string") return;

      const { action, timestamp: _timestamp, ...safeProperties } = payload;

      try {
        track(`tesis20_${action}`.slice(0, 255), safeProperties);
      } catch {
        // La experiencia principal no depende del proveedor de analítica.
      }
    };

    window.addEventListener("tesis20:interaction", forwardInteraction);
    return () => window.removeEventListener("tesis20:interaction", forwardInteraction);
  }, []);

  if (!import.meta.env.PROD) return null;

  return (
    <>
      <Analytics beforeSend={allowPublicMeasurement} />
      <SpeedInsights sampleRate={0.5} beforeSend={allowPublicMeasurement} />
    </>
  );
}
