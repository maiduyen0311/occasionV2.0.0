# 02 · Đo lường: Google Analytics 4 + Meta Pixel

Code đã cài sẵn trong `page-intro/assets/intro.js`, chỉ chạy khi có mã. Không có mã thì trang không tải
script nào của Google / Meta.

## Lấy mã

**Google Analytics 4**
1. https://analytics.google.com → Admin → Create → Property (tên: “Occasion intro”, múi giờ Việt Nam, tiền USD).
2. Data stream → Web → URL `https://iphoenixthemes.com` → tạo.
3. Copy **Measurement ID** dạng `G-XXXXXXXXXX`.

**Meta Pixel**
1. https://business.facebook.com → Events Manager → Connect data sources → Web → Meta Pixel.
2. Đặt tên “Occasion intro”, chọn cài thủ công (manual).
3. Copy **Pixel ID** (dãy số, khoảng 15–16 chữ số).

## Điền mã

Đầu file `page-intro/assets/intro.js`:

```js
var GA4_ID = 'G-XXXXXXXXXX';
var META_PIXEL_ID = '123456789012345';
```

Upload lại `intro.js`. (Hoặc gửi mã cho Claude để điền và kiểm tra.)

## Sự kiện đã gửi

| Sự kiện | Khi nào | Tham số |
|---|---|---|
| `page_view` (GA4) / `PageView` (Meta) | Mở trang | — |
| `buy_click` | Bấm bất kỳ nút mua nào | `location`: `nav`, `hero`, `demo-card`, `cta`, `sale-strip` |
| `InitiateCheckout` (Meta, chuẩn) | Cùng lúc với `buy_click` | — dùng làm mục tiêu tối ưu quảng cáo |
| `demo_click` | Bấm ảnh demo hoặc nút Live demo | `demo`: link store demo |

Trong GA4, đánh dấu `buy_click` là **Key event** (Admin → Events) để xem tỉ lệ chuyển đổi theo kênh.

Lưu ý: ThemeForest không cho gắn mã đo lường, nên chỉ đo được tới lúc bấm nút mua. Đơn thật xem ở
trang thống kê tác giả trên Envato (và báo cáo affiliate nếu dùng link affiliate).

## Link UTM cho từng kênh

GA4 tự đọc UTM. Luôn dùng link có UTM khi đăng, để biết khách đến từ đâu.

| Kênh | Link |
|---|---|
| Fanpage Facebook | `https://iphoenixthemes.com/themes/occasion/?utm_source=facebook&utm_medium=social&utm_campaign=occasion2` |
| Group Facebook | `https://iphoenixthemes.com/themes/occasion/?utm_source=facebook&utm_medium=group&utm_campaign=occasion2` |
| Reddit | `https://iphoenixthemes.com/themes/occasion/?utm_source=reddit&utm_medium=social&utm_campaign=occasion2` |
| YouTube (mô tả video) | `https://iphoenixthemes.com/themes/occasion/?utm_source=youtube&utm_medium=video&utm_campaign=occasion2` |
| Pinterest | `https://iphoenixthemes.com/themes/occasion/?utm_source=pinterest&utm_medium=social&utm_campaign=occasion2` |
| Email / tin nhắn | `https://iphoenixthemes.com/themes/occasion/?utm_source=email&utm_medium=email&utm_campaign=occasion2` |
| Quảng cáo Facebook | `…?utm_source=facebook&utm_medium=paid&utm_campaign=bf2026` |
| Google Ads | bật auto-tagging trong Google Ads (không cần UTM) |

Đợt Black Friday: đổi `utm_campaign=bf2026` để tách số liệu.
