const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function dialogControls(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);
}

/** Keep keyboard navigation inside the open panel, without changing the book. */
export function handleDialogKey(event, dialog, onClose) {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    onClose();
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = dialogControls(dialog);
  const first = controls[0];
  const last = controls.at(-1);
  const active = dialog.ownerDocument.activeElement;
  if (!first) {
    event.preventDefault();
    dialog.focus();
  } else if (!controls.includes(active) || (event.shiftKey ? active === first : active === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

export function readerShortcutsBlocked(event, suspended) {
  return suspended || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
    || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName)
    || Boolean(event.target?.isContentEditable || event.target?.closest?.('[role="dialog"]'));
}
