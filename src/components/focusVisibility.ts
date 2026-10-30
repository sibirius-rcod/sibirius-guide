export function focusScrollOffset(bottom: number, panelTop: number) {
  return Math.max(0, bottom + 12 - panelTop);
}

export function keepFocusVisible(event: { target: EventTarget | null }) {
  if (!(event.target instanceof HTMLElement)) return;
  const panel = document.querySelector<HTMLElement>('.mobile-nav');
  if (!panel || getComputedStyle(panel).display === 'none') return;
  const offset = focusScrollOffset(event.target.getBoundingClientRect().bottom, panel.getBoundingClientRect().top);
  if (offset) window.scrollBy({ top: offset, behavior: 'instant' });
}
