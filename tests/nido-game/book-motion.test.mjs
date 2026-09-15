import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { tween, createTweenScope, updateTweens, cancelAllTweens, ease } from '../../src/nido/cuentos/three/tween.js';

afterEach(cancelAllTweens);

test('cerrar durante la apertura cancela el pop-up pendiente y la tapa anterior', () => {
  const motion = createTweenScope();
  const cover = { t: 0 }; let opened = 0; let popupVisible = false;
  motion.tween(cover, { t: 1 }, { duration: 1, easing: ease.linear, onUpdate: () => { opened = cover.t; } });
  motion.after(0.7, () => { popupVisible = true; });
  updateTweens(0); updateTweens(0.1);
  motion.cancel();
  const closing = { t: opened };
  motion.tween(closing, { t: 0 }, { duration: 0.3, onUpdate: () => { opened = closing.t; } });
  updateTweens(0.1); updateTweens(0.5); updateTweens(2);
  assert.equal(opened, 0); assert.equal(popupVisible, false);
});

test('cancelar una página elimina también su animación encadenada', () => {
  const motion = createTweenScope(); const popup = { y: 1 }; let reveals = 0;
  motion.tween(popup, { y: 0 }, { duration: 0.2, onComplete: () => {
    motion.tween(popup, { y: 1 }, { duration: 0.5, onComplete: () => reveals++ });
  } });
  updateTweens(0); updateTweens(0.2); updateTweens(0.3);
  motion.cancel(); popup.y = 0;
  updateTweens(2);
  assert.equal(popup.y, 0); assert.equal(reveals, 0);
});

test('cambios rápidos dejan terminar solo a la última hoja', () => {
  const motion = createTweenScope(); const completed = [];
  for (let i = 0; i < 5; i++) {
    motion.cancel();
    motion.tween({ t: 0 }, { t: 1 }, { duration: 0.74, onComplete: () => completed.push(i) });
    updateTweens(i * 0.1);
  }
  updateTweens(2);
  assert.deepEqual(completed, [4]);
});

test('cancelar un libro no detiene la habitación ni un grupo independiente', () => {
  const book = createTweenScope(); const room = createTweenScope();
  const light = { value: 0 }; const camera = { value: 0 }; let stale = false;
  book.after(0.5, () => { stale = true; });
  room.tween(light, { value: 1 }, { duration: 1 });
  tween(camera, { value: 2 }, { duration: 1 });
  updateTweens(0); book.cancel(); updateTweens(1);
  assert.equal(stale, false); assert.equal(light.value, 1); assert.equal(camera.value, 2);
});

test('la cancelación puede repetirse y el grupo se puede reutilizar', () => {
  const motion = createTweenScope(); let calls = 0;
  motion.after(1, () => calls++); motion.cancel(); motion.cancel();
  motion.after(0.01, () => calls++);
  updateTweens(0); updateTweens(0.02); updateTweens(4);
  assert.equal(calls, 1);
});

test('pasar de página durante la apertura no revive la ilustración inicial ni detiene la tapa', () => {
  const book = createTweenScope(); const page = createTweenScope();
  const cover = { t: 0 }; const popup = { y: 0 }; let illustration = 'initial';
  book.tween(cover, { t: 1 }, { duration: 1 });
  page.after(0.7, () => page.tween(popup, { y: 1 }, { duration: 0.6 }));
  updateTweens(0); updateTweens(0.6);
  page.cancel();
  page.tween(popup, { y: 0 }, { duration: 0.28, onComplete: () => {
    illustration = 'requested';
    page.tween(popup, { y: 1 }, { duration: 0.55 });
  } });
  updateTweens(0.6); updateTweens(0.71); updateTweens(0.9); updateTweens(2);
  assert.equal(illustration, 'requested');
  assert.equal(cover.t, 1); assert.equal(popup.y, 1);
});
