# ThemeForest listing content — Occasion 2.0

Copy-ready content for the ThemeForest upload form of **Occasion 2.0** (store designs:
**Occasion** multi-category, **Home Fashion #1**, **Home Fashion #2**), by iPhoenix Themes.
Same structure as the Top Market listing.

| File | Goes into (upload form field) |
|---|---|
| [01-item-details.md](01-item-details.md) | **Name**, **Key Features**, **Category**, **Tags**, **Attributes**, **Price**, **URLs** |
| [02-item-description.html](02-item-description.html) | **Description** (paste the HTML between START and END) |
| [03-description-images.md](03-description-images.md) | Banners used by the description, thumbnail, preview gallery |
| [04-seo-keywords.md](04-seo-keywords.md) | Keyword plan: where each keyword is placed |
| [05-message-to-reviewer.md](05-message-to-reviewer.md) | **Message to the reviewer** (A: update of the existing item, B: new item) |
| [06-changelog.md](06-changelog.md) | Changelog block + “Item update” notes |
| [07-presale-faq.md](07-presale-faq.md) | Answers for the item **Comments** tab |

## Files to upload

`npm run release` builds everything into `dist/themeforest-upload/` (its last step runs
`themeforest/preview/build.js`, which can also be run on its own):

| Upload form field | File |
|---|---|
| Main File(s) | `1-main-file/occasion-themeforest-v2.0.0.zip` (themes/ with 3 zips, documentation/) |
| Thumbnail (80 × 80) | `2-thumbnail/thumbnail.png` |
| Theme Preview (ZIP) | `3-theme-preview/occasion-preview-v2.0.0.zip` — `01_preview.jpg` (590 × 300) + 19 screenshots |
| Description banners | `4-description-images/01-hero.jpg` … `10-mobile.jpg` (1180 px; host them, see below) |
| Name, tags, attributes, URLs · Description · Message to the reviewer | `5-listing/` (copies of this folder) |

`UPLOAD-GUIDE.md` in that folder repeats this table. Images are drawn from
`themeforest/preview/thumbnail.html`, `inline-preview.html` and `banners.html` (open `banners.html`
in a browser to see all ten); edit them there.

## Publishing: update of the existing item

Occasion 1.x (2018) is already on ThemeForest, and **2.0 is published as an update of that item**
(decided). It keeps sales, ratings and comments, and 1.x buyers get 2.0 for free. Every image and
text of this folder says so (“Version 2.0 · free update”, What's new banner, upgrade FAQ).

1. ThemeForest → your item → **Edit**: upload the new main file, theme preview zip and thumbnail.
2. Change the name, key features, tags and description (`01-item-details.md`, `02-item-description.html`).
3. Message to the reviewer: **A** of `05-message-to-reviewer.md`.
4. After approval, post a short comment on the item: “Occasion 2.0 is out: rebuilt for Online Store 2.0,
   two new store designs, free for every buyer. Download it from your Downloads page.”

## Before you submit

1. Upload `4-description-images/*.jpg` to `https://iphoenixthemes.com/occasion/themeforest/`
   — the description loads the banners from there. ThemeForest does not host description images.
2. Publish `page-intro/` at `https://iphoenixthemes.com/occasion/` (Live preview URL) and
   `documentation/` at `https://iphoenixthemes.com/occasion/documentation/` (the theme's
   documentation link in `config/settings_schema.json`).
3. Run `npm run release`: it builds the theme, checks each zip with Theme Check and rebuilds this folder.
4. Once the item is live, set `BUY_URL` in `page-intro/assets/intro.js` to the item URL.
5. The demo stores have no password. If one is added later, mention it in the description,
   the intro page and the reviewer message.

## Writing rules used

- English, plain and concrete. Envato rejects exaggerated or unverifiable claims (“#1”, “fastest”,
  PageSpeed scores), so the copy only states what the theme does.
- Names of other products are **never** used in the listing.
- Shopify is a trademark of Shopify Inc.; it is used only to describe compatibility.
- Every number (3 designs, 80+ sections, 25+ features, 31 languages) comes from the package.
  Update the intro page, the banners and the description together.
