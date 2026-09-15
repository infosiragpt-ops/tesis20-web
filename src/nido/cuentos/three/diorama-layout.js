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
