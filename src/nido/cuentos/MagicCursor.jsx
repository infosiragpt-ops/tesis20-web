import { useEffect, useRef } from "react";

// Partículas de vida corta: un único lienzo, sin renders de React por movimiento.
export function MagicCursor() {
  const canvasRef = useRef(null);
  const handRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const hand = handRef.current;
    const host = canvas.closest(".cuentos");
    const ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const particles = [];
    let frame = 0;
    let previous = null;
    let last = performance.now();
    let width = 0;
    let height = 0;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= dt * 28;
        const fade = Math.min(1, p.life / 0.4);
        const radius = p.size * fade;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.2);
        glow.addColorStop(0, `rgba(255,251,225,${fade})`);
        glow.addColorStop(0.24, `rgba(255,218,113,${fade * 0.7})`);
        glow.addColorStop(1, "rgba(255,169,36,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - radius * 3.2, p.y - radius * 3.2, radius * 6.4, radius * 6.4);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * p.turn);
        ctx.fillStyle = `rgba(255,255,245,${fade})`;
        ctx.beginPath();
        for (let n = 0; n < 8; n++) {
          const r = n % 2 ? radius * 0.33 : radius;
          const a = n * Math.PI / 4;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      frame = particles.length ? requestAnimationFrame(draw) : 0;
    };
    const emit = (x, y, burst = false) => {
      if (reduced.matches) return;
      const count = burst ? 28 : 2;
      for (let i = 0; i < count; i++) {
        if (particles.length >= 150) particles.shift();
        const a = Math.random() * Math.PI * 2;
        const speed = burst ? 35 + Math.random() * 100 : Math.random() * 22;
        particles.push({ x: x + (Math.random() - 0.5) * 10, y, vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 14, life: 0.35 + Math.random() * 0.5,
          size: 2 + Math.random() * (burst ? 5 : 4), turn: Math.random() * 3 });
      }
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(draw); }
    };
    const hide = () => { hand.setAttribute("hidden", ""); previous = null; host.classList.remove("has-magic-cursor"); };
    const move = (e) => {
      if (e.pointerType === "touch" || reduced.matches || !fine.matches) { hide(); return; }
      const blocked = e.target.closest('[role="dialog"], input, textarea, .cuentos-modal');
      if (blocked) { hide(); return; }
      host.classList.add("has-magic-cursor"); hand.removeAttribute("hidden");
      hand.style.transform = `translate3d(${e.clientX - 12}px, ${e.clientY - 3}px, 0)`;
      hand.dataset.pressed = e.buttons ? "true" : "false";
      if (previous) {
        const dist = Math.hypot(e.clientX - previous.x, e.clientY - previous.y);
        const steps = Math.min(14, Math.ceil(dist / 7));
        for (let n = 1; n <= steps; n++) emit(previous.x + (e.clientX - previous.x) * n / steps, previous.y + (e.clientY - previous.y) * n / steps);
      }
      previous = { x: e.clientX, y: e.clientY };
    };
    const down = (e) => { emit(e.clientX, e.clientY, true); hand.dataset.pressed = "true"; };
    const up = () => { hand.dataset.pressed = "false"; };
    const preferences = () => { hide(); particles.length = 0; ctx.clearRect(0, 0, width, height); };
    resize();
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerdown", down, { passive: true });
    host.addEventListener("pointerleave", hide);
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", hide);
    window.addEventListener("resize", resize);
    reduced.addEventListener("change", preferences);
    return () => {
      cancelAnimationFrame(frame); hide();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointerleave", hide); window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", hide); window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", preferences);
    };
  }, []);
  return <>
    <canvas className="cuentos-magic-trail" ref={canvasRef} aria-hidden="true" />
    <svg ref={handRef} hidden className="cuentos-magic-hand" viewBox="0 0 48 56" aria-hidden="true">
      <path d="M14 30V8C14 2 22 2 22 8V24C23 18 29 19 30 25C31 20 37 23 37 28C39 25 44 28 44 33V39C44 45 38 49 37 53H19C18 48 14 46 11 42L3 31C0 26 6 23 10 27L14 30Z" fill="#fffdf5" stroke="#283046" strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M23 29V37M30 29V37M37 32V38M20 47H37" fill="none" stroke="#d8d3c9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </>;
}
