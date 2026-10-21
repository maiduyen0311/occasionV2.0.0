/**
 * Build the ThemeForest download package.
 *
 *   npm run release
 *
 * dist/occasion-v<version>/
 *   themes/<theme>-theme-v<version>.zip ← one upload-ready Shopify theme per store design (THEMES below)
 *   documentation/                     ← buyer guide (documentation/index.html + one page per theme)
 * dist/occasion-themeforest-v<version>.zip ← everything above, ready to upload to ThemeForest
 * dist/themeforest-upload/                   ← every file for the upload form (themeforest/preview/build.js):
 *   main file, thumbnail, theme preview zip, description banners, listing text, UPLOAD-GUIDE.md
 *
 * Buyers are store owners, not developers: the package holds only what goes into Shopify plus the
 * guide — no source, package.json, webpack or build tooling.
 *
 * Each theme is checked with Shopify Theme Check before it is zipped (errors stop the release).
 *
 * Requires: Shopify CLI (`shopify`, otherwise `npx @shopify/cli` is used), `tar` (bundled with
 * Windows 10+, macOS and Linux) for the zips (`zip` on macOS / Linux).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const run = (cmd, opts = {}) => execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
const works = (cmd) => {
  try { execSync(cmd, { cwd: root, stdio: 'ignore' }); return true; } catch (_) { return false; }
};
// Global Shopify CLI when installed, otherwise a one-off npx copy (nothing added to package.json)
const shopify = works('shopify version') ? 'shopify' : 'npx -y @shopify/cli@latest';

const schema = JSON.parse(fs.readFileSync(path.join(root, 'config/settings_schema.json'), 'utf8'));
const info = schema.find((g) => g.name === 'theme_info') || {};
const version = info.theme_version || require('../package.json').version;
const slug = 'occasion';

// Store designs shipped in the package. `demo` = overlay folder in demos/ (config, templates,
// sections groups) applied over the base theme; the base theme itself is Occasion.
const THEMES = [
  { slug: 'occasion', name: 'Occasion' },
  { slug: 'occasion-fashion-1', name: 'Occasion Fashion 1', demo: 'clone01' },
  { slug: 'occasion-fashion-2', name: 'Occasion Fashion 2', demo: 'clone02' },
];
const THEME_DIRS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const OVERLAY_DIRS = ['config', 'templates', 'sections'];

const dist = path.join(root, 'dist');
const out = path.join(dist, `${slug}-v${version}`);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'themes'), { recursive: true });

console.log(`\n▶ Building ${info.theme_name || slug} v${version}\n`);
run('npm run build');

// 1. One theme zip per store design: base theme folders + the design's overlay,
//    theme_info.theme_name set to the design name, packaged by Shopify CLI.
for (const t of THEMES) {
  const stage = path.join(dist, `.theme-${t.slug}`);
  fs.rmSync(stage, { recursive: true, force: true });
  for (const dir of THEME_DIRS) {
    fs.cpSync(path.join(root, dir), path.join(stage, dir), { recursive: true, filter: (src) => !/\.map$/.test(src) });
  }
  if (t.demo) {
    for (const dir of OVERLAY_DIRS) {
      const from = path.join(root, 'demos', t.demo, dir);
      if (!fs.existsSync(from)) continue;
      for (const file of fs.readdirSync(from)) fs.copyFileSync(path.join(from, file), path.join(stage, dir, file));
    }
  }
  const schemaFile = path.join(stage, 'config', 'settings_schema.json');
  const staged = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
  staged[0].theme_name = t.name;
  fs.writeFileSync(schemaFile, JSON.stringify(staged, null, 2) + '\n');

  // Validate the exact files that ship (base theme + overlay)
  run(`${shopify} theme check --path "${stage}" --fail-level error`);

  const seen = (dir) => new Set(fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.zip')) : []);
  const beforeRoot = seen(root);
  const beforeStage = seen(stage);
  run(`${shopify} theme package --path "${stage}"`);
  const fresh = (dir, before) => [...seen(dir)].filter((f) => !before.has(f)).map((f) => path.join(dir, f));
  const created = [...fresh(root, beforeRoot), ...fresh(stage, beforeStage)][0];
  if (!created) throw new Error(`shopify theme package did not create a zip for ${t.name}`);
  fs.renameSync(created, path.join(out, 'themes', `${t.slug}-theme-v${version}.zip`));
  fs.rmSync(stage, { recursive: true, force: true });
  console.log(`✔ ${t.name}: themes/${t.slug}-theme-v${version}.zip`);
}

// 2. Documentation
fs.cpSync(path.join(root, 'documentation'), path.join(out, 'documentation'), { recursive: true });

// 3. Final ThemeForest zip
const finalZip = path.join(dist, `${slug}-themeforest-v${version}.zip`);
try {
  zipDir(dist, finalZip, path.basename(out));
  console.log(`\n✔ Package ready: ${path.relative(root, finalZip)}`);
} catch (_) {
  console.log(`\n✔ Folder ready: ${path.relative(root, out)} (zip it manually — no zip tool found)`);
}

// 4. ThemeForest upload folder: main file, thumbnail, theme preview, description banners, listing
if (fs.existsSync(path.join(root, 'themeforest', 'preview', 'build.js'))) run('node themeforest/preview/build.js');
else console.log('(no themeforest/preview: ThemeForest upload folder skipped)');

/** Zip the folder `entry` (a name inside `cwd`) into `dest`. */
function zipDir(cwd, dest, entry) {
  fs.rmSync(dest, { force: true });
  if (process.platform === 'win32') {
    // Windows' own bsdtar writes standard zips with "/" separators. PowerShell 5.1
    // Compress-Archive writes "\" separators, which breaks the folders on macOS / Linux.
    const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    run(`"${tar}" -a -c -f "${dest}" "${entry}"`, { cwd });
  } else {
    run(`zip -rq "${dest}" "${entry}"`, { cwd });
  }
  if (!fs.existsSync(dest)) throw new Error(`Zip was not created: ${dest}`);
}
