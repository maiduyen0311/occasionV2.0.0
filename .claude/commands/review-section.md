---
description: Review 1 section đã build — chạy liquid-reviewer + schema-auditor (song song) và gộp kết quả. Cú pháp /review-section <section-id>.
argument-hint: <section-id>
---

User muốn review section: `$ARGUMENTS`

## Quy trình

1. **Verify file tồn tại**: `sections/$ARGUMENTS.liquid`. Nếu không có → dừng, đề xuất `/build-section $ARGUMENTS`.

2. **Spawn 2 agent song song** trong cùng 1 message (parallel):

   **Agent 1 — `liquid-reviewer`**:
   ```
   Review file `sections/$ARGUMENTS.liquid` theo checklist trong agent definition.
   Đối chiếu với `design/SPEC.md` §2 entry tương ứng + `CLAUDE.md` conventions.
   Output theo format markdown chuẩn của agent.
   ```

   **Agent 2 — `schema-auditor`**:
   ```
   Audit {% schema %} của `sections/$ARGUMENTS.liquid`.
   Verify mọi visual element trong markup có setting tương ứng + có default + có preset.
   Output theo format markdown chuẩn của agent.
   ```

3. **Optional**: nếu user thêm flag `--visual` hoặc nói "kiểm tra cả render" → spawn thêm `responsive-qa` agent (cần dev server đang chạy).

4. **Gộp kết quả**: hiển thị cả 2 (3) report. Tổng hợp:

```markdown
# Review summary: $ARGUMENTS

## Verdict
<approve / changes required>

## Counts
- 🔴 Blocking: <từ cả 2 agent>
- 🟡 Should-fix: <count>
- 🔵 Nits: <count>

## Top 3 blockers
1. ...
2. ...
3. ...

## Full reports
<paste từ liquid-reviewer>
---
<paste từ schema-auditor>
```

5. **Đề xuất**: nếu có blocker → list các edit cần làm (user tự edit hoặc gọi `section-builder` để re-scaffold). Nếu pass → đề xuất chạy `npm run dev` + visual check.

## Constraints

- KHÔNG tự sửa file dựa trên review — chỉ output report.
- Agent chạy SONG SONG (cùng 1 tool-call batch) để tiết kiệm thời gian.
- Nếu user truyền tên section không tồn tại → dừng và list những section có sẵn trong `sections/`.
