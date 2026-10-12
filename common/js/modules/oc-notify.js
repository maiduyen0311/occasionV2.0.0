// Occasion confirmation popups — design/old-demo/states/old-add-to-cart.png, old-wishlist-click.png.
//
//   • Add to cart (Theme settings → Cart → "After adding to cart" = Show a confirmation popup):
//     the mini cart is refreshed but not opened; a popup shows the product with
//     "is added to your shopping cart" and Continue shopping / Go to cart.
//   • Wishlist add (Theme settings → "Wishlist popup"): same popup with "is added to your wish list"
//     and Continue shopping / Go to wishlist.
// Settings and strings come from window.ocSettings (layout/theme.liquid).

const cfg = () => window.ocSettings || {};

let root;
function ensureRoot() {
  if (root) return root;
  root = document.createElement('div');
  root.className = 'oc-notify';
  root.hidden = true;
  root.innerHTML = `
    <div class="oc-notify__overlay" data-oc-notify-close></div>
    <div class="oc-notify__box" role="dialog" aria-modal="true" aria-labelledby="OcNotifyTitle" tabindex="-1">
      <button type="button" class="oc-notify__close" data-oc-notify-close aria-label="${cfg().strings?.close || 'Close'}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>
      </button>
      <div class="oc-notify__media"></div>
      <div class="oc-notify__body">
        <p class="oc-notify__title" id="OcNotifyTitle"></p>
        <p class="oc-notify__message">
          <svg class="oc-notify__check" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>
          <span></span>
        </p>
        <div class="oc-notify__actions">
          <button type="button" class="oc-notify__btn" data-oc-notify-close></button>
          <a class="oc-notify__btn" href="#"></a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-oc-notify-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !root.hidden) close();
  });
  return root;
}

function close() {
  if (!root) return;
  root.classList.remove('is-open');
  setTimeout(() => { root.hidden = true; }, 200);
}

function show({ image, title, message, check = true, primaryLabel, primaryUrl }) {
  const el = ensureRoot();
  const s = cfg().strings || {};
  el.querySelector('.oc-notify__media').innerHTML = image ? `<img src="${image}" alt="" width="100" height="100">` : '';
  el.querySelector('.oc-notify__title').textContent = title || '';
  el.querySelector('.oc-notify__message span').textContent = message;
  el.querySelector('.oc-notify__check').style.display = check ? '' : 'none';
  const [cont, primary] = el.querySelectorAll('.oc-notify__btn');
  cont.textContent = s.continueShopping || 'Continue shopping';
  primary.textContent = primaryLabel;
  primary.href = primaryUrl;
  el.hidden = false;
  requestAnimationFrame(() => {
    el.classList.add('is-open');
    el.querySelector('.oc-notify__box').focus();
  });
}

const sized = (url, width = 200) => {
  if (!url) return '';
  const u = url.startsWith('//') ? `https:${url}` : url;
  return u.includes('?') ? `${u}&width=${width}` : `${u}?width=${width}`;
};

// Cart: called with the /cart/add.js response (single item, or { items: [...] })
export function cartAdded(json) {
  const item = json?.items ? json.items[json.items.length - 1] : json;
  if (!item || !item.product_title) return;
  const s = cfg().strings || {};
  show({
    image: sized(item.featured_image?.url || item.image),
    title: item.product_title,
    message: s.addedToCart || 'is added to your shopping cart.',
    primaryLabel: s.goToCart || 'Go to cart',
    primaryUrl: window.routes?.cart_url || '/cart',
  });
}

export const cartPopupEnabled = () => cfg().cartFeedback === 'popup';

function onWishlistChange(event) {
  const changed = event.detail?.changed;
  if (!cfg().wishlistPopup || !changed) return;
  // `changed` is the handle; it was an add when the handle is now in the list
  const handle = typeof changed === 'string' ? changed : changed.handle;
  if (!handle || !(event.detail.list || []).includes(handle)) return;
  const s = cfg().strings || {};
  fetch(`${window.Shopify?.routes?.root || '/'}products/${handle}.js`)
    .then((r) => (r.ok ? r.json() : null))
    .then((p) => {
      if (!p) return;
      show({
        image: sized(p.featured_image),
        title: p.title,
        message: s.addedToWishlist || 'is added to your wish list.',
        check: false,
        primaryLabel: s.goToWishlist || 'Go to wishlist',
        primaryUrl: cfg().wishlistUrl || '/pages/wishlist',
      });
    })
    .catch(() => {});
}

function init() {
  if (document.documentElement.dataset.ocNotifyBound === '1') return;
  document.documentElement.dataset.ocNotifyBound = '1';
  document.addEventListener('wishlist:change', onWishlistChange);
}

export default { init, show, cartAdded, cartPopupEnabled };
