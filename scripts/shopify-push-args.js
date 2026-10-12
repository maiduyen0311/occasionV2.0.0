/**
 * Build `shopify theme push` flags from .env (shared by css-sync, etc.)
 *
 * SHOPIFY_FLAG_STORE     — required store hostname
 * SHOPIFY_FLAG_THEME     — remote theme ID (live duplicate or published theme)
 * SHOPIFY_PUSH_LIVE=true — push to published live theme (--live), overrides theme ID
 */
function getShopifyPushArgs(store, { allowLive = false } = {}) {
  const args = ['theme', 'push', '--store', store];

  if (process.env.SHOPIFY_PUSH_LIVE === 'true' || process.env.SHOPIFY_PUSH_LIVE === '1') {
    args.push('--live');
  } else {
    const themeId = (process.env.SHOPIFY_FLAG_THEME || process.env.SHOPIFY_THEME_ID || '').trim();
    if (themeId) {
      args.push('--theme', themeId);
    } else {
      args.push('--development');
    }
  }

  if (allowLive) {
    args.push('--allow-live');
  }

  return args;
}

function describePushTarget() {
  if (process.env.SHOPIFY_PUSH_LIVE === 'true' || process.env.SHOPIFY_PUSH_LIVE === '1') {
    return 'published live theme (--live)';
  }
  const themeId = (process.env.SHOPIFY_FLAG_THEME || process.env.SHOPIFY_THEME_ID || '').trim();
  if (themeId) {
    return `theme #${themeId}`;
  }
  return 'development theme (--development)';
}

module.exports = { getShopifyPushArgs, describePushTarget };
