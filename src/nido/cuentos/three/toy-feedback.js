import * as THREE from "three";
import { toyLabel } from "./toys/index.js";

// Cartela orientada a cámara y destellos dentro de la escena, no sobre el texto.
export function createToyFeedback(scene, camera, reduced) {
  const textures = new Map();
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, toneMapped: false }));
  sprite.renderOrder = 20; sprite.visible = false; scene.add(sprite);
  const positions = new Float32Array(48 * 3);
  const velocities = new Float32Array(48 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const sparkCanvas = document.createElement("canvas"); sparkCanvas.width = sparkCanvas.height = 64;
  const ctx = sparkCanvas.getContext("2d");
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "white"); glow.addColorStop(0.18, "#fff3bc"); glow.addColorStop(0.4, "#ffd260"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
  const material = new THREE.PointsMaterial({ map: new THREE.CanvasTexture(sparkCanvas), color: "#fff3b0", transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, size: 0.045, opacity: 0 });
  const sparks = new THREE.Points(geometry, material); sparks.frustumCulled = false; scene.add(sparks);
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  let target = null; let hold = 0; let life = 0; let label = ""; let leavePending = false;
  function textureFor(text) {
    if (textures.has(text)) return textures.get(text);
    const c = document.createElement("canvas"); c.width = 512; c.height = 164;
    const g = c.getContext("2d");
    g.shadowColor = "#39280970"; g.shadowBlur = 12; g.shadowOffsetY = 7;
    g.fillStyle = "#fff7e4"; g.beginPath(); g.roundRect(10, 7, 492, 143, 32); g.fill();
    g.shadowColor = "transparent"; g.strokeStyle = "#d7b979"; g.lineWidth = 4; g.stroke();
    g.setLineDash([8, 6]); g.strokeStyle = "#62657a"; g.lineWidth = 2;
    g.beginPath(); g.roundRect(25, 21, 462, 115, 22); g.stroke();
    g.fillStyle = "#29304b"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 ${text.length > 14 ? 44 : text.length > 8 ? 60 : 78}px sans-serif`; g.fillText(text, 256, 80, 427);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    textures.set(text, tex); return tex;
  }
  function show(holder, burst = false) {
    if (!holder && performance.now() < hold) { leavePending = true; return; }
    leavePending = false;
    target = holder;
    if (!target) { sprite.visible = false; return; }
    label = toyLabel(holder.userData.toyId);
    sprite.material.map = textureFor(label); sprite.material.needsUpdate = true;
    sprite.visible = true;
    if (!burst) return;
    hold = performance.now() + 1600;
    if (reduced) return;
    box.setFromObject(holder); box.getCenter(center);
    for (let i = 0; i < 48; i++) {
      const angle = i * Math.PI * 2 / 48;
      positions.set([center.x, center.y, center.z + 0.03], i * 3);
      const speed = 0.22 + (i % 7) * 0.06;
      velocities.set([Math.cos(angle) * speed, Math.sin(angle) * speed + 0.3, Math.sin(i * 2.4) * 0.22], i * 3);
    }
    life = 1; material.opacity = 1;
  }
  function update(dt) {
    if (leavePending && performance.now() >= hold) { leavePending = false; target = null; sprite.visible = false; }
    if (target && !target.parent) { target = null; sprite.visible = false; }
    if (target && sprite.visible) {
      box.setFromObject(target); box.getCenter(anchor); anchor.y = box.max.y + 0.11;
      anchor.project(camera);
      anchor.x = THREE.MathUtils.clamp(anchor.x, -0.72, 0.72);
      anchor.y = THREE.MathUtils.clamp(anchor.y, -0.6, camera.aspect < 0.85 ? 0.72 : 0.82);
      sprite.position.copy(anchor.unproject(camera));
      const distance = camera.position.distanceTo(sprite.position);
      const size = distance * Math.tan(camera.fov * Math.PI / 360) / camera.zoom;
      const pulse = !reduced && performance.now() < hold ? 1 + Math.sin((1600 - (hold - performance.now())) / 1600 * Math.PI) * 0.2 : 1;
      sprite.scale.set(size * (camera.aspect < 0.85 ? 0.37 : 0.34) * pulse, size * 0.108 * pulse, 1);
    }
    if (life > 0) {
      life = Math.max(0, life - dt * 1.25); material.opacity = life;
      for (let i = 0; i < 48; i++) {
        const p = i * 3; positions[p] += velocities[p] * dt;
        positions[p + 1] += velocities[p + 1] * dt; positions[p + 2] += velocities[p + 2] * dt;
        velocities[p + 1] -= dt * 0.4;
      }
      geometry.attributes.position.needsUpdate = true;
    }
  }
  return { show, update, clear() { hold = 0; show(null); }, get label() { return sprite.visible ? label : null; },
    dispose() { scene.remove(sprite, sparks); textures.forEach(t => t.dispose()); sprite.material.dispose(); geometry.dispose(); material.map.dispose(); material.dispose(); } };
}
