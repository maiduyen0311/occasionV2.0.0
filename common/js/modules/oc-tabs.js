// Occasion tabs + pager — sections home-top-rated-tabs / home-new-items.
//
//   [data-oc-tabs]                     root
//     [data-oc-tab="<i>"]              tab button (aria-selected)
//     [data-oc-panel="<i>"]            panel, [hidden] unless active
//   [data-oc-pager="<id>"][data-per-page="4"]   list whose children are paged
//   [data-oc-nav="<id>"] [data-oc-prev] / [data-oc-next]   "Prev / Next" buttons
//     <id> may name a pager directly or a tabs root (pages its active panel's pager)
//   [data-oc-feature] [data-oc-feature-thumb data-src data-srcset] → swaps [data-oc-feature-main]
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
  const thumb = event.target.closest('[data-oc-feature-thumb]');
  if (thumb) {
    const root = thumb.closest('[data-oc-feature]');
    const main = root?.querySelector('[data-oc-feature-main]');
    if (main) {
      main.srcset = thumb.dataset.srcset || '';
      main.src = thumb.dataset.src;
    }
    root?.querySelectorAll('[data-oc-feature-thumb]').forEach((b) => b.classList.toggle('is-active', b === thumb));
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
  showPage(pager, (Number(pager.dataset.page) || 0) + step);
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
