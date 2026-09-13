import test from 'node:test';
import assert from 'node:assert/strict';
import { dialogControls, handleDialogKey, readerShortcutsBlocked } from '../../src/nido/cuentos/dialog-focus.js';

function fixture() {
  const document = { activeElement: null };
  const control = (visible = true) => ({ getClientRects: () => visible ? [{}] : [], focus() { document.activeElement = this; } });
  const first = control(); const hidden = control(false); const last = control();
  const dialog = { ownerDocument: document, querySelectorAll: () => [first, hidden, last], focus() { document.activeElement = this; } };
  const event = (key, shiftKey = false) => ({ key, shiftKey, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; } });
  return { document, first, last, dialog, event };
}

test('Escape cierra solo el diálogo y detiene el atajo del libro', () => {
  const f = fixture(); const event = f.event('Escape'); let closed = 0;
  handleDialogKey(event, f.dialog, () => closed++);
  assert.equal(closed, 1); assert.equal(event.defaultPrevented, true); assert.equal(event.stopped, true);
});

test('Tab y Mayús+Tab mantienen el foco dentro del diálogo', () => {
  const f = fixture();
  assert.deepEqual(dialogControls(f.dialog), [f.first, f.last]);
  f.document.activeElement = f.last;
  handleDialogKey(f.event('Tab'), f.dialog, () => {});
  assert.equal(f.document.activeElement, f.first);
  handleDialogKey(f.event('Tab', true), f.dialog, () => {});
  assert.equal(f.document.activeElement, f.last);
  f.document.activeElement = {};
  handleDialogKey(f.event('Tab'), f.dialog, () => {});
  assert.equal(f.document.activeElement, f.first);
});

test('el foco se mantiene incluso si el diálogo no tiene botones', () => {
  const f = fixture(); f.dialog.querySelectorAll = () => [];
  handleDialogKey(f.event('Tab'), f.dialog, () => {});
  assert.equal(f.document.activeElement, f.dialog);
});

test('los atajos no cambian la página detrás de paneles ni dentro de campos', () => {
  assert.equal(readerShortcutsBlocked({}, true), true);
  assert.equal(readerShortcutsBlocked({ target: { closest: () => ({}) } }, false), true);
  for (const tagName of ['INPUT', 'SELECT', 'TEXTAREA']) assert.equal(readerShortcutsBlocked({ target: { tagName } }, false), true);
  assert.equal(readerShortcutsBlocked({ target: { isContentEditable: true } }, false), true);
  for (const key of ['defaultPrevented', 'isComposing', 'altKey', 'ctrlKey', 'metaKey']) assert.equal(readerShortcutsBlocked({ [key]: true }, false), true);
  assert.equal(readerShortcutsBlocked({ target: { tagName: 'BUTTON' } }, false), false);
});
