// Coordenadas de la biblioteca y límites compartidos por ratón, tacto y teclado.
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const clampZoom = (value) => clamp(value, 0.8, 1.55);
export const bookIndexAt = (pan, count, spacing) => clamp(Math.round(pan / spacing + (count - 1) / 2), 0, count - 1);
export const bookPositionAt = (index, count, spacing) => (clamp(index, 0, count - 1) - (count - 1) / 2) * spacing;
export const dragScale = (distance, fov, height, zoom) => 2 * distance * Math.tan(fov * Math.PI / 360) / Math.max(1, height) / zoom;
export const settleBook = (pan, velocity, count, spacing) => bookIndexAt(pan + clamp(velocity * 150, -spacing, spacing), count, spacing);

// Gestos sobre el libro en la mesa: arrastrar la tapa hacia la izquierda la
// abre; arrastrar el libro hacia arriba lo devuelve a la repisa. Devuelve null
// mientras el movimiento no supera el umbral (así un toque sigue siendo toque).
export const deskDragIntent = (dx, dy, threshold = 8) => {
  if (Math.hypot(dx, dy) < threshold) return null;
  if (dx < 0 && Math.abs(dx) >= Math.abs(dy) * 0.8) return "open";
  if (dy < 0 && Math.abs(dy) > Math.abs(dx)) return "return";
  return "none";
};
export const dragProgress = (delta, distance) => clamp(delta / Math.max(1, distance), 0, 1);
// Se completa pasada casi la mitad del recorrido o con un tirón rápido
// (velocidad en px/ms) que ya haya avanzado algo.
export const shouldCompleteDrag = (progress, velocity, { min = 0.42, flick = 0.9, flickMin = 0.12 } = {}) =>
  progress >= min || (velocity >= flick && progress >= flickMin);
