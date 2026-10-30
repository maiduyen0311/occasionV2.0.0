# 03 · Link affiliate cho nút mua

Envato có chương trình affiliate (hiện chạy qua nền tảng Impact): người giới thiệu nhận hoa hồng khi
khách mới mua qua link của họ. Nếu điều khoản cho phép tác giả dùng link affiliate cho chính item của
mình, bạn nhận thêm hoa hồng ngoài phần tiền tác giả với khách mua lần đầu.

**Đọc điều khoản trước khi đăng ký** (tỉ lệ hoa hồng, điều kiện “khách mới”, thời gian cookie, có cho
tác giả tự giới thiệu item của mình không). Điều khoản thay đổi theo thời gian; tài liệu này không khẳng
định con số nào.

## Các bước

1. Envato → trang Affiliates (footer ThemeForest: “Become an affiliate”) → đăng ký qua Impact.
2. Khi được duyệt, tạo link tới đúng trang item:
   `https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511`
3. Dán link vào đầu `page-intro/assets/intro.js`:

   ```js
   var AFFILIATE_URL = 'https://1.envato.market/…';
   ```

   Có giá trị → cả 7 nút mua (Buy now, Purchase, 3 × Add to cart, Buy Occasion, nút dải sale) dùng link
   này. Để `''` → nút trỏ thẳng tới item.
4. Upload `intro.js`, bấm thử một nút: phải mở trang item Occasion.
5. Dùng cùng link affiliate trong bài đăng fanpage / group / YouTube (ở chỗ dẫn thẳng tới ThemeForest).
   Link tới page intro thì vẫn dùng link UTM (02-tracking.md) — nút mua trên intro đã mang affiliate.

## Theo dõi

Báo cáo của Impact cho biết số click và đơn qua link affiliate. So với `buy_click` trong GA4 để xem tỉ lệ
người bấm nút thực sự mua.
