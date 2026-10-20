# Demo stores — tổng hợp công việc & quy trình clone

Tài liệu nội bộ (không nằm trong gói bán). Cập nhật 2026-10-20.

## 1. Lịch sử yêu cầu đã làm

### Top Market (`../top-market`, 22/05 → 12/10/2026, 108 commit) — code nền của Occasion

| Giai đoạn | Nội dung |
|---|---|
| 22–25/05 — Khởi tạo | Chuyển theme Top Market sang OS 2.0 (Dawn): pipeline SCSS + webpack, `.env` cho store, header theo PSD, mega menu SHOP BY CATEGORIES, trending / best-selling / new products, trang collection (sidebar filter, price slider, swatches, rating), PDP + cart page theo design |
| 26/05 — Chất lượng | Theme Check sạch, font qua `font_picker`, a11y WCAG AA (Lighthouse 100), **bỏ jQuery / Slick** (vanilla JS), cart drawer, predictive search, quick view, reviews, wishlist page, sticky ATC mobile, zoom ảnh, header mobile 56px + drawer, 5 section premium (lookbook, testimonials, brand story, FAQ, compare) |
| 27/05 → 30/09 | Sửa HTML/CSS, mega menu, trang cart, release v1.0.0 (compare page, mini cart, docs) |
| 30/09 — Mobile | Drawer menu dạng tab, side-panel cart, tabs → accordion |
| 01–07/10 — Demo Haley | Demo thời trang thứ 2 trên store `haley-demo`: `scripts/demo-import.js` (import sản phẩm / collection / menu / blog / ngôn ngữ), header 1 hàng, nhiều bảng màu, list view collection, bundle, mega menu header, menu badge |
| 07–12/10 — Phát hành | Wordmark SVG, Sales popup, accessibility pass, docs nhiều design (1 zip / design), ảnh editor trong docs, trang giới thiệu ThemeForest (`page-intro/`), `npm run release` → `dist/themeforest-upload/` |

### Occasion v2.0.0 (repo này, nhánh `release/v2.0.0`, 12/10 → 20/10/2026)

| Ngày | Nội dung |
|---|---|
| 12/10 | Clone code Top Market v1.1.0, đổi brand Occasion (tokens, settings, logo, SPEC). Header (top bar, middle, ALL CATEGORIES, nav), các section trang chủ + footer, QA trang chủ với demo cũ, collection / product / blog / article / contact theo layout Occasion cũ, mobile |
| 13/10 | Design chuyển sang **6 PSD** (SPEC/old-demo bỏ). Khớp PSD: header, homepage, footer, product, collection, cart; mini cart, mega menu, dropdown top bar (My Account, currency, flag ngôn ngữ), popup add-to-cart, quick view, lightbox ảnh, sales popup, slider giá, mặc định USD + EN |
| 14/10 | Demo **clone01** (Home Fashion #1): `scripts/demo/clone01.js` sinh `demos/clone01/` + các biến thể layout cần cho demo; sửa schema bị Shopify từ chối khi upload |
| 15–17/10 | Trang chủ clone01 khớp `01_Homepage.psd` (đo bằng toạ độ layer), các trạng thái (menu, categories, mini cart, popup, quick view, footer); trang con giống occasion-demo (filter collection, swatch, blog, wishlist, about); layout product Haley, biến thể màu, progress giỏ hàng, phân trang |
| 18/10 | Banner trang con vẽ bằng `clone01-banners.js`, thumbnail gallery bên phải ảnh chính, ALL CATEGORIES cấp 2 khi hover, mega menu full container |
| 18–20/10 | Review/sửa `occasion-demo-1`: top bar dạng text, All categories = main-menu có icon + 4 mega menu Occasion 1.x, deals carousel, newsletter popup "Simple box", **5 ngôn ngữ** (`locale-merge.js`, `demo-translate.js`), giá USD cố định cho store VND (`demo-usd-prices.js`), mô tả sản phẩm thật + metafield short description, list view, toolbar collection, mobile (top strip, dropdown, accordion), "Select options" cho sản phẩm có biến thể, khoảng cách trên footer, màu giá thường, làm trắng nền ảnh sản phẩm; cập nhật theme `occasion-demo` với các fix này (giữ layout cũ) |

### Store & theme

| Store | Dùng cho |
|---|---|
| `occasion-demo` | Theme Occasion gốc (theme cũ jQuery đang live — chỉ dùng development theme) |
| `occasion-demo-1`, `occasion-demo-3` | Demo clone01 (Fashion #1) — theme live #154847641678 trên demo-3, được phép deploy sau mỗi task |
| `occasion-demo-2` | **Demo clone02 (Fashion #2)** — mới, xem §3 |
| `haley-demo` | Demo Haley của Top Market |

## 2. Quy trình clone 1 design (rút ra từ clone01)

1. **Đọc design**: `design/<clone>/01_Layout/*.jpg` (render 1820px, container x≈320–1500) + `02_Image/` (ảnh gốc). PSD đọc bằng `ag-psd` (không có Python). Đo toạ độ / màu trực tiếp trên jpg (crop + lấy mẫu pixel), không đoán hex.
2. **Generator** `scripts/demo/<clone>.js` → `demos/<clone>/`: `content.json` (sản phẩm, collection, trang, blog, menu, Files), `templates/*.json`, `sections/{header,footer}-group.json`, `config/settings_data.json`, `images.manifest.json`.
3. **Ảnh**: `powershell -File scripts/demo/clone01-images.ps1 -Demo <clone>` (crop 1:1 từ layout, resize ảnh gốc).
4. **Thiếu tính năng** trong theme → thêm *setting / layout option* vào section (merchant chỉnh được), không hard-code cho riêng demo. Chạy `node scripts/validate-templates.js` trước khi push (Shopify từ chối range / option sai).
5. **Import nội dung**: `npm run demo:import -- <clone> --store <shop>` (chạy lại an toàn, tìm theo handle).
6. **Deploy theme**: `node scripts/deploy-demo.js <clone> --store <shop> --theme <id>` (push theme + overlay `demos/<clone>`; `--demo-only` khi chỉ đổi JSON).
7. **Verify** trên storefront (desktop + mobile), so với jpg từng trạng thái, rồi commit `[YYYY-MM-DD HH:MM] …` + push.

Lưu ý đã gặp:
- `demos/clone01/*.json` đã được sửa tay sau khi sinh — **`clone01.js` chạy lại sẽ ghi đè mất các sửa đó**. clone02 dựng trên file đã commit của clone01.
- `demo-import --only files` không upload lại file trùng tên → ảnh vẽ lại phải đổi tên key.
- Bước `discounts` cần quyền `read_discounts`; "Buy 3 get 20% OFF" phải tạo trong admin.
- Việc ở phía store (theme không sửa được): tiền tệ shop (VND → hiển thị USD), bật customer accounts, Markets.

## 3. clone02 — Home Fashion #2 trên `occasion-demo-2.myshopify.com`

Design: `design/clone02/01_Layout/02_Homepage_*.jpg` (Banner-1/2/3 = 3 slide hero, Hover-Home/Collection/Shop/New-in = 4 mega menu, hover-Quickview, hover-newletter, Button-add) + `Bags.psd` (trang collection), `Login.psd` (trang đăng nhập).

**Đã làm (20/10)**
- `scripts/demo/clone02.js` → `demos/clone02/`: catalogue clone01 (64 sản phẩm, dùng lại ảnh `demos/clone01/images`) + 20 sản phẩm mới từ ảnh trang chủ clone02 (`Layer-7079xx`) cho Daily deals / Trending / New items; menu `clone02-main-menu` (Home, Collection, Shop, New In, Sale, Blog, Contact Us) + 4 mega menu; header logo giữa, nav trắng; trang chủ theo thứ tự layout; footer sáng; màu: chữ đen, giá `#f59dad`, badge sale `#fed38e`, accent `#c0dcdd`.
- Theme: `home-banner-grid` thêm layout **`mosaic_left`** (banner rộng trên 2 banner nhỏ | banner cao).
- 42 ảnh cắt từ layout (`images.manifest.json`, ảnh trong `demos/clone02/images`).

**Theme đã bổ sung cho clone02 (20–21/10, đều là setting merchant chỉnh được)**
- Header: layout "Centered logo (search, logo, cart)", "Wide top bar and logo row", "Logo colour". Navigation: "Show categories button", "Menu alignment". Menu chính hiện banner của block Mega menu style 3 cùng tên.
- Daily deals: "Card layout" (Image above the details), 3–4 deal / view, "Show colour swatches", "Progress bar colour".
- Thẻ sản phẩm: "Tall portrait (271×313)", màu chữ badge Discount / NEW; New Items "Show colour swatches".
- Banner grid "Wide over two small + tall"; Brand logos "Box background"; Instagram "Show handle tile"; blog card "Simple".
- Footer: style "Grey, white copyright | payments row", newsletter "Row with divider", Button colour, Logo colour.

**Còn lại**
1. Quick view, popup add-to-cart, newsletter popup: so với `02_Homepage_hover-Quickview / Button-add / hover-newletter-.jpg`.
2. Trang con: `Bags.psd` (collection), `Login.psd` (đăng nhập), sau đó product / cart.
3. Mobile của các phần mới (header split, deals dọc, footer row).

**Dữ liệu theo layout (20/10)**: giá / badge NEW, -15%, -30% / swatch từng thẻ như layout (giá gạch được chỉnh để % badge đúng — layout tự mâu thuẫn), không rating (5 sao rỗng), blog 4 bài ảnh layout, Instagram 4 ảnh, countdown 185 ngày. Tên sản phẩm / bài viết giữ tên thật (layout chỉ có chữ mẫu lặp lại).
- Theme: menu chính hiện banner của block "Mega menu style 3" cùng tên (Shop / Collection / New In).

**Store `occasion-demo-2`** (tiền tệ USD)
- Theme **"Occasion - Home Fashion 2" #131637510208 — đang live** (publish 20/10). Theme cũ "Occasion_Fashion_Theme_V1.0.1" giữ unpublished làm backup.
- Đã import: 84 sản phẩm clone02 (32 sản phẩm cũ của store vẫn còn), 24 collection, blog, menu, Files `oc2-*`, discount "Buy 3 get 20% OFF".
- Chưa import: ngôn ngữ (cần auth thêm scope `read_markets,write_markets`).
- Cập nhật: `node scripts/demo/clone02.js` → `npm run demo:import -- clone02 --store occasion-demo-2.myshopify.com --only files,products,collections,pages,blog,menus,discounts` → `node scripts/deploy-demo.js clone02 --store occasion-demo-2.myshopify.com --theme 131637510208`.
