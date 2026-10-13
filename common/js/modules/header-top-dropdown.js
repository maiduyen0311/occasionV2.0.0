// Header top dropdowns (currency + language) — vanilla custom element.
//
// Markup (snippets/header-top-currency.liquid, snippets/header-top.liquid):
//   <header-top-dropdown>
//     <button data-dropdown-toggle aria-expanded="false">…</button>
//     <div data-dropdown-panel hidden> <a href="…">…</a> … </div>
//   </header-top-dropdown>
//
// Options are plain links (GET): `?country=XX` switches market/currency and
// `/<locale>/…` switches language. Unlike the POST /localization form, this
// works through the `shopify theme dev` proxy (which answers 502 to that POST)
// and on the live storefront alike.

class HeaderTopDropdown extends HTMLElement {
  connectedCallback() {
    if (this.dataset.bound === '1') return;
    this.dataset.bound = '1';

    this.toggle = this.querySelector('[data-dropdown-toggle]');
    this.panel = this.querySelector('[data-dropdown-panel]');
    if (!this.toggle || !this.panel) return;

    this.toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      // event.detail === 0 → keyboard activation: move focus into the list
      if (this.panel.hasAttribute('hidden')) this.open(event.detail === 0);
      else this.close();
    });

    // [data-dropdown-hover] (My Account): also open on pointer hover, desktop only
    if (this.hasAttribute('data-dropdown-hover')) {
      const canHover = () => window.matchMedia('(hover: hover) and (min-width: 992px)').matches;
      this.addEventListener('mouseenter', () => {
        clearTimeout(this.hoverTimer);
        if (canHover() && this.panel.hasAttribute('hidden')) this.open(false);
      });
      this.addEventListener('mouseleave', () => {
        if (!canHover()) return;
        this.hoverTimer = setTimeout(() => this.close(), 150);
      });
    }

    // A currency / language the visitor picks themselves wins over the theme default
    // (snippets/oc-default-locale.liquid)
    this.panel.addEventListener('click', (event) => {
      const link = event.target.closest('a[href*="country="], a[hreflang]');
      if (!link) return;
      try { localStorage.setItem('oc_locale_chosen', '1'); } catch (e) { /* storage blocked */ }
    });

    this.onDocumentClick = (event) => {
      if (!this.contains(event.target)) this.close();
    };
    document.addEventListener('click', this.onDocumentClick);

    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.panel.hasAttribute('hidden')) {
        this.close();
        this.toggle.focus();
      }
    });
  }

  disconnectedCallback() {
    if (this.onDocumentClick) document.removeEventListener('click', this.onDocumentClick);
    delete this.dataset.bound;
  }

  open(focusList = true) {
    // Only one header dropdown open at a time
    document.querySelectorAll('header-top-dropdown').forEach((el) => {
      if (el !== this && typeof el.close === 'function') el.close();
    });
    this.panel.removeAttribute('hidden');
    this.toggle.setAttribute('aria-expanded', 'true');
    if (!focusList) return;
    const current = this.panel.querySelector('[data-dropdown-focus]') || this.panel.querySelector('[aria-current="true"]') || this.panel.querySelector('a');
    if (current) current.focus({ preventScroll: true });
  }

  close() {
    this.panel.setAttribute('hidden', '');
    this.toggle.setAttribute('aria-expanded', 'false');
  }
}

const HeaderTopDropdownModule = {
  init() {
    if (!customElements.get('header-top-dropdown')) {
      customElements.define('header-top-dropdown', HeaderTopDropdown);
    }
  },
};

export default HeaderTopDropdownModule;
