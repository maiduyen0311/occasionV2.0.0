---
name: deploy-clone01-after-task
description: "User pre-authorized deploying clone01 to the live occasion-demo-3 theme after each finished task, without asking"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e1ee1763-d6c6-4a50-a354-c369bc1d5bbd
  modified: 2026-10-18T06:18:02.755Z
---

When a clone01 task is done (verified + committed), deploy it straight away without asking: `node scripts/deploy-demo.js clone01 --store occasion-demo-3.myshopify.com --theme 154847641678`, then verify on https://occasion-demo-3.myshopify.com. User said on 2026-10-18: "làm xong là deploy luôn kg hỏi nhé".

**Why:** the theme is still being built and the demo store is meant to track the latest work; asking each time only slowed them down (store data such as menus can also go live before the theme code).
**How to apply:** covers the clone01 demo store/theme only — not the main occasion-demo store's live theme. Still mention the deploy in the final report. See [[clone01-demo-store]], [[commit-per-task]].
