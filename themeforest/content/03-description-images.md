# 03 · Images for the listing

The description is a stack of tall banners, each followed by a heading and a bullet list. Text in
images is not indexed by search, so the **heading and bullets under every banner stay in HTML**
(already done in `02-item-description.html`).

All images are drawn from HTML in `themeforest/preview/` and exported by
`node themeforest/preview/build.js` (also the last step of `npm run release`) into
`dist/themeforest-upload/`. Edit the HTML, never the JPGs.

## Style (same as the intro page)

| Token | Value |
|---|---|
| Dark background | `#33302b` with an orange `#fb9455` glow top-left and a green `#bbd8b2` glow bottom-right |
| Light background | cream `#fffcfa`; demo banners use a soft tint of the design (`#f1f8ee` green, `#fdf0f2` pink) |
| Accent | orange `#fb9455`; ticks and the “fashion” tag green `#96cc66` |
| Font | Poppins 600/700 (headings), 400/500 (text) |
| Logo | Occasion wordmark (`snippets/logo-occasion.liquid`), “ASION” in white on dark |

## Upload form files

| File | Size | Source | Content |
|---|---|---|---|
| Thumbnail | 80 × 80 PNG | `thumbnail.html` | Split “O” + “C” monogram from the wordmark, “OCCASION”, orange “2.0” corner |
| Inline preview (`01_preview.jpg`) | 590 × 300 JPG | `inline-preview.html` | Wordmark, “NEW · Version 2.0 · fully rebuilt”, “Multipurpose Shopify Theme OS 2.0”, 4 chips, the 3 homepages in tilted browser frames, “3 store designs” badge. No price |
| Theme preview zip | JPG | `build.js` (SCREENSHOTS) | `01_preview.jpg` + 19 screenshots from `page-intro/images` (gallery order below) |

## Description banners (1180 px wide, JPG 82, under 600 KB)

Upload to `https://iphoenixthemes.com/occasion/themeforest/` with exactly these names.

| File | Height | Content |
|---|---|---|
| `01-hero.jpg` | 900 | Wordmark, “NEW · VERSION 2.0”, “One theme. Three ready-made stores.”, chips, the 3 homepages |
| `02-whats-new.jpg` | 760 | Occasion 1.x (2018) vs 2.0: sections, JavaScript, designs, built-in features |
| `03-store-designs.jpg` | 440 | 3 store designs · 80+ sections · 25+ built-in features · 31 languages |
| `04-demo-occasion.jpg` | 1400 | Occasion homepage in a browser frame |
| `05-demo-fashion-1.jpg` | 1400 | Home Fashion #1 homepage |
| `06-demo-fashion-2.jpg` | 1400 | Home Fashion #2 homepage |
| `07-built-in.jpg` | 760 | 12 tiles: features that replace apps |
| `08-features.jpg` | 1500 | 6 cards: category mega menu, banner mega menu, quick view, list view, daily deals, newsletter popup |
| `09-inner-pages.jpg` | 1060 | 12 inner pages |
| `10-mobile.jpg` | 720 | 6 phones (2 per design) |

## Theme preview gallery (order)

```
01_preview.jpg                 08_fashion-1-collection-list.jpg  15_quick-view.jpg
02_occasion-home.jpg           09_fashion-1-product-bundle.jpg   16_add-to-cart-popup.jpg
03_occasion-collection.jpg     10_fashion-1-categories.jpg       17_wishlist.jpg
04_occasion-product.jpg        11_fashion-2-home.jpg             18_compare.jpg
05_occasion-mega-menu.jpg      12_fashion-2-collection.jpg       19_newsletter-popup.jpg
06_occasion-daily-deals.jpg    13_fashion-2-product.jpg          20_mobile.jpg
07_fashion-1-home.jpg          14_fashion-2-mega-menu.jpg
```

## New screenshots

Screenshots live in `page-intro/images/` (see `page-intro/README.md` for sizes and how they are
taken from the live demos). Replace a file there, then run `node themeforest/preview/build.js`:
the intro page, the gallery and the banners all update.

## Rules

- Demo photos are for preview only; the description says images are not included (*Credits*).
- No fake ratings, sales numbers or “#1 best seller” badges: Envato rejects them.
- Keep a 40 px safe margin; ThemeForest scales images down on phones.
