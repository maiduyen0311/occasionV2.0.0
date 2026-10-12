---
description: Build a new Shopify section from a SPEC.md entry. Invokes the section-builder agent. Cú pháp /build-section <section-id>.
argument-hint: <section-id>
---

User muốn build section: `$ARGUMENTS`

## Trước khi spawn agent

1. Verify `$ARGUMENTS` có trong `design/SPEC.md` §2 — nếu không, dừng và đề xuất tên gần nhất.
2. Verify file `sections/$ARGUMENTS.liquid` CHƯA tồn tại — nếu đã có, hỏi user có muốn `/review-section` thay vì build lại (build sẽ overwrite).
3. Verify section đó là trạng thái "NEW" hoặc "EDIT" trong SPEC — không build lại section "OK existing" trừ khi user xác nhận.

## Spawn agent

Spawn `section-builder` agent với prompt:

```
Build Shopify section `$ARGUMENTS` cho theme Top Market.

Đọc:
- `design/SPEC.md` §2 — tìm entry `$ARGUMENTS`
- `CLAUDE.md` — conventions
- Các section liền tính chất để mirror style (xem section-builder agent definition để biết)

Tạo:
- `sections/$ARGUMENTS.liquid`
- `common/scss/section/_$ARGUMENTS.scss`
- Thêm `@use` line vào `common/scss/styles.scss`
- Bổ sung locale keys vào `locales/en.default.json`

KHÔNG sửa `templates/index.json` — đó là việc của /wire-section.

Khi xong, báo cáo file paths + settings exposed + suggested next step.
```

## Sau khi agent xong

- Hiển thị report của agent
- Đề xuất chạy: `/wire-section $ARGUMENTS` để thêm vào homepage
- Đề xuất chạy: `/review-section $ARGUMENTS` để review code
