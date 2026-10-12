// Sales popup (sections/sales-popup.liquid): rotates "recently bought" toasts.
// Dismissing it hides it for the rest of the browser session.
const DISMISS_KEY = 'tm_sales_popup_dismissed';

function initPopup(root) {
  if (root.dataset.bound === '1') return;
  root.dataset.bound = '1';

  try { if (sessionStorage.getItem(DISMISS_KEY) === '1') return; } catch (e) { /* storage blocked */ }
  if (root.dataset.mobile !== 'true' && !window.matchMedia('(min-width: 768px)').matches) return;

  let items = [];
  try { items = JSON.parse(root.querySelector('[data-sales-items]').textContent); } catch (e) { items = []; }
  if (!items.length) return;

  const q = (sel) => root.querySelector(sel);
  const delay = (Number(root.dataset.delay) || 8) * 1000;
  const duration = (Number(root.dataset.duration) || 6) * 1000;
  const interval = (Number(root.dataset.interval) || 20) * 1000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = -1;
  let hideTimer = null;
  let loopTimer = null;
  let hovered = false;

  const render = (item) => {
    q('[data-sales-name]').textContent = item.name || '';
    q('[data-sales-title]').textContent = item.title || '';
    q('[data-sales-city]').textContent = item.city || '';
    q('[data-sales-ago]').textContent = item.ago || '';
    root.querySelectorAll('[data-sales-link]').forEach((a) => { a.href = item.url; });
    const img = q('[data-sales-image]');
    if (item.image) { img.src = item.image; img.alt = item.alt || item.title || ''; img.parentElement.hidden = false; } else { img.parentElement.hidden = true; }
    const view = q('[data-quick-view-trigger]');
    if (view) view.setAttribute('data-product-url', item.url);
  };

  const hide = () => {
    root.classList.remove('is-visible');
    setTimeout(() => { if (!root.classList.contains('is-visible')) root.hidden = true; }, reduceMotion ? 0 : 350);
  };

  const show = () => {
    index = (index + 1) % items.length;
    render(items[index]);
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-visible'));
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function autoHide() {
      if (hovered) { hideTimer = setTimeout(autoHide, 1000); return; } // keep it while the pointer / focus is on it
      hide();
    }, duration);
  };

  root.addEventListener('mouseenter', () => { hovered = true; });
  root.addEventListener('mouseleave', () => { hovered = false; });
  root.addEventListener('focusin', () => { hovered = true; });
  root.addEventListener('focusout', () => { hovered = false; });

  q('[data-sales-close]').addEventListener('click', () => {
    clearTimeout(hideTimer);
    clearInterval(loopTimer);
    hide();
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* storage blocked */ }
  });

  setTimeout(() => {
    show();
    loopTimer = setInterval(show, interval + duration);
  }, delay);
}

export default {
  init() {
    document.querySelectorAll('[data-sales-popup]').forEach(initPopup);
  },
};
