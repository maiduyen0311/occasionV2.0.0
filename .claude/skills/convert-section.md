---
name: convert-section
description: Full end-to-end workflow để convert 1 section homepage từ design sang Shopify theme. Chạy tuần tự — spec → build → wire → preview → review. Use when user invokes /convert-section <id> hoặc nói "convert toàn bộ section X". Đây là orchestrator — nó gọi các sub-agent và sub-command theo thứ tự.
---

User muốn convert section: `$ARGUMENTS`

Workflow này gọi các agent/command đã định nghĩa, kết nối thành chuỗi end-to-end.

## Step 1: Spec lookup

Đọc `design/SPEC.md`:
- Tìm entry `$ARGUMENTS` trong §2
- Verify trạng thái: NEW / EDIT / OK existing
- Tóm tắt 3-4 dòng: layout, settings chính, blocks, asset cần
- Liệt kê các điểm Gaps & questions (§5) liên quan section này

**Nếu trạng thái = OK existing** → hỏi user có muốn /review-section thay vì re-build, dừng workflow.

**Nếu SPEC ambiguous về điểm trọng yếu** (font, mobile layout, badge logic...) → hỏi user trước khi tiếp tục.

## Step 2: Build

Gọi `section-builder` agent (xem `.claude/agents/section-builder.md`):

```
Build section $ARGUMENTS theo SPEC §2.<x>.
Tạo .liquid + .scss + cập nhật styles.scss + locale keys.
```

Hiển thị report. Nếu agent báo lỗi/blocker → dừng workflow, return user.

## Step 3: Tokens sync (conditional)

**Nếu** section dùng CSS var mới chưa có trong `_tokens.scss` (vd banner pastel mới):

Gọi `theme-tokens` agent:
```
Sync token mới từ section $ARGUMENTS vào _tokens.scss + theme-styles.liquid.
```

## Step 4: Card snippet extend (conditional)

**Nếu** section yêu cầu feature card mới chưa có (wishlist heart, category tag pill, sold progress):

Gọi `card-component` agent:
```
Extend card snippet cho feature X (theo SPEC §3.<y>).
```

## Step 5: Wire to template

Gọi command `/wire-section $ARGUMENTS` (xem `.claude/commands/wire-section.md`):
- Thêm vào `templates/index.json` đúng vị trí theo SPEC Appendix A
- Verify JSON valid

## Step 6: Review

Gọi command `/review-section $ARGUMENTS` (chạy `liquid-reviewer` + `schema-auditor` song song).

**Nếu** có 🔴 blocker:
- List ra cho user
- Đề xuất: user tự fix, hoặc gọi lại `section-builder` để re-scaffold
- Dừng workflow

## Step 7: Visual QA (optional)

Hỏi user dev server có đang chạy không (`npm run dev` trong `src/`).

**Nếu có** → gọi `responsive-qa` agent:
```
Verify $ARGUMENTS @ http://127.0.0.1:9293 ở 4 viewport (1440/1024/768/375)
so với design/old-demo/index.png và SPEC §2.
```

## Step 8: Summary

Output:

```markdown
# Convert summary: $ARGUMENTS

| Step | Status | Notes |
|---|---|---|
| 1. Spec lookup | ✅ | <1 line> |
| 2. Build | ✅ | <files created> |
| 3. Tokens | ⏭ skipped | <reason hoặc updates> |
| 4. Card extend | ⏭ skipped | <reason hoặc updates> |
| 5. Wire | ✅ | Position N in order |
| 6. Review | ✅/🔴 | <blocker count> |
| 7. Visual QA | ✅/⏭ | <reason> |

## Files changed
- (list)

## Outstanding issues
- (list — nếu có)

## Next section
- Theo SPEC Appendix A, section kế tiếp cần convert là `<next>`. Gọi `/convert-section <next>`?
```

## Constraints

- Workflow tuần tự — đừng skip step trừ khi step explicit là conditional
- Mỗi sub-agent/command đã định nghĩa scope riêng — đừng override
- Stop ngay khi gặp 🔴 blocker, đừng cố push qua
- Auto mode: vẫn confirm với user ở những bước có rủi ro (overwrite section đã có, thay đổi token global, edit snippet shared)
