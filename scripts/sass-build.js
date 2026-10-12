/**
 * Compile theme SCSS → assets/*.css
 *
 * Dev watch:  npm run sass:watch  — expanded CSS + source maps (local only)
 * One-shot:   npm run sass:build  — expanded + source maps
 * Production: npm run sass:build:prod — compressed, no .map
 *
 * Source maps (.map) are gitignored and not required on the storefront.
 * For Shopify theme dev (http://127.0.0.1:9293), maps use file:/// paths so
 * Chrome DevTools can open common/scss/.../*.scss on disk.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--prod');

const entries = [
  'common/scss/styles.scss:assets/styles.css',
  'common/scss/component/localization-form.scss:assets/component-localization-form.css',
];

const args = ['sass', ...entries];

if (isWatch) {
  args.push(
    '--watch',
    '--poll',
    '--style=expanded',
    '--source-map',
    '--source-map-urls=absolute'
  );
} else if (isProd) {
  args.push('--style=compressed', '--no-source-map');
} else {
  args.push('--style=expanded', '--source-map', '--source-map-urls=absolute');
}

// node_modules on the load path → Bootstrap counts as a dependency, so --quiet-deps silences its warnings
args.push('--load-path=node_modules', '--quiet-deps');

const result = spawnSync('npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
