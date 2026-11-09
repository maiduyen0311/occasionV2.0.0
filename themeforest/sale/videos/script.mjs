// Writes voiceover/SCRIPT.md (the lines to record) from narration.json.
//   node themeforest/sale/videos/script.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const n = JSON.parse(fs.readFileSync(path.join(DIR, 'narration.json'), 'utf8'));
const NAMES = { 1: 'Video 1 — 3 store designs (16:9)', 2: 'Video 2 — built-in features (16:9)', 3: 'Video 3 — Shorts (9:16)' };
const BR = '<break time="1.0s" />';

let md = `# Lời đọc (voice-over) — 3 video Occasion 2.0

Tạo tự động từ \`../narration.json\` (sửa lời ở đó rồi chạy lại lệnh ở cuối file). Giọng tiếng Anh, đọc tự nhiên,
tốc độ vừa phải. Video tự kéo dài cảnh nếu câu đọc dài hơn, nên không cần canh giờ.

## Cách 1 (dễ nhất): mỗi video một file

Dán nguyên khối "Đọc liền" của từng video vào công cụ giọng AI, tải về và lưu vào thư mục này:
\`v1.mp3\`, \`v2.mp3\`, \`v3.mp3\`. Giữa các câu phải có **khoảng 1 giây im lặng** — khối dưới đây đã chèn sẵn
\`${BR}\` (ElevenLabs hiểu thẻ này). Công cụ không hiểu thẻ thì xoá thẻ đi và để mỗi câu một
đoạn riêng. Bộ dựng tự cắt file thành từng câu theo khoảng lặng; nếu số câu không khớp nó sẽ báo lỗi.

## Cách 2: mỗi câu một file

Mỗi câu lưu thành một file theo tên ghi cạnh câu (vd \`v1-03.mp3\`). Hợp với CapCut, Canva hoặc tự thu âm.
Có file từng câu thì bộ dựng dùng chúng, bỏ qua file cả video.

Định dạng nhận: \`.mp3\`, \`.wav\`, \`.m4a\`. Nhạc nền (tuỳ chọn): \`music.mp3\` — được trộn nhỏ dưới giọng đọc
và tắt dần ở cuối. Lấy nhạc trong YouTube Audio Library, chọn bài ghi “No attribution required”.

`;
for (const v of ['1', '2', '3']) {
  const lines = Object.keys(n[v]).map(Number).sort((a, b) => a - b);
  md += `---\n\n## ${NAMES[v]}\n\n### Đọc liền (cách 1 → \`v${v}.mp3\`)\n\n\`\`\`\n${lines.map(k => n[v][k]).join(`\n${BR}\n`)}\n\`\`\`\n\n`;
  md += `### Từng câu (cách 2)\n\n| File | Cảnh | Lời đọc |\n|---|---|---|\n`;
  for (const k of lines) md += `| \`v${v}-${String(k).padStart(2, '0')}.mp3\` | ${k} | ${n[v][k]} |\n`;
  md += '\n';
}
md += `---

## Dựng lại video có giọng

\`\`\`
node themeforest/sale/videos/render.mjs
\`\`\`
(Chrome cổng 9334 phải đang chạy — xem ../README.md.) Kết quả trong \`../out/\`, kèm \`timeline-v1.json\`… để cập nhật mốc
chapter trong mô tả YouTube.

Tạo lại file này: \`node themeforest/sale/videos/script.mjs\`
`;
fs.writeFileSync(path.join(DIR, 'voiceover', 'SCRIPT.md'), md);
console.log('✔ voiceover/SCRIPT.md');
