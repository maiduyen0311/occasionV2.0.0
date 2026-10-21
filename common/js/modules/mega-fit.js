// Navigation → Mega menu width "Under the menu item": the panel opens from its menu item and is
// as wide as its columns, so on narrower screens it ran past the right edge (cut off when open,
// and a horizontal page scrollbar even while hidden). Shift each panel left just enough to stay
// inside the window. Runs on load and on resize; idempotent.

const SELECTOR = '.header-bottom--mega-fit .header-bottom__dropdown--mega';
const GAP = 16;

function fit() {
  const width = document.documentElement.clientWidth;
  document.querySelectorAll(SELECTOR).forEach((panel) => {
    panel.style.removeProperty('margin-inline-start');
    const over = panel.getBoundingClientRect().right - (width - GAP);
    if (over > 0) panel.style.marginInlineStart = `${-Math.ceil(over)}px`;
  });
}

function init() {
  fit();
  if (document.documentElement.dataset.megaFitBound === '1') return;
  document.documentElement.dataset.megaFitBound = '1';
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  });
  window.addEventListener('load', fit);
}

export default { init };
