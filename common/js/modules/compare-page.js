// Compare page — sections/main-compare.liquid
// Loads each saved handle from /products/<handle>?view=compare (JSON from
// templates/product.compare.liquid) and renders a side-by-side table with a
// sticky label column. "Highlight differences" marks rows whose values differ.

import Compare from './compare.js';
import MiniCart from './mini-cart.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

class ComparePage {
  constructor(root) {
    this.root = root;
    this.d = root.dataset;
    this.base = (this.d.rootUrl || '/').replace(/\/$/, '');
    this.cache = new Map();
    this.$ = (sel) => root.querySelector(sel);

    root.addEventListener('click', (e) => this.onClick(e));
    this.$('[data-compare-diff]')?.addEventListener('change', (e) => {
      this.root.classList.toggle('is-diff', e.target.checked);
    });
    document.addEventListener('compare:change', () => this.render());
    this.render();
  }

  async fetch(handle) {
    if (this.cache.has(handle)) return this.cache.get(handle);
    let data = null;
    try {
      const r = await fetch(`${this.base}/products/${encodeURIComponent(handle)}?view=compare`, { credentials: 'same-origin' });
      if (r.ok) data = JSON.parse(await r.text());
    } catch (_) { data = null; }
    this.cache.set(handle, data);
    return data;
  }

  async render() {
    const handles = Compare.list();
    this.$('[data-compare-count-text]').textContent = handles.length;
    const empty = handles.length === 0;
    this.$('[data-compare-empty]').hidden = !empty;
    this.$('[data-compare-toolbar]').hidden = empty;
    if (empty) {
      this.$('[data-compare-scroll]').hidden = true;
      return;
    }

    const token = (this.token = Symbol('render'));
    if (!this.painted) this.$('[data-compare-loading]').hidden = false;
    const items = await Promise.all(handles.map((h) => this.fetch(h)));
    if (token !== this.token) return;

    const dead = handles.filter((h, i) => !items[i]);
    const products = items.filter(Boolean);
    this.$('[data-compare-loading]').hidden = true;
    this.painted = true;
    if (dead.length) {
      dead.forEach((h) => Compare.remove(h)); // triggers a re-render
      return;
    }

    this.$('[data-compare-table]').innerHTML = this.tableHtml(products);
    this.$('[data-compare-scroll]').hidden = false;
    this.root.style.setProperty('--compare-cols', products.length);
  }

  // ---------------------------------------------------------------------------
  tableHtml(products) {
    const d = this.d;
    const rows = [];
    const row = (label, cells, key) => {
      const texts = cells.map((c) => c.replace(/<[^>]+>/g, '').trim());
      const same = texts.every((t) => t === texts[0]);
      rows.push(`<tr class="${same ? 'is-same' : 'is-different'}" data-row="${key}">
        <th scope="row">${esc(label)}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`);
    };

    // Product header row
    const head = `<thead><tr>
      <th scope="col" class="compare-page__corner"><span class="visually-hidden">${esc(d.labelPrice)}</span></th>
      ${products.map((p) => `<th scope="col" class="compare-page__product">
        <button type="button" class="compare-page__remove" data-compare-remove="${esc(p.handle)}" aria-label="${esc(d.labelRemove)}: ${esc(p.title)}">×</button>
        <a href="${esc(p.url)}" class="compare-page__image">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ''}</a>
        <a href="${esc(p.url)}" class="compare-page__name">${esc(p.title)}</a>
      </th>`).join('')}
    </tr></thead>`;

    row(d.labelPrice, products.map((p) => `<span class="compare-page__price${p.compare_html ? ' is-sale' : ''}">${esc(p.price_html)}</span>${p.compare_html ? ` <s>${esc(p.compare_html)}</s>` : ''}`), 'price');

    if (d.showRating === 'true') {
      row(d.labelRating, products.map((p) => {
        if (p.rating == null) return '<span class="compare-page__muted">—</span>';
        const pct = Math.round((Number(p.rating) / Number(p.rating_max || 5)) * 100);
        return `<span class="compare-page__stars" style="--pct:${pct}%" aria-label="${Number(p.rating).toFixed(1)} / ${p.rating_max}"></span>
          <span class="compare-page__muted">(${p.rating_count} ${esc(d.labelReviews)})</span>`;
      }), 'rating');
    }

    row(d.labelAvailability, products.map((p) => (p.available
      ? `<span class="compare-page__stock is-in">${esc(d.labelInStock)}</span>`
      : `<span class="compare-page__stock is-out">${esc(d.labelOutStock)}</span>`)), 'availability');

    if (d.showVendor === 'true') row(d.labelVendor, products.map((p) => esc(p.vendor || '—')), 'vendor');
    if (d.showType === 'true') row(d.labelType, products.map((p) => esc(p.type || '—')), 'type');
    if (d.showSku === 'true') row(d.labelSku, products.map((p) => esc(p.sku || '—')), 'sku');

    // One row per option name (union across products)
    const optionNames = [...new Set(products.flatMap((p) => p.options.map((o) => o.name)))].filter((n) => n !== 'Title');
    optionNames.forEach((name) => {
      const isColor = /colou?r/i.test(name);
      row(name, products.map((p) => {
        const opt = p.options.find((o) => o.name === name);
        if (!opt) return '<span class="compare-page__muted">—</span>';
        return `<ul class="compare-page__values">${opt.values.map((v) => (isColor && v.color
          ? `<li class="compare-page__swatch" style="--swatch:${esc(v.color)}" title="${esc(v.label)}"><span class="visually-hidden">${esc(v.label)}</span></li>`
          : `<li class="compare-page__chip">${esc(v.label)}</li>`)).join('')}</ul>`;
      }), `option-${name}`);
    });

    if (d.showDescription === 'true') {
      row(d.labelDescription, products.map((p) => `<p class="compare-page__excerpt">${esc(p.excerpt)}</p>`), 'description');
    }

    // Actions
    rows.push(`<tr class="compare-page__actions" data-row="actions"><th scope="row"><span class="visually-hidden">${esc(d.labelAdd)}</span></th>
      ${products.map((p) => `<td>${p.available
        ? `<button type="button" class="tm-btn tm-btn--sm" data-compare-add="${p.variant_id}">${esc(d.labelAdd)}</button>
           ${p.variants_count > 1 ? `<a href="${esc(p.url)}" class="compare-page__options-link">${esc(d.labelOptions)}</a>` : ''}`
        : `<button type="button" class="tm-btn tm-btn--sm" disabled>${esc(d.labelSoldOut)}</button>`}</td>`).join('')}
    </tr>`);

    return `${head}<tbody>${rows.join('')}</tbody>`;
  }

  async onClick(e) {
    const remove = e.target.closest('[data-compare-remove]');
    if (remove) {
      Compare.remove(remove.dataset.compareRemove);
      return;
    }
    if (e.target.closest('[data-compare-clear]')) {
      Compare.clear();
      return;
    }
    const add = e.target.closest('[data-compare-add]');
    if (add) {
      add.disabled = true;
      try {
        await MiniCart.addToCart([{ id: Number(add.dataset.compareAdd), quantity: 1 }]);
      } catch (err) {
        MiniCart.toast(err.message);
      } finally {
        add.disabled = false;
      }
    }
  }
}

export default {
  init() {
    document.querySelectorAll('[data-compare-page]').forEach((root) => {
      if (root.dataset.bound === '1') return;
      root.dataset.bound = '1';
      // eslint-disable-next-line no-new
      new ComparePage(root);
    });
  },
};
