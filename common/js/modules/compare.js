// Compare list store — localStorage 'tm_compare' (array of product handles).
// Shared by product cards (card-actions.js), the PDP "Add Compare" action,
// the header compare icon and the compare page (compare-page.js).
//
// DOM contract:
//   [data-compare-toggle="<handle>"]  aria-pressed synced
//   [data-compare-count]              textContent = number of products
// Every change dispatches 'compare:change' { detail: { list, count, handle, added } } on document.

const KEY = 'tm_compare';
export const COMPARE_MAX = 8;

export function list() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((h) => typeof h === 'string' && /^[a-z0-9-]+$/i.test(h)) : [];
  } catch (_) {
    return [];
  }
}

function save(next, handle = null, added = null) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (_) { /* storage blocked */ }
  sync();
  document.dispatchEvent(new CustomEvent('compare:change', { detail: { list: next, count: next.length, handle, added } }));
}

export function has(handle) {
  return list().includes(handle);
}

/** Toggle a handle; returns true when it was added. Oldest item drops off past COMPARE_MAX. */
export function toggle(handle) {
  const current = list();
  const i = current.indexOf(handle);
  if (i >= 0) {
    current.splice(i, 1);
    save(current, handle, false);
    return false;
  }
  current.push(handle);
  while (current.length > COMPARE_MAX) current.shift();
  save(current, handle, true);
  return true;
}

export function remove(handle) {
  save(list().filter((h) => h !== handle), handle, false);
}

export function clear() {
  save([]);
}

export function sync() {
  const set = new Set(list());
  document.querySelectorAll('[data-compare-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', set.has(btn.dataset.compareToggle) ? 'true' : 'false');
  });
  document.querySelectorAll('[data-compare-count]').forEach((el) => {
    el.textContent = String(set.size);
  });
}

// Other tabs
window.addEventListener('storage', (e) => { if (e.key === KEY) sync(); });

const Compare = { list, has, toggle, remove, clear, sync, COMPARE_MAX };
window.TmCompare = Compare; // for inline section scripts (PDP)
export default Compare;
