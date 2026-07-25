// Render vectorial del bosque. Funciona como AnimationRegistry: cada personaje
// es una función (ctx, pose, t) reemplazable por sprites/Rive sin tocar la
// lógica del juego. Sin imágenes descargadas: todo se dibuja en canvas.

export const VIEW_W = 960;
export const VIEW_H = 540;

const INK = "#10233f";

export function drawBackground(ctx, cameraX, t, reducedMotion) {
  // Cielo
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, "#bfe7ff");
  sky.addColorStop(0.7, "#e8f7ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Sol
  ctx.fillStyle = "#ffd985";
  ctx.beginPath();
  ctx.arc(820, 86, 44, 0, Math.PI * 2);
  ctx.fill();

  const drift = reducedMotion ? 0 : t * 6;

  // Nubes (parallax lejano)
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let index = 0; index < 4; index += 1) {
    const cx =
      ((index * 320 + drift - cameraX * 0.15) % (VIEW_W + 260)) - 130;
    const cy = 60 + (index % 2) * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 58, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 38, cy + 8, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Colinas (parallax medio)
  ctx.fillStyle = "#bdeccb";
  for (let index = 0; index < 4; index += 1) {
    const hx = ((index * 420 - cameraX * 0.35) % (VIEW_W + 500)) - 250;
    ctx.beginPath();
    ctx.ellipse(hx, 470, 260, 130, 0, Math.PI, 0);
    ctx.fill();
  }

  // Árboles (parallax cercano)
  for (let index = 0; index < 6; index += 1) {
    const tx = ((index * 310 - cameraX * 0.6) % (VIEW_W + 360)) - 180;
    const sway = reducedMotion ? 0 : Math.sin(t * 1.1 + index) * 4;
    ctx.fillStyle = "#8a5a38";
    ctx.fillRect(tx - 8, 330, 16, 90);
    ctx.fillStyle = index % 2 ? "#46b982" : "#2e8f63";
    ctx.beginPath();
    ctx.arc(tx + sway, 305, 52, 0, Math.PI * 2);
    ctx.arc(tx - 34 + sway, 330, 38, 0, Math.PI * 2);
    ctx.arc(tx + 34 + sway, 330, 38, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawGround(ctx, world, cameraX) {
  ctx.fillStyle = "#63cf83";
  ctx.fillRect(0, world.groundY, VIEW_W, VIEW_H - world.groundY);
  ctx.fillStyle = "#4bb56c";
  ctx.fillRect(0, world.groundY, VIEW_W, 14);
  // Florecitas
  ctx.fillStyle = "#fff3c9";
  for (let index = 0; index < 14; index += 1) {
    const fx = ((index * 170 - cameraX) % (VIEW_W + 160)) - 80;
    ctx.beginPath();
    ctx.arc(fx, world.groundY + 34 + (index % 3) * 12, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawPlatform(ctx, platform) {
  ctx.fillStyle = "#b07b4f";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  roundRect(ctx, platform.x, platform.y, platform.w, platform.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#63cf83";
  roundRect(ctx, platform.x - 4, platform.y - 8, platform.w + 8, 14, 7);
  ctx.fill();
}

export function drawBush(ctx, obstacle, groundY, t, reducedMotion) {
  const sway = reducedMotion ? 0 : Math.sin(t * 1.6 + obstacle.x) * 2;
  ctx.fillStyle = "#2e8f63";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(obstacle.x + 14 + sway, groundY - obstacle.h + 16, 20, 0, Math.PI * 2);
  ctx.arc(obstacle.x + 40 + sway, groundY - obstacle.h + 8, 24, 0, Math.PI * 2);
  ctx.arc(obstacle.x + 30 + sway, groundY - 14, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawFruit(ctx, fruit, t, highlighted, reducedMotion) {
  if (fruit.collected) return;
  const bob = reducedMotion ? 0 : Math.sin(t * 2.4 + fruit.x * 0.05) * 3;
  const y = fruit.y + bob;
  if (highlighted) {
    ctx.fillStyle = "rgba(255,201,77,0.4)";
    ctx.beginPath();
    ctx.arc(fruit.x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ff6f61";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(fruit.x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(fruit.x - 5, y - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2e8f63";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(fruit.x, y - 13);
  ctx.quadraticCurveTo(fruit.x + 6, y - 22, fruit.x + 12, y - 20);
  ctx.stroke();
}

export function drawBasket(ctx, basket, delivered, target, glow, t) {
  if (glow) {
    ctx.fillStyle = `rgba(255,201,77,${0.25 + Math.sin(t * 6) * 0.12})`;
    ctx.beginPath();
    ctx.arc(basket.x + basket.w / 2, basket.y + 20, 66, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#b07b4f";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(basket.x, basket.y);
  ctx.lineTo(basket.x + basket.w, basket.y);
  ctx.lineTo(basket.x + basket.w - 12, basket.y + basket.h);
  ctx.lineTo(basket.x + 12, basket.y + basket.h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#8a5a38";
  ctx.lineWidth = 2;
  for (let index = 1; index < 4; index += 1) {
    ctx.beginPath();
    ctx.moveTo(basket.x + index * (basket.w / 4), basket.y + 4);
    ctx.lineTo(basket.x + index * (basket.w / 4) - 6, basket.y + basket.h - 4);
    ctx.stroke();
  }
  // Frutas entregadas asomando
  for (let index = 0; index < Math.min(delivered, 6); index += 1) {
    ctx.fillStyle = "#ff6f61";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(basket.x + 16 + index * 13, basket.y - 6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Etiqueta de meta
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  roundRect(ctx, basket.x + basket.w / 2 - 34, basket.y - 58, 68, 34, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "900 20px 'Arial Rounded MT Bold', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${delivered}/${target}`, basket.x + basket.w / 2, basket.y - 34);
}

/**
 * Niko, explorador jugable. Poses: idle | walk | run | jump | fall | grab |
 * celebrate | tryAgain (AnimationRegistry sustituible). Proporciones chibi
 * (cabeza grande, cuerpo pequeño) con sombreado por gradiente para un look
 * de mascota más pulido.
 */
export function drawNiko(ctx, body, pose, t, carrying) {
  const cx = body.x + body.w / 2;
  const bottom = body.y + body.h;
  const facing = body.facing;
  const runPhase = Math.sin(t * 14);
  const walking = pose === "walk" || pose === "run";
  const grabbing = pose === "grab";

  ctx.save();
  ctx.translate(cx, bottom);
  ctx.scale(facing, 1);

  // Sombra
  ctx.fillStyle = "rgba(16,35,63,0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 25, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const squash = pose === "jump" ? -4 : pose === "fall" ? 3 : grabbing ? 3 : 0;
  const lean = grabbing ? 6 : 0;

  // Piernas con zapatillas redondeadas
  const legSwing = walking ? runPhase * 10 : 0;
  const jumpTuck = pose === "jump" || pose === "fall" ? -8 : 0;
  const legs = [
    { x: -8 + legSwing * 0.6, y: jumpTuck ? -12 : -2 },
    { x: 8 - legSwing * 0.6, y: jumpTuck ? -14 : -2 },
  ];
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  for (const leg of legs) {
    ctx.beginPath();
    ctx.moveTo(leg.x * 0.3, -26);
    ctx.lineTo(leg.x, leg.y);
    ctx.stroke();
  }
  ctx.fillStyle = "#3a4a63";
  for (const leg of legs) {
    ctx.beginPath();
    ctx.ellipse(leg.x + facing * 3, leg.y + 1, 7, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // Cuerpo (polo con gradiente coral)
  const bodyGradient = ctx.createLinearGradient(-17, -62 + squash, 17, -22 + squash);
  bodyGradient.addColorStop(0, "#ff8a7e");
  bodyGradient.addColorStop(1, "#dc5048");
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  roundRect(ctx, -18 + lean * 0.15, -63 + squash, 35, 42, 14);
  ctx.fill();
  ctx.stroke();
  // Franja/cuello simple para dar textura de prenda
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10 + lean * 0.15, -60 + squash);
  ctx.lineTo(-10 + lean * 0.15, -26 + squash);
  ctx.stroke();

  // Mochila con detalle de bolsillo y estrellita
  ctx.fillStyle = "#ffc94d";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  roundRect(ctx, -31, -58 + squash, 13, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e8a936";
  roundRect(ctx, -29, -50 + squash, 9, 9, 3);
  ctx.fill();

  // Brazos
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  if (pose === "celebrate") {
    const wave = Math.sin(t * 10) * 6;
    ctx.beginPath();
    ctx.moveTo(-15, -52 + squash);
    ctx.lineTo(-26, -74 - wave + squash);
    ctx.moveTo(15, -52 + squash);
    ctx.lineTo(26, -74 + wave + squash);
    ctx.stroke();
  } else if (grabbing) {
    // Un brazo se extiende hacia adelante-abajo, como agarrando algo.
    ctx.beginPath();
    ctx.moveTo(14, -52 + squash);
    ctx.lineTo(30, -34 + squash);
    ctx.moveTo(-14, -52 + squash);
    ctx.lineTo(-8, -40 + squash);
    ctx.stroke();
  } else if (carrying > 0) {
    ctx.beginPath();
    ctx.moveTo(-15, -52 + squash);
    ctx.lineTo(-6, -66 + squash);
    ctx.moveTo(15, -52 + squash);
    ctx.lineTo(6, -66 + squash);
    ctx.stroke();
  } else {
    const armSwing = walking ? runPhase * 8 : 0;
    ctx.beginPath();
    ctx.moveTo(-15, -52 + squash);
    ctx.lineTo(-20 - armSwing * 0.4, -34 + squash);
    ctx.moveTo(15, -52 + squash);
    ctx.lineTo(20 + armSwing * 0.4, -34 + squash);
    ctx.stroke();
  }

  // Cabeza grande (proporción chibi) con sombreado
  const headBob = walking ? Math.abs(runPhase) * 1.6 : Math.sin(t * 2) * 1.2;
  const headY = -83 + squash - headBob;
  const headR = 23;
  const headX = lean;
  const headGradient = ctx.createRadialGradient(
    headX - 7,
    headY - 7,
    3,
    headX,
    headY,
    headR,
  );
  headGradient.addColorStop(0, "#ffd9b3");
  headGradient.addColorStop(1, "#f0b689");
  ctx.fillStyle = headGradient;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Orejas pequeñas
  ctx.fillStyle = "#f0b689";
  ctx.beginPath();
  ctx.ellipse(headX - headR + 3, headY + 3, 3.4, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(headX + headR - 3, headY + 3, 3.4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pelo con volumen, mechón y brillo
  ctx.fillStyle = "#5b3a22";
  ctx.beginPath();
  ctx.moveTo(headX - headR - 1, headY - 2);
  ctx.quadraticCurveTo(headX - headR - 4, headY - 22, headX - 6, headY - 24);
  ctx.quadraticCurveTo(headX + 2, headY - 30, headX + 10, headY - 24);
  ctx.quadraticCurveTo(headX + headR + 5, headY - 20, headX + headR + 1, headY - 1);
  ctx.quadraticCurveTo(headX + 6, headY - 15, headX, headY - 12);
  ctx.quadraticCurveTo(headX - 6, headY - 16, headX - headR - 1, headY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  // Mechoncito
  ctx.strokeStyle = "#5b3a22";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(headX + 3, headY - 26);
  ctx.quadraticCurveTo(headX + 9, headY - 32, headX + 6, headY - 22);
  ctx.stroke();
  // Brillo del pelo
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(headX - 6, headY - 14, 8, Math.PI * 1.1, Math.PI * 1.5);
  ctx.stroke();

  // Cara
  const blink = Math.sin(t * 0.9) > 0.985;
  const eyeY = headY - 2;
  ctx.fillStyle = INK;
  if (pose === "tryAgain") {
    ctx.beginPath();
    ctx.arc(headX + 7, eyeY, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(headX + 9, eyeY + 10, 4.4, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.stroke();
  } else {
    if (blink) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(headX + 3, eyeY);
      ctx.lineTo(headX + 10, eyeY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(headX + 7, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(headX + 8.2, eyeY - 1.1, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const smile = pose === "celebrate" || grabbing ? 6.5 : 4.5;
    ctx.arc(headX + 8, eyeY + 11, smile, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,148,138,0.55)";
    ctx.beginPath();
    ctx.arc(headX + 15, eyeY + 8, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fruta cargada sobre la cabeza, con un pequeño brillo
  if (carrying > 0) {
    const count = Math.min(carrying, 5);
    for (let index = 0; index < count; index += 1) {
      const fx = (index - count / 2 + 0.5) * 16;
      const fy = -120 + squash - index * 2;
      ctx.fillStyle = "#ff6f61";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(fx, fy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(fx - 3, fy - 3, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Luma, criatura luminosa narradora. Poses: idle | talk | cheer | think. */
export function drawLuma(ctx, x, y, pose, t) {
  const bob = Math.sin(t * 2.2) * 6;
  const glow = 0.35 + Math.sin(t * 3) * 0.12;
  ctx.save();
  ctx.translate(x, y + bob);

  ctx.fillStyle = `rgba(255,217,133,${glow})`;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff3c9";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Alitas
  const flap = Math.sin(t * 9) * (pose === "cheer" ? 10 : 5);
  ctx.fillStyle = "#ffd985";
  ctx.beginPath();
  ctx.ellipse(-24, -2 - flap * 0.4, 10, 6, -0.5, 0, Math.PI * 2);
  ctx.ellipse(24, -2 + flap * 0.4, 10, 6, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Carita
  ctx.fillStyle = INK;
  if (pose === "cheer") {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-6, -3, 3, Math.PI, 0);
    ctx.arc(6, -3, 3, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-6, -3, 2.4, 0, Math.PI * 2);
    ctx.arc(6, -3, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (pose === "talk") {
    const mouth = 2.5 + Math.abs(Math.sin(t * 12)) * 2.5;
    ctx.arc(0, 5, mouth, 0, Math.PI * 2);
  } else {
    ctx.arc(0, 4, 4, Math.PI * 0.15, Math.PI * 0.85);
  }
  ctx.stroke();

  // Chispas
  if (pose === "cheer") {
    ctx.fillStyle = "#ffc94d";
    for (let index = 0; index < 5; index += 1) {
      const angle = t * 3 + (index * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 32, Math.sin(angle) * 32, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawParticles(ctx, particles) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
