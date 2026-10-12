// Wishlist module — localStorage-backed, no backend. See SPEC §5.6.
//
// Public API:
//   Wishlist.list()            -> string[] of product handles
//   Wishlist.has(handle)       -> boolean
//   Wishlist.count()           -> number
//   Wishlist.add(handle)       -> void
//   Wishlist.remove(handle)    -> void
//   Wishlist.toggle(handle)    -> 'added' | 'removed'
//   Wishlist.clear()           -> void
//   Wishlist.init()            -> bind DOM handlers (idempotent per element)
//
// Every state change dispatches a CustomEvent on `document`:
//   'wishlist:change' { detail: { count, list, changed } }
//
// DOM contract:
//   [data-wishlist-toggle="<handle>"]  — click toggle; aria-pressed + .is-wished synced
//   [data-wishlist-count]              — textContent set to current count
//
// No jQuery. ES module default export.

const STORAGE_KEY = 'topmarket:wishlist';
const META_KEY = 'topmarket:wishlist:meta'; // { handle: addedAtTimestamp } — shown on the wishlist page
const EVENT_CHANGE = 'wishlist:change';

const hasStorage = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__tm_wl_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch (_) {
    return false;
  }
})();

// In-memory fallback if localStorage is unavailable (Safari private mode, etc.)
let memoryStore = [];

function readRaw() {
  if (!hasStorage) return memoryStore.slice();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((h) => typeof h === 'string' && h.length > 0);
  } catch (_) {
    return [];
  }
}

function readMeta() {
  if (!hasStorage) return {};
  try {
    const meta = JSON.parse(window.localStorage.getItem(META_KEY) || '{}');
    return meta && typeof meta === 'object' ? meta : {};
  } catch (_) {
    return {};
  }
}

// Keep one "added at" timestamp per saved handle (new ones = now, removed ones pruned)
function writeMeta(list) {
  if (!hasStorage) return;
  const prev = readMeta();
  const next = {};
  list.forEach((h) => { next[h] = prev[h] || Date.now(); });
  try { window.localStorage.setItem(META_KEY, JSON.stringify(next)); } catch (_) { /* quota */ }
}

function writeRaw(arr) {
  const clean = Array.isArray(arr)
    ? arr.filter((h) => typeof h === 'string' && h.length > 0)
    : [];
  writeMeta(clean);
  if (!hasStorage) {
    memoryStore = clean.slice();
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (_) {
    memoryStore = clean.slice();
  }
}

function emitChange(changed) {
  const list = readRaw();
  const detail = { count: list.length, list, changed: changed || null };
  try {
    document.dispatchEvent(new CustomEvent(EVENT_CHANGE, { detail }));
  } catch (_) {
    // CustomEvent missing (very old browser) — silent fallback.
  }
  syncCountBadges(list.length);
  syncToggleButtons();
}

function syncCountBadges(count) {
  const badges = document.querySelectorAll('[data-wishlist-count]');
  badges.forEach((el) => {
    el.textContent = String(count);
    if (count > 0) {
      el.removeAttribute('hidden');
    }
  });
}

function syncToggleButtons() {
  const list = readRaw();
  const set = new Set(list);
  const buttons = document.querySelectorAll('[data-wishlist-toggle]');
  buttons.forEach((btn) => {
    const handle = btn.getAttribute('data-wishlist-toggle');
    if (!handle) return;
    const wished = set.has(handle);
    btn.setAttribute('aria-pressed', wished ? 'true' : 'false');
    btn.classList.toggle('is-wished', wished);
  });
}

function handleToggleClick(event) {
  const btn = event.currentTarget;
  if (!btn) return;
  const handle = btn.getAttribute('data-wishlist-toggle');
  if (!handle) return;
  event.preventDefault();
  Wishlist.toggle(handle);
}

const Wishlist = {
  STORAGE_KEY,
  EVENT_CHANGE,

  list() {
    return readRaw();
  },

  has(handle) {
    if (!handle) return false;
    return readRaw().indexOf(handle) !== -1;
  },

  count() {
    return readRaw().length;
  },

  add(handle) {
    if (!handle) return;
    const list = readRaw();
    if (list.indexOf(handle) !== -1) return;
    list.push(handle);
    writeRaw(list);
    emitChange(handle);
  },

  remove(handle) {
    if (!handle) return;
    const list = readRaw();
    const idx = list.indexOf(handle);
    if (idx === -1) return;
    list.splice(idx, 1);
    writeRaw(list);
    emitChange(handle);
  },

  toggle(handle) {
    if (!handle) return 'removed';
    const list = readRaw();
    const idx = list.indexOf(handle);
    if (idx === -1) {
      list.push(handle);
      writeRaw(list);
      emitChange(handle);
      return 'added';
    }
    list.splice(idx, 1);
    writeRaw(list);
    emitChange(handle);
    return 'removed';
  },

  meta() {
    return readMeta();
  },

  set(list) {
    writeRaw(list);
    emitChange(null);
  },

  clear() {
    writeRaw([]);
    emitChange(null);
  },

  init() {
    if (typeof document === 'undefined') return;
    const buttons = document.querySelectorAll('[data-wishlist-toggle]');
    buttons.forEach((btn) => {
      if (btn.dataset.wishlistBound === '1') return;
      btn.dataset.wishlistBound = '1';
      btn.addEventListener('click', handleToggleClick);
    });
    // Sync initial state for both newly-bound and pre-existing buttons.
    syncToggleButtons();
    syncCountBadges(readRaw().length);
  },
};

export default Wishlist;
