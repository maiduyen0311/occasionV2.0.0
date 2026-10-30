/**
 * Renders the sale images drawn in HTML (headless Chrome or Edge), then saves them as JPG.
 *
 *   node themeforest/sale/render.js
 *
 * og-image.html → page-intro/images/og-occasion.jpg (1200 × 630, social share image of the intro page)
 *
 * Not part of `npm run release`: themeforest/sale/ is marketing material only.
 * JPG conversion uses the same tools as themeforest/preview/build.js (Windows: System.Drawing).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.join(here, '..', '..');
const IMAGES = [
  ['og-image.html', path.join(root, 'page-intro', 'images', 'og-occasion.jpg'), 1200, 630],
];

const browser = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((b) => fs.existsSync(b));
if (!browser) throw new Error('Chrome or Edge not found');

function toJpg(png, jpg, quality = 85) {
  if (process.platform === 'win32') {
    const ps = [
      'Add-Type -AssemblyName System.Drawing',
      `$img = [System.Drawing.Image]::FromFile('${png}')`,
      "$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }",
      '$p = New-Object System.Drawing.Imaging.EncoderParameters 1',
      `$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ${quality}L`,
      `$img.Save('${jpg}', $enc, $p)`,
      '$img.Dispose()',
    ].join('; ');
    execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
  } else if (process.platform === 'darwin') {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), png, '--out', jpg], { stdio: 'ignore' });
  } else {
    execFileSync('convert', [png, '-quality', String(quality), jpg], { stdio: 'inherit' });
  }
  fs.rmSync(png);
}

for (const [html, jpg, w, h] of IMAGES) {
  const png = jpg.replace(/\.jpg$/, '.png');
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', `--window-size=${w},${h}`, '--virtual-time-budget=8000',
    `--screenshot=${png}`, 'file:///' + path.join(here, html).replace(/\\/g, '/'),
  ], { stdio: 'ignore' });
  if (!fs.existsSync(png)) throw new Error(`Screenshot failed: ${html}`);
  toJpg(png, jpg);
  console.log(`✔ ${path.relative(root, jpg)} (${w} × ${h}, ${(fs.statSync(jpg).size / 1024).toFixed(0)} KB)`);
}
