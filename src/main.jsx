import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { AppErrorBoundary } from "./platform-enhancements.jsx";
import { Observability } from "./observability.jsx";
import { preloadRouteModule } from "./route-modules.js";
import "./styles.css";
import "./design-v2.css";
import "./home.css";

// Precarga el chunk de la ruta (si tiene) antes de montar: sin destellos.
preloadRouteModule().finally(() => {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
        <Observability />
      </AppErrorBoundary>
    </React.StrictMode>,
  );
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }).catch(() => {
        // La plataforma continúa disponible aunque el navegador no permita el modo offline.
      });
    },
    { once: true },
  );
}
