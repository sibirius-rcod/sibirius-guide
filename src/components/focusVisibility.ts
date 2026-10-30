export function focusScrollOffset(bottom: number, panelTop: number) {
  return Math.max(0, bottom + 12 - panelTop);
}

export function keepFocusVisible(event: { target: EventTarget | null }) {
  // A click on plain text can focus the entire main[tabindex="-1"]. Its
  // bottom is the end of the page, not the control the user is interacting with.
  if (!(event.target instanceof HTMLElement) || event.target.tabIndex < 0 || !event.target.closest('main, footer')) return;
  const panel = document.querySelector<HTMLElement>('.mobile-nav');
  if (!panel || getComputedStyle(panel).display === 'none') return;
  const offset = focusScrollOffset(event.target.getBoundingClientRect().bottom, panel.getBoundingClientRect().top);
  if (offset) window.scrollBy({ top: offset, behavior: 'instant' });
}

export function createFocusVisibilityHandlers() {
  let navigatingWithTab = false;
  return {
    onKeyDownCapture(event: { key: string }) {
      navigatingWithTab = event.key === 'Tab';
    },
    onPointerDownCapture() {
      navigatingWithTab = false;
    },
    onFocusCapture(event: { target: EventTarget | null }) {
      if (!navigatingWithTab) return;
      navigatingWithTab = false;
      keepFocusVisible(event);
    },
  };
}
