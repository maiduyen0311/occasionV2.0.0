# Occasion — Shopify Theme (source)

Supermarket / multipurpose Shopify **Online Store 2.0** theme (rebuild of the 2018 Occasion theme on Dawn): SCSS + vanilla JavaScript, Bootstrap 5 grid, no jQuery.
Buyer-facing setup guide: [`documentation/index.html`](documentation/index.html).

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Shopify CLI | 3.x (`npm install -g @shopify/cli@latest`) |

## Setup

```bash
npm install
cp .env.example .env      # SHOPIFY_FLAG_STORE=your-store.myshopify.com, theme id…
npm run dev               # compile + watch SCSS/JS, run `shopify theme dev` on :9293
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Compile SCSS, watch SCSS + JS + images, sync CSS, run `shopify theme dev` |
| `npm run build` | Production build: compressed `assets/styles.css` + minified `assets/common.js` |
| `npm run check` | Shopify Theme Check |
| `npm run package` | Build + `shopify theme package` (upload-ready theme zip) |
| `npm run release` | Full ThemeForest package in `dist/` (theme zips + documentation) |
| `npm run dev:stop` | Stop a stuck dev server on port 9293 |

## Structure

```
common/scss/        SCSS → assets/styles.css (single stylesheet)
  _tokens.scss        design tokens
  layout/ header/ nav/ footer/  global chrome
  section/_<name>.scss          one partial per section / page
common/js/          ES modules → assets/common.js (webpack)
  common.js           boot: init every module on DOMContentLoaded + shopify:section:load
  modules/            mini-cart, card-actions, wishlist, wishlist-page, compare, compare-page,
                      quick-view, tm-scroller (carousel), header-account, cart-page, …
common/img/         source images copied to assets/ by `npm run dev`
sections/ snippets/ templates/ layout/ config/ locales/   Shopify theme files
documentation/      buyer guide (HTML)
scripts/            build, dev-server and release helpers
```

`assets/styles.css` and `assets/common.js` are generated — edit the sources in `common/` instead.

## Conventions

- Layout with Bootstrap grid classes (`container`, `row`, `col-*`, `row-cols-*`); SCSS styles components only.
- Every visible text / image / color / link is a section or theme setting (merchant-editable).
- Storefront strings live in `locales/*.json` (`{{ 'key' | t }}`).
- Custom elements use the `tm-` prefix; JS modules export an idempotent `init()`.
- Never add stylesheet tags in sections — add a partial under `common/scss/section/` and `@use` it in `styles.scss`.
