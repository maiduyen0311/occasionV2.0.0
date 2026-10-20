---
name: design-source-psd
description: Occasion theme — PSDs in design/ are now the design source; theme 146318131251 is the old-theme backup for sub-page reference
metadata:
  node_type: memory
  type: project
  originSessionId: 5712db70-8cd9-47d6-b0cb-01038614d679
  modified: 2026-10-13T05:36:34.123Z
---

On 2026-10-13 the user removed design/SPEC.md + design/old-demo/ from the working tree and put 6 PSDs in design/ (01_Homepage, 02_Homepage_Hover_Popup Newletters, 03_Product Detail, 04_Product, 05_Product Detail_Hover Product, 06_Shopping-cart; canvas 1820px, container x≈320–1500). User asked to match the PSDs exactly ("từ icon đến style").

Theme 146318131251 on occasion-demo.myshopify.com = "Copy of Occassion_141020" (old jQuery theme backup, unpublished) — reference for sub-pages not in PSD; storefront viewable at https://occasion-demo.myshopify.com/?preview_theme_id=146318131251 (no login needed).

**Why:** CLAUDE.md still says SPEC.md is source of truth, but SPEC was deleted (still in git HEAD); PSD wins where they disagree.
**How to apply:** Render PSDs with ag-psd + pngjs (no Python on this machine; ag-psd needs initializeCanvas stub with useImageData). Layer text dump gives exact font/size/hex. Preview needs Shopify CLI login by the user (`npx @shopify/cli theme dev --store occasion-demo.myshopify.com`).
