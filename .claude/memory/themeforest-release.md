---
name: themeforest-release
description: "Occasion 2.0 ships as an UPDATE of the existing 2018 ThemeForest item; listing kit in themeforest/, built by npm run release"
metadata:
  node_type: memory
  type: project
  originSessionId: 548e1970-0633-45a9-aa66-43391e44fe2e
  modified: 2026-10-21T06:35:30.145Z
---

Occasion 2.0 is published as an **update of the existing Occasion item** on ThemeForest (user decision 2026-10-21), not a new item.

**Why:** keeps sales, ratings and comments; 1.x buyers get 2.0 free.

**How to apply:** every banner, preview image, description, intro page and reviewer message must mention the upgrade (1.x 2018 → 2.0 rebuilt for Online Store 2.0, free update for 1.x buyers, "What's new in 2.0"). Listing kit: `themeforest/content/` (texts) + `themeforest/preview/` (thumbnail / inline preview / banners HTML + build.js), output `dist/themeforest-upload/` via `npm run release` (same structure as Top Market). Intro page: `page-intro/` uses only the Occasion palette, product-landing layout, text hero with line-art SVG (user wanted it like the sw_bemart intro hero). See [[commit-per-task]]. Description banners are hosted at https://iphoenixthemes.com/themes/occasion/themeforest/ (user-given path).

Item: https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511 (category Shopify › Shopping, $48, 84 sales, 4.50; 1.x = 1.0.0–1.0.7, 2018–2019). 1.x had 4 designs; mapping to 2.0: Super Market → Occasion, Shopping → Home Fashion #1, Fashion → Home Fashion #2, **Kids postponed to a later 2.x update** (user, 2026-10-21). Never write that 1.x had one design. Description keeps the 1.x customer review images (iphoenixthemes.com/assets/occasion-theme/img/) and full 1.x changelog; the old real-stores list was dropped. ThemeForest blocks headless Chrome/WebFetch (Cloudflare); a visible Chrome with --remote-debugging-port works.

Sales phase (from 2026-10-30): everything lives in `themeforest/sale/` (NOT part of the build) — README checklist, tracking (GA4/Pixel), affiliate, campaign plan, Black Friday (30% 22/11–1/12 proposed), ready posts, user's 29/10 plan docx, og-image.html + render.js → page-intro/images/og-occasion.jpg. Page intro settings live at the top of page-intro/assets/intro.js (ITEM_URL, AFFILIATE_URL, GA4_ID, META_PIXEL_ID, SALE). ThemeForest description images are lazy-loaded spans: reading page text makes image sections look empty — check data-src instead. The user also chats with Claude in the Chrome extension; that history is not visible here, they paste it.
