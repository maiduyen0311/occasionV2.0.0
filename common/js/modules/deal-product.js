// Deal of the week (sections/home-deal-product.liquid): gallery slider,
// variant picker, quantity, add to cart (shared mini-cart addToCart) and
// buy it now. Idempotent per section root.
import { addToCart } from './mini-cart.js';
import { formatMoney, moneyFormatFor } from './money.js';

const pad = (n) => String(n).padStart(2, '0');

function initRoot(root) {
  if (root.dataset.dealBound === '1') return;
  root.dataset.dealBound = '1';
  const money = (cents) => formatMoney(cents, moneyFormatFor(root));

  // ---------------- Gallery ----------------
  const track = root.querySelector('[data-deal-track]');
  const slides = track ? [...track.children] : [];
  const thumbs = [...root.querySelectorAll('[data-deal-thumb]')];
  const indexEl = root.querySelector('[data-deal-index]');
  let index = 0;
  const go = (i) => {
    if (!slides.length) return;
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    thumbs.forEach((t, n) => t.classList.toggle('is-active', n === index));
    if (indexEl) indexEl.textContent = pad(index + 1);
  };
  root.querySelector('[data-deal-prev]')?.addEventListener('click', () => go(index - 1));
  root.querySelector('[data-deal-next]')?.addEventListener('click', () => go(index + 1));
  thumbs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.dealThumb))));

  // ---------------- Variants ----------------
  const form = root.querySelector('[data-deal-form]');
  if (!form) return;
  let variants = [];
  try { variants = JSON.parse(root.querySelector('[data-deal-variants]')?.textContent || '[]'); } catch (_) { /* none */ }
  const idInput = form.querySelector('[data-deal-variant]');
  const addBtn = form.querySelector('[data-deal-add]');
  const buyBtn = form.querySelector('[data-deal-buy]');
  const addLabel = addBtn ? addBtn.textContent.trim() : '';

  const selected = () => [...form.querySelectorAll('[data-option-index]')].map((fs) => fs.querySelector('input:checked')?.value);
  const update = () => {
    const opts = selected();
    const v = variants.find((x) => x.options.every((o, i) => opts[i] == null || o === opts[i]));
    form.querySelectorAll('[data-option-index]').forEach((fs, i) => {
      const val = fs.querySelector('[data-deal-option-value]');
      if (val) val.textContent = opts[i] || '';
      fs.querySelectorAll('.deal-product__value').forEach((l) => l.classList.toggle('is-selected', l.querySelector('input').checked));
    });
    if (!v) return;
    idInput.value = v.id;
    const price = root.querySelector('[data-deal-price]');
    const compare = root.querySelector('[data-deal-compare]');
    const sale = root.querySelector('[data-deal-sale]');
    if (price) price.textContent = money(v.price);
    const onSale = v.compare_at_price && v.compare_at_price > v.price;
    if (compare) { compare.hidden = !onSale; if (onSale) compare.textContent = money(v.compare_at_price); }
    if (sale) {
      sale.hidden = !onSale;
      if (onSale) sale.textContent = `${sale.dataset.saleWord} ${Math.round(((v.compare_at_price - v.price) * 100) / v.compare_at_price)}%`;
    }
    const sku = root.querySelector('[data-deal-sku]');
    if (sku) sku.textContent = v.sku || '';
    const stock = root.querySelector('[data-deal-stock]');
    if (stock) {
      stock.querySelector('.deal-product__stock-dot')?.classList.toggle('is-out', !v.available);
      const qty = v.inventory_management && v.inventory_quantity > 0 ? `${v.inventory_quantity} ` : '';
      stock.querySelector('[data-deal-stock-text]').textContent = v.available ? `${qty}${stock.dataset.inLabel}` : stock.dataset.outLabel;
    }
    if (addBtn) { addBtn.disabled = !v.available; addBtn.textContent = v.available ? addLabel : stock?.dataset.outLabel || addLabel; }
    if (buyBtn) buyBtn.disabled = !v.available;
    if (v.featured_media) {
      const i = slides.findIndex((s) => s.dataset.mediaId === String(v.featured_media.id));
      if (i >= 0) go(i);
    }
  };
  form.addEventListener('change', (e) => { if (e.target.matches('[data-option-index] input')) update(); });

  // ---------------- Quantity + buttons ----------------
  const qty = form.querySelector('[data-deal-qty-input]');
  form.querySelectorAll('[data-deal-qty]').forEach((b) => b.addEventListener('click', () => {
    qty.value = Math.max(1, Number(qty.value || 1) + Number(b.dataset.dealQty));
  }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    addBtn.classList.add('is-loading');
    try { await addToCart([{ id: Number(idInput.value), quantity: Number(qty.value || 1) }]); } catch (err) { window.TmCart?.toast?.(err.message); }
    addBtn.classList.remove('is-loading');
  });
  buyBtn?.addEventListener('click', () => {
    window.location.href = `/cart/${idInput.value}:${Math.max(1, Number(qty.value || 1))}`;
  });
}

export default {
  init() {
    document.querySelectorAll('[data-deal-product]').forEach(initRoot);
  },
};
