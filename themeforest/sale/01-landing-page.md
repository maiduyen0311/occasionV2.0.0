# 01 · Page intro trước khi chia sẻ

Page intro: https://iphoenixthemes.com/themes/occasion/ (mã nguồn `page-intro/`).

## 4 chỗ đã sửa

| # | Vấn đề | Đã làm | File |
|---|---|---|---|
| 1 | `og:image` là đường dẫn tương đối, Facebook / Messenger / Zalo không đọc được → link chia sẻ không có ảnh. Ảnh cũ còn là ảnh dọc 900 × 3858, có đọc được cũng bị cắt xấu | Ảnh chia sẻ riêng **1200 × 630** (`images/og-occasion.jpg`), mọi thẻ dùng link đầy đủ `https://iphoenixthemes.com/themes/occasion/…`; thêm `og:url`, `og:type`, `og:site_name`, kích thước ảnh, thẻ `twitter:*` | `index.html`, `images/og-occasion.jpg` |
| 2 | Không có công cụ đo lường | GA4 + Meta Pixel cài sẵn, bật khi điền mã (xem [02-tracking.md](02-tracking.md)) | `assets/intro.js` |
| 3 | Nút mua chưa gắn affiliate | Một chỗ cấu hình `AFFILIATE_URL`; có giá trị thì cả 7 nút mua dùng link đó (xem [03-affiliate.md](03-affiliate.md)) | `assets/intro.js` |
| 4 | Tiêu đề hướng về người mua cũ; thiếu canonical | Thêm dòng lợi ích dưới tiêu đề: “One theme instead of a stack of paid apps: mega menus, daily deals, wishlist, compare and bundles built in.” Giữ tiêu đề “Occasion is back…” cho người mua cũ. Thêm `<link rel="canonical">` | `index.html`, `assets/intro.css` |

Không dùng câu “10 paid apps”: con số cụ thể khó chứng minh; “a stack of paid apps” nói đúng ý mà không bị bắt bẻ.

## Cần upload lên host

Upload đè vào `iphoenixthemes.com/themes/occasion/`:

```
page-intro/index.html            → /themes/occasion/index.html
page-intro/assets/intro.js       → /themes/occasion/assets/intro.js
page-intro/assets/intro.css      → /themes/occasion/assets/intro.css
page-intro/images/og-occasion.jpg → /themes/occasion/images/og-occasion.jpg   (file mới)
```

## Kiểm tra ảnh chia sẻ sau khi upload

1. Mở https://iphoenixthemes.com/themes/occasion/images/og-occasion.jpg — phải thấy ảnh.
2. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/ → dán link page intro →
   **Scrape Again** (Facebook nhớ ảnh cũ, phải bấm để nó đọc lại). Xem khung preview có ảnh và tiêu đề.
3. Zalo / Messenger: gửi link cho chính mình. Zalo cũng nhớ ảnh cũ một thời gian; nếu vẫn thấy ảnh cũ,
   thêm `?v=2` vào cuối link khi đăng.

## Đổi ảnh chia sẻ

Sửa `themeforest/sale/og-image.html`, rồi `node themeforest/sale/render.js` → ghi đè
`page-intro/images/og-occasion.jpg`. Upload lại ảnh và bấm Scrape Again.
