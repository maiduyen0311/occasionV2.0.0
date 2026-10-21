// "Load more" button of the product grid section (sections/home-product-grid.liquid, View all
// button action = Load more products): the next products are already in the list, hidden; each
// click shows data-load-more-step more and hides the button when none are left. Delegated, so
// theme-editor re-renders keep working.

function onClick(event) {
  const btn = event.target.closest('[data-load-more]');
  if (!btn) return;
  const list = document.getElementById(btn.dataset.loadMore);
  if (!list) return;
  const step = Number(list.dataset.loadMoreStep) || 4;
  const hidden = [...list.children].filter((li) => li.hidden);
  hidden.slice(0, step).forEach((li) => { li.hidden = false; });
  if (hidden.length <= step) btn.closest('.oc-product-grid__more').hidden = true;
}

function init() {
  if (document.documentElement.dataset.loadMoreBound === '1') return;
  document.documentElement.dataset.loadMoreBound = '1';
  document.addEventListener('click', onClick);
}

export default { init };
