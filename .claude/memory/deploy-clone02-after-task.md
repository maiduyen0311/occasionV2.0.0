---
name: deploy-clone02-after-task
description: "User pre-authorized importing + deploying clone02 to occasion-demo-2 (as the published theme) after each finished task, without asking"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 984f8d2e-09aa-499e-8b8c-8b6e8aee03ed
  modified: 2026-10-20T15:02:24.000Z
---

On 2026-10-20 the user chose "Thay luôn theme live" (clone02 replaces the live theme on occasion-demo-2) and "Có, tự deploy" (after each clone02 task: commit, push, then demo-import + deploy to occasion-demo-2 without asking).

**Why:** same as clone01 on demo-3 — the demo store should track the latest work.
**How to apply:** clone02 lives in its own theme that is published; the old "Occasion_Fashion_Theme_V1.0.1" stays unpublished as a backup (don't delete it). Deploy with `node scripts/deploy-demo.js clone02 --store occasion-demo-2.myshopify.com --theme <clone02 theme id>` (see [[clone02-demo-store]] for the id). Still mention each deploy in the final report. Only covers occasion-demo-2.
