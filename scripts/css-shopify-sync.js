#!/usr/bin/env node
/**
 * After Sass writes assets/*.css (+ .css.map), push to the remote theme so
 * Shopify CLI hot-reloads the browser. Source maps use file:/// paths so
 * Chrome DevTools opens common/scss/... on disk.
 *
 * Run alongside `npm run serve` (shopify theme dev). Requires SHOPIFY_FLAG_STORE in .env.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getShopifyPushArgs, describePushTarget } = require('./shopify-push-args');

const root = process.cwd();
const store = (process.env.SHOPIFY_FLAG_STORE || '').trim();

if (!store) {
  console.error('[css-sync] Set SHOPIFY_FLAG_STORE in .env');
  process.exit(1);
}

const cssOutputs = [
  path.join(root, 'assets/styles.css'),
  path.join(root, 'assets/component-localization-form.css'),
];

const pendingFiles = new Set();
let pushTimer;
let pushing = false;

function pushCssAssets() {
  if (pushing || pendingFiles.size === 0) return;

  const files = [...pendingFiles];
  pendingFiles.clear();
  pushing = true;

  const args = getShopifyPushArgs(store, { allowLive: true });
  for (const file of files) {
    args.push('--only', file);
  }

  console.log(`[css-sync] Uploading ${files.join(', ')}…`);

  const child = spawn('shopify', args, { cwd: root, stdio: 'inherit', shell: true });
  child.on('exit', () => {
    pushing = false;
    if (pendingFiles.size > 0) pushCssAssets();
  });
}

function schedulePush(relativePath) {
  pendingFiles.add(relativePath);
  if (relativePath.endsWith('.css')) {
    const mapRel = `${relativePath}.map`;
    if (fs.existsSync(path.join(root, mapRel))) {
      pendingFiles.add(mapRel);
    }
  }
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushCssAssets(), 350);
}

console.log(`[css-sync] Target: ${describePushTarget()}. CSS + .map for DevTools SCSS debug. Preview http://127.0.0.1:9293`);

for (const filePath of cssOutputs) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '/* waiting for sass */\n');
  }

  fs.watchFile(filePath, { interval: 400 }, (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs) return;
    schedulePush(path.relative(root, filePath).replace(/\\/g, '/'));
  });
}
