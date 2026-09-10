import { lazy, Suspense } from "react";

// Tesis20 Nido es ahora una biblioteca de cuentos ilustrados con narración.
// El módulo se carga en diferido para que el resto del sitio no lo pague.
const CuentosApp = lazy(() => import("./cuentos/CuentosApp.jsx"));

export default function NidoPage() {
  return (
    <Suspense
      fallback={
        <main
          id="nido-main"
          aria-busy="true"
          aria-live="polite"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            background: "#dfe5d3",
            color: "#3b2a1f",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
          }}
        >
          Abriendo la biblioteca de Nido…
        </main>
      }
    >
      <CuentosApp />
    </Suspense>
  );
}
