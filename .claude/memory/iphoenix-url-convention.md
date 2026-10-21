---
name: iphoenix-url-convention
description: "Every theme's public pages live under https://iphoenixthemes.com/themes/<theme-name>/ (intro, documentation/, themeforest/ banners)"
metadata:
  node_type: memory
  type: user
  originSessionId: 548e1970-0633-45a9-aa66-43391e44fe2e
  modified: 2026-10-21T06:48:55.487Z
---

The user hosts each theme under `https://iphoenixthemes.com/themes/<theme-name>/`:
- intro page (Live preview URL): `/themes/<name>/`
- documentation: `/themes/<name>/documentation/` (also `theme_documentation_url` in config/settings_schema.json; support = `/themes/<name>/#support`)
- ThemeForest description banners: `/themes/<name>/themeforest/`

**Why:** user's standing convention for all their themes (stated 2026-10-21).

**How to apply:** use this path in listing texts, preview build scripts, settings_schema and READMEs; never `iphoenixthemes.com/<name>/`. Related: [[themeforest-release]].
