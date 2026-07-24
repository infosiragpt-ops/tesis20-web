// Física arcade para plataformas laterales: aceleración/desaceleración suave,
// gravedad, coyote time, jump buffering y colisiones AABB tolerantes.
// Sin muerte: si el jugador sale del mundo reaparece suavemente.

export const PHYSICS = Object.freeze({
  gravity: 2300,
  runSpeed: 285,
  walkSpeed: 180,
  accel: 1500,
  decel: 2000,
  jumpVelocity: -800,
  maxFall: 950,
  coyoteTime: 0.1,
  jumpBuffer: 0.14,
});

/**
 * @typedef {{ x: number, y: number, w: number, h: number }} Rect
 * @typedef {{
 *   x: number, y: number, vx: number, vy: number,
 *   w: number, h: number, facing: 1|-1,
 *   onGround: boolean, coyote: number, jumpBufferT: number,
 *   state: string, stateT: number,
 * }} PlayerBody
 */

/** @returns {PlayerBody} */
export function createPlayerBody(x, y) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    w: 46,
    h: 64,
    facing: 1,
    onGround: false,
    coyote: 0,
    jumpBufferT: 0,
    state: "idle",
    stateT: 0,
  };
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/**
 * Avanza el cuerpo del jugador un paso fijo.
 *
 * @param {PlayerBody} body
 * @param {{ left: boolean, right: boolean, jumpPressed: boolean, running: boolean }} input
 * @param {number} dt paso fijo en segundos
 * @param {{ width: number, groundY: number, platforms: Rect[], spawn: {x:number,y:number} }} world
 * @returns {{ jumped: boolean, landed: boolean, respawned: boolean }}
 */
export function stepPlayer(body, input, dt, world) {
  const events = { jumped: false, landed: false, respawned: false };
  const targetSpeed = input.running ? PHYSICS.runSpeed : PHYSICS.walkSpeed;

  // Horizontal con aceleración/desaceleración
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (direction !== 0) {
    body.facing = direction;
    body.vx += direction * PHYSICS.accel * dt;
    const cap = targetSpeed;
    if (body.vx > cap) body.vx = cap;
    if (body.vx < -cap) body.vx = -cap;
  } else if (body.vx !== 0) {
    const drop = PHYSICS.decel * dt;
    if (Math.abs(body.vx) <= drop) body.vx = 0;
    else body.vx -= Math.sign(body.vx) * drop;
  }

  // Temporizadores de salto amable
  body.coyote = body.onGround ? PHYSICS.coyoteTime : Math.max(0, body.coyote - dt);
  body.jumpBufferT = input.jumpPressed
    ? PHYSICS.jumpBuffer
    : Math.max(0, body.jumpBufferT - dt);

  if (body.jumpBufferT > 0 && body.coyote > 0) {
    body.vy = PHYSICS.jumpVelocity;
    body.onGround = false;
    body.coyote = 0;
    body.jumpBufferT = 0;
    events.jumped = true;
  }

  // Gravedad
  body.vy = Math.min(body.vy + PHYSICS.gravity * dt, PHYSICS.maxFall);

  // Integración por ejes con colisión AABB
  body.x += body.vx * dt;
  if (body.x < 0) {
    body.x = 0;
    body.vx = 0;
  }
  if (body.x + body.w > world.width) {
    body.x = world.width - body.w;
    body.vx = 0;
  }
  for (const platform of world.platforms) {
    if (overlaps(body, platform)) {
      body.x =
        body.vx > 0 ? platform.x - body.w : platform.x + platform.w;
      body.vx = 0;
    }
  }

  const wasOnGround = body.onGround;
  body.y += body.vy * dt;
  body.onGround = false;

  // Suelo
  if (body.y + body.h >= world.groundY) {
    body.y = world.groundY - body.h;
    body.vy = 0;
    body.onGround = true;
  }

  // Plataformas: solo se aterriza cayendo (tolerante, one-way)
  for (const platform of world.platforms) {
    const falling = body.vy >= 0;
    const feetPrev = body.y + body.h - body.vy * dt;
    if (
      falling &&
      feetPrev <= platform.y + 8 &&
      overlaps(body, platform)
    ) {
      body.y = platform.y - body.h;
      body.vy = 0;
      body.onGround = true;
    }
  }

  if (!wasOnGround && body.onGround) events.landed = true;

  // Sin castigo: fuera del mundo → reaparición suave cerca del inicio
  if (body.y > world.groundY + 400) {
    body.x = world.spawn.x;
    body.y = world.spawn.y;
    body.vx = 0;
    body.vy = 0;
    events.respawned = true;
  }

  return events;
}
