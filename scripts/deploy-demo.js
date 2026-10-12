#!/usr/bin/env node
/**
 * Push the theme with a demo's settings to a store, without touching the
 * working copy.
 *
 *   node scripts/deploy-demo.js <demo> --store <shop>.myshopify.com [--live | --theme <id> | --unpublished --name "<theme name>"] [--no-build]
 *   npm run deploy:demo -- fashion --store haley-demo.myshopify.com --live
 *
 * Steps: production build → copy the theme folders to dist/demo-<demo>/ →
 * copy demos/<demo>/{config,templates,sections}/ over them → `shopify theme push`.
 * Store content (products, collections, menus, files…) is a separate step:
 * scripts/demo-import.js.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THEME_DIRS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const OVERLAY_DIRS = ['config', 'templates', 'sections'];

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const demo = argv.find((a, i) => !a.startsWith('-') && !['--store', '--theme', '--name'].includes(argv[i - 1]));
const store = flag('--store');

if (!demo || !store) {
  console.error('Usage: node scripts/deploy-demo.js <demo> --store <shop>.myshopify.com [--live | --theme <id> | --unpublished --name "<theme name>"] [--no-build]');
  process.exit(1);
}
const demoDir = path.join(ROOT, 'demos', demo);
if (!fs.existsSync(path.join(demoDir, 'config', 'settings_data.json'))) {
  console.error(`demos/${demo}/config/settings_data.json not found`);
  process.exit(1);
}

if (!argv.includes('--no-build')) execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

// Stage: theme folders + demo overlay
const stage = path.join(ROOT, 'dist', `demo-${demo}`);
fs.rmSync(stage, { recursive: true, force: true });
for (const dir of THEME_DIRS) {
  fs.cpSync(path.join(ROOT, dir), path.join(stage, dir), {
    recursive: true,
    filter: (src) => !/\.map$/.test(src),
  });
}
let overlaid = 0;
for (const dir of OVERLAY_DIRS) {
  const from = path.join(demoDir, dir);
  if (!fs.existsSync(from)) continue;
  for (const file of fs.readdirSync(from)) {
    fs.copyFileSync(path.join(from, file), path.join(stage, dir, file));
    overlaid += 1;
  }
}
console.log(`\n▶ demos/${demo}: ${overlaid} files over the theme → ${path.relative(ROOT, stage)}`);

// Push
const args = ['theme', 'push', '--path', stage, '--store', store];
if (argv.includes('--live')) args.push('--live', '--allow-live');
else if (flag('--theme')) args.push('--theme', flag('--theme'), '--allow-live');
else if (argv.includes('--unpublished')) args.push('--unpublished', '--theme', `"${flag('--name') || `Occasion — ${demo}`}"`);
else args.push('--development');

console.log(`▶ shopify ${args.join(' ')}\n`);
const res = spawnSync('shopify', args, { cwd: ROOT, stdio: 'inherit', shell: true });
process.exit(res.status ?? 1);
