// Coordenadas de la biblioteca y límites compartidos por ratón, tacto y teclado.
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const clampZoom = (value) => clamp(value, 0.8, 1.55);
export const bookIndexAt = (pan, count, spacing) => clamp(Math.round(pan / spacing + (count - 1) / 2), 0, count - 1);
export const bookPositionAt = (index, count, spacing) => (clamp(index, 0, count - 1) - (count - 1) / 2) * spacing;
export const dragScale = (distance, fov, height, zoom) => 2 * distance * Math.tan(fov * Math.PI / 360) / Math.max(1, height) / zoom;
export const settleBook = (pan, velocity, count, spacing) => bookIndexAt(pan + clamp(velocity * 150, -spacing, spacing), count, spacing);
