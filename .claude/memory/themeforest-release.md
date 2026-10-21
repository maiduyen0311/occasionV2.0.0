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
