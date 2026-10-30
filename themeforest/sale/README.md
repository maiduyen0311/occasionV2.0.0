# Bán hàng — Occasion 2.0

Tài liệu và công cụ cho các bước bán Occasion 2.0 sau khi item đã lên ThemeForest
(https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511).

**Không nằm trong quá trình build.** `npm run release` chỉ lấy theme, `documentation/` và
`themeforest/content/` + `themeforest/preview/`; thư mục này không bị đóng gói hay copy vào `dist/`.

| File | Nội dung |
|---|---|
| [01-landing-page.md](01-landing-page.md) | 4 chỉnh sửa page intro trước khi chia sẻ (ảnh chia sẻ, đo lường, affiliate, tiêu đề + canonical) và file cần upload |
| [02-tracking.md](02-tracking.md) | Gắn Google Analytics 4 + Meta Pixel, các sự kiện đã cài sẵn, link UTM cho từng kênh |
| [03-affiliate.md](03-affiliate.md) | Link affiliate Envato cho các nút mua |
| [04-campaign-plan.md](04-campaign-plan.md) | Kế hoạch bán: kênh, lịch, ngân sách quảng cáo, chỉ số theo dõi |
| [05-black-friday.md](05-black-friday.md) | Đợt giảm giá Black Friday: Envato, dải sale trên intro, bài đăng |
| [06-posts.md](06-posts.md) | Bài đăng soạn sẵn: tab Comments ThemeForest, fanpage, group, Reddit |
| `og-image.html` + `render.js` | Ảnh chia sẻ 1200 × 630 của page intro → `node themeforest/sale/render.js` |

## Trạng thái

| Việc | Trạng thái |
|---|---|
| Ảnh chia sẻ (og:image) dùng link đầy đủ, ảnh riêng 1200 × 630 | Xong trong code — **cần upload** (xem 01) |
| Canonical, og:url, thẻ Twitter | Xong trong code — cần upload |
| Dòng lợi ích cho khách mới ở hero | Xong trong code — cần upload |
| Google Analytics 4 / Meta Pixel | Code sẵn, **chờ mã** GA4 và Pixel ID |
| Link affiliate cho nút mua | Code sẵn, **chờ link** affiliate |
| Dải sale Black Friday trên intro | Code sẵn, đang tắt — bật khi đã đặt giảm giá trên Envato |
| Giảm giá trên Envato (Manage Discount / đợt Black Friday) | Bạn làm trên ThemeForest |
