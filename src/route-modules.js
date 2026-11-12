/**
 * Páginas que viven en su propio chunk. main.jsx precarga la de la ruta actual
 * antes del primer render: así App la pinta directamente, sin pasar por
 * Suspense (sin destello de «Preparando…» sobre el HTML prerenderizado).
 * La navegación entre páginas es por recarga completa, no hay router.
 */
export const loadContractPage = () => import("./contract-page.jsx");
export const loadResourcesPage = () => import("./resources-page.jsx");
export const loadCareersPage = () => import("./academic-directory-pages.jsx");
export const loadAdvisorsPage = () => import("./advisors-page.jsx");

// Sin esta precarga la página monta con un <main> provisional de una línea:
// el pie aparece pegado a la cabecera y salta hacia abajo al llegar el chunk.
const loaders = {
  "/contrato": loadContractPage,
  "/recursos": loadResourcesPage,
  "/carreras": loadCareersPage,
  "/docentes": loadAdvisorsPage,
};

export const loadedRouteModules = {};

export function preloadRouteModule(pathname = window.location.pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const loader = loaders[path];
  if (!loader) return Promise.resolve();
  return loader()
    .then((module) => {
      loadedRouteModules[path] = module;
    })
    .catch(() => undefined);
}
