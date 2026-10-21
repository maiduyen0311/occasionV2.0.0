# Occasion — intro page

Static landing page for the ThemeForest item (iPhoenix Themes). No build step.

```
page-intro/
├── index.html         # the page
├── assets/intro.css   # styles (brand colors in :root)
├── assets/intro.js    # menu, tabs, reveal on scroll, buy links
└── images/            # screenshots (JPEG, already resized)
```

- **Preview**: open `index.html` in a browser.
- **Publish**: upload the whole folder to any static host (for example `https://iphoenixthemes.com/occasion/`).
- **Buy links**: set `BUY_URL` at the top of `assets/intro.js` to the ThemeForest item URL. Until then every
  “Buy” button opens https://iphoenixthemes.com.
- **Layout** (product landing page, not a copy of the storefront): sticky dark nav → dark hero with
  the 3 homepages in browser frames → trust strip → “What’s new in Occasion 2.0” (1.x vs 2.0, new
  features, upgrade note) → 3 demo cards (hover to scroll) → feature rows (image / text) → “Skip a
  dozen apps” grid → inner pages grid → phones → under the hood → FAQ → CTA → footer.
- **New store design**: add it to `DEMOS`-style blocks in `index.html`: a `.demo` card in `#demos`,
  a page or two in `.pages`, and a full-page screenshot `images/demo-<slug>-full.jpg` (900 px wide).
  Update the numbers (hero stats, FAQ) and `themeforest/` (banners, description) together.
- **Screenshots**: taken from the live demos (occasion-demo.myshopify.com = Occasion, occasion-demo-1.myshopify.com = Home Fashion #1, occasion-demo-2.myshopify.com = Home Fashion #2; visit with ?country=US first so prices are in USD). Files: demo-<slug>-full, page-<slug>-*, m-<slug>-*, f-<slug>-* (slug occasion / fashion1 / fashion2).
  Full page 1440 px → 900 px, inner pages 1440×1100 → 1000×764, phones 390×844 → 520×1125.
- **Style**: only the Occasion palette — Poppins, orange `#fb9455` (buttons, accents), green `#bbd8b2` /
  `#96cc66` (ticks), dark brown `#33302b` (nav, hero, dark sections), cream `#fffcfa` (light sections).
  Tokens live in `:root` of `intro.css`.
- **Occasion wordmark**: inline SVG copied from `snippets/logo-occasion.liquid` (header and footer).
- **Logo**: source files in `design/logo/` (`logo.svg` dark wordmark, `favicon.svg` “p” app icon). Copies here:
  `images/logo-iphoenix.svg` (dark, light backgrounds), `images/logo-iphoenix-white.svg` ,
  `images/logo-mark.svg` (favicon) and `images/logo-mark-white.svg` (CTA watermark). Paths only, no web font.
- Contact used on the page: support@iphoenixthemes.com · https://iphoenixthemes.com

Not part of the buyer package: `scripts/release.js` excludes this folder from the source zip.
