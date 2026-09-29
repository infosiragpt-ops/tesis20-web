// Registro de pivotes articulados. Cualquier objeto con una de estas marcas
// en userData es una articulación que el escenario (o una entrega futura del
// motor de actuación) mueve por separado: el horneado nunca lo fusiona y las
// mallas que cuelgan de él se agrupan bajo ese pivote.
export const RIG_KEYS = Object.freeze([
  'head', 'neck', 'chest', 'eye', 'gaze', 'lid', 'brow', 'mouth', 'jaw',
  'arm', 'forearm', 'hand', 'leg', 'shin', 'wing', 'flutter', 'tail', 'ear',
  'hair', 'cape', 'skirt', 'antenna', 'sway', 'spray',
]);

/** Misma veracidad que el helper `tagged()` de las pruebas. */
export const isRigPivot = (o) => RIG_KEYS.some((k) => Boolean(o.userData[k]));
