---
description: Đăng ký 1 section đã build vào templates/index.json — chèn vào `sections` map + `order` array đúng vị trí theo SPEC §Appendix A. Cú pháp /wire-section <section-id>.
argument-hint: <section-id>
---

User muốn wire section: `$ARGUMENTS` vào `templates/index.json`.

## Quy trình

1. **Verify section file tồn tại**: check `sections/$ARGUMENTS.liquid`. Nếu chưa có → dừng, đề xuất `/build-section $ARGUMENTS` trước.

2. **Đọc SPEC §Appendix A** (`design/SPEC.md`) — lấy thứ tự chuẩn của section homepage.

3. **Đọc** `templates/index.json` — biết section nào đã có trong `order`.

4. **Xác định vị trí chèn**: tra trong Appendix A thứ tự, tìm vị trí của `$ARGUMENTS`, chèn ngay sau section liền trước của nó trong `order` (mà section liền trước đã tồn tại).

5. **Đọc** `sections/$ARGUMENTS.liquid` schema → trích preset settings nếu có; nếu không có preset, lấy default settings.

6. **Edit** `templates/index.json`:
   - Thêm vào `sections` map: key là `$ARGUMENTS` (hoặc snake_case nếu user prefer), `type` là tên section file (không phải `.liquid`)
   - Settings copy từ preset / default trong SPEC §2 entry (text, color, count...)
   - Block (nếu có) copy từ preset
   - Thêm tên key đó vào `order` array đúng vị trí

7. **Verify** JSON syntax — không leave trailing comma, không double key.

## Output format

```markdown
✅ Wired `$ARGUMENTS` vào templates/index.json

- Position: <N> trong order (sau `<prev>`, trước `<next>`)
- Settings populated: <count> từ SPEC defaults
- Blocks: <count> từ preset

Next: chạy `npm run dev` trong `src/` và verify trong browser.
```

## Constraints

- KHÔNG xóa section khác trong order
- KHÔNG đổi settings của section khác
- Nếu `$ARGUMENTS` đã có trong order → hỏi user (overwrite / skip / append new instance với suffix)
- Nếu SPEC Appendix A không list section này → hỏi user vị trí chèn
- JSON phải valid sau edit — chạy `python3 -m json.tool templates/index.json > /dev/null` để verify
