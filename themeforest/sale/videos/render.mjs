// Render the YouTube videos and thumbnails from compose.html.
//   node themeforest/sale/videos/render.mjs            → all videos + thumbnails into out/
//   node themeforest/sale/videos/render.mjs 2          → video 2 only
//   node themeforest/sale/videos/render.mjs 1 thumb    → thumbnail of video 1 only
//   node themeforest/sale/videos/render.mjs 1 at 12.5  → one still frame at 12.5 s (checking)
// Voice-over comes from voiceover/ (see voiceover/SCRIPT.md); VO=other-folder picks another folder.
// Needs Chrome with --remote-debugging-port=9334 (README.md) and frames/ from capture.mjs.
import { connect } from './cdp.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4' };
const server = http.createServer((req, res) => {
  const p = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(DIR) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/compose.html`;
const VOQ = process.env.VO ? `&vo=${encodeURIComponent(process.env.VO)}` : '';

const [only, mode, at] = process.argv.slice(2);
const c = await connect();
await c.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT });

async function run(query, timeoutS) {
  await c.send('Page.navigate', { url: `${BASE}?${query}${VOQ}` });
  for (let i = 0; i < timeoutS * 2; i++) {
    await c.sleep(500);
    const st = await c.ev('window.__state');
    if (st === 'done' || (st && st.startsWith('error'))) return st;
  }
  return 'timeout';
}
async function saveCanvas(file) {
  const data = await c.ev(`document.getElementById('c').toDataURL('image/jpeg', 0.92)`);
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data.split(',')[1], 'base64'));
  console.log('✔', file);
}

for (const v of only ? [only] : ['1', '2', '3']) {
  if (mode === 'at') { console.log(await run(`v=${v}&t=${at}`, 60)); await saveCanvas(`check-v${v}-${at}s.jpg`); continue; }
  if (v !== '3') { const st = await run(`v=${v}&thumb=1`, 60); if (st === 'done') await saveCanvas(`thumbnail-v${v}.jpg`); else console.log('thumb', v, st); }
  if (mode === 'thumb') continue;
  await c.send('Page.navigate', { url: 'about:blank' });
  const before = new Set(fs.readdirSync(OUT));
  const st = await run(`v=${v}`, 300);
  const info = await c.ev('JSON.stringify({file: window.__file, size: window.__size, mime: window.__mime, fps: window.__fps, total: window.__total, voice: window.__voice})');
  console.log('video', v, st, info);
  // Scene start times (for YouTube chapters, which move when the voice-over changes)
  const tl = await c.ev('JSON.stringify(window.__timeline || [])');
  fs.writeFileSync(path.join(OUT, `timeline-v${v}.json`), tl);
  // Wait for Chrome to finish writing the download
  for (let i = 0; i < 60; i++) { const f = fs.readdirSync(OUT).filter(n => !before.has(n) && !n.endsWith('.crdownload')); if (f.length) break; await c.sleep(500); }
}
console.log('errors', c.errors.slice(0, 5));
c.close();
server.close();
