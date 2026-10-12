// <tm-price-range> — two-handle range slider for collection sidebar.
// Custom tag prefixed `tm-` to avoid clash with Dawn's own <price-range>
// custom element registered in facets.js.
// Updates the fill bar + numeric labels on input. Submits filter on change
// by setting filter.v.price.gte / filter.v.price.lte query params, in currency units
// (e.g. 5 or 20.40 — see shopify.dev "Storefront filtering").
//
// Also: at boot, physically relocate the .sidebar-price block to sit between
// the Size facet and Product Type facet (per design/collections.jpg) since
// Dawn renders its facets as a fixed-order group we can't inject into.
(() => {
  const relocatePriceSlider = () => {
    const sidebar = document.getElementById('main-collection-filters');
    if (!sidebar) return;
    const priceBlock = sidebar.querySelector('.sidebar-price');
    if (!priceBlock) return;
    // Walk facet details, find one whose summary text starts with "Size"
    const sizeDetails = [...sidebar.querySelectorAll('.facets-container details')].find((d) => {
      const s = d.querySelector('summary');
      return s && s.textContent.trim().toLowerCase().startsWith('size');
    });
    if (sizeDetails && sizeDetails.nextSibling !== priceBlock) {
      sizeDetails.parentNode.insertBefore(priceBlock, sizeDetails.nextSibling);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', relocatePriceSlider);
  } else {
    relocatePriceSlider();
  }

  class TopMarketPriceRange extends HTMLElement {
    connectedCallback() {
      this.min = Number(this.dataset.min || 0);
      this.max = Number(this.dataset.max || 200);
      this.from = this.querySelector('.sidebar-price__input--from');
      this.to = this.querySelector('.sidebar-price__input--to');
      this.fromLabel = this.querySelector('[data-from-value]');
      this.toLabel = this.querySelector('[data-to-value]');
      this.fill = this.querySelector('[data-fill]');
      this.fromField = this.querySelector('[data-from-field]');
      this.toField = this.querySelector('[data-to-field]');
      if (!this.from || !this.to || !this.fill) return;

      // Initialise from URL params (currency units, same as the slider)
      const params = new URL(window.location.href).searchParams;
      const gte = parseFloat(params.get('filter.v.price.gte'));
      const lte = parseFloat(params.get('filter.v.price.lte'));
      if (Number.isFinite(gte) && gte > 0) {
        this.from.value = Math.max(this.min, Math.min(this.max, Math.floor(gte)));
      }
      if (Number.isFinite(lte) && lte > 0) {
        this.to.value = Math.max(this.min, Math.min(this.max, Math.ceil(lte)));
      }

      this._onInput = this._onInput.bind(this);
      this._onChange = this._onChange.bind(this);
      this.from.addEventListener('input', this._onInput);
      this.to.addEventListener('input', this._onInput);
      this.from.addEventListener('change', this._onChange);
      this.to.addEventListener('change', this._onChange);

      // Typed values: move the handles, submit on change / Enter
      [[this.fromField, this.from], [this.toField, this.to]].forEach(([field, range]) => {
        if (!field) return;
        field.addEventListener('input', () => {
          const v = Number(field.value);
          if (Number.isFinite(v)) { range.value = Math.max(this.min, Math.min(this.max, v)); this._sync(true); }
        });
        field.addEventListener('change', this._onChange);
      });

      this._sync();
    }

    _sync(fromField) {
      let lo = Number(this.from.value);
      let hi = Number(this.to.value);
      if (lo > hi) [lo, hi] = [hi, lo];
      const span = Math.max(1, this.max - this.min);
      const left = ((lo - this.min) / span) * 100;
      const right = 100 - ((hi - this.min) / span) * 100;
      this.fill.style.insetInlineStart = left + '%';
      this.fill.style.insetInlineEnd = right + '%';
      if (this.fromLabel) this.fromLabel.textContent = lo;
      if (this.toLabel) this.toLabel.textContent = hi;
      if (!fromField) {
        if (this.fromField) this.fromField.value = lo;
        if (this.toField) this.toField.value = hi;
      }
    }

    _onInput() {
      this._sync();
    }

    _onChange() {
      // Submit the Shopify price filter on the document URL.
      const url = new URL(window.location.href);
      let lo = Math.min(Number(this.from.value), Number(this.to.value));
      let hi = Math.max(Number(this.from.value), Number(this.to.value));
      if (lo <= this.min) url.searchParams.delete('filter.v.price.gte');
      else url.searchParams.set('filter.v.price.gte', String(lo));
      if (hi >= this.max) url.searchParams.delete('filter.v.price.lte');
      else url.searchParams.set('filter.v.price.lte', String(hi));
      window.location.href = url.toString();
    }
  }
  if (!customElements.get('tm-price-range')) {
    customElements.define('tm-price-range', TopMarketPriceRange);
  }
})();
