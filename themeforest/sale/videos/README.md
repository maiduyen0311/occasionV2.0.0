# Video YouTube — Occasion 2.0

Ba video dựng từ ảnh chụp 3 demo store, màu và font Occasion (Poppins).

**Bản trong `out/` (9/11/2026) đã hoàn chỉnh để đăng:** giọng đọc tiếng Anh (giọng Windows Microsoft Zira, tạo bằng
`tts.ps1` từ `narration.json`) + nhạc nền piano nhẹ do bộ dựng tự soạn (bản gốc, không cần ghi nguồn, không lo bản
quyền), nhạc tự nhỏ lại khi có giọng đọc.

| File (trong `out/`) | Khổ | Dài | Đăng dạng |
|---|---|---|---|
| `occasion-2-0-three-store-designs.mp4` + `thumbnail-v1.jpg` | 1920 × 1080 | 1:47 | Video thường |
| `occasion-2-0-built-in-features.mp4` + `thumbnail-v2.jpg` | 1920 × 1080 | 1:29 | Video thường |
| `occasion-2-0-shorts-3-stores-1-theme.mp4` | 1080 × 1920 | 0:36 | Shorts (dọc, dưới 60 giây) |

Muốn giọng hay hơn: thu giọng / tạo giọng AI theo [voiceover/SCRIPT.md](voiceover/SCRIPT.md), thay các file trong
`voiceover/` rồi chạy lại `render.mjs` — cảnh tự dài ra cho vừa câu đọc. Có `voiceover/music.mp3` thì dùng nhạc đó
thay nhạc tự soạn. Đổi giọng thì mốc chapter đổi theo: lấy cột `start` trong `out/timeline-v1.json`.

`frames/` và `out/` không nằm trong git (file lớn) — dựng lại bằng lệnh ở cuối file.

Link trong mô tả có `utm_source=youtube` để GA4 (G-7HCVQ4XPFZ) tách lượt xem từ YouTube; `utm_content` cho
biết video nào. Khi có link affiliate, link ThemeForest trong mô tả cũng đổi sang link affiliate.

---

## Video 1 — 3 store designs

**Tiêu đề**
```
Occasion 2.0 Shopify Theme – 3 Store Designs (Supermarket & Fashion) | Online Store 2.0
```

**Mô tả**
```
Occasion 2.0 is a Shopify theme rebuilt for Online Store 2.0, with 3 ready-made store designs:
Occasion (supermarket / multi-category), Home Fashion #1 and Home Fashion #2.

▶ Live demos: https://iphoenixthemes.com/themes/occasion/?utm_source=youtube&utm_medium=video&utm_campaign=occasion2&utm_content=v1-designs
▶ Get Occasion on ThemeForest: https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511

Built in, no extra apps: mega menu, quick view, wishlist, product compare, daily deals with countdown,
bundle discount, add-to-cart popup, sales popup, newsletter popup, free shipping bar, cookie consent.
Sections on every page, no jQuery, 31 storefront languages.

Already bought Occasion 1.x? Version 2.0 is a free update on your ThemeForest Downloads page.

Chapters
0:00 Occasion – supermarket & multi-category
0:41 Home Fashion #1
1:07 Home Fashion #2
1:35 Get Occasion 2.0

#shopify #shopifytheme #onlinestore2
```

**Tags**
```
shopify theme, shopify 2.0 theme, online store 2.0, shopify supermarket theme, shopify grocery theme,
shopify fashion theme, multipurpose shopify theme, shopify mega menu, occasion shopify theme, themeforest shopify
```

---

## Video 2 — built-in features

**Tiêu đề**
```
Shopify Theme with Mega Menu, Wishlist, Compare & Daily Deals Built In (No Apps) – Occasion 2.0
```

**Mô tả**
```
The store features you would otherwise add with paid apps, built into one Shopify theme:

0:14 Mega menu
0:20 Product card actions
0:25 Quick view
0:32 Wishlist popup
0:36 Wishlist page
0:42 Product compare
0:49 Daily deals with countdown
0:54 Add-to-cart popup
0:59 Mini cart
1:04 Newsletter & sales popups
1:12 Mobile menu

▶ Try them on the live demos: https://iphoenixthemes.com/themes/occasion/?utm_source=youtube&utm_medium=video&utm_campaign=occasion2&utm_content=v2-features
▶ Get Occasion on ThemeForest: https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511

Occasion 2.0 is rebuilt for Shopify Online Store 2.0: sections on every page, no jQuery,
3 store designs (supermarket and two fashion stores).

#shopify #shopifytheme #ecommerce
```
(Các mốc thời gian ở trên là danh sách tính năng, không phải chapter: YouTube cần mỗi chapter ≥ 10 giây.)

**Tags**
```
shopify theme, shopify mega menu, shopify wishlist, shopify product compare, shopify quick view,
shopify daily deals, shopify countdown timer, shopify theme no apps, online store 2.0, occasion shopify theme
```

---

## Video 3 — Shorts

**Tiêu đề** (Shorts nên ngắn)
```
3 Shopify stores, 1 theme 🛒 #shopify #shorts
```

**Mô tả**
```
Occasion 2.0 – Shopify theme for Online Store 2.0 with 3 store designs.
Live demos: https://iphoenixthemes.com/themes/occasion/?utm_source=youtube&utm_medium=shorts&utm_campaign=occasion2&utm_content=v3-shorts
```
Shorts không cho bấm link trong mô tả trên điện thoại — sau khi đăng, vào Studio gắn **Related video** = Video 1
để người xem bấm sang video dài có link.

---

## Sau khi đăng

1. **Bình luận ghim** dưới video 1 và 2:
   ```
   Live demos of all 3 designs: https://iphoenixthemes.com/themes/occasion/?utm_source=youtube&utm_medium=comment&utm_campaign=occasion2
   Questions about the theme? Ask here, we reply within 24 hours.
   ```
2. **End screen** (Studio → Editor → End screen): video 1 ↔ video 2 trỏ sang nhau + nút Subscribe. Màn kết của
   video đã chừa chỗ trống phía dưới.
3. **Playlist** “Occasion Shopify Theme”: cho cả 3 video vào.
4. **Trang ThemeForest**: thêm link video 1 vào phần description (ThemeForest cho nhúng link YouTube).
5. Sau 1–2 tuần: xem GA4 → Traffic acquisition, lọc `youtube` để biết video có mang người vào intro không.

## Dựng lại video

Cần Chrome mở cổng gỡ lỗi 9334 (không cần cài thêm gói npm):
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --remote-debugging-port=9334 --user-data-dir=%TEMP%\chrome-video --hide-scrollbars about:blank
node themeforest/sale/videos/capture.mjs        # chụp lại 3 demo → frames/
powershell -File themeforest/sale/videos/tts.ps1  # giọng Windows → voiceover/*.wav (bỏ qua nếu đã có giọng thu)
node themeforest/sale/videos/render.mjs         # dựng 3 video + thumbnail → out/
node themeforest/sale/videos/render.mjs 2 at 15 # xem thử 1 khung hình của video 2 ở giây 15
```
Nội dung từng cảnh (chữ, thời lượng, ảnh) nằm trong mảng `VIDEOS` đầu `compose.html`. Video được ghi theo thời
gian thực (MediaRecorder trong Chrome), nên dựng 3 video mất khoảng 3 phút.
