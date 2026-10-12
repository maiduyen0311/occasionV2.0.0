// Product card hover actions — snippets/card-product.liquid (design/Hover-product.jpg)
//   [data-card-add="<variant id>"]     orange bar basket → AJAX add, opens the mini cart
//   [data-compare-toggle="<handle>"]   compare icon → compare.js store ('tm_compare')
// Quick view ([data-quick-view-trigger]) and wishlist ([data-wishlist-toggle])
// are handled by quick-view.js and wishlist.js.
// Delegated listeners → works for cards injected later (Recently viewed, AJAX filters).

import MiniCart from './mini-cart.js';
import Compare from './compare.js';

async function onClick(event) {
  const add = event.target.closest('[data-card-add]');
  if (add) {
    event.preventDefault();
    add.classList.add('is-loading');
    try {
      await MiniCart.addToCart([{ id: Number(add.dataset.cardAdd), quantity: 1 }]);
    } catch (e) {
      MiniCart.toast(e.message);
    } finally {
      add.classList.remove('is-loading');
    }
    return;
  }

  const cmp = event.target.closest('[data-compare-toggle]');
  if (cmp && !cmp.closest('[data-compare-page]')) {
    event.preventDefault();
    const added = Compare.toggle(cmp.dataset.compareToggle);
    const s = window.tmStrings || {};
    MiniCart.toast(added ? `${s.compareAdded || 'Added to compare'} (${Compare.list().length})` : s.compareRemoved || 'Removed from compare');
  }
}

const CardActions = {
  init() {
    Compare.sync();
    if (document.documentElement.dataset.cardActionsBound === '1') return;
    document.documentElement.dataset.cardActionsBound = '1';
    document.addEventListener('click', onClick);
  },
};

export default CardActions;
