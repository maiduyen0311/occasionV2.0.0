// Quick-view modal — design/TopMarket_quickview.jpg.
//
// DOM contract:
//   • [data-quick-view-trigger]   button on product card; data-product-url
//   • [data-quick-view-modal]     modal shell (snippets/quick-view-modal.liquid)
//   • [data-quick-view-body]      where the rendered section lands
//   • [data-quick-view-close]     any close trigger
//
// Content comes from sections/quick-view.liquid via the Section Rendering API
// (`<product url>?section_id=quick-view`). It carries a JSON block with every
// variant, so picking option values resolves the real variant: hidden `id`,
// price / compare-at, SKU, stock badge, image and crossed-out values update,
// and Add to cart posts the right variant to /cart/add.js.
// Settings: Theme settings → "Occasion — Quick view" (settings.quick_view_*).

import Wishlist from './wishlist.js';

const BOUND_FLAG = 'qvBound';
const SECTION_ID = 'quick-view';
const SPINNER = '<div class="quick-view-modal__loading"><svg class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle></svg></div>';

let lastTrigger = null;
let modalEl = null;

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------
function getModal() {
  return document.querySelector('[data-quick-view-modal]');
}

function openModal(trigger) {
  modalEl = getModal();
  if (!modalEl) return;
  lastTrigger = trigger || document.activeElement;
  modalEl.hidden = false;
  modalEl.setAttribute('aria-hidden', 'false');
  // eslint-disable-next-line no-unused-expressions
  modalEl.offsetWidth; // reflow so the transition runs
  modalEl.classList.add('is-open');
  document.body.classList.add('quick-view-locked');
  document.addEventListener('keydown', onKeydown);
  const panel = modalEl.querySelector('.quick-view-modal__panel');
  if (panel) setTimeout(() => panel.focus(), 30);
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('quick-view-locked');
  document.removeEventListener('keydown', onKeydown);
  setTimeout(() => {
    modalEl.hidden = true;
    const body = modalEl.querySelector('[data-quick-view-body]');
    if (body) body.innerHTML = SPINNER;
  }, 260);
  if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  lastTrigger = null;
}

function onKeydown(event) {
  if (event.key === 'Escape') closeModal();
}

// ---------------------------------------------------------------------------
// Variant picker
// ---------------------------------------------------------------------------
function setupQuickView(root) {
  const dataEl = root.querySelector('[data-qv-product]');
  if (!dataEl) return;
  const product = JSON.parse(dataEl.textContent);
  const optionEls = [...root.querySelectorAll('[data-qv-option]')];
  const showSoldOut = root.dataset.showSoldOut === 'true';
  const $ = (sel) => root.querySelector(sel);

  // Current selection, one value per option position (1-based → index)
  const selected = product.options.map((_, i) => {
    const el = optionEls.find((o) => Number(o.dataset.qvOption) === i + 1);
    if (!el) return null;
    const select = el.querySelector('[data-qv-select]');
    if (select) return select.value;
    const btn = el.querySelector('[data-qv-value].is-selected') || el.querySelector('[data-qv-value]');
    return btn ? btn.dataset.qvValue : null;
  });

  const findVariant = (values) =>
    product.variants.find((v) => v.options.every((val, i) => values[i] == null || val === values[i]));

  // Does any available variant exist for option i = value, given other picks?
  const isValueAvailable = (i, value) =>
    product.variants.some((v) => v.available && v.options[i] === value &&
      v.options.every((val, j) => j === i || selected[j] == null || val === selected[j]));

  // When a hidden option's current value makes the combo impossible, move it
  // to a value that exists with the visible picks.
  const reconcileHidden = () => {
    optionEls.forEach((el) => {
      if (!el.hidden) return;
      const i = Number(el.dataset.qvOption) - 1;
      if (findVariant(selected)) return;
      const match = product.variants.find((v) => v.available &&
        v.options.every((val, j) => j === i || selected[j] == null || val === selected[j]))
        || product.variants.find((v) => v.options.every((val, j) => j === i || selected[j] == null || val === selected[j]));
      if (match) selected[i] = match.options[i];
    });
  };

  const showMedia = (mediaId) => {
    const slides = [...root.querySelectorAll('.quick-view__slide')];
    const target = slides.find((s) => Number(s.dataset.mediaId) === mediaId);
    if (!target) return;
    slides.forEach((s) => s.classList.toggle('is-active', s === target));
  };

  const render = () => {
    reconcileHidden();
    const variant = findVariant(selected);

    // Option UI
    optionEls.forEach((el) => {
      const i = Number(el.dataset.qvOption) - 1;
      const label = el.querySelector('[data-qv-option-value]');
      if (label) label.textContent = selected[i] || '';
      el.querySelectorAll('[data-qv-value]').forEach((btn) => {
        const on = btn.dataset.qvValue === selected[i];
        btn.classList.toggle('is-selected', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.classList.toggle('is-unavailable', showSoldOut && !isValueAvailable(i, btn.dataset.qvValue));
      });
      const select = el.querySelector('[data-qv-select]');
      if (select) {
        select.value = selected[i];
        [...select.options].forEach((opt) => {
          const unavailable = !isValueAvailable(i, opt.value);
          opt.textContent = opt.value + (showSoldOut && unavailable ? ` — ${product.strings.soldOut}` : '');
        });
      }
    });

    const idInput = $('[data-qv-variant-id]');
    const addBtn = $('[data-qv-add]');
    const addLabel = $('[data-qv-add-label]');
    const stock = $('[data-qv-stock]');

    if (!variant) {
      if (addBtn) addBtn.disabled = true;
      if (addLabel) addLabel.textContent = product.strings.unavailable;
      if (stock) { stock.textContent = product.strings.unavailable; stock.classList.add('is-sold-out'); }
      return;
    }

    if (idInput) idInput.value = variant.id;
    const price = $('[data-qv-price-current]');
    const compare = $('[data-qv-price-compare]');
    if (price) price.textContent = variant.price;
    if (compare) { compare.hidden = !variant.compare; compare.textContent = variant.compare || ''; }
    const sku = $('[data-qv-sku]');
    const skuRow = $('[data-qv-sku-row]');
    if (sku) sku.textContent = variant.sku || '';
    if (skuRow) skuRow.hidden = !variant.sku;
    if (stock) {
      stock.textContent = variant.available ? product.strings.inStock : product.strings.soldOut;
      stock.classList.toggle('is-sold-out', !variant.available);
    }
    if (addBtn) addBtn.disabled = !variant.available;
    if (addLabel) addLabel.textContent = variant.available ? product.strings.add : product.strings.soldOut;
    if (variant.media) showMedia(variant.media);
  };

  optionEls.forEach((el) => {
    const i = Number(el.dataset.qvOption) - 1;
    el.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-qv-value]');
      if (!btn) return;
      selected[i] = btn.dataset.qvValue;
      render();
    });
    const select = el.querySelector('[data-qv-select]');
    if (select) select.addEventListener('change', () => { selected[i] = select.value; render(); });
  });

  // Gallery arrows
  const step = (dir) => {
    const slides = [...root.querySelectorAll('.quick-view__slide')];
    const cur = slides.findIndex((s) => s.classList.contains('is-active'));
    const next = (cur + dir + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === next));
  };
  root.querySelector('[data-qv-prev]')?.addEventListener('click', () => step(-1));
  root.querySelector('[data-qv-next]')?.addEventListener('click', () => step(1));

  // Quantity
  root.querySelectorAll('[data-qv-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = root.querySelector('.quick-view__qty-input');
      if (!input) return;
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + Number(btn.dataset.qvQty));
    });
  });

  bindAddToCart(root.querySelector('[data-qv-form]'), root);
  render();
}

// ---------------------------------------------------------------------------
// Add to cart
// ---------------------------------------------------------------------------
function bindAddToCart(formEl, root) {
  if (!formEl) return;
  const errorEl = root.querySelector('[data-qv-error]');
  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = formEl.querySelector('[data-qv-add]');
    const label = formEl.querySelector('[data-qv-add-label]');
    const originalText = label?.textContent;
    if (errorEl) errorEl.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    submitBtn?.classList.add('is-loading');
    try {
      const data = new FormData(formEl);
      const drawer = document.querySelector('cart-drawer');
      if (drawer) {
        data.append('sections', 'cart-drawer,cart-icon-bubble');
        data.append('sections_url', window.location.pathname);
      }
      const resp = await fetch(`${window.routes?.cart_add_url || '/cart/add'}.js`, {
        method: 'POST',
        headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
        body: data,
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.description || json.message || 'Error');
      closeModal();
      if (drawer && typeof drawer.renderContents === 'function' && json.sections) {
        drawer.renderContents(json);
      } else if (drawer && typeof drawer.open === 'function') {
        drawer.open();
      } else {
        document.dispatchEvent(new CustomEvent('tm:cart:add', { detail: json }));
      }
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message; errorEl.hidden = false; }
      if (submitBtn) submitBtn.disabled = false;
    } finally {
      submitBtn?.classList.remove('is-loading');
      if (label && originalText) label.textContent = originalText;
    }
  });
}

// ---------------------------------------------------------------------------
// Load + triggers
// ---------------------------------------------------------------------------
async function handleTriggerClick(event, trigger) {
  const url = trigger.getAttribute('data-product-url') || trigger.getAttribute('href');
  if (!url) return;
  event.preventDefault();
  event.stopPropagation();
  openModal(trigger);
  const body = modalEl?.querySelector('[data-quick-view-body]');
  if (!body) return;
  try {
    const sectionUrl = `${url.split('?')[0]}?section_id=${SECTION_ID}`;
    const resp = await fetch(sectionUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.querySelector('[data-quick-view-root]');
    if (!root) throw new Error('No quick view markup');
    body.innerHTML = '';
    body.appendChild(document.importNode(root, true));
    setupQuickView(body.querySelector('[data-quick-view-root]'));
    Wishlist.init(); // bind + sync the heart button that just arrived
  } catch (err) {
    body.innerHTML = `<p class="quick-view-modal__error">Couldn't load product. <a href="${url}">Open full page →</a></p>`;
  }
}

function init() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-quick-view-trigger]').forEach((el) => {
    if (el.dataset[BOUND_FLAG] === '1') return;
    el.dataset[BOUND_FLAG] = '1';
    el.addEventListener('click', (e) => handleTriggerClick(e, el));
  });
  document.querySelectorAll('[data-quick-view-close]').forEach((el) => {
    if (el.dataset[BOUND_FLAG] === '1') return;
    el.dataset[BOUND_FLAG] = '1';
    el.addEventListener('click', closeModal);
  });
}

export default { init };
