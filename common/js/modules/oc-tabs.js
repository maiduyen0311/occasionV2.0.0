// Occasion tabs + pager — sections home-top-rated-tabs / home-new-items.
//
//   [data-oc-tabs]                     root
//     [data-oc-tab="<i>"]              tab button (aria-selected)
//     [data-oc-panel="<i>"]            panel, [hidden] unless active
//   [data-oc-pager="<id>"][data-per-page="4"]   list whose children are paged
//   [data-oc-nav="<id>"] [data-oc-prev] / [data-oc-next]   "Prev / Next" buttons
//     <id> may name a pager directly or a tabs root (pages its active panel's pager)
//   [data-oc-feature] [data-oc-feature-thumb data-src data-srcset] → swaps [data-oc-feature-main]
//   [data-oc-sidebar-toggle aria-controls=id] → mobile collection sidebar panel (.is-oc-sidebar-open)
//
// Idempotent (dataset flags); delegated clicks so theme-editor re-renders keep working.

const BOUND = 'ocTabsBound';

function showPage(pager, page) {
  const per = Number(pager.dataset.perPage) || 4;
  const items = [...pager.children];
  const pages = Math.max(1, Math.ceil(items.length / per));
  const p = ((page % pages) + pages) % pages;
  pager.dataset.page = String(p);
  items.forEach((item, i) => {
    item.hidden = Math.floor(i / per) !== p;
  });
  return pages;
}

// Prev / Next: the current page slides out and the next one slides in (carousel), the way
// it moves following the button; plain swap when reduced motion is on
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function slidePage(pager, step) {
  const next = (Number(pager.dataset.page) || 0) + step;
  if (reduceMotion() || !pager.animate) {
    showPage(pager, next);
    return;
  }
  if (pager.dataset.sliding === '1') return;
  pager.dataset.sliding = '1';
  const clip = pager.parentElement;
  clip.classList.add('oc-pager-clip');
  try {
    await pager.animate(
      [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-step * 100}%)`, opacity: 0.4 }],
      { duration: 220, easing: 'ease-in' }
    ).finished;
    showPage(pager, next);
    await pager.animate(
      [{ transform: `translateX(${step * 100}%)`, opacity: 0.4 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 300, easing: 'ease-out' }
    ).finished;
  } finally {
    clip.classList.remove('oc-pager-clip');
    delete pager.dataset.sliding;
  }
}

function pagerFor(id) {
  const target = document.getElementById(id);
  if (!target) return null;
  if (target.matches('[data-oc-pager]')) return target;
  const panel = target.querySelector('[data-oc-panel]:not([hidden])');
  return panel?.querySelector('[data-oc-pager]') || target.querySelector('[data-oc-pager]');
}

function syncNav(id) {
  const pager = pagerFor(id);
  document.querySelectorAll(`[data-oc-nav="${id}"]`).forEach((nav) => {
    const per = Number(pager?.dataset.perPage) || 4;
    const many = pager && pager.children.length > per;
    nav.hidden = !many;
  });
}

function activate(root, index) {
  root.querySelectorAll('[data-oc-tab]').forEach((tab) => {
    const on = tab.dataset.ocTab === index;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-selected', on ? 'true' : 'false');
    tab.tabIndex = on ? 0 : -1;
  });
  root.querySelectorAll('[data-oc-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.ocPanel !== index;
  });
  if (root.id) syncNav(root.id);
}

function onClick(event) {
  const sidebarBtn = event.target.closest('[data-oc-sidebar-toggle]');
  if (sidebarBtn) {
    const panel = document.getElementById(sidebarBtn.getAttribute('aria-controls'));
    const open = !(panel && panel.classList.contains('is-oc-sidebar-open'));
    panel?.classList.toggle('is-oc-sidebar-open', open);
    document.documentElement.classList.toggle('oc-sidebar-locked', open);
    sidebarBtn.setAttribute('aria-expanded', String(open));
    sidebarBtn.textContent = open ? sidebarBtn.dataset.hideLabel : sidebarBtn.dataset.showLabel;
    return;
  }
const thumb = event.target.closest('[data-oc-feature-thumb]');
  if (thumb) {
    const root = thumb.closest('[data-oc-feature]');
    const main = root?.querySelector('[data-oc-feature-main], .oc-feature__image');
    if (main) {
      main.srcset = thumb.dataset.srcset || '';
      main.src = thumb.dataset.src;
    }
    root?.querySelectorAll('[data-oc-feature-thumb]').forEach((b) => b.classList.toggle('is-active', b === thumb));
    return;
  }
  // Colour dots on the featured product: select (ring) and show that colour's image
  const swatch = event.target.closest('[data-oc-feature-swatch]');
  if (swatch) {
    const root = swatch.closest('[data-oc-feature]');
    const main = root?.querySelector('[data-oc-feature-main], .oc-feature__image');
    if (main && swatch.dataset.src) {
      main.srcset = swatch.dataset.srcset || '';
      main.src = swatch.dataset.src;
    }
    swatch.closest('ul')?.querySelectorAll('[data-oc-feature-swatch]').forEach((b) => {
      b.classList.toggle('is-active', b === swatch);
      b.setAttribute('aria-pressed', b === swatch ? 'true' : 'false');
    });
    return;
  }
  const tab = event.target.closest('[data-oc-tab]');
  if (tab) {
    const root = tab.closest('[data-oc-tabs]');
    if (root) activate(root, tab.dataset.ocTab);
    return;
  }
  const btn = event.target.closest('[data-oc-prev], [data-oc-next]');
  const nav = btn?.closest('[data-oc-nav]');
  if (!nav) return;
  const pager = pagerFor(nav.dataset.ocNav);
  if (!pager) return;
  const step = btn.hasAttribute('data-oc-next') ? 1 : -1;
  slidePage(pager, step);
}

function onKeydown(event) {
  const tab = event.target.closest('[data-oc-tab]');
  if (!tab || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[data-oc-tab]')];
  const next = tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  next.focus();
  next.click();
}

function init() {
  document.querySelectorAll('[data-oc-pager]').forEach((pager) => {
    if (pager.dataset[BOUND] === '1') return;
    pager.dataset[BOUND] = '1';
    showPage(pager, 0);
  });
  document.querySelectorAll('[data-oc-nav]').forEach((nav) => syncNav(nav.dataset.ocNav));
  if (document.documentElement.dataset[BOUND] === '1') return;
  document.documentElement.dataset[BOUND] = '1';
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);
}

export default { init };
