#!/usr/bin/env node
/**
 * Shopify theme dev with live reload for Liquid/snippets (full-page).
 * Requires SHOPIFY_FLAG_STORE in .env (see .env.example).
 *
 * Preview at http://127.0.0.1:9293 — do not use the myshopify.com URL directly
 * if you want auto-reload on save.
 */
const { spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const root = process.cwd();

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
      console.error('[shopify-dev] Cannot parse .shopify-env.json:', e.message);
      process.exit(1);
    }
  }

  return '';
}

const store = loadStore();
if (!store) {
  console.error('[shopify-dev] Missing store. Set SHOPIFY_FLAG_STORE in .env (copy from .env.example).');
  process.exit(1);
}

const port = process.env.SHOPIFY_DEV_PORT || '9293';
const theme = process.env.SHOPIFY_FLAG_THEME || process.env.SHOPIFY_THEME_ID;

const args = [
  'theme',
  'dev',
  '--store',
  store,
  '--port',
  port,
  // hot-reload: inject CSS without F5. Snippets/layout: set SHOPIFY_LIVE_RELOAD=full-page in .env
  '--live-reload',
  process.env.SHOPIFY_LIVE_RELOAD || 'hot-reload',
];

if (theme && String(theme).trim()) {
  args.push('--theme', String(theme).trim());
}

const liveReload = process.env.SHOPIFY_LIVE_RELOAD || 'hot-reload';
console.log(`[shopify-dev] store=${store} port=${port} live-reload=${liveReload}`);
console.log(`[shopify-dev] preview → http://127.0.0.1:${port}`);
console.log(`[shopify-dev] If port ${port} is busy: npm run dev:stop  (then start again)`);

const child = spawn('shopify', args, { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
