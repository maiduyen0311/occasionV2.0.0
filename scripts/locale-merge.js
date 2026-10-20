#!/usr/bin/env node
/**
 * Merge translated Occasion locale keys (scripts/data/locale-occasion-keys.js,
 * key → [fr, de, es, it]) into locales/<lang>.json. Keeps each file's header comment
 * and line endings.   node scripts/locale-merge.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KEYS = require('./data/locale-occasion-keys.js');
const LANGS = ['fr', 'de', 'es', 'it'];

for (const [i, lang] of LANGS.entries()) {
  const file = path.join(ROOT, 'locales', `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  const header = (raw.match(/^\uFEFF?\/\*[\s\S]*?\*\/\s*/) || [''])[0];
  const json = JSON.parse(raw.slice(header.length));
  let n = 0;
  for (const [key, values] of Object.entries(KEYS)) {
    const parts = key.split('.');
    let node = json;
    for (const p of parts.slice(0, -1)) node = node[p] = node[p] && typeof node[p] === 'object' ? node[p] : {};
    if (node[parts.at(-1)] !== values[i]) { node[parts.at(-1)] = values[i]; n++; }
  }
  let out = header.replace(/\r\n/g, '\n') + JSON.stringify(json, null, 2) + '\n';
  if (crlf) out = out.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, out);
  console.log(`${lang}: ${n} keys updated`);
}
