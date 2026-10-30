# Bán hàng — Occasion 2.0

Tài liệu và công cụ cho các bước bán Occasion 2.0 sau khi item đã lên ThemeForest
(https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511).

**Không nằm trong quá trình build.** `npm run release` chỉ lấy theme, `documentation/` và
`themeforest/content/` + `themeforest/preview/`; thư mục này không bị đóng gói hay copy vào `dist/`.

| File | Nội dung |
|---|---|
| `00-ke-hoach-tang-sale-2026-10-29.docx` | Kế hoạch gốc (29/10): so sánh đối thủ, tiêu đề/tags theo ngách supermarket, tiếp cận người mua 1.x, lộ trình 30 ngày, mục tiêu |
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

## Việc từ kế hoạch 29/10 (docx)

| Việc | Trạng thái / ghi chú |
|---|---|
| Thử tiêu đề theo ngách supermarket (2 phương án, mỗi bản 3–4 tuần, so lượt xem) | Chưa làm — chi tiết trong docx |
| Tags: thêm `supermarket, grocery, marketplace, department store, dropshipping, multi category`, bớt tag chung | Chưa làm — chỉ thêm niche khi demo đúng niche đó (Occasion = supermarket / multi-category) |
| Phần “What customers said” | **Không trống**: 3 ảnh review vẫn có và tải được (ThemeForest lazy-load ảnh, đọc chữ trang sẽ tưởng trống — kiểm tra 30/10) |
| Bảng “Occasion thay thế những app nào” + chi phí app/tháng | Chưa làm — chỉ ghi giá app khi có nguồn kiểm chứng (Envato cấm số liệu không chứng minh được) |
| Điểm PageSpeed demo trong mô tả | Chưa làm — chỉ đưa số đo thật (kèm ngày đo, link PageSpeed Insights) |
| Trả lời 3 bình luận cũ ở tab Comments + bài thông báo 2.0 | Bạn làm trên ThemeForest — bài soạn sẵn ở 06-posts.md |
| Email khách từng liên hệ support (1 lần, có dòng từ chối) | Mẫu email trong docx |
| Gia hạn support cho khách 1.x khi hỗ trợ cài 2.0 | Ghi nhớ khi trả lời support |
| Lộ trình Kids / Theme Blocks trên trang item | Cần bạn quyết định có hỗ trợ Theme Blocks không |
| Mục tiêu 30 ngày: +5 sale, +3 đánh giá | Theo dõi hằng tuần (04-campaign-plan.md) |

Tài liệu nội bộ: tên đối thủ trong docx chỉ dùng để phân tích, **không** đưa vào listing, tags hay bài đăng.
