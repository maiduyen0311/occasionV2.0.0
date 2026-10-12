// Mini cart dropdown — snippets/cart-drawer.liquid (design/dropcart.jpg, Mini-Cart.jpg).
//
// Dawn's <cart-drawer> Web Component (assets/cart-drawer.js) still owns
// open/close, focus trap and re-rendering; cart.js owns quantity/remove.
// This module adds:
//   • positioning: the panel drops down under the header cart icon
//     (CSS vars --mini-cart-top / --mini-cart-right set on open and while
//     scrolling). Page scroll is NOT locked: Dawn's body.overflow-hidden is
//     removed, the panel is position:fixed so it stays on screen.
//   • tool panels: order note (saved to cart.note), shipping estimate,
//     coupon code (kept in localStorage, applied at checkout via /discount/<code>)
//   • gift wrap "ADD"
//   • addToCart(items) — shared AJAX add used by product cards, PDP, quick view
//   • header count sync: mirrors #cart-icon-bubble's count to every [data-cart-count]
//
// Everything is event-delegated, so it keeps working after the drawer HTML is
// replaced by the Section Rendering API.

import { fillProvinces, preselectCountry, estimateShippingHtml } from './cart-page.js';

const COUPON_KEY = 'tm_coupon';
const drawer = () => document.querySelector('cart-drawer');

const readCoupon = () => {
  try { return localStorage.getItem(COUPON_KEY) || ''; } catch (_) { return ''; }
};
const writeCoupon = (code) => {
  try {
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
  } catch (_) { /* storage blocked */ }
};

function toast(message) {
  let el = document.getElementById('TmToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'TmToast';
    el.className = 'tm-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('is-visible'), 2400);
}

// ---------------------------------------------------------------------------
// Position the dropdown under the visible cart icon
// ---------------------------------------------------------------------------
function placeUnderIcon(el) {
  const icons = [...document.querySelectorAll('#cart-icon-bubble, #cart-icon-bubble-mobile')];
  const icon = icons.find((i) => i.offsetParent !== null && i.getBoundingClientRect().width > 0);
  if (!icon) return;
  const r = icon.getBoundingClientRect();
  const top = Math.max(8, Math.round(r.bottom + 14));
  const right = Math.max(8, Math.round(window.innerWidth - r.right - 16));
  el.style.setProperty('--mini-cart-top', `${top}px`);
  el.style.setProperty('--mini-cart-right', `${right}px`);
  el.style.setProperty('--mini-cart-arrow', `${Math.round(window.innerWidth - (r.left + r.width / 2) - right)}px`);
}

// Below 992px the mini cart is a side panel (_cart-drawer.scss), not a dropdown
const isSidePanel = () => window.matchMedia('(max-width: 991.98px)').matches;

customElements.whenDefined('cart-drawer').then(() => {
  const CartDrawer = customElements.get('cart-drawer');
  if (CartDrawer.prototype.tmPatched) return;
  CartDrawer.prototype.tmPatched = true;
  const open = CartDrawer.prototype.open;
  CartDrawer.prototype.open = function patchedOpen(triggeredBy) {
    const sidePanel = isSidePanel();
    if (!sidePanel) placeUnderIcon(this);
    refreshCoupon(this);
    const result = open.call(this, triggeredBy);
    // Desktop dropdown keeps the page scrollable; the mobile side panel keeps
    // Dawn's scroll lock like the menu drawer.
    if (!sidePanel) document.body.classList.remove('overflow-hidden');
    return result;
  };
  const close = CartDrawer.prototype.close;
  CartDrawer.prototype.close = function patchedClose() {
    this.querySelectorAll('[data-mini-panel]').forEach((p) => { p.hidden = true; });
    return close.call(this);
  };
});

// ---------------------------------------------------------------------------
// Shared add-to-cart
// ---------------------------------------------------------------------------
export async function addToCart(items) {
  const d = drawer();
  const body = { items };
  if (d) {
    body.sections = 'cart-drawer,cart-icon-bubble';
    body.sections_url = window.location.pathname;
  }
  const resp = await fetch(`${window.routes?.cart_add_url || '/cart/add'}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!resp.ok || json.status) throw new Error(json.description || json.message || 'Could not add to cart');
  if (d && json.sections && typeof d.renderContents === 'function') {
    d.renderContents(json);
  } else {
    const cart = await (await fetch(`${window.routes?.cart_url || '/cart'}.js`)).json();
    syncCount(cart.item_count);
    toast(window.tmStrings?.addedToCart || 'Added to cart');
  }
  document.dispatchEvent(new CustomEvent('tm:cart-updated', { detail: json }));
  return json;
}

// ---------------------------------------------------------------------------
// Header count sync (#cart-icon-bubble is re-rendered by Dawn; mobile badge isn't)
// ---------------------------------------------------------------------------
// Only writes when the value differs — the bubble itself is observed below, so
// an unconditional write would re-trigger the observer forever.
function syncCount(count) {
  const value = String(count).trim();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    if (el.textContent.trim() !== value) el.textContent = value;
  });
}

function watchBubble() {
  const bubble = document.getElementById('cart-icon-bubble');
  if (!bubble || bubble.dataset.tmWatched === '1') return;
  bubble.dataset.tmWatched = '1';
  // Dawn replaces the bubble's innerHTML after cart changes → copy its count to
  // the other badges (mobile header). Only childList: our own writes elsewhere
  // never touch the bubble's children.
  new MutationObserver(() => {
    const total = bubble.querySelector('[data-cart-total-source]')?.textContent;
    if (total != null) {
      document.querySelectorAll('[data-cart-total]').forEach((el) => {
        if (el.textContent.trim() !== total.trim()) el.textContent = total.trim();
      });
    }
    const n = bubble.querySelector('[data-cart-count]')?.textContent;
    if (n == null) return;
    const value = n.trim();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      if (!bubble.contains(el) && el.textContent.trim() !== value) el.textContent = value;
    });
  }).observe(bubble, { childList: true });
}

// ---------------------------------------------------------------------------
// Coupon chip
// ---------------------------------------------------------------------------
function refreshCoupon(root = drawer()) {
  if (!root) return;
  const code = readCoupon();
  const chip = root.querySelector('[data-mini-coupon-chip]');
  if (chip) {
    chip.hidden = !code;
    const out = chip.querySelector('[data-mini-coupon-code]');
    if (out) out.textContent = code;
  }
  const input = root.querySelector('[data-mini-coupon]');
  if (input && !input.value) input.value = code;
  root.querySelector('[data-mini-panel-open="coupon"]')?.classList.toggle('has-value', !!code);
}

// ---------------------------------------------------------------------------
// Panels + actions (delegated)
// ---------------------------------------------------------------------------
function openPanel(root, name) {
  root.querySelectorAll('[data-mini-panel]').forEach((p) => { p.hidden = p.dataset.miniPanel !== name; });
  const panel = root.querySelector(`[data-mini-panel="${name}"]`);
  if (!panel) return;
  if (name === 'shipping') {
    const country = panel.querySelector('[data-mini-country]');
    const province = panel.querySelector('[data-mini-province]');
    if (country && province && !province.options.length) {
      preselectCountry(country);
      fillProvinces(country, province);
    }
  }
  if (name === 'coupon') refreshCoupon(root);
  panel.querySelector('textarea, input, select')?.focus({ preventScroll: true });
}

async function onClick(event) {
  const t = event.target.closest(
    '[data-mini-panel-open],[data-mini-panel-close],[data-mini-note-save],[data-mini-estimate],[data-mini-coupon-save],[data-mini-coupon-remove],[data-mini-gift],[data-mini-checkout]'
  );
  if (!t) return;
  const root = t.closest('cart-drawer');
  if (!root) return;

  if (t.matches('[data-mini-panel-open]')) return openPanel(root, t.dataset.miniPanelOpen);

  if (t.matches('[data-mini-panel-close]')) {
    t.closest('[data-mini-panel]').hidden = true;
    return undefined;
  }

  if (t.matches('[data-mini-note-save]')) {
    const note = root.querySelector('[data-mini-note]')?.value || '';
    t.disabled = true;
    try {
      await fetch(`${window.routes?.cart_update_url || '/cart/update'}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note }),
      });
      root.querySelector('[data-mini-panel-open="note"]')?.classList.toggle('has-value', !!note.trim());
      t.closest('[data-mini-panel]').hidden = true;
    } finally {
      t.disabled = false;
    }
    return undefined;
  }

  if (t.matches('[data-mini-estimate]')) {
    const panel = t.closest('[data-mini-panel]');
    const out = panel.querySelector('[data-mini-rates]');
    out.textContent = '…';
    out.innerHTML = await estimateShippingHtml(
      panel.querySelector('[data-mini-country]'),
      panel.querySelector('[data-mini-province]'),
      panel.querySelector('[data-mini-zip]')
    );
    return undefined;
  }

  if (t.matches('[data-mini-coupon-save]')) {
    writeCoupon((root.querySelector('[data-mini-coupon]')?.value || '').trim());
    refreshCoupon(root);
    t.closest('[data-mini-panel]').hidden = true;
    return undefined;
  }

  if (t.matches('[data-mini-coupon-remove]')) {
    writeCoupon('');
    const input = root.querySelector('[data-mini-coupon]');
    if (input) input.value = '';
    refreshCoupon(root);
    return undefined;
  }

  if (t.matches('[data-mini-gift]')) {
    t.disabled = true;
    try {
      await addToCart([{ id: Number(t.dataset.miniGift), quantity: 1 }]);
    } catch (e) {
      toast(e.message);
      t.disabled = false;
    }
    return undefined;
  }

  if (t.matches('[data-mini-checkout]')) {
    const code = readCoupon();
    if (!code) return undefined; // normal form submit → /cart → checkout
    event.preventDefault();
    window.location.href = `/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent('/checkout')}`;
  }
  return undefined;
}

function onChange(event) {
  const country = event.target.closest('[data-mini-country]');
  if (!country) return;
  const province = country.closest('[data-mini-panel]')?.querySelector('[data-mini-province]');
  if (province) fillProvinces(country, province);
}

const MiniCart = {
  init() {
    watchBubble();
    if (document.documentElement.dataset.miniCartBound === '1') return;
    document.documentElement.dataset.miniCartBound = '1';
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    // Follow the (sticky) header while the page scrolls under the open dropdown
    let raf = 0;
    const follow = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = drawer();
        if (d?.classList.contains('active') && !isSidePanel()) placeUnderIcon(d);
      });
    };
    window.addEventListener('resize', follow);
    window.addEventListener('scroll', follow, { passive: true });
  },
  addToCart,
  toast,
};

window.TmCart = MiniCart; // for inline section scripts (PDP)

export default MiniCart;
