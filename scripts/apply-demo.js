#!/usr/bin/env node
// Swap a demo into place: copies demos/<name>/{config,templates,sections}/*
// over the theme folders (older demos: flat settings_data.json, index.json,
// header-group.json). To push a demo to a store without touching the working
// copy use scripts/deploy-demo.js instead.
//
// Usage:  node scripts/apply-demo.js <demo-name>
// Or via: npm run apply-demo -- <demo-name>
//
// Refuses to overwrite if the live files have uncommitted changes (so
// merchant edits aren't lost). Pass `--force` to override.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEMO_DIR = path.join(ROOT, 'demos');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const name = argv.find((a) => !a.startsWith('-'));

if (!name) {
  console.error('Usage: node scripts/apply-demo.js <demo-name> [--force]');
  console.error('Available demos:', fs.readdirSync(DEMO_DIR).filter((f) => fs.statSync(path.join(DEMO_DIR, f)).isDirectory()).join(', '));
  process.exit(1);
}

const src = path.join(DEMO_DIR, name);
if (!fs.existsSync(src)) {
  console.error(`Demo "${name}" not found in demos/. Available:`);
  console.error('  ' + fs.readdirSync(DEMO_DIR).filter((f) => fs.statSync(path.join(DEMO_DIR, f)).isDirectory()).join(', '));
  process.exit(1);
}

const OVERLAY_DIRS = ['config', 'templates', 'sections'];
const FILES = fs.existsSync(path.join(src, 'config'))
  ? OVERLAY_DIRS.filter((dir) => fs.existsSync(path.join(src, dir))).flatMap((dir) =>
      fs.readdirSync(path.join(src, dir)).map((file) => ({ src: path.join(dir, file), dst: path.join(dir, file) })))
  : [
      { src: 'settings_data.json', dst: path.join('config', 'settings_data.json') },
      { src: 'index.json', dst: path.join('templates', 'index.json') },
      { src: 'header-group.json', dst: path.join('sections', 'header-group.json') },
    ];

// Validate sources exist
for (const f of FILES) {
  if (!fs.existsSync(path.join(src, f.src))) {
    console.error(`Demo "${name}" is missing ${f.src}`);
    process.exit(1);
  }
}

// Safety check — if any live target has uncommitted changes, refuse unless --force
if (!force) {
  try {
    const targets = FILES.map((f) => f.dst).join(' ');
    const dirty = execSync(`git status --porcelain ${targets}`, { cwd: ROOT }).toString().trim();
    if (dirty) {
      console.error('Refusing to overwrite: live config has uncommitted changes:');
      console.error(dirty);
      console.error('Commit or stash them first, or pass --force to override.');
      process.exit(2);
    }
  } catch (_) {
    // not a git repo or git unavailable — proceed
  }
}

for (const f of FILES) {
  fs.copyFileSync(path.join(src, f.src), path.join(ROOT, f.dst));
  console.log(`  ${f.dst} <- demos/${name}/${f.src}`);
}
console.log('');
console.log(`Applied demo "${name}". Reload your shopify theme dev preview to see it.`);
