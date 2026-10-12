// Collection grid view switcher (3 cols / 4 cols / list) — design/Collection.jpg.
//
// Buttons: [data-collection-views] [data-view="grid-3|grid-4|list"] in the
// toolbar of sections/main-collection-product-grid.liquid. The choice is
// applied as `data-view` on #ProductGridContainer and remembered per visitor.
// Dawn's facets.js replaces the grid via AJAX when filters change, so a
// MutationObserver re-applies the view to the fresh markup.

const STORAGE_KEY = 'tm_collection_view';
const VIEWS = ['grid-3', 'grid-4', 'list'];

function readView() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return VIEWS.includes(v) ? v : null;
  } catch (_) {
    return null;
  }
}

function saveView(view) {
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch (_) {
    /* private mode — ignore */
  }
}

function apply(view) {
  const container = document.getElementById('ProductGridContainer');
  if (!container) return;
  const current = view || readView() || container.dataset.defaultView || 'grid-4';
  container.dataset.view = current;
  container.querySelectorAll('[data-collection-views] [data-view]').forEach((btn) => {
    const on = btn.dataset.view === current;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

let observer = null;

const CollectionView = {
  init() {
    const container = document.getElementById('ProductGridContainer');
    if (!container) return;
    apply();

    if (document.documentElement.dataset.collectionViewBound !== '1') {
      document.documentElement.dataset.collectionViewBound = '1';
      document.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-collection-views] [data-view]');
        if (!btn) return;
        event.preventDefault();
        saveView(btn.dataset.view);
        apply(btn.dataset.view);
      });
    }

    if (!observer && container.parentElement) {
      observer = new MutationObserver(() => {
        const c = document.getElementById('ProductGridContainer');
        if (c && !c.dataset.view) apply();
      });
      observer.observe(container.parentElement, { childList: true, subtree: true });
    }
  },
};

export default CollectionView;
