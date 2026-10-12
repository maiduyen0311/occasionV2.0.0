// "Buy more, save more" bundle (snippets/product-bundle.liquid): per-item
// variant selects + quantity, running total with discount preview, and one
// button that adds every checked item through the shared mini-cart addToCart.
import { addToCart } from './mini-cart.js';
import { formatMoney } from './money.js';

function initBundle(root) {
  if (root.dataset.bound === '1') return;
  root.dataset.bound = '1';

  const fmt = root.dataset.moneyFormat;
  const discount = Number(root.dataset.discount) || 0;
  const minItems = Number(root.dataset.minItems) || 3;
  const items = [...root.querySelectorAll('[data-bundle-item]')];
  const totalEl = root.querySelector('[data-bundle-total]');
  const totalCompareEl = root.querySelector('[data-bundle-total-compare]');
  const noteEl = root.querySelector('[data-bundle-note]');
  const addBtn = root.querySelector('[data-bundle-add]');

  const state = items.map((item) => {
    let variants = [];
    try { variants = JSON.parse(item.querySelector('[data-bundle-variants]').textContent); } catch (e) { /* no variants */ }
    return { item, variants, variant: null };
  });

  const qtyOf = (s) => Math.max(1, Number(s.item.querySelector('[data-bundle-quantity]').value) || 1);

  const pickVariant = (s) => {
    const selects = [...s.item.querySelectorAll('[data-bundle-option]')];
    const wanted = selects.map((sel) => sel.value);
    s.variant = s.variants.find((v) => wanted.every((val, i) => v.options[i] === val)) || s.variants[0] || null;
    const v = s.variant;
    const check = s.item.querySelector('[data-bundle-check]');
    if (!v) return;
    s.item.querySelector('[data-bundle-variant]').value = v.id;
    s.item.querySelector('[data-bundle-price]').textContent = formatMoney(v.price, fmt);
    const cmp = s.item.querySelector('[data-bundle-compare]');
    const onSale = v.compare_at_price > v.price;
    cmp.hidden = !onSale;
    if (onSale) cmp.textContent = formatMoney(v.compare_at_price, fmt);
    if (v.image) { const img = s.item.querySelector('[data-bundle-image]'); if (img) { img.srcset = ''; img.src = v.image; } }
    check.disabled = !v.available;
    if (!v.available) check.checked = false;
    s.item.classList.toggle('is-unavailable', !v.available);
  };

  const update = () => {
    const picked = state.filter((s) => s.item.querySelector('[data-bundle-check]').checked && s.variant);
    const count = picked.reduce((n, s) => n + qtyOf(s), 0);
    const total = picked.reduce((sum, s) => sum + s.variant.price * qtyOf(s), 0);
    const applies = discount > 0 && count >= minItems;
    totalEl.textContent = formatMoney(applies ? Math.round(total * (100 - discount) / 100) : total, fmt);
    totalCompareEl.hidden = !applies;
    if (applies) totalCompareEl.textContent = formatMoney(total, fmt);
    if (noteEl) noteEl.hidden = !applies;
    addBtn.disabled = picked.length === 0;
    items.forEach((it) => it.classList.toggle('is-checked', it.querySelector('[data-bundle-check]').checked));
  };

  state.forEach((s) => {
    pickVariant(s);
    s.item.querySelectorAll('[data-bundle-option]').forEach((sel) => sel.addEventListener('change', () => { pickVariant(s); update(); }));
    s.item.querySelector('[data-bundle-check]').addEventListener('change', update);
    const qty = s.item.querySelector('[data-bundle-quantity]');
    s.item.querySelectorAll('[data-bundle-qty]').forEach((btn) => btn.addEventListener('click', () => {
      qty.value = Math.max(1, (Number(qty.value) || 1) + Number(btn.dataset.bundleQty));
      update();
    }));
    qty.addEventListener('change', update);
  });

  addBtn.addEventListener('click', async () => {
    const lines = state
      .filter((s) => s.item.querySelector('[data-bundle-check]').checked && s.variant && s.variant.available)
      .map((s) => ({ id: s.variant.id, quantity: qtyOf(s) }));
    if (!lines.length) return;
    addBtn.classList.add('is-loading');
    try { await addToCart(lines); } catch (err) { window.TmCart?.toast?.(err.message); }
    addBtn.classList.remove('is-loading');
  });

  update();
}

function initShare(btn) {
  if (btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';
  btn.addEventListener('click', async () => {
    const url = btn.dataset.shareUrl || window.location.href;
    if (navigator.share) {
      try { await navigator.share({ url, title: document.title }); return; } catch (e) { /* cancelled → copy */ }
    }
    try { await navigator.clipboard.writeText(url); } catch (e) { return; }
    const msg = btn.querySelector('[data-bundle-copied]');
    if (msg) { msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 1800); }
  });
}

export default {
  init() {
    document.querySelectorAll('[data-product-bundle]').forEach(initBundle);
    document.querySelectorAll('[data-bundle-share]').forEach(initShare);
  },
};
