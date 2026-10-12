# Top Market — intro page

Static landing page for the ThemeForest item (iPhoenix Themes). No build step.

```
page-intro/
├── index.html         # the page
├── assets/intro.css   # styles (brand colors in :root)
├── assets/intro.js    # menu, tabs, reveal on scroll, buy links
└── images/            # screenshots (JPEG, already resized)
```

- **Preview**: open `index.html` in a browser.
- **Publish**: upload the whole folder to any static host (for example `https://iphoenixthemes.com/top-market/`).
- **Buy links**: set `BUY_URL` at the top of `assets/intro.js` to the ThemeForest item URL. Until then every
  “Buy” button opens https://iphoenixthemes.com.
- **New store design**: add an `<article class="demo">` card in the `#demos` section, its pages to `#pages`
  (with `data-theme="<slug>"` and a filter button), and a full-page screenshot `images/demo-<slug>-full.jpg`
  (900 px wide).
- **Brand**: two colours, navy `#01172a` (dark sections, headings) and green `#026e4e` (icons, links, accents);
  text `#111111`. Derived tints in `:root` of `intro.css`: `#01563d` hover, `#5fd1a5` accent on navy, `#e3f1ec` chips,
  `#f2f7f5` light sections. Dark sections use `#01172a` → `#023a33`. Buttons: gradient `#011222` → `#012943`,
  white text, no border.
- **Logo**: source files in `design/logo/` (`logo.svg` dark wordmark, `favicon.svg` “p” app icon). Copies here:
  `images/logo-iphoenix.svg` (dark, light backgrounds), `images/logo-iphoenix-white.svg` (header, hero, footer),
  `images/logo-mark.svg` (favicon) and `images/logo-mark-white.svg` (CTA watermark). Paths only, no web font.
- Contact used on the page: support@iphoenixthemes.com · https://iphoenixthemes.com

Not part of the buyer package: `scripts/release.js` excludes this folder from the source zip.
