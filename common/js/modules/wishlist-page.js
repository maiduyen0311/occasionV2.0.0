// Wishlist page — sections/wishlist.liquid
//
// Source of truth: wishlist.js (localStorage 'topmarket:wishlist' + added-at meta).
// Views:
//   table → rows built from /products/<handle>.js (variant picker, price, stock,
//           date added, Add to cart via mini-cart.js)
//   grid  → real card-product markup from /products/<handle>?view=card
// Share:  ?items=h1,h2 → read-only shared list with "Save to my wishlist".
// Dead handles (404) are pruned from storage automatically.

import Wishlist from './wishlist.js';
import MiniCart from './mini-cart.js';

const VIEW_KEY = 'topmarket:wishlist:view';
const HANDLE_RE = /^[a-z0-9-]+$/i;

const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function moneyFormatter(format, currency) {
  const noDecimals = /no_decimals/.test(format);
  const nf = new Intl.NumberFormat(['EUR', 'VND', 'IDR', 'DKK', 'SEK', 'NOK'].includes(currency) ? 'de-DE' : 'en-US', {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  });
  return (cents) => format.replace(/\{\{\s*amount[a-z_]*\s*\}\}/i, nf.format(cents / 100));
}

function readView(fallback) {
  try { return localStorage.getItem(VIEW_KEY) || fallback; } catch (_) { return fallback; }
}
function writeView(v) {
  try { localStorage.setItem(VIEW_KEY, v); } catch (_) { /* blocked */ }
}

class WishlistPage {
  constructor(root) {
    this.root = root;
    this.d = root.dataset;
    this.money = moneyFormatter(this.d.moneyFormat || '${{amount}}', this.d.currency);
    this.base = (this.d.rootUrl || '/').replace(/\/$/, '');
    this.$ = (sel) => root.querySelector(sel);
    this.products = new Map(); // handle → product json
    this.cards = new Map(); // handle → card html

    const shared = new URLSearchParams(window.location.search).get('items');
    this.shared = shared ? shared.split(',').filter((h) => HANDLE_RE.test(h)).slice(0, 50) : null;

    this.view = readView(this.d.defaultView || 'table');
    this.bind();
    this.render();
  }

  handles() {
    return this.shared || Wishlist.list();
  }

  bind() {
    this.root.addEventListener('click', (e) => this.onClick(e));
    this.root.addEventListener('change', (e) => {
      const select = e.target.closest('[data-row-variant]');
      if (select) this.onVariant(select);
    });
    // Hearts inside grid cards / elsewhere on the page
    document.addEventListener('wishlist:change', () => {
      if (!this.shared) this.render();
    });
  }

  // -------------------------------------------------------------------------
  async fetchProduct(handle) {
    if (this.products.has(handle)) return this.products.get(handle);
    const r = await fetch(`${this.base}/products/${encodeURIComponent(handle)}.js`, { credentials: 'same-origin' });
    const p = r.ok ? await r.json() : null;
    this.products.set(handle, p);
    return p;
  }

  async fetchCard(handle) {
    if (this.cards.has(handle)) return this.cards.get(handle);
    const r = await fetch(`${this.base}/products/${encodeURIComponent(handle)}?view=card`, { credentials: 'same-origin' });
    const html = r.ok ? await r.text() : '';
    const ok = html.includes('card-wrapper') ? html : '';
    this.cards.set(handle, ok);
    return ok;
  }

  // -------------------------------------------------------------------------
  async render() {
    const handles = this.handles();
    const count = this.$('[data-wishlist-count-text]');
    if (count) count.textContent = handles.length;

    this.$('[data-wishlist-shared-note]').hidden = !this.shared;
    this.$('[data-wishlist-subtitle]').hidden = !!this.shared;
    this.$('[data-wishlist-save-shared]').hidden = !this.shared;
    this.$('[data-wishlist-share]')?.toggleAttribute('hidden', !!this.shared);
    this.$('[data-wishlist-clear]').hidden = !!this.shared;

    this.root.querySelectorAll('[data-wishlist-view]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.wishlistView === this.view);
      b.setAttribute('aria-pressed', b.dataset.wishlistView === this.view ? 'true' : 'false');
    });

    const empty = handles.length === 0;
    this.$('[data-wishlist-empty]').hidden = !empty;
    this.$('[data-wishlist-toolbar]').hidden = empty;
    this.$('[data-wishlist-table]').hidden = empty || this.view !== 'table';
    this.$('[data-wishlist-grid]').hidden = empty || this.view !== 'grid';
    if (empty) return;

    const token = (this.renderToken = Symbol('render'));
    const loading = this.$('[data-wishlist-loading]');
    const firstPaint = !this.painted;
    if (firstPaint) loading.hidden = false;

    const dead = [];
    if (this.view === 'table') {
      const products = await Promise.all(handles.map((h) => this.fetchProduct(h).catch(() => null)));
      if (token !== this.renderToken) return;
      const meta = Wishlist.meta();
      const rows = products
        .map((p, i) => {
          if (!p) { dead.push(handles[i]); return ''; }
          return this.rowHtml(p, handles[i], meta[handles[i]]);
        })
        .join('');
      this.$('[data-wishlist-rows]').innerHTML = rows;
    } else {
      const cards = await Promise.all(handles.map((h) => this.fetchCard(h).catch(() => '')));
      if (token !== this.renderToken) return;
      this.$('[data-wishlist-grid]').innerHTML = cards
        .map((html, i) => {
          if (!html) { dead.push(handles[i]); return ''; }
          return `<li class="col wishlist-page__card" data-handle="${esc(handles[i])}">
            <button type="button" class="wishlist-page__card-remove" data-wishlist-remove="${esc(handles[i])}" aria-label="${esc(this.d.labelRemove)}">×</button>
            ${html}
          </li>`;
        })
        .join('');
      document.dispatchEvent(new CustomEvent('tm:content-loaded', { detail: { root: this.root } }));
    }

    loading.hidden = true;
    this.painted = true;
    const error = this.$('[data-wishlist-error]');
    error.hidden = dead.length === 0;
    if (dead.length && !this.shared) {
      Wishlist.set(Wishlist.list().filter((h) => !dead.includes(h)));
    }
  }

  rowHtml(p, handle, addedAt) {
    const variant = p.variants.find((v) => v.available) || p.variants[0];
    const img = (variant.featured_image && variant.featured_image.src) || p.featured_image || '';
    const multi = p.variants.length > 1;
    const date = addedAt
      ? new Date(addedAt).toLocaleDateString(document.documentElement.lang || 'en', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
    const options = multi
      ? `<label class="visually-hidden" for="WlVariant-${p.id}">${esc(p.options.map((o) => o.name || o).join(' / '))}</label>
         <div class="tm-select wishlist-page__variant"><select id="WlVariant-${p.id}" class="tm-input" data-row-variant>
           ${p.variants.map((v) => `<option value="${v.id}" ${v.id === variant.id ? 'selected' : ''} ${v.available ? '' : 'data-unavailable'}>${esc(v.title)}${v.available ? '' : ` — ${esc(this.d.labelSoldOut)}`}</option>`).join('')}
         </select></div>`
      : '';
    return `<li class="row align-items-center wishlist-page__row" data-handle="${esc(handle)}">
      <div class="col-12 col-lg-5">
        <div class="d-flex align-items-center gap-3">
          <button type="button" class="wishlist-page__remove" data-wishlist-remove="${esc(handle)}" aria-label="${esc(this.d.labelRemove)}: ${esc(p.title)}">×</button>
          <a href="${esc(p.url)}" class="wishlist-page__thumb" tabindex="-1" aria-hidden="true">${img ? `<img src="${esc(img)}${img.includes('?') ? '&' : '?'}width=200" alt="" loading="lazy" data-row-image>` : ''}</a>
          <div class="wishlist-page__info">
            ${p.vendor ? `<p class="wishlist-page__vendor">${esc(p.vendor)}</p>` : ''}
            <a href="${esc(p.url)}" class="wishlist-page__name">${esc(p.title)}</a>
            ${date ? `<p class="wishlist-page__date">${esc(this.d.labelAddedOn)} ${esc(date)}</p>` : ''}
            ${options}
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-2 wishlist-page__price" data-row-price>${this.priceHtml(variant)}</div>
      <div class="col-6 col-lg-2" data-row-stock>${this.stockHtml(variant)}</div>
      <div class="col-12 col-lg-3 text-lg-end">
        <button type="button" class="tm-btn tm-btn--sm wishlist-page__add" data-row-add="${variant.id}" ${variant.available ? '' : 'disabled'}>
          ${esc(variant.available ? this.d.labelAdd : this.d.labelSoldOut)}
        </button>
      </div>
    </li>`;
  }

  priceHtml(v) {
    const sale = v.compare_at_price && v.compare_at_price > v.price;
    return `<span class="${sale ? 'is-sale' : ''}">${this.money(v.price)}</span>${sale ? `<s>${this.money(v.compare_at_price)}</s>` : ''}`;
  }

  stockHtml(v) {
    return v.available
      ? `<span class="wishlist-page__stock is-in">${esc(this.d.labelInStock)}</span>`
      : `<span class="wishlist-page__stock is-out">${esc(this.d.labelOutStock)}</span>`;
  }

  onVariant(select) {
    const row = select.closest('[data-handle]');
    const p = this.products.get(row.dataset.handle);
    const v = p?.variants.find((x) => String(x.id) === select.value);
    if (!v) return;
    row.querySelector('[data-row-price]').innerHTML = this.priceHtml(v);
    row.querySelector('[data-row-stock]').innerHTML = this.stockHtml(v);
    const btn = row.querySelector('[data-row-add]');
    btn.dataset.rowAdd = v.id;
    btn.disabled = !v.available;
    btn.textContent = v.available ? this.d.labelAdd : this.d.labelSoldOut;
    const img = row.querySelector('[data-row-image]');
    if (img && v.featured_image?.src) img.src = `${v.featured_image.src}${v.featured_image.src.includes('?') ? '&' : '?'}width=200`;
  }

  // -------------------------------------------------------------------------
  async onClick(e) {
    const view = e.target.closest('[data-wishlist-view]');
    if (view) {
      this.view = view.dataset.wishlistView;
      writeView(this.view);
      this.render();
      return;
    }

    const remove = e.target.closest('[data-wishlist-remove]');
    if (remove) {
      const handle = remove.dataset.wishlistRemove;
      if (this.shared) {
        this.shared = this.shared.filter((h) => h !== handle);
        this.render();
      } else {
        remove.closest('[data-handle]')?.classList.add('is-removing');
        setTimeout(() => Wishlist.remove(handle), 180); // wishlist:change → render
      }
      return;
    }

    const add = e.target.closest('[data-row-add]');
    if (add) {
      add.disabled = true;
      try {
        await MiniCart.addToCart([{ id: Number(add.dataset.rowAdd), quantity: 1 }]);
      } catch (err) {
        MiniCart.toast(err.message);
      } finally {
        add.disabled = false;
      }
      return;
    }

    if (e.target.closest('[data-wishlist-add-all]')) {
      const btn = e.target.closest('[data-wishlist-add-all]');
      const products = await Promise.all(this.handles().map((h) => this.fetchProduct(h).catch(() => null)));
      const items = products
        .filter(Boolean)
        .map((p) => {
          const row = this.root.querySelector(`[data-handle="${p.handle}"] [data-row-add]`);
          const id = row ? Number(row.dataset.rowAdd) : (p.variants.find((v) => v.available) || {}).id;
          const v = p.variants.find((x) => x.id === id);
          return v && v.available ? { id, quantity: 1 } : null;
        })
        .filter(Boolean);
      if (!items.length) return;
      btn.disabled = true;
      try {
        await MiniCart.addToCart(items);
      } catch (err) {
        MiniCart.toast(err.message);
      } finally {
        btn.disabled = false;
      }
      return;
    }

    if (e.target.closest('[data-wishlist-clear]')) {
      Wishlist.clear();
      return;
    }

    if (e.target.closest('[data-wishlist-save-shared]')) {
      const mine = Wishlist.list();
      Wishlist.set([...mine, ...this.shared.filter((h) => !mine.includes(h))]);
      window.location.href = window.location.pathname;
      return;
    }

    if (e.target.closest('[data-wishlist-share]')) {
      const url = `${window.location.origin}${window.location.pathname}?items=${this.handles().join(',')}`;
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        navigator.share({ title: document.title, url }).catch(() => {});
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
      } catch (_) {
        window.prompt('', url);
        return;
      }
      MiniCart.toast(this.d.labelCopied);
    }
  }
}

export default {
  init() {
    document.querySelectorAll('[data-wishlist-page]').forEach((root) => {
      if (root.dataset.bound === '1') return;
      root.dataset.bound = '1';
      // eslint-disable-next-line no-new
      new WishlistPage(root);
    });
  },
};
