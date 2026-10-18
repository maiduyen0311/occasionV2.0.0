#!/usr/bin/env node
/**
 * Renders the clone01 inner-page banners (collection header, shop + blog sidebars) from
 * HTML into demos/clone01/images/<key>.jpg, in the style of the homepage banners: pastel
 * ground, cut-out model, a faded serif word behind a condensed title, "SHOP NOW >".
 * Model cut-outs come from design/clone01/02_Image (local design files, not in git).
 * Output is 2x the size the banners are shown at, so they stay sharp on retina screens.
 *
 *   node scripts/demo/clone01-banners.js [key…]
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const IMG = path.join(ROOT, 'design', 'clone01', '02_Image');
const OUT = path.join(ROOT, 'demos', 'clone01', 'images');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const img = (file) => pathToFileURL(path.join(IMG, file)).href;

const FONTS = 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&family=Playfair+Display:ital,wght@0,400;1,400&family=Poppins:wght@400;500;600&display=block';
const GREEN = '#96cc66';
const BROWN = '#51412c';

const base = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body { position: relative; font-family: Poppins, sans-serif; color: ${BROWN}; }
  .ghost { position: absolute; font-family: 'Playfair Display', serif; text-transform: uppercase; line-height: 1; color: rgba(81, 65, 44, 0.07); white-space: nowrap; }
  .eyebrow { font-family: 'Playfair Display', serif; font-style: italic; color: ${GREEN}; }
  .title { font-family: Oswald, sans-serif; font-weight: 600; text-transform: uppercase; line-height: 1.05; color: ${BROWN}; }
  .shop { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: ${BROWN}; }
  .shop::after { content: ''; width: 6px; height: 6px; border: solid currentColor; border-width: 1.5px 1.5px 0 0; transform: rotate(45deg); }
  .model { position: absolute; bottom: 0; height: auto; }
`;

// Each banner: CSS size it is shown at (rendered at 2x) + its markup
const BANNERS = {
  // Collection page, above the product grid (main column ≈ 940px wide)
  'banner-collection': {
    width: 940,
    height: 220,
    html: `
      <style>
        body { background: linear-gradient(100deg, #f3f9ee 0%, #e4f2d6 100%); }
        .stripes { position: absolute; right: 70px; top: 26px; width: 280px; height: 194px;
          background: repeating-linear-gradient(135deg, ${GREEN} 0 6px, transparent 6px 18px); opacity: 0.55; }
        .dot { position: absolute; left: 520px; top: 34px; width: 120px; height: 120px; border-radius: 50%; background: #ffbd2e; opacity: 0.85; }
        .ghost { left: 58px; top: 10px; font-size: 64px; letter-spacing: 0.08em; }
        .copy { position: absolute; left: 70px; top: 58px; }
        .eyebrow { font-size: 22px; margin-bottom: 4px; }
        .title { font-size: 44px; letter-spacing: 0.01em; }
        .title b { color: ${GREEN}; font-weight: 600; }
        .sub { margin: 6px 0 14px; font-size: 13px; color: #8a7d6b; }
        .shop { font-size: 11px; }
        .model { right: 120px; width: 300px; bottom: -150px; }
        .model--2 { right: 330px; width: 250px; bottom: -150px; }
      </style>
      <div class="stripes"></div>
      <div class="dot"></div>
      <div class="ghost">Collection</div>
      <img class="model model--2" src="${img('Layer-70736.png')}">
      <img class="model" src="${img('Layer-70735.png')}">
      <div class="copy">
        <p class="eyebrow">Hot trend</p>
        <h2 class="title">Summer style <b>'26</b></h2>
        <p class="sub">Up to 40% off selected new arrivals</p>
        <span class="shop">Shop now</span>
      </div>`,
  },
  // Collection sidebar (≈ 270px wide)
  'banner-sidebar-shop': {
    width: 270,
    height: 400,
    html: `
      <style>
        body { background: linear-gradient(180deg, #ffe9ef 0%, #fdd5e0 100%); }
        .frame { position: absolute; inset: 12px; border: 1px solid rgba(255, 255, 255, 0.9); z-index: 2; }
        .ghost { left: 50%; top: 18px; transform: translateX(-50%); font-size: 64px; color: rgba(255, 255, 255, 0.75); }
        .copy { position: absolute; left: 0; right: 0; top: 44px; text-align: center; z-index: 3; }
        .tag { display: inline-block; padding: 3px 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; background: ${GREEN}; }
        .title { margin: 10px 0 2px; font-size: 34px; }
        .eyebrow { font-size: 17px; color: ${BROWN}; }
        .model { left: 50%; transform: translateX(-50%); width: 300px; bottom: -6px; }
        .shop { position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 3; padding: 9px 18px; font-size: 10px; background: #fff; }
      </style>
      <div class="ghost">Knit</div>
      <img class="model" src="${img('Layer-707855.png')}">
      <div class="frame"></div>
      <div class="copy">
        <span class="tag">Sale 30%</span>
        <h3 class="title">Cosy knits</h3>
        <p class="eyebrow">soft &amp; colourful</p>
      </div>
      <span class="shop">Shop now</span>`,
  },
  // Blog + article sidebar (≈ 270px wide)
  'banner-sidebar-blog': {
    width: 270,
    height: 400,
    html: `
      <style>
        body { background: #eaf3fb; }
        .circle { position: absolute; left: 50%; top: 150px; width: 250px; height: 250px; margin-left: -125px; border-radius: 50%; background: #d3e6f6; }
        .ghost { left: 50%; top: 30px; transform: translateX(-50%); font-size: 40px; color: rgba(255, 255, 255, 0.95); }
        .copy { position: absolute; left: 0; right: 0; top: 38px; text-align: center; z-index: 2; }
        .eyebrow { font-size: 17px; }
        .title { margin-top: 2px; font-size: 30px; }
        .title b { display: block; font-size: 15px; font-weight: 500; letter-spacing: 0.32em; color: #8a7d6b; }
        .model { left: 50%; transform: translateX(-50%); width: 260px; bottom: -120px; }
        .shop { position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 2; padding: 9px 18px; font-size: 10px; color: #fff; background: ${BROWN}; }
      </style>
      <div class="circle"></div>
      <div class="ghost">Lookbook</div>
      <img class="model" src="${img('h1-slider-1-layer-1.png')}">
      <div class="copy">
        <p class="eyebrow">The new</p>
        <h3 class="title">Lookbook<b>2026</b></h3>
      </div>
      <span class="shop">Discover</span>`,
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(BANNERS);
  const port = 9600 + Math.floor(Math.random() * 300);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-banners-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch (_) {}
    }
    if (!target) throw new Error('Chrome did not start');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Page.enable');

    for (const key of keys) {
      const b = BANNERS[key];
      if (!b) { console.warn(`  ! unknown banner ${key}`); continue; }
      const file = path.join(profile, `${key}.html`);
      fs.writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>${base}</style></head><body>${b.html}</body></html>`);
      await send('Emulation.setDeviceMetricsOverride', { width: b.width, height: b.height, deviceScaleFactor: 2, mobile: false });
      await send('Page.navigate', { url: pathToFileURL(file).href });
      await sleep(800);
      await send('Runtime.evaluate', { expression: 'Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))])', awaitPromise: true });
      await sleep(300);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: b.width, height: b.height, scale: 1 } });
      fs.writeFileSync(path.join(OUT, `${key}.jpg`), Buffer.from(shot.result.data, 'base64'));
      console.log(`  demos/clone01/images/${key}.jpg (${b.width * 2}x${b.height * 2})`);
    }
    ws.close();
  } finally {
    chrome.kill();
    await sleep(500);
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
