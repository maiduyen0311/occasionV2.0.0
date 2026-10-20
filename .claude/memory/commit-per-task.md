---
name: commit-per-task
description: "User wants a git commit after each finished request, with a timestamp in the message, then pushed"
metadata:
  node_type: memory
  type: feedback
  originSessionId: f4f890ce-b681-4c4e-9077-93c97e50e4da
  modified: 2026-10-14T15:42:39.068Z
---

Commit as soon as each requested piece of work is done ("vừa làm vừa xong 1 yêu cầu thì commit với thời gian"), not one big commit at the end. Prefix the subject with the local time, e.g. `[2026-10-13 15:01] Match the PSD design: …`. Then push it ("nhớ đẩy lên git nhé", 2026-10-14).

**Why:** user wants progress checkpoints they can review/revert per task, and shares the branch with another machine (origin/release/v2.0.0 on github.com/maiduyen0311/occasionV2.0.0).
**How to apply:** after each item is verified, `git add` (excluding the user's own `design/` files — PSDs are gitignored, SPEC/old-demo removal and design/clone* are theirs) and commit on release/v2.0.0 with `date "+%Y-%m-%d %H:%M"`. Then `git fetch`; if the remote moved, merge (not rebase) before `git push origin release/v2.0.0`. See [[design-source-psd]].
