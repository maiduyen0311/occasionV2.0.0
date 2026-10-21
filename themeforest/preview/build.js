/**
 * Everything for the ThemeForest upload form, in one folder (not part of the buyer package).
 *
 *   node themeforest/preview/build.js        (also run at the end of `npm run release`)
 *
 * dist/themeforest-upload/
 *   1-main-file/occasion-themeforest-v<version>.zip   "Main File(s)"     (copied from npm run release)
 *   2-thumbnail/thumbnail.png                            "Thumbnail"        80 × 80
 *   3-theme-preview/occasion-preview-v<version>.zip      "Theme Preview"    01_preview.jpg (590 × 300) + gallery
 *   3-theme-preview/inline-preview-590x300.jpg           the same 01_preview.jpg, to check it
 *   4-description-images/01-hero.jpg … 10-mobile.jpg     banners used by the description, 1180 px wide
 *                                                        (host them at iphoenixthemes.com/themes/occasion/themeforest/)
 *   5-listing/                                           name, description HTML, tags, reviewer message, FAQ…
 *   UPLOAD-GUIDE.md                                      which file goes into which form field
 *
 * Renders thumbnail.html / inline-preview.html / banners.html with headless Chrome or Edge (fonts from
 * Google Fonts) and copies the gallery screenshots from page-intro/images. The browser only writes
 * PNG, so JPGs are converted (Windows: System.Drawing, macOS: sips, Linux: ImageMagick).
 */
const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const here = __dirname;
const schema = JSON.parse(fs.readFileSync(path.join(root, 'config/settings_schema.json'), 'utf8'));
const version = (schema.find((g) => g.name === 'theme_info') || {}).theme_version || '1.0.0';
const out = path.join(root, 'dist', 'themeforest-upload');
const dir = (name) => { const d = path.join(out, name); fs.mkdirSync(d, { recursive: true }); return d; };

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const browser = browsers.find((b) => fs.existsSync(b));
if (!browser) throw new Error('Chrome or Edge not found: install one, or edit the list in build.js');

function shot(page, file, width, height) {
  const [html, query = ''] = page.split('?');
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', `--window-size=${width},${height}`, '--virtual-time-budget=8000',
    `--screenshot=${file}`, 'file:///' + path.join(here, html).replace(/\\/g, '/') + (query ? '?' + query : ''),
  ], { stdio: 'ignore' });
  if (!fs.existsSync(file)) throw new Error(`Screenshot failed: ${file}`);
}

function toJpg(png, jpg, quality = 92) {
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
  if (!fs.existsSync(jpg)) throw new Error(`JPG conversion failed: ${jpg}`);
  fs.rmSync(png);
}

function zipDir(cwd, zip) {
  if (process.platform === 'win32') {
    const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    execSync(`"${tar}" -a -c -f "${zip}" *`, { cwd, stdio: 'inherit' });
  } else {
    execSync(`zip -q "${zip}" *`, { cwd, stdio: 'inherit' });
  }
}

// Gallery screenshots (page-intro/images), in display order
const SCREENSHOTS = [
  ['demo-occasion-full.jpg', '02_occasion-home.jpg'],
  ['page-occasion-collection.jpg', '03_occasion-collection.jpg'],
  ['page-occasion-product.jpg', '04_occasion-product.jpg'],
  ['f-mega.jpg', '05_occasion-mega-menu.jpg'],
  ['f-deal.jpg', '06_occasion-daily-deals.jpg'],
  ['demo-fashion1-full.jpg', '07_fashion-1-home.jpg'],
  ['page-fashion1-collection.jpg', '08_fashion-1-collection-list.jpg'],
  ['page-fashion1-product.jpg', '09_fashion-1-product-bundle.jpg'],
  ['f-fashion1-categories.jpg', '10_fashion-1-categories.jpg'],
  ['demo-fashion2-full.jpg', '11_fashion-2-home.jpg'],
  ['page-fashion2-collection.jpg', '12_fashion-2-collection.jpg'],
  ['page-fashion2-product.jpg', '13_fashion-2-product.jpg'],
  ['f-fashion2-mega.jpg', '14_fashion-2-mega-menu.jpg'],
  ['f-fashion2-quickview.jpg', '15_quick-view.jpg'],
  ['f-cart-popup.jpg', '16_add-to-cart-popup.jpg'],
  ['f-wishlist.jpg', '17_wishlist.jpg'],
  ['f-compare.jpg', '18_compare.jpg'],
  ['f-fashion2-newsletter.jpg', '19_newsletter-popup.jpg'],
  ['m-occasion-home.jpg', '20_mobile.jpg'],
];

// Description banners (banners.html?b=NN), heights from 03-description-images.md
const BANNERS = [
  ['01', '01-hero.jpg', 900], ['02', '02-whats-new.jpg', 760], ['03', '03-store-designs.jpg', 440],
  ['04', '04-demo-occasion.jpg', 1400], ['05', '05-demo-fashion-1.jpg', 1400], ['06', '06-demo-fashion-2.jpg', 1400],
  ['07', '07-built-in.jpg', 760], ['08', '08-features.jpg', 1500], ['09', '09-inner-pages.jpg', 1060], ['10', '10-mobile.jpg', 720],
];

fs.rmSync(out, { recursive: true, force: true });

// 1. Main file (built by npm run release)
const mainZip = path.join(root, 'dist', `occasion-themeforest-v${version}.zip`);
if (fs.existsSync(mainZip)) fs.copyFileSync(mainZip, path.join(dir('1-main-file'), path.basename(mainZip)));
else console.warn(`! ${path.relative(root, mainZip)} not found: run npm run release first (1-main-file left empty)`);

// 2. Thumbnail
shot('thumbnail.html', path.join(dir('2-thumbnail'), 'thumbnail.png'), 80, 80);

// 3. Theme preview zip: 01_preview.jpg + gallery
const preview = dir('3-theme-preview');
const stage = path.join(out, '.preview');
fs.mkdirSync(stage, { recursive: true });
shot('inline-preview.html', path.join(out, 'inline-preview.png'), 590, 300);
toJpg(path.join(out, 'inline-preview.png'), path.join(stage, '01_preview.jpg'));
for (const [from, to] of SCREENSHOTS) fs.copyFileSync(path.join(root, 'page-intro', 'images', from), path.join(stage, to));
zipDir(stage, path.join(preview, `occasion-preview-v${version}.zip`));
fs.copyFileSync(path.join(stage, '01_preview.jpg'), path.join(preview, 'inline-preview-590x300.jpg'));
fs.rmSync(stage, { recursive: true, force: true });

// 4. Description banners
const banners = dir('4-description-images');
for (const [id, file, height] of BANNERS) {
  const png = path.join(banners, file.replace('.jpg', '.png'));
  shot(`banners.html?b=${id}`, png, 1180, height);
  toJpg(png, path.join(banners, file), 82);
  const kb = fs.statSync(path.join(banners, file)).size / 1024;
  if (kb > 600) console.warn(`! ${file} is ${kb.toFixed(0)} KB (ThemeForest description images should stay under 600 KB)`);
}

// 5. Listing content (copy-ready text for the form)
const listing = dir('5-listing');
const content = path.join(here, '..', 'content');
for (const f of fs.readdirSync(content).filter((f) => f !== 'README.md')) fs.copyFileSync(path.join(content, f), path.join(listing, f));

fs.writeFileSync(path.join(out, 'UPLOAD-GUIDE.md'), `# Occasion v${version} — ThemeForest upload

Occasion 2.0 is an **update of the existing Occasion item**: open the item on ThemeForest → Edit, and
replace the files and texts below (1.x buyers get it for free).

| Upload form field | File |
|---|---|
| Main File(s) | \`1-main-file/occasion-themeforest-v${version}.zip\` |
| Thumbnail (80 × 80) | \`2-thumbnail/thumbnail.png\` |
| Theme Preview (ZIP) | \`3-theme-preview/occasion-preview-v${version}.zip\` (01_preview.jpg 590 × 300 + ${SCREENSHOTS.length} screenshots) |
| Name, Key features, Tags, Attributes, URLs | \`5-listing/01-item-details.md\` |
| Description | \`5-listing/02-item-description.html\` (paste the HTML) |
| Message to the reviewer | \`5-listing/05-message-to-reviewer.md\` (new item or item update) |

Before submitting, upload \`4-description-images/*.jpg\` to
https://iphoenixthemes.com/themes/occasion/themeforest/ — the description HTML loads the banners from there.
Keyword notes, changelog and pre-sale answers: \`5-listing/04-seo-keywords.md\`, \`06-changelog.md\`, \`07-presale-faq.md\`.
`);

console.log(`✔ ${path.relative(root, out)}: main file, thumbnail, theme preview (${SCREENSHOTS.length + 1} images), ${BANNERS.length} description banners, listing`);
