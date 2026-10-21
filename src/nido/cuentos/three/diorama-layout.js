// All slots stay in front of the opaque pop-up at local z=-0.02.
export function dioramaLayout(castCount, propCount) {
  const slots = [];
  const scale = castCount === 1 ? .72 : castCount === 2 ? .6 : .52;
  if (castCount === 1) slots.push({ x: 0, z: .05, scale, face: 0 });
  if (castCount === 2) slots.push({ x: -.085, z: .045, scale, face: .28 }, { x: .085, z: .045, scale, face: -.28 });
  if (castCount === 3) slots.push({ x: 0, z: .06, scale: scale * 1.1, face: 0 }, { x: -.135, z: .02, scale, face: .42 }, { x: .135, z: .02, scale, face: -.42 });
  const propScale = castCount === 0 ? .6 : castCount === 1 ? .42 : castCount === 2 ? .38 : .34;
  const x = castCount >= 3 ? .21 : castCount === 2 ? .2 : castCount === 1 ? .15 : .08;
  if (propCount >= 1) slots.push({ x: -x, z: .045, scale: propScale, face: .35 });
  if (propCount >= 2) slots.push({ x, z: .045, scale: propScale, face: -.35 });
  return slots;
}

/**
 * Ajusta las ranuras a lo que mide cada figura (ancho a escala 1, en el
 * orden de las ranuras): los objetos grandes (el laberinto, la carta, la
 * lámpara) se achican y todos se corren hacia fuera hasta no tocar a los
 * personajes, sin salirse del desplegable (±limit).
 */
export function fitDioramaSlots(slots, widths, castCount, { propMax = 0.15, propMin = 0.07, gap = 0.012, limit = 0.235 } = {}) {
  const fitted = slots.map((slot) => ({ ...slot }));
  const width = (i) => (widths[i] || 0) * fitted[i].scale;
  // Personajes: el más ancho de cada par que se pisa se achica hasta tocar.
  const cast = fitted.slice(0, castCount).map((slot, i) => i).sort((a, b) => fitted[a].x - fitted[b].x);
  for (let k = 1; k < cast.length; k += 1) {
    const [a, b] = [cast[k - 1], cast[k]];
    const room = fitted[b].x - fitted[a].x - gap;
    const overlap = (width(a) + width(b)) / 2 - room;
    if (overlap <= 0) continue;
    const wider = width(a) >= width(b) ? a : b;
    const other = wider === a ? b : a;
    fitted[wider].scale = Math.max(0.5 * fitted[wider].scale, (2 * room - width(other)) / widths[wider]);
  }
  let left = 0;
  let right = 0;
  for (let i = 0; i < castCount; i += 1) {
    left = Math.min(left, fitted[i].x - width(i) / 2);
    right = Math.max(right, fitted[i].x + width(i) / 2);
  }
  for (let i = castCount; i < fitted.length; i += 1) {
    const slot = fitted[i];
    if (!widths[i]) continue;
    const side = slot.x < 0 ? -1 : 1;
    const edge = side < 0 ? -left : right;
    const room = limit - edge - gap;
    const target = Math.min(propMax, width(i), Math.max(propMin, room));
    slot.scale = target / widths[i];
    const half = target / 2;
    slot.x = side * Math.max(edge + gap + half, Math.min(Math.abs(slot.x), limit - half));
  }
  return fitted;
}
