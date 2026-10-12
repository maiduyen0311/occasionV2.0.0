---
description: Trích đoạn liên quan của một section từ design/SPEC.md để xem nhanh mà không phải mở file. Cú pháp /spec <section-id>.
argument-hint: <section-id>
---

User muốn xem spec của section: `$ARGUMENTS`

Hãy đọc `design/SPEC.md` và trích xuất:

1. Entry của section trong §2 (Section inventory) — copy nguyên text từ heading `### 2.x` cho tới heading kế tiếp.
2. Token màu mà section đó dùng — chỉ những token được nhắc trong entry, kèm hex từ §1.1.
3. Component spec liên quan — nếu section dùng `card-product`, copy §3.1; nếu dùng `article-card`, copy §3.2; etc.
4. Asset cần thiết — phần trong §4 thuộc section đó.

Format output:

```markdown
# Spec: <section-id>

## Section entry (SPEC §2.x)
<copy paste>

## Tokens used
- `--color-...` = `#hex`

## Components
<related section from §3>

## Assets
<list from §4>

## Status & next step
- Trạng thái hiện tại: OK existing / NEW / EDIT
- File: `sections/<id>.liquid` <tồn tại / chưa có>
- Nếu chưa có: gọi `/build-section <id>`
- Nếu đã có: gọi `/review-section <id>`
```

Nếu không tìm thấy `$ARGUMENTS` trong SPEC, list các section ID có sẵn (grep `### 2.` headings) và đề xuất tên gần nhất.
