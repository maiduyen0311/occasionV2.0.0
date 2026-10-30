# 05 · Black Friday 2026

Black Friday 27/11/2026, Cyber Monday 30/11/2026. Đề xuất: giảm **30% từ 22/11 đến hết 1/12**.

## 1. Giảm giá trên Envato (bắt buộc làm trước)

Có hai cách, **kiểm tra cách nào áp dụng** cho năm nay:

- **Đợt sale chung của Envato**: Envato thường gửi lời mời tác giả tham gia, có hạn đăng ký trước đợt sale
  vài tuần và mức giảm do Envato đặt. Xem email Envato và Author Hub ngay.
- **Tự giảm giá** (Author Driven Discount): ThemeForest → item → Manage Discount → chọn 30% → ngày
  22/11 đến 1/12 (giờ AEST). Quỹ 60 ngày / 12 tháng, tối đa 30 ngày liên tiếp.

Có thể Envato không cho chồng hai cách, hoặc yêu cầu item không giảm giá ngay trước đợt chung — đọc điều
kiện trong lời mời. Ở giá $48 giảm 30%: khách trả $33, phần của bạn $18 (xem 04-campaign-plan.md).

## 2. Dải sale trên page intro

Đã có sẵn trong `page-intro/assets/intro.js`, đang tắt:

```js
var SALE = {
  enabled: false,          // → true khi giảm giá trên Envato đã được đặt
  start: '2026-11-22',     // dải tự hiện từ ngày này (UTC)
  end: '2026-12-02',       // và tự ẩn từ ngày này
  text: '<b>Black Friday</b> Occasion is 30% off until December 1',
  cta: 'Get the deal'
};
```

Dải màu cam nằm trên menu, nút “Get the deal” dùng cùng link mua (affiliate nếu có). Chỉ bật khi giá trên
ThemeForest đã giảm thật — nếu không, khách thấy “30% off” nhưng trang ThemeForest vẫn giá cũ.

Đổi `text` nếu mức giảm hoặc ngày khác. Upload `intro.js` sau khi sửa.

## 3. Bài đăng

Xem [06-posts.md](06-posts.md) mục Black Friday. Dùng `utm_campaign=bf2026` trong link.

## 4. Sau đợt sale

- Đặt `enabled: false` (hoặc để ngày `end` tự ẩn).
- Ghi lại lượt bán 22/11–1/12 so với 2 tuần trước để quyết định năm sau.
