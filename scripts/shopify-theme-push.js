#!/usr/bin/env node
/**
 * Full theme push: local → Shopify (NOT pull).
 * Uses SHOPIFY_FLAG_STORE + SHOPIFY_FLAG_THEME from .env.
 * Pass --live to overwrite the published theme.
 */
const { spawn } = require('child_process');
const { getShopifyPushArgs, describePushTarget } = require('./shopify-push-args');

if (process.argv.includes('--live')) {
  process.env.SHOPIFY_PUSH_LIVE = 'true';
}

const store = (process.env.SHOPIFY_FLAG_STORE || '').trim();
if (!store) {
  console.error('[deploy] Set SHOPIFY_FLAG_STORE in .env');
  process.exit(1);
}

const args = getShopifyPushArgs(store, { allowLive: true });
const target = describePushTarget();

console.log(`[deploy] Pushing local theme → ${store} (${target})`);
console.log('[deploy] Direction: LOCAL → Shopify. Do NOT use theme pull unless backing up remote.');

const child = spawn('shopify', args, { cwd: process.cwd(), stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
