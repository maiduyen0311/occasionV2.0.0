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
      if (this.panel.hasAttribute('hidden')) this.open();
      else this.close();
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

  open() {
    // Only one header dropdown open at a time
    document.querySelectorAll('header-top-dropdown').forEach((el) => {
      if (el !== this && typeof el.close === 'function') el.close();
    });
    this.panel.removeAttribute('hidden');
    this.toggle.setAttribute('aria-expanded', 'true');
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
