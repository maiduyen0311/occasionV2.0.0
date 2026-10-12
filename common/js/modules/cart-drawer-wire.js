// Cart-drawer extra wiring — Dawn's `cart-drawer.js` only binds the desktop
// `#cart-icon-bubble` link. Our theme also has a mobile cart icon
// (`#cart-icon-bubble-mobile`) plus other places that should open the drawer.
// This module forwards clicks on `[data-cart-drawer-toggle]` (and the mobile
// icon by id) to the existing `<cart-drawer>` Web Component.
//
// No-op when:
//   • cart_type isn't "drawer" (the <cart-drawer> element isn't on the page)
//   • the user is already on /cart (page template, no drawer needed)

const BOUND_FLAG = 'cartDrawerWired';

function getDrawer() {
  return document.querySelector('cart-drawer');
}

function bindTrigger(el) {
  if (!el || el.dataset[BOUND_FLAG] === '1') return;
  el.dataset[BOUND_FLAG] = '1';
  el.addEventListener('click', (event) => {
    const drawer = getDrawer();
    if (!drawer || typeof drawer.open !== 'function') return; // fall back to <a href="/cart">
    event.preventDefault();
    drawer.open(el);
  });
}

function init() {
  if (typeof document === 'undefined') return;
  // Mobile cart icon
  bindTrigger(document.getElementById('cart-icon-bubble-mobile'));
  // Any future opt-in triggers
  document.querySelectorAll('[data-cart-drawer-toggle]').forEach(bindTrigger);
}

export default { init };
