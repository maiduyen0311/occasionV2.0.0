#!/usr/bin/env node
/**
 * Fail fast before parallel dev tasks if Shopify store is not configured.
 * Used by `npm run dev` / `npm run start`.
 *
 * Resolution order: SHOPIFY_FLAG_STORE → .shopify-env.json → `shopify theme info --json`
 */
const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const root = process.cwd();
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

function loadStoreFromShopifyCli() {
  try {
    const out = execSync('shopify theme info --json', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    const info = JSON.parse(out.trim());
    if (info.store) return String(info.store).trim();
  } catch {
    // CLI not installed, not logged in, or not in a theme directory
  }
  return '';
}

function loadStore() {
  if (process.env.SHOPIFY_FLAG_STORE) {
    return process.env.SHOPIFY_FLAG_STORE.trim();
  }

  const envJson = path.join(root, '.shopify-env.json');
  if (existsSync(envJson)) {
    try {
      const cfg = JSON.parse(readFileSync(envJson, 'utf8'));
      if (cfg.store) return String(cfg.store).trim();
    } catch (e) {
      console.error('[dev] Cannot parse .shopify-env.json:', e.message);
      process.exit(1);
    }
  }

  return loadStoreFromShopifyCli();
}

const store = loadStore();

if (store) {
  console.log(`[dev] Shopify store: ${store}`);
  if (!existsSync(envPath) && !process.env.SHOPIFY_FLAG_STORE) {
    console.log('[dev] Tip: copy .env.example → .env so css:sync and serve get the store via dotenv.');
  }
  process.exit(0);
}

console.error('');
console.error('[dev] Cannot start — no Shopify store configured.');
console.error('');
if (!existsSync(envPath)) {
  console.error('  Missing .env in project root.');
  if (existsSync(examplePath)) {
    console.error('  Create it from the template:');
    console.error('    copy .env.example .env');
    console.error('  Then edit .env and set:');
  } else {
    console.error('  Create .env with:');
  }
} else {
  console.error('  .env exists but SHOPIFY_FLAG_STORE is empty or unset.');
  console.error('  Edit .env and set:');
}
console.error('    SHOPIFY_FLAG_STORE=your-store-name.myshopify.com');
console.error('');
console.error('  Or link this folder with Shopify CLI (`shopify auth login` + theme dev once).');
console.error('  Preview after start: http://127.0.0.1:9293');
console.error('');
process.exit(1);
