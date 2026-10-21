---
name: clone02-demo-store
description: "Clone02 (Home Fashion #2) on occasion-demo-2 — live theme id, how to update, what is done, what to do next"
metadata:
  node_type: memory
  type: project
  originSessionId: 984f8d2e-09aa-499e-8b8c-8b6e8aee03ed
  modified: 2026-10-20T17:15:08.338Z
---

Clone02 = design/clone02/01_Layout (02_Homepage_*.jpg states, 1820px wide, container x 320–1500; Bags.psd, Login.psd). Store: occasion-demo-2.myshopify.com (currency USD). Started 2026-10-20.

**Store state:** theme "Occasion - Home Fashion 2" #131637510208 is LIVE (old "Occasion_Fashion_Theme_V1.0.1" kept unpublished as backup — don't delete). Imported: 84 products (64 from clone01 + 20 homepage products from Layer-7079xx photos), 24 collections, blog (4 posts), menus clone02-main-menu etc., Files oc2-*, discount "Buy 3 get 20% OFF". The store's 32 old products are still there. Languages not imported (store auth lacks read_markets/write_markets).

**Update loop (per finished part):** edit theme / `scripts/demo/clone02.js` → `node scripts/demo/clone02.js` → (new images) `powershell -ExecutionPolicy Bypass -File scripts/demo/clone01-images.ps1 -Demo clone02` + `node scripts/demo-import.js clone02 --store occasion-demo-2.myshopify.com --only files` (new key names: Files are never re-uploaded) → `node scripts/validate-templates.js` → `node scripts/deploy-demo.js clone02 --store occasion-demo-2.myshopify.com --theme 131637510208` → check live with chrome-devtools MCP screenshots (viewport ~1442px; remove cookie banner / popups first) → commit `[YYYY-MM-DD HH:MM] …` + push. Full content re-import: `--only files,products,collections,pages,blog,menus,discounts` (languages step fails); Shopify 503 mid-import → just re-run.

clone02.js builds on the COMMITTED demos/clone01 JSON — never re-run clone01.js (it is behind hand-tuned demos/clone01 files and overwrites them).

**Done 2026-10-20/21 (commits 118e0ec…9c12cf6):** homepage matches the layout on desktop — header (centered_split layout, wide rows, logo colour, nav without categories + centred, mega banners for Shop/Collection/New In), hero, services, Daily deals vertical cards, banner mosaic, Trending/New Items cards (tall portrait, badges, swatches), sale strip, blog "simple" cards, brand logos box, Instagram handle tile, footer soft style + newsletter row. All are merchant settings with old defaults; list in demos/README.md §3.

**Done 2026-10-21:** popups like the layout — newsletter layout "Photo left, close button outside", add-to-cart popup 2px #95cc66 line (Theme settings → Cart: line colour / thickness / "under the quick view too"), quick view colour dots (quick_view_color_style swatch), no line under the quick view. Not done: quick view "Limited-Time Offers, End in" line (no data for it).

**Next:** 1) inner pages: Bags.psd (collection), Login.psd (login), then product / cart; 3) mobile check of the new header / deals / footer.

**Why:** lets the next session continue without re-deriving. **How to apply:** deploy + push after each part without asking ([[deploy-clone02-after-task]], [[commit-per-task]]). See [[clone01-demo-store]].
