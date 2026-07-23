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

          if (id.includes("node_modules/@phosphor-icons/")) {
            return "vendor-icons";
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
  plugins: [react(), removeInternalQaArtifacts()],
});
