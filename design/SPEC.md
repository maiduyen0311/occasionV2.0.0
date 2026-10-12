# Occasion — Design Spec (OS 2.0 rebuild)

> **Mục tiêu**: nguồn sự thật duy nhất cho mọi agent build/sửa section. Thiết kế gốc là demo cũ đang chạy tại
> https://occasion-demo.myshopify.com/ (theme jQuery/Slick 2018). Ảnh chụp tham chiếu nằm trong `design/old-demo/`:
>
> - `design/old-demo/<page>.png` — full page 1920px (index, collection, collection-all, collections, product, cart, blog,
>   article, contact, wishlist, login, register, search, 404) và `<page>-mobile.png` (375px).
> - `design/old-demo/sections/NN-<name>.png` — từng section trang chủ (crop 1240px quanh container 1200px).
> - `design/old-demo/states/*.png` — trạng thái hover: mega menu dọc (`vmenu-*`), dropdown giỏ hàng.
> - `design/old-demo/live-settings.txt` + `settings_data.legacy.json` — settings của theme live (ảnh `shopify://shop_images/…`,
>   handle menu, collection, text). Dùng làm default/preset cho section mới để demo mới dùng lại nội dung store.
>
> **Quy ước**: số đo đo bằng `getComputedStyle` trên demo live ở viewport 1920 (chính xác), trừ khi có `~` (ước lượng).
> Setting id `snake_case`, file `kebab-case`. Khi spec nói "dùng lại section X" → sửa/opt-in section đó, đừng tạo file mới.

---

## 1. Design tokens

### 1.1 Color palette

#### Brand
| Token | Hex | Dùng cho |
|---|---|---|
| `--color-accent` | `#fb9455` | Cam chủ đạo: nút ALL CATEGORIES, nút giỏ tròn, badge sale, nút "Add to cart"/"Select options", thanh newsletter footer, border-top của top bar, viền dưới footer |
| `--color-accent-ink` | `#b4561b` | Cam đậm dùng cho **chữ** trên nền trắng (giá, link active, tab active) — 4.9:1 AA. Demo cũ dùng `#fb9455` cho chữ (2.2:1, fail) |
| `--color-accent-dark` | `#e4864d` | Cam đậm hơn: khối social trong thanh newsletter footer, hover nút |
| `--color-secondary` | `#bbd8b2` | Xanh mint: nút search tròn, badge NEW, "Hurry Up! Offers End in:" |
| `--color-sale` | `#fb9455` | Badge giảm giá tròn 45px |
| `--color-new` | `#bbd8b2` | Badge NEW tròn 45px |

#### Header / footer
| Token | Hex | Dùng cho |
|---|---|---|
| `--color-header-top-bg` | `#231e17` | Top bar (40px) — có `border-top: 2px solid var(--color-accent)` |
| `--color-header-bg` | `#33302b` | Header middle (logo/search/cart) + thanh navigation |
| `--color-header-text` | `#ffffff` | Chữ header |
| `--color-vmenu-bg` | `#f9f8f2` | Nền menu danh mục dọc (ALL CATEGORIES) |
| `--color-footer-bg` | `#fffcfa` | Nền footer (kem rất nhạt) |
| `--color-footer-text` | `#8b8b8b` | Link footer (contrast 3.5:1 — dùng `#767676` cho AA) |
| `--color-footer-heading` | `#141414` | Tiêu đề cột footer |

#### Neutrals
| Token | Hex | Dùng cho |
|---|---|---|
| `--color-bg` | `#ffffff` | Nền trang |
| `--color-text` | `#2d2d2d` | Body text |
| `--color-heading` | `#000000` | Heading section, tên sản phẩm |
| `--color-text-muted` | `#696969` | Mô tả, excerpt |
| `--color-text-light` | `#8c8b8b` | Mô tả service bar, meta (dùng `#767676` khi là chữ nhỏ cần AA) |
| `--color-compare` | `#b4b4b4` | Giá gạch ngang |
| `--color-tab` | `#a2a2a2` | Tab inactive (dùng `#767676` cho AA) |
| `--color-border` | `#eeeeee` | Divider heading (1px `#efefef`), border box services, card |
| `--color-hero-title` | `#673a3f` | Màu chữ slide hero mặc định (setting per slide) |

### 1.2 Typography
- **Heading + body**: `Poppins` (font_picker, default `poppins_n4` body / `poppins_n5` heading). Demo cũ load Google Fonts — bản mới dùng Shopify font CDN như Top Market.
- **Display banner**: `Oswald` 300 chỉ xuất hiện **trong ảnh** banner (chữ đã render sẵn trong PNG) và slide hero (48px). Slide hero text là setting → dùng font heading, size setting.
- Base: `html { font-size: 62.5% }` (giữ như Top Market), body 12px Poppins / lh 1.5 trên demo cũ → bản mới **13px** (đọc tốt hơn, vẫn sát demo).

| Thành phần | Size / weight | Ghi chú |
|---|---|---|
| Section heading (`DAILY DEALS`) | 20px / 500, uppercase, `#000` | `h2` padding `10px 40px 15px`, căn giữa, gạch dưới 1px `#efefef` dài ~200px + đoạn giữa 60px đậm hơn (`#bbb`) |
| Sidebar heading (`TOP RATED`) | 20px / 500 uppercase, căn trái | Cùng style gạch dưới, căn trái |
| Tên sản phẩm (card) | 14px / 500, `#000` | căn giữa |
| Giá (card) | 16px / 600, accent | "from" 13px `#2d2d2d` trước giá |
| Giá gạch | 12px / 400, `#b4b4b4` | |
| Nav chính | 14px / 600 uppercase, ls .28px, trắng; active/hover accent | |
| ALL CATEGORIES | 16px / 600 uppercase, ls .32px, trắng trên accent | nút 240×45 |
| Menu dọc item | 12px→13px / 400, `#000`, hover accent | padding `7px 15px 7px 40px`, icon 18px bên trái |
| Top bar | 12px / 400 trắng | |
| Service title / desc | 12px / 600 uppercase / 10px `#8c8b8b` | |
| Footer heading / link | 13px / 600 uppercase ls .65px / 13px / 400 | |
| Blog card title | 16px / 400 uppercase | |
| Tab (Hot & New) | 12px / 400 uppercase `#a2a2a2`, active accent | có icon 20px trước |
| Tab (New Items) | 12px / 600 uppercase, active accent | không icon |

### 1.3 Layout & spacing
- Container **1200px** (Bootstrap `container` với max-width 1200 + gutter 15px). Breakpoints Bootstrap 5.
- Khoảng cách giữa các section trang chủ: **30px** (demo: section kế tiếp cách 10–35px). Setting `padding_top/bottom` mỗi section, default 15/15.
- Heading section margin-bottom 20px.

### 1.4 Radius / shape
- Search input: pill (`50px`). Nút search tròn 40px trong input.
- Badge sale/new: tròn 45px, font 12px, line-height 45px, góc trên phải ảnh.
- Nút CTA ("Add to Cart", "Select options"): pill radius 20px, cao 34px, padding 0 20px, nền accent, chữ trắng 14px/500.
- Nút giỏ header: tròn 42px nền `#ed8d52`, bubble số lượng tròn trắng 22px viền accent.
- Banner, ảnh: góc vuông (radius 0).

### 1.5 Shadow / border
- Dropdown (mega menu, cart): nền trắng, `box-shadow: 0 5px 15px rgba(0,0,0,.1)`, cart dropdown có `border-bottom: 2px solid accent`.
- Services bar: box `1px solid #eee`, 5 cột phân cách bằng 1px `#eee`.

---

## 2. Section inventory — trang chủ (top → bottom)

Ảnh: `design/old-demo/sections/NN-*.png`. Cột "Triển khai" = section Top Market dùng lại (restyle / opt-in setting) hoặc section mới.

| # | Section (ảnh) | Triển khai |
|---|---|---|
| 2.1 | Top bar (`header-full.png`) | `header.liquid` (row top) |
| 2.2 | Header middle | `header.liquid` (row middle) |
| 2.3 | Navigation + ALL CATEGORIES | `navigation.liquid` |
| 2.4 | Hero (`02-hero.png`) | `home-hero.liquid` |
| 2.5 | Services (`03-services.png`) | `home-services-bar.liquid` |
| 2.6 | Daily deals (`04-daily-deals.png`) | **mới** `home-daily-deals.liquid` |
| 2.7 | Product carousel (`05-deals-carousel.png`) | `featured-collection.liquid` (carousel) |
| 2.8 | Banner grid 3 cột (`06-banner-grid.png`) | `home-promo-grid.liquid` |
| 2.9 | Trending items (`07-trending-items.png`) | `featured-collection.liquid` (grid 5 cột × 2 hàng) |
| 2.10 | Banner full width (`08-banner-wide.png`) | `image-banner.liquid` |
| 2.11 | Top rated + Hot & New (`09-top-rated-hot-new.png`) | **mới** `home-top-rated-tabs.liquid` |
| 2.12 | Banner đôi 1 (`10-banner-pair-1.png`) | `home-dual-banner.liquid` |
| 2.13 | New items (`11-new-items.png`) | **mới** `home-new-items.liquid` |
| 2.14 | Banner đôi 2 (`12-banner-pair-2.png`) | `home-dual-banner.liquid` (tỉ lệ 1:3) |
| 2.15 | Blog posts (`13-blog-posts.png`) | `home-latest-news.liquid` |
| 2.16 | Brand logos (`14-brand-logos.png`) | `home-brand-logos.liquid` |
| 2.17 | Instagram (`15/16-instagram.png`, app hỏng trên demo cũ) | `home-instagram.liquid` (lưới ảnh từ setting) |
| 2.18 | Footer (`17-footer.png`) | `footer.liquid` |

### 2.1 Top bar — cao 40px, nền `#231e17`, border-top 2px accent
- Trái: "Welcome Our Occasion!" (setting text), "Languages: [cờ] ▾", "Currencies: USD ▾" (dropdown GET link như Top Market).
- Phải: "My Account", "Check Out", "Sign in or Register" (khách) / "Log out" (đã đăng nhập). Chữ trắng 12px, khoảng cách 30px.

### 2.2 Header middle — cao 96px (gồm nav 45px chồng lên: middle ~95px), nền `#33302b`
- Logo trái (ảnh `logo.png` ~160×27; fallback SVG wordmark "OCCASION" cam/xám).
- Search giữa: input pill trắng 690×46, placeholder "Search for a product", nút tròn 40px `#bbd8b2` icon kính lúp trắng ở trong mép phải. Predictive search của Dawn.
- Phải: icon tim (wishlist, 30px trắng, bubble đếm), nút giỏ tròn accent 42px + bubble trắng số lượng + text "My cart" / tổng tiền (13px trắng, tổng tiền 600).
- Hover/click giỏ → mini cart dropdown 380px (Top Market `mini-cart`), border-bottom 2px accent; rỗng: "Your cart is currently empty."

### 2.3 Navigation — cao 45px, nền `#33302b`
- Trái: nút **ALL CATEGORIES** 240×45 nền accent, icon hamburger, chữ 16px/600. Bên dưới là **menu dọc** 240px nền `#f9f8f2`, padding 5px 0: mỗi item 32px có icon (ảnh/SVG) + chữ + mũi tên ▸ nếu có con, cuối list "See more" (accent) mở rộng các item ẩn (mặc định hiện 10).
  - **Trang chủ: menu dọc luôn mở** (chiếm cột trái của hero). Trang khác: đóng, hover/click nút để mở.
  - Flyout mega (`states/vmenu-*.png`) rộng tới hết container: cột link nhóm (heading 13px/600 uppercase có gạch dưới ngắn + link 13px), tuỳ chọn icon lớn trước heading (Fashion), banner ảnh bên phải (Fashion, Computer). Dùng mega flyout của Top Market (`header-mega-flyout-*`).
  - Menu: handle `main-menu` (demo cũ) — setting `categories_menu`.
- Giữa: menu ngang (`home-menu` trên demo cũ) HOME / SHOP / COLLECTION / BLOG / CONTACT US — 14px/600 uppercase trắng, active/hover accent, gap 30px. Hỗ trợ dropdown + mega như Top Market, nhãn New/Hot.
- Phải: "Track your order" (12px/200 trắng, link) + icon điện thoại + "Hotline (+123)4 567 890" (richtext settings).

### 2.4 Hero — cột trái 240px dành cho menu dọc (desktop ≥1200), slideshow 702×385, 2 banner phải 226×185 xếp dọc, gap 15px
- Slide: ảnh nền + text tuỳ chọn (eyebrow script "Off all sale items" với gạch ngang trái, heading 48px, sub 60px, nút text "COLLECTION NOW" 14px/500 uppercase). Màu chữ setting (default `#673a3f`). Autoplay 5s. Demo cũ: `banner-2.jpg`, `banner-3.jpg`, `slide_1_2000x_…png`.
- Banner phải: `cl_1.png`, `cl_2.png` (chữ nằm trong ảnh).
- Tablet/mobile: menu dọc ẩn, slideshow full width, 2 banner thành 1 hàng 2 cột bên dưới.

### 2.5 Services — box 1200×71 viền 1px `#eee`, 5 cột ngăn 1px
- Mỗi cột: text phải-căn (title 12px/600 uppercase + desc 10px `#8c8b8b`) + icon line 34px màu `#bbd8b2` bên phải. Icon ảnh `icon_1..5.png` hoặc icon thư viện.
- Mobile: scroll ngang hoặc 2 cột.

### 2.6 Daily deals — heading "DAILY DEALS", 2 sản phẩm / hàng
- Mỗi deal: ảnh 230px trái (badge -X% tròn), phải: tên 16px/500, giá 18px/600 accent + giá gạch, excerpt 3 dòng 13px `#696969`, hàng "Available: **38**" (trái) "Sold: **5**" (phải), progress bar 8px radius 4px nền `#e0e0e0` fill accent, "Hurry Up! Offers End in:" 12px/600 `#bbd8b2`, countdown 4 ô tròn 35px nền `#eee` (DAYS / HOURS / MINS / SECS, nhãn 11px uppercase dưới).
- Block `product` (product picker, available, sold, end date). Available = tồn kho thật nếu track inventory, fallback setting. Countdown dùng logic `flash-deals-countdown.js` của Top Market.
- Mobile: 1 deal / hàng, ảnh trên.

### 2.7 Product carousel — 6 card / hàng, mũi tên mảnh `‹ ›` hai bên (ngoài container), không heading
- Collection `furnicom` (demo cũ). Dùng `featured-collection` layout carousel (tm-scroller).

### 2.8 Banner grid — 3 cột: ảnh cao 386×(~500) | ảnh cao | 2 ảnh xếp dọc
- `block_1.png`, `block_4.png`, `block_2.png` + `block_3.png`. Chữ nằm trong ảnh → không overlay text mặc định (setting tuỳ chọn).

### 2.9 Trending items — heading, grid 5 cột × 2 hàng, collection `women`, 10 sp

### 2.10 Banner full width — `block_5.png` (1200×231), link sản phẩm

### 2.11 Top rated + Hot & New
- Trái 300px: heading "TOP RATED" căn trái + "Prev / Next" (12px `#b0b0b0`) phải; list 4 sản phẩm (ảnh 80px trái, tên 14px/500 + giá) — carousel theo trang 4 item. Collection `fashion-accessories`.
- Phải: heading "HOT & NEW" + Prev/Next; hàng tab có icon (MOBILE & ACCESSORIES, HEADPHONE, TV & AUDIOS, ALL ITEMS, ACCESSORIES — icon `ico01..05.png`); lưới 2×2 card ngang (ảnh 180px trái, phải: tên, giá, nút pill "Select options"/"Add to cart").
- Block `tab` (title, icon image, collection). Mobile: cột xếp chồng, tab scroll ngang.

### 2.12 Banner đôi 1 — `bn_1.png` | `bn_2.png`, tỉ lệ ~1:1 (590 / 590), gap 20px

### 2.13 New items
- Heading "NEW ITEMS", tabs chữ (ELECTROCIC LIGHT / FURNITURE / OFFICE) căn giữa.
- Trái 470px: sản phẩm nổi bật (ảnh lớn nền `#f7f7f7`, swatch màu góc dưới phải ảnh, tên, giá, nút "Add to Cart" + tim, hàng thumbnail 4 ảnh có mũi tên — click đổi ảnh lớn). Product `various-versions-have-evolved-over`.
- Phải: lưới 3×2 card (collection theo tab, 6 sp).

### 2.14 Banner đôi 2 — `block_13.png` (285) | `block_12.png` (895)

### 2.15 Blog posts — heading, 3 card: ảnh 387×280, khung trắng chồng lên mép dưới ảnh (lệch trái 15px, rộng 355): meta "October 30, 2018 0 comments" 13px `#b4b4b4`, title 16px uppercase

### 2.16 Brand logos — 6 logo / hàng xám, carousel, `Layer_670..674.png`, `Logo_03.png`

### 2.17 Instagram — heading "INSTAGRAM", lưới ảnh (setting image blocks) 6 cột, link profile

### 2.18 Footer — nền `#fffcfa`, border-bottom 2px accent
- Thanh trên (1200×71, nền accent, margin-bottom 25px): khối social 280px nền `#e4864d` (icon f, twitter, instagram, tumblr, g+ → dùng icon mạng xã hội từ settings Social media), "JOIN IN OUR MAILING LIST" 13px/600 + mô tả 13px, input email pill viền trắng + nút tròn trắng icon máy bay giấy.
- 5 cột: (1) logo + text + "Read More..." (accent) | (2) Customer Service (`customer-services`) | (3) Delivery & Returns (`delivery-returns`) | (4) Cards & Discounts (`cards-discounts`) | (5) Contact us: 4 dòng icon (địa chỉ, phone, email, giờ mở cửa) icon accent line + payment icons.
- Bottom: menu `footer` ngăn cách `|` 12px uppercase `#696969` + "© 2018 OCCASION. ALL RIGHTS RESERVED." căn giữa, border-top 1px `#eee`.

---

## 3. Components

### 3.1 Product card (`snippets/card-product.liquid`)
- Không viền, nền trắng. Ảnh vuông contain, căn giữa. Badge tròn 45px góc trên phải (sale accent `-43%`, NEW `#bbd8b2`).
- Tên căn giữa 14px/500 đen, giá căn giữa 16px/600 accent-ink, "from" khi khác giá biến thể, giá gạch 12px `#b4b4b4`.
- Swatch màu tròn 10px dưới giá (Top Market swatch hover).
- Hover: hiện nhóm nút (quick view, wishlist, add to cart, compare) — dùng `card-actions` Top Market, đổi style tròn accent.
- Biến thể ngang (list): ảnh trái 80px / 180px, text trái (Top rated, Hot & New, sidebar Top sellers).

### 3.2 Section heading — `.oc-heading` (20px/500 uppercase, gạch dưới 2 lớp), biến thể `--left` + slot Prev/Next.

### 3.3 Countdown — 4 ô tròn 35px nền `#eee`, số 13px/600, nhãn 11px uppercase.

### 3.4 Pill button — accent, chữ trắng, radius 20px, hover `--color-accent-dark`.

---

## 4. Trang trong (ảnh `design/old-demo/<page>.png`)

| Trang | Bố cục demo cũ | Triển khai |
|---|---|---|
| Collection | Breadcrumb; sidebar trái 240px: Product categories (menu, có +), Filter by color (chấm tròn), price (checkbox khoảng), size, brand, tags (pill viền), Top sellers (list), banner ảnh. Phải: tiêu đề, banner collection, thanh "Showing 1-12 of 12" + grid/list icon + sort, grid 4 cột | `main-collection-product-grid` (Top Market sidebar + facets) |
| Product | Breadcrumb; sidebar trái (Categories, Top sellers, banner, Custom CMS block); gallery thumbnail dọc trái + ảnh lớn; info: tên 26px, giá gạch + giá 26px accent + badge %, Availability, excerpt, Color swatch ảnh/màu tròn, Size text, qty pill + ADD TO CART pill + tim, "Guaranteed Safe Checkout" + payment icons; tabs Description / Reviews / Additional information; Related products carousel 5 | `main-product` + `product-tabs` + `related-products` (thêm sidebar opt-in) |
| Cart, Wishlist, Login, Register, Contact, Blog, Article, Search, 404, List collections | layout chuẩn | section `main-*` Top Market, restyle theo token |

---

## 5. Decisions

### 5.1 Nền code
Clone Top Market v1.1.0 (Dawn-based, SCSS + vanilla JS, Bootstrap grid). Giữ prefix code `tm-` (custom element, class JS, localStorage key) để không phá module dùng chung; class style mới của Occasion dùng prefix `oc-`.

### 5.2 Contrast (cần user xác nhận)
`#fb9455` trên nền trắng = 2.2:1, chữ trắng trên `#fb9455` = 2.2:1 (không đạt WCAG AA). Mặc định:
- Chữ cam trên nền trắng (giá, link active) → `--color-accent-ink: #b4561b` (4.9:1).
- Nút cam chữ trắng giữ đúng thiết kế (setting `color_accent_contrast` cho merchant đổi sang chữ tối `#231e17`, 7.5:1).

### 5.3 Nội dung demo
Store occasion-demo đã có sản phẩm, collection, menu, ảnh (`shop_images`). Template JSON mới tham chiếu handle cũ (`main-menu`, `home-menu`, `customer-services`, `delivery-returns`, `cards-discounts`, `footer`, collection `furnicom`, `women`, `fashion-accessories`, `camera-photo`, `health-beauty`, `man`, blog `news`).

### 5.4 Không làm
- Không load lại Oswald/Roboto Google Fonts. Không jQuery/Slick/fancybox/selectize. Không Instagram app token (lưới ảnh tĩnh từ setting).

---

## Appendix A — `templates/index.json` order

```
1.  home_hero              home-hero
2.  home_services          home-services-bar
3.  home_daily_deals       home-daily-deals (NEW)
4.  home_deals_carousel    featured-collection (carousel)
5.  home_banner_grid       home-promo-grid
6.  home_trending          featured-collection (grid 5×2)
7.  home_banner_wide       image-banner
8.  home_top_rated         home-top-rated-tabs (NEW)
9.  home_banner_pair_1     home-dual-banner
10. home_new_items         home-new-items (NEW)
11. home_banner_pair_2     home-dual-banner
12. home_blog              home-latest-news
13. home_brand_logos       home-brand-logos
14. home_instagram         home-instagram
```

Header group: `header` + `navigation`. Footer group: `footer`.

## Appendix B — CSS variable conventions
Giống Top Market: mỗi section khai báo biến trong `{%- style -%}` với selector `#<SectionName>-{{ section.id }}`; style chính trong `common/scss/section/_<name>.scss`, `@use` trong `styles.scss`.

*End of spec.*
