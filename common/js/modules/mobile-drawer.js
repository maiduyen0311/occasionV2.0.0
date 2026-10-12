// Mobile off-canvas drawer + search overlay — vanilla, no jQuery.
//
// DOM contract:
//   • [data-mobile-drawer-open]   button (hamburger)
//   • [data-mobile-drawer-close]  close button OR backdrop
//   • [data-mobile-drawer]        the drawer root (#MobileDrawer)
//   • [data-mobile-search-open]   button (magnifier in header bar)
//   • [data-mobile-search-close]  close × in the search row
//   • #MobileSearch               the search overlay root
//   • [data-mobile-drawer-tab]    Menu / Categories tab buttons (aria-controls → pane)
//   • [data-mobile-drawer-expand] +/− button that opens a nested menu list
//   • [data-mobile-drawer-extras] slot filled from the header section's
//                                 <template data-mobile-drawer-extras-source>
//
// State:
//   • body.mobile-drawer-locked   added when drawer is open (scroll lock)
//   • body.mobile-search-locked   added when search overlay is open
//   • .mobile-drawer.is-open      controls transform + backdrop opacity
//
// Idempotent: re-running init() on the same DOM is a no-op (dataset flag).

const BOUND_FLAG = 'mobileDrawerBound';
const SEARCH_BOUND_FLAG = 'mobileSearchBound';

let openTrigger = null;
let openDrawerEl = null;
let searchTrigger = null;
let openSearchEl = null;

function focusableInside(root) {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function trapKey(event) {
  if (event.key === 'Escape') {
    if (openDrawerEl) closeDrawer();
    else if (openSearchEl) closeSearch();
    return;
  }
  if (event.key !== 'Tab') return;
  const root = openDrawerEl || openSearchEl;
  if (!root) return;
  const focusables = focusableInside(root);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openDrawer(trigger) {
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (!drawer || openDrawerEl) return;
  openTrigger = trigger || document.activeElement;
  openDrawerEl = drawer;
  drawer.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');
  // force reflow so the transition kicks in
  // eslint-disable-next-line no-unused-expressions
  drawer.offsetWidth;
  drawer.classList.add('is-open');
  document.body.classList.add('mobile-drawer-locked');
  document.addEventListener('keydown', trapKey);
  const panel = drawer.querySelector('.mobile-drawer__panel');
  if (panel && typeof panel.focus === 'function') {
    setTimeout(() => panel.focus(), 30);
  }
  document.querySelectorAll('[data-mobile-drawer-open]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'true');
  });
}

function closeDrawer() {
  if (!openDrawerEl) return;
  const drawer = openDrawerEl;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('mobile-drawer-locked');
  document.removeEventListener('keydown', trapKey);
  // wait for transition before hiding (matches 0.25s in SCSS)
  setTimeout(() => {
    drawer.hidden = true;
  }, 260);
  document.querySelectorAll('[data-mobile-drawer-open]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
  if (openTrigger && typeof openTrigger.focus === 'function') {
    openTrigger.focus();
  }
  openTrigger = null;
  openDrawerEl = null;
}

function openSearch(trigger) {
  const search = document.getElementById('MobileSearch');
  if (!search || openSearchEl) return;
  searchTrigger = trigger || document.activeElement;
  openSearchEl = search;
  search.hidden = false;
  document.body.classList.add('mobile-search-locked');
  document.addEventListener('keydown', trapKey);
  const input = search.querySelector('[data-mobile-search-input]');
  if (input) setTimeout(() => input.focus(), 30);
  document.querySelectorAll('[data-mobile-search-open]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'true');
  });
}

function closeSearch() {
  if (!openSearchEl) return;
  openSearchEl.hidden = true;
  document.body.classList.remove('mobile-search-locked');
  document.removeEventListener('keydown', trapKey);
  document.querySelectorAll('[data-mobile-search-open]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
  if (searchTrigger && typeof searchTrigger.focus === 'function') {
    searchTrigger.focus();
  }
  searchTrigger = null;
  openSearchEl = null;
}

function selectTab(tab) {
  const tabs = tab.closest('[role="tablist"]')?.querySelectorAll('[data-mobile-drawer-tab]') || [];
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
    t.tabIndex = active ? 0 : -1;
    const pane = document.getElementById(t.getAttribute('aria-controls'));
    if (pane) pane.hidden = !active;
  });
}

function toggleSub(button) {
  const sub = document.getElementById(button.getAttribute('aria-controls'));
  if (!sub) return;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  sub.hidden = !open;
  button.closest('.mobile-drawer__item')?.classList.toggle('is-open', open);
}

// The header section owns wishlist/account/help/currency/language settings, the
// navigation section owns the drawer — copy the header's template into the slot.
function fillExtras() {
  const source = document.querySelector('template[data-mobile-drawer-extras-source]');
  const slot = document.querySelector('[data-mobile-drawer-extras]');
  if (!source || !slot) return;
  slot.replaceChildren(source.content.cloneNode(true));
}

let delegated = false;
function bindDelegated() {
  if (delegated) return;
  delegated = true;
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-mobile-drawer-tab]');
    if (tab) {
      selectTab(tab);
      return;
    }
    const expand = event.target.closest('[data-mobile-drawer-expand]');
    if (expand) {
      toggleSub(expand);
    }
  });
  // Arrow keys move between the two tabs (WAI-ARIA tabs pattern)
  document.addEventListener('keydown', (event) => {
    const tab = event.target.closest?.('[data-mobile-drawer-tab]');
    if (!tab || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[data-mobile-drawer-tab]')];
    const next = tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
}

function init() {
  if (typeof document === 'undefined') return;

  fillExtras();
  bindDelegated();

  // Drawer open/close buttons (bind once per element via dataset flag)
  document.querySelectorAll('[data-mobile-drawer-open]').forEach((btn) => {
    if (btn.dataset[BOUND_FLAG] === '1') return;
    btn.dataset[BOUND_FLAG] = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(btn);
    });
  });

  document.querySelectorAll('[data-mobile-drawer-close]').forEach((el) => {
    if (el.dataset[BOUND_FLAG] === '1') return;
    el.dataset[BOUND_FLAG] = '1';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  });

  // Search overlay
  document.querySelectorAll('[data-mobile-search-open]').forEach((btn) => {
    if (btn.dataset[SEARCH_BOUND_FLAG] === '1') return;
    btn.dataset[SEARCH_BOUND_FLAG] = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch(btn);
    });
  });

  document.querySelectorAll('[data-mobile-search-close]').forEach((el) => {
    if (el.dataset[SEARCH_BOUND_FLAG] === '1') return;
    el.dataset[SEARCH_BOUND_FLAG] = '1';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeSearch();
    });
  });
}

export default { init };
