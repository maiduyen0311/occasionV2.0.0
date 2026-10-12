// Social proof popup — rotates static "recent order" notifications bottom-left.
// Markup + data injected by snippets/social-proof-popup.liquid.

function pickNext(items, lastIdx) {
  if (!items.length) return null;
  if (items.length === 1) return 0;
  let next;
  do {
    next = Math.floor(Math.random() * items.length);
  } while (next === lastIdx);
  return next;
}

function shouldShowOnMobile(root) {
  const allow = root.dataset.mobile === 'true';
  if (allow) return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

const SocialProof = {
  init() {
    const root = document.getElementById('SocialProof');
    if (!root) return;
    if (root.dataset.spBound === '1') return;
    root.dataset.spBound = '1';

    if (!shouldShowOnMobile(root)) return;

    const dataEl = root.querySelector('[data-sp-items]');
    if (!dataEl) return;
    let items = [];
    try {
      items = JSON.parse(dataEl.textContent || '[]');
    } catch (_) {
      items = [];
    }
    items = items.filter((it) => it && it.city && it.product);
    if (!items.length) return;

    const cityEl = root.querySelector('[data-sp-city]');
    const productEl = root.querySelector('[data-sp-product]');
    const agoEl = root.querySelector('[data-sp-ago]');
    const closeBtn = root.querySelector('[data-sp-close]');

    let lastIdx = -1;
    let timer = null;
    let dismissed = false;

    function render(idx) {
      const it = items[idx];
      if (!it) return;
      if (cityEl) cityEl.textContent = it.city;
      if (productEl) productEl.textContent = it.product;
      if (agoEl) agoEl.textContent = it.ago || '';
    }

    function show() {
      const next = pickNext(items, lastIdx);
      if (next === null) return;
      lastIdx = next;
      render(next);
      root.hidden = false;
      root.classList.add('is-entering');
      requestAnimationFrame(() => {
        root.classList.remove('is-entering');
        root.classList.add('is-visible');
      });
      // Auto-hide after 5s
      setTimeout(() => {
        root.classList.remove('is-visible');
        setTimeout(() => {
          root.hidden = true;
        }, 300);
      }, 5000);
    }

    function start() {
      const delay = (parseInt(root.dataset.delay, 10) || 8) * 1000;
      const interval = (parseInt(root.dataset.interval, 10) || 12) * 1000;
      setTimeout(() => {
        if (dismissed) return;
        show();
        timer = setInterval(() => {
          if (dismissed) return;
          show();
        }, interval);
      }, delay);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissed = true;
        if (timer) clearInterval(timer);
        root.classList.remove('is-visible');
        setTimeout(() => {
          root.hidden = true;
        }, 300);
      });
    }

    start();
  },
};

export default SocialProof;
