import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

function removeInternalQaArtifacts() {
  return {
    name: "tesis20-remove-internal-qa-artifacts",
    apply: "build",
    async closeBundle() {
      const outputDirectory = resolve(process.cwd(), "dist");
      const internalArtifacts = [
        "qa",
        "qa-results",
        "qa-focus.html",
        "qa-results-overview.html",
        "qa-results-focus.html",
        "qa-board.html",
        "assets/support-session.png",
        "assets/hero-backdrop.png",
        "assets/evidence/case-267-grade-result-full.png",
      ];

      await Promise.all(
        internalArtifacts.map((artifact) =>
          rm(resolve(outputDirectory, artifact), { recursive: true, force: true }),
        ),
      );
    },
  };
}

/** Expone /api/thesis-search en `vite dev` reutilizando el handler de Vercel. */
function thesisSearchDevApi() {
  return {
    name: "tesis20-thesis-search-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/thesis-search")) return next();

        try {
          const { default: handler } = await server.ssrLoadModule("/api/thesis-search.js");
          const parsed = new URL(url, "http://127.0.0.1");
          const query = Object.fromEntries(parsed.searchParams.entries());
          const mockReq = { method: req.method || "GET", query, url };
          const mockRes = {
            statusCode: 200,
            headers: {},
            setHeader(key, value) {
              this.headers[key] = value;
            },
            status(code) {
              this.statusCode = code;
              return this;
            },
            json(body) {
              res.statusCode = this.statusCode;
              for (const [key, value] of Object.entries(this.headers)) {
                res.setHeader(key, value);
              }
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify(body));
            },
            end(payload) {
              res.statusCode = this.statusCode;
              for (const [key, value] of Object.entries(this.headers)) {
                res.setHeader(key, value);
              }
              res.end(payload ?? "");
            },
          };
          await handler(mockReq, mockRes);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "dev api error" }));
        }
      });
    },
  };
}

export default defineConfig({
  build: {
    assetsDir: "build-assets",
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/scheduler/")) {
            return "vendor-react";
          }

          // La matriz de 500 juegos es contenido estático y cambia con mucha
          // menos frecuencia que el motor. Mantenerla en un chunk propio
          // evita que la ruta diferida de Nido supere el presupuesto por
          // archivo y mejora la reutilización de caché entre despliegues.
          if (id.includes("/src/nido/nido-curriculum-matrix.js")) {
            return "nido-curriculum-matrix";
          }

          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "127.0.0.1",
    allowedHosts: ["terminal.local", "localhost", "127.0.0.1"],
    hmr: {
      host: "127.0.0.1",
      clientPort: 3000,
    },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), thesisSearchDevApi(), removeInternalQaArtifacts()],
});
