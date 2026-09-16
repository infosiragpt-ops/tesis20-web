// Perspective fit of actual page/pop-up corners, not a scaled world sphere.
// Empty corners in a world-aligned box would make a tilted book too small.
export function cinemaFitDistance(points, focus, direction, fov, aspect, safeX = .9, safeY = .76) {
  const horizontal = Math.hypot(direction.x, direction.z) || 1;
  const rx = direction.z / horizontal, rz = -direction.x / horizontal;
  const ux = direction.y * rz, uy = direction.z * rx - direction.x * rz, uz = -direction.y * rx;
  const tanV = Math.tan(fov * Math.PI / 360), tanH = tanV * aspect;
  let distance = .1;
  for (const point of points) {
    const dx = point.x - focus.x, dy = point.y - focus.y, dz = point.z - focus.z;
    const depth = dx * direction.x + dy * direction.y + dz * direction.z;
    const side = Math.abs(dx * rx + dz * rz);
    const height = Math.abs(dx * ux + dy * uy + dz * uz);
    distance = Math.max(distance, depth + side / (tanH * safeX), depth + height / (tanV * safeY));
  }
  return distance;
}
