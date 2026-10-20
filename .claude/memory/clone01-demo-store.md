---
name: clone01-demo-store
description: "Clone01 (Home Fashion #1) demo store occasion-demo-3 — themes, how to preview demos/clone01 locally, store-side blockers"
metadata:
  node_type: memory
  type: project
  originSessionId: cfbed772-42ff-4594-bbe8-c1efe62f64dd
  modified: 2026-10-18T04:15:04.540Z
---

Clone01 = design/clone01/01_Layout (01_Homepage.psd + state jpgs: Home, ALL-CATEGORIES, Banner-1/2/3, Button-add, Hover, Hover-Button-add, Popup-Newletters, Quickview). Store: occasion-demo-3.myshopify.com, live theme #154847641678 "Occasion - Home Fashion 1", unpublished #154943553614 "(preview)".

Demo files are generated: edit scripts/demo/clone01.js, then `node scripts/demo/clone01.js` (writes demos/clone01/*); images via scripts/demo/clone01-images.ps1; store content via `npm run demo:import -- clone01 --store …`; theme via scripts/deploy-demo.js (no dist/ staging any more).

Local preview of the demo (2026-10-17): mirror theme dirs + demos/clone01 overlay into a scratch folder and run `shopify theme dev --path <stage> --store occasion-demo-3.myshopify.com` (development theme, safe). Headless-Chrome measuring against PSD layer coords (ag-psd tree dump) got the homepage to 6842px vs PSD 6841.

Live deploy: Claude Code auto mode blocks `node scripts/deploy-demo.js clone01 --store occasion-demo-3.myshopify.com --theme 154847641678` (pushes to the live theme) — ask the user to run it with `!`. First pushed to live 2026-10-17 15:5x after the full import; live matched the Home jpg. No browser automation was available (Claude in Chrome not connected), so admin-only settings must be changed by the user.

As of 2026-10-17 store-side gaps the theme can't fix: shop currency is VND (design shows USD), customer accounts disabled (top bar hides My Account / Sign In), only one currency in Markets.

2026-10-18: inner-page banners are drawn by `node scripts/demo/clone01-banners.js` (HTML → 2x jpg; manifest entries marked `drawn`). `demo-import --only files` never re-uploads an existing Files name, so a re-rendered banner needs a new key/filename (or deleting the old file in admin). The `discounts` step fails: the CLI token lacks `read_discounts` — the "Buy 3 get 20% OFF" automatic discount must be made in admin.

**Why:** these explain "live demo doesn't look like the design" questions.
**How to apply:** ask before demo-import / deploy (outward-facing); point the user to admin settings for currency/accounts. See [[design-source-psd]].
