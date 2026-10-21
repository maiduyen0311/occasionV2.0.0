# Occasion — Shopify Theme (OS 2.0 rebuild)

Làm lại theme **Occasion** (2018, jQuery/Slick — demo live https://occasion-demo.myshopify.com/) thành Shopify Online Store 2.0 theme dựa trên Dawn. Code nền clone từ **Top Market v1.1.0** (d:/DuyenNguyen/Shopify/Top-market/top-market) rồi restyle theo thiết kế Occasion.

## Đang làm (bàn giao giữa các máy)

**Đọc trước khi làm tiếp:** `.claude/memory/MEMORY.md` + các file trong `.claude/memory/` (bản sao memory của Claude: store, theme id, quy trình deploy, việc đã/chưa làm) và `demos/README.md` §3.

- Việc hiện tại (21/10): 3 demo — Occasion (`occasion-demo`, live #38129205299), Home Fashion #1 (`occasion-demo-1`, live #65539801188, clone01), Home Fashion #2 (`occasion-demo-2`, live #131637510208, clone02). Đã xong: popup clone02, trang collection / blog / contact clone02, tài liệu 3 demo (`documentation/`, trang demo sinh bởi `scripts/docs-demo-pages.js`), page intro 3 demo, `npm run release` ra 3 zip. Còn: trang `Bags.psd` / `Login.psd` (PSD chỉ có ở máy kia), ngôn ngữ cho demo-2, đẩy code mới lên `occasion-demo` (cần CLI đăng nhập tài khoản maiduyen0311).
- User đã cho phép: xong mỗi phần thì deploy clone02 + commit `[YYYY-MM-DD HH:MM] …` + push, không cần hỏi.
- Khi cập nhật memory trên máy này, chép lại vào `.claude/memory/` rồi commit để máy khác có bản mới.

## Nguồn sự thật

**Tất cả** decision về layout, màu, spacing, settings phải tham chiếu `design/SPEC.md`. Ảnh tham chiếu: `design/old-demo/` (full page desktop/mobile, `sections/` từng section trang chủ, `states/` mega menu / cart dropdown). Settings của theme cũ (ảnh `shopify://shop_images/…`, handle menu/collection): `design/old-demo/live-settings.txt`. Đừng tự thiết kế lại. Nếu SPEC.md mơ hồ — hỏi user, đừng đoán hex/size.

- Store dev: `occasion-demo.myshopify.com` — theme cũ đang **live**, chỉ preview bằng development theme (`shopify theme dev`), không push lên theme live khi chưa được user duyệt.
- Prefix: giữ `tm-` cho code dùng chung kế thừa từ Top Market (custom element, module JS); class style mới riêng Occasion dùng `oc-`.

## Stack

- Shopify Online Store 2.0 (theme dựa trên Dawn, section/block-based, JSON template)
- SCSS compile bằng `sass`, JS bundle bằng Webpack 5
- Bootstrap 5 cho utility classes/grid only — không dùng Bootstrap JS components
- **Vanilla JS** — không còn jQuery, không còn Slick carousel (đã remove tháng 5/2026)
- `shopify theme dev` cho preview tại http://127.0.0.1:9293

### Pipeline CSS — 1 stylesheet chính từ SCSS

CSS theme **không còn dựa vào file CSS của Dawn** (`base.css`, `component-*.css`, `dawn-bundle.css`). Toàn bộ style do mình tự viết trong `common/scss/`, compile bằng `scripts/sass-build.js`:

| Entry SCSS | Output | Load ở đâu |
|---|---|---|
| `common/scss/styles.scss` | `assets/styles.css` | `layout/theme.liquid`, blocking — stylesheet chính duy nhất |
| `common/scss/component/localization-form.scss` | `assets/component-localization-form.css` | `theme.liquid`, chỉ khi shop có >1 country/language |

Cả 2 output đều gitignored (build artifact). Thứ tự `@use` trong `styles.scss`:

1. `tokens` — design tokens (SCSS vars + CSS custom properties)
2. Bootstrap 5 SCSS (utility/grid)
3. `layout/base` (as `dawn`) — reset/primitives port từ Dawn `base.css` sang SCSS (giữ `html { font-size: 62.5% }`)
4. `base` — typography & reset của Occasion (sau Bootstrap + reset để thắng)
5. `layout/header` → `header/*`, `layout/nav` → `nav/*`, `layout/footer` → `footer/*`
6. `section/*` — mỗi section/page 1 partial

Sau `styles.css`, snippet `theme-styles` render CSS vars runtime từ settings (font_picker, color) để override fallback compile-time.

**CSS Dawn còn lại** trong `assets/` (đã dọn toàn bộ file không dùng tháng 9/2026): chỉ `component-predictive-search.css` (`theme.liquid`) và `template-giftcard.css` (`templates/gift_card.liquid`). Section Dawn không có style (slideshow, collage, multicolumn…) đã bị xoá — dùng section Occasion tương ứng.

### JS architecture

- `common/js/common.js` — boot entry, compile thành `assets/common.js` qua webpack
- `common/js/modules/` — mỗi feature 1 module (vanilla, idempotent init):
  - `carousel.js` — slider translateX-based (replaces Slick)
  - `lang.js` — flag pairing cho language picker
  - `tabs.js`, `flash-deals-countdown.js`, `wishlist.js`, `swatch-hover.js`
  - `mobile-drawer.js`, `header-fixed.js`, `categories-menu.js` — header/nav
  - `cart-drawer-wire.js`, `quick-view.js`, `free-shipping-bar.js`
  - `cookie-consent.js`, `social-proof.js`
  - `mini-cart.js` — mini cart dropdown (Dawn `<cart-drawer>` restyled, `snippets/cart-drawer.liquid`) + `addToCart()` dùng chung (card, PDP, wishlist)
  - `card-actions.js` — hover card: nút giỏ hàng + so sánh (`tm_compare`); `header-account.js` — dropdown Account
  - `wishlist-page.js` — trang wishlist (bảng / lưới / chia sẻ); `cart-page.js` — trang cart (+ export helper ước tính ship)
  - `tm-scroller.js` — `<tm-scroller>` carousel scroll-snap (thumbnail PDP, Related, Recently viewed)
  - `header-top-dropdown.js` — `<header-top-dropdown>` (currency, language, search icon dropdown); `newsletter-popup.js`
  - `collection-view.js` — grid / list switcher trang collection (list view chỉ desktop); `compare.js` + `compare-page.js`
  - `deal-product.js` — section Deal of the week; `product-bundle.js` — khối "Buy 3 get 20% OFF" (PDP + Deal)
  - `sales-popup.js` — section Sales popup ("X recently bought"); `money.js` — `formatMoney()` theo `shop.money_format`
  - `oc-notify.js` — popup xác nhận kiểu Occasion cũ (thêm giỏ / thêm wishlist), bật bằng setting `cart_feedback` = popup, `wishlist_popup`; config qua `window.ocSettings` (`theme.liquid`)
- Dawn JS (`constants.js`, `pubsub.js`, `global.js`, `search-form.js`, `predictive-search.js`, `localization-form.js`...) vẫn load trực tiếp từ `assets/` trong `theme.liquid`
- Custom Web Components dùng prefix `tm-` để tránh đụng Dawn (vd `<tm-price-range>`)
- Init pattern: mỗi module export `init()` (idempotent qua `dataset.bound` flag); `common.js` gọi tất cả trên `DOMContentLoaded` + lại trên `shopify:section:load`

## Cấu trúc thư mục

> **Lưu ý**: `source/` là project root (chứa `.git`). Các bản theme cũ nằm ở `../2026/` (chỉ để tham khảo, không sửa).

```
source/                       # ← Project root (d:/DuyenNguyen/Shopify/Occasion/source)
├── CLAUDE.md                  # File này
├── .claude/                   # Agent/command/skill (git-tracked)
│   ├── agents/                # 6 subagent
│   ├── commands/              # 4 slash command
│   └── skills/                # 1 skill
├── design/
│   ├── SPEC.md                # ← Nguồn sự thật cho mọi section (git-tracked)
│   ├── old-demo/              # Ảnh chụp demo cũ (full page, sections/, states/) + settings theme cũ
│   └── logo-old.png           # Logo gốc (wordmark SVG: snippets/logo-occasion.liquid)
├── layout/theme.liquid
├── sections/                  # Section files (.liquid) — kebab-case, prefix `home-` cho homepage
├── snippets/                  # Component tái sử dụng (card-product, news-card, icon-*)
├── templates/                 # JSON templates (index.json là homepage)
├── config/                    # settings_schema.json, settings_data.json
├── locales/                   # vi.json, en.default.json...
├── common/
│   ├── scss/
│   │   ├── styles.scss              # SCSS entry → assets/styles.css
│   │   ├── _tokens.scss             # Design tokens (sync từ SPEC §1)
│   │   ├── _base.scss               # Typography & reset Occasion
│   │   ├── layout/                  # Aggregator: _base (reset port từ Dawn), _header, _nav, _footer
│   │   ├── header/                  # _wrapper, _top, _middle, _middle-logo, _middle-search, _middle-actions, _mobile
│   │   ├── nav/                     # _bottom, _bottom-categories, _bottom-nav
│   │   ├── footer/                  # _footer
│   │   ├── section/_<name>.scss     # Style cho từng section/page (home-*, main-*, card-product...)
│   │   └── component/               # Entry riêng: localization-form.scss → assets/component-localization-form.css
│   ├── js/
│   │   ├── common.js                # boot entry (vanilla, no jQuery)
│   │   └── modules/                 # 29 module (xem §JS architecture)
│   └── img/                         # Source images (copy sang assets/ qua watch:img)
├── scripts/
│   ├── sass-build.js                # Compile SCSS (build / --watch / --prod)
│   ├── shopify-dev.js, css-shopify-sync.js, check-shopify-env.js, kill-dev-port.js
│   ├── shopify-theme-push.js        # Dùng bởi deploy:* — KHÔNG tự chạy
│   ├── release.js                   # npm run release → dist/ (theme zip + documentation, không kèm source) + dist/themeforest-upload/
│   └── data/                        # svg-icons.json, tm-icon-picker.json (KHÔNG đặt trong config/)
├── page-intro/                      # Trang giới thiệu ThemeForest (HTML tĩnh, iPhoenix Themes) — không nằm trong gói bán
├── assets/                          # Build output + asset tĩnh
│                                    # • styles.css, component-localization-form.css — SCSS compiled (gitignored)
│                                    # • common.js — webpack bundle (gitignored)
│                                    # • Dawn JS + vài Dawn CSS legacy (xem §Pipeline CSS)
├── webpack.{common,dev,prod}.js
├── package.json
└── .gitignore                       # node_modules, .shopify, design/*.psd, build outputs
```

## Build & preview (chạy từ project root)

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Check `.env`, compile SCSS, watch SCSS + JS + ảnh + CSS sync, chạy `shopify theme dev --port=9293` |
| `npm run build` | Production: compile SCSS (compressed) + webpack bundle JS |
| `npm run sass:build` | Compile SCSS một lần (expanded + source map) |
| `npm run watch:css` | Chỉ watch SCSS |
| `npm run webpack` | Chỉ watch JS |

Thêm: `npm run check` (theme check), `npm run package` (theme zip), `npm run release` (gói ThemeForest trong `dist/`). Tài liệu cho người mua: `documentation/` (tiếng Anh, nhiều trang, xem §Demo theme) — cập nhật khi thêm tính năng. Style mới luôn viết trong SCSS partial rồi `@use` vào `styles.scss`; không thêm `{{ '*.css' | asset_url | stylesheet_tag }}` trong section/snippet.

## Convention

- **Tên section**: `home-<name>.liquid` cho section chỉ dùng trang chủ; tên generic cho section dùng nhiều trang.
- **Setting ID**: `snake_case`. Tên section/file: `kebab-case`.
- **CSS vars**: mỗi section khai báo trong `{% style %}` với selector `#<sectionName>-{{ section.id }}` theo pattern trong SPEC §Appendix B. KHÔNG inline CSS lớn.
- **Default color**: lấy đúng hex từ SPEC §1.1 (vd `accent_color` default `#f05d17`).
- **Text**: dùng `{{ 'sections.<id>.<key>' | t }}` và bổ sung key vào `locales/en.default.json` + `locales/vi.json`.
- **Snippet tái sử dụng**: ưu tiên dùng `card-product`, `news-card` (bài blog), `page-breadcrumb`, `account-nav`, `address-form-fields`, `icon-*` đã có thay vì inline markup mới.
- **Layout cột**: dùng Bootstrap grid (`container` / `row` / `col-*` / `row-cols-*` / `g-*`) trong markup; SCSS chỉ style component, không tự viết grid.
- **Trang nội bộ** (account, search, blog, page, contact, 404, password…): dùng primitive chung trong `common/scss/section/_pages.scss` — `.tm-page__title`, `.tm-card`, `.tm-btn` (`--dark` / `--outline` / `--sm` / `--block`), `.tm-input`, `.tm-label`, `.tm-select`, `.tm-alert`, `.tm-table`. Style riêng: `_account.scss`, `_blog.scss`, `_password.scss`, `_main-cart.scss`, `_facets-drawer.scss` (drawer filter mobile cho collection + search).
- **Schema**: mọi text/màu/ảnh/link **bắt buộc** có setting → merchant edit được trong Theme Editor. Mỗi section nên có `presets` block.
- **`templates/index.json`**: cập nhật `order` array khi thêm/xoá section homepage.

## Workflow build 1 section mới

1. Mở `design/SPEC.md` §2, tìm entry của section + ảnh `design/old-demo/sections/NN-*.png`.
2. Gọi `/build-section <id>` → agent `section-builder` scaffold `.liquid` + `.scss`.
3. Thêm `@use 'section/<id>';` vào `common/scss/styles.scss` (partial nằm ở `common/scss/section/_<id>.scss`).
4. Gọi `/wire-section <id>` → thêm vào `templates/index.json` đúng vị trí (xem SPEC §Appendix A).
5. `npm run dev`, mở browser, verify.
6. Gọi `/review-section <id>` → agent `liquid-reviewer` check code.
7. Optional: `responsive-qa` agent so sánh viewport (1440 / 1024 / 768 / 375) với `design/old-demo/index.png` / `index-mobile.png`.

## Subagents có sẵn

| Agent | Khi dùng |
|---|---|
| `section-builder` | Tạo 1 section mới từ SPEC entry |
| `card-component` | Sửa/extend snippet card-product, news-card |
| `theme-tokens` | Đồng bộ CSS vars / SCSS tokens từ SPEC §1 |
| `liquid-reviewer` | Code review file `.liquid` |
| `schema-auditor` | Verify schema merchant-editable đầy đủ |
| `responsive-qa` | Render + screenshot + so sánh với design |

## Slash commands

| Command | Tác dụng |
|---|---|
| `/spec <section-id>` | Trích đoạn liên quan từ SPEC.md |
| `/build-section <id>` | Gọi `section-builder` |
| `/wire-section <id>` | Thêm section vào `templates/index.json` |
| `/review-section <id>` | Gọi `liquid-reviewer` |

## Không làm

- KHÔNG sửa `design/SPEC.md` mà chưa có user approve.
- KHÔNG add global dependency mới (npm package) mà chưa hỏi user.
- KHÔNG bỏ qua schema settings — mọi giá trị merchant có thể muốn đổi đều phải là setting.
- KHÔNG inline markup khi đã có snippet tái sử dụng được.
- KHÔNG add lại jQuery / Slick / Bootstrap-JS. Stack đã chuyển sang vanilla tháng 5/2026 (xem §Stack). Carousel mới → vanilla module trong `common/js/modules/`. Tooltip / dropdown / modal → Web Component hoặc Dawn primitive có sẵn.
- KHÔNG add `{{ '*.css' | asset_url | stylesheet_tag }}` mới trong section/snippet — theme không dùng CSS Dawn nữa. Style riêng của section → SCSS partial dưới `common/scss/section/`, `@use` trong `styles.scss`.
- KHÔNG tự ý chạy `shopify theme push` — chỉ `shopify theme dev` local.
