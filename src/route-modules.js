/**
 * Páginas que viven en su propio chunk. main.jsx precarga la de la ruta actual
 * antes del primer render: así App la pinta directamente, sin pasar por
 * Suspense (sin destello de «Preparando…» sobre el HTML prerenderizado).
 * La navegación entre páginas es por recarga completa, no hay router.
 */
export const loadContractPage = () => import("./contract-page.jsx");

const loaders = {
  "/contrato": loadContractPage,
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
