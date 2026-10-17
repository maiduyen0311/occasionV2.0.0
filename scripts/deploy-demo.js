#!/usr/bin/env node
/**
 * Push the theme with a demo's settings to a store, without touching the
 * working copy and without a build folder.
 *
 *   node scripts/deploy-demo.js <demo> --store <shop>.myshopify.com (--theme <id> | --live) [--no-build] [--demo-only]
 *   npm run deploy:demo -- clone01 --store occasion-demo-3.myshopify.com --theme 154847641678
 *
 * Steps: production build → push the theme from the project root, minus the
 * files the demo overrides → push demos/<demo>/{config,templates,sections}/
 * on top of it (--nodelete). --demo-only skips the build and the first push
 * (only the demo's settings / templates / section groups changed).
 * Store content (products, collections, menus, files…) is a separate step:
 * scripts/demo-import.js.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OVERLAY_DIRS = ['config', 'templates', 'sections'];

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const demo = argv.find((a, i) => !a.startsWith('-') && !['--store', '--theme'].includes(argv[i - 1]));
const store = flag('--store');
const theme = flag('--theme');
const live = argv.includes('--live');
const demoOnly = argv.includes('--demo-only');

if (!demo || !store || (!theme && !live)) {
  console.error('Usage: node scripts/deploy-demo.js <demo> --store <shop>.myshopify.com (--theme <id> | --live) [--no-build] [--demo-only]');
  process.exit(1);
}
const demoDir = path.join(ROOT, 'demos', demo);
if (!fs.existsSync(path.join(demoDir, 'config', 'settings_data.json'))) {
  console.error(`demos/${demo}/config/settings_data.json not found`);
  process.exit(1);
}

// Files the demo overrides, as theme paths (config/settings_data.json, …)
const overlay = OVERLAY_DIRS.flatMap((dir) => {
  const from = path.join(demoDir, dir);
  return fs.existsSync(from) ? fs.readdirSync(from).map((file) => `${dir}/${file}`) : [];
});

const target = live ? ['--live'] : ['--theme', theme];
function push(label, args) {
  const full = ['shopify', 'theme', 'push', '--store', store, ...target, '--allow-live', ...args];
  console.log(`\n▶ ${label}\n  npx ${full.join(' ')}\n`);
  // npx needs a shell on Windows → quote args with spaces / globs
  const shell = process.platform === 'win32';
  const res = spawnSync('npx', shell ? full.map((x) => (/[\s*]/.test(x) ? `"${x}"` : x)) : full, { cwd: ROOT, stdio: 'inherit', shell });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

if (!demoOnly) {
  if (!argv.includes('--no-build')) execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  push('theme code (project root)', ['--path', ROOT, '--nodelete', '--ignore', 'assets/*.map', ...overlay.flatMap((f) => ['--ignore', f])]);
}
// demos/<demo> is not a full theme → --force skips the "not a theme directory" prompt
push(`demos/${demo}: ${overlay.length} files`, ['--path', demoDir, '--nodelete', '--force', ...overlay.flatMap((f) => ['--only', f])]);
