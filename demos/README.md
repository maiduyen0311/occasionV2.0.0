# Store designs (demos)

The package ships one theme per store design. All designs share the theme code in the
project root; a design only adds an **overlay**: theme settings, templates and section
groups that replace the base files.

| Design | Folder | Theme zip | Live demo |
|---|---|---|---|
| **Top Market** (base, marketplace) | project root | `top-market-theme-v<version>.zip` | https://topmarket-demo.myshopify.com/ |
| **Haley** (fashion boutique) | `demos/fashion/` | `haley-theme-v<version>.zip` | https://haley-demo.myshopify.com/ |

## A design folder

```
demos/<demo>/
├── config/settings_data.json      # colours, fonts, cards, cart, popups…
├── templates/*.json               # homepage and page layouts
├── sections/*-group.json          # header and footer groups
├── content.json                   # store content for scripts/demo-import.js
└── images/                        # local images uploaded by demo-import
```

The overlay files are generated: edit `scripts/demos/<demo>-theme.js` (theme) and
`scripts/demos/<demo>-content.js` (store content), then run them. Do not edit the JSON by hand.

## Commands

```bash
node scripts/demos/fashion-theme.js                       # regenerate the overlay
node scripts/demos/fashion-content.js                     # regenerate content.json
node scripts/demo-import.js fashion --store <shop>        # products, collections, menus, pages, blog…
node scripts/deploy-demo.js fashion --store <shop> --theme <id>   # build + push base + overlay
npm run release                                           # one zip per design in dist/…/themes/
```

## Add a new design

1. Copy `scripts/demos/fashion-theme.js` / `fashion-content.js` and change the palette, fonts,
   sections and content. Features specific to the design must be opt-in theme settings
   (defaults keep Top Market unchanged).
2. Generate the overlay, import the content into a demo store, deploy and review.
3. Add the design to `THEMES` in `scripts/release.js`.
4. Document it: a page in `documentation/` (copy `haley.html`), an entry in `NAV`
   (`documentation/assets/docs.js`), a card in `documentation/index.html` and a column in
   `getting-started.html#choose`.
