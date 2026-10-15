#!/usr/bin/env node
/**
 * Check JSON templates / section groups against section schemas before Shopify rejects them:
 * unknown section types, unknown settings, range values off min/max/step, select values not in
 * the options. `--fix` snaps range values to the nearest valid step (and clamps to min/max).
 *
 *   node scripts/validate-templates.js [--fix]
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fix = process.argv.includes('--fix');
const readJson = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const i = raw.indexOf('{');
  return { head: raw.slice(0, i), data: JSON.parse(raw.slice(i)) };
};
const schemaCache = {};
const schemaFor = (type) => {
  if (type in schemaCache) return schemaCache[type];
  const file = path.join(root, 'sections', `${type}.liquid`);
  if (!fs.existsSync(file)) return (schemaCache[type] = null);
  const s = fs.readFileSync(file, 'utf8');
  const a = s.indexOf('{% schema %}'), b = s.indexOf('{% endschema %}');
  return (schemaCache[type] = a < 0 ? {} : JSON.parse(s.slice(a + 12, b)));
};

let problems = 0;
const report = (where, msg) => { problems++; console.log(`${where}: ${msg}`); };

function checkSettings(where, values, defs) {
  if (!values) return false;
  let changed = false;
  for (const [id, value] of Object.entries(values)) {
    const def = (defs || []).find((d) => d.id === id);
    if (!def) { report(where, `unknown setting "${id}"`); continue; }
    if (def.type === 'range' && typeof value === 'number') {
      const step = def.step || 1;
      let v = Math.min(def.max, Math.max(def.min, value));
      v = Math.round((v - def.min) / step) * step + def.min;
      v = Math.round(v * 1000) / 1000;
      if (v !== value) {
        report(where, `${id}=${value} not on the range (${def.min}–${def.max} step ${step})${fix ? ` → ${v}` : ''}`);
        if (fix) { values[id] = v; changed = true; }
      }
    }
    if (def.type === 'select' && !(def.options || []).some((o) => o.value === value)) {
      report(where, `${id}="${value}" is not an option`);
    }
  }
  return changed;
}

// Schema rules Shopify enforces on upload: option labels ≤ 50 characters, no blank defaults
for (const f of fs.readdirSync(path.join(root, "sections")).filter((f) => f.endsWith(".liquid"))) {
  const schema = schemaFor(f.replace(/.liquid$/, ""));
  if (!schema) continue;
  const lists = [schema.settings || [], ...(schema.blocks || []).map((b) => b.settings || [])];
  for (const list of lists) for (const x of list) {
    if (x.default === "") report(`sections/${f}`, `setting "${x.id}" has a blank default`);
    for (const o of x.options || []) if (o.label && !o.label.startsWith("t:") && o.label.length > 50) report(`sections/${f}`, `option label too long in "${x.id}": ${o.label}`);
  }
}

const files = [
  ...fs.readdirSync(path.join(root, 'templates')).filter((f) => f.endsWith('.json')).map((f) => path.join('templates', f)),
  ...fs.readdirSync(path.join(root, 'templates', 'customers')).filter((f) => f.endsWith('.json')).map((f) => path.join('templates', 'customers', f)),
  ...fs.readdirSync(path.join(root, 'sections')).filter((f) => f.endsWith('.json')).map((f) => path.join('sections', f)),
  // Demo overlays (scripts/deploy-demo.js copies them over the theme)
  ...(fs.existsSync(path.join(root, 'demos')) ? fs.readdirSync(path.join(root, 'demos')) : []).flatMap((demo) =>
    ['templates', 'sections']
      .map((dir) => path.join('demos', demo, dir))
      .filter((dir) => fs.existsSync(path.join(root, dir)))
      .flatMap((dir) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)))),
];

for (const rel of files) {
  const file = path.join(root, rel);
  const { head, data } = readJson(file);
  let changed = false;
  for (const [key, sec] of Object.entries(data.sections || {})) {
    const schema = schemaFor(sec.type);
    const where = `${rel} › ${key}`;
    if (!schema) { if (!sec.type.startsWith('apps')) report(where, `section type "${sec.type}" not found`); continue; }
    changed = checkSettings(where, sec.settings, schema.settings) || changed;
    for (const [bid, block] of Object.entries(sec.blocks || {})) {
      const bdef = (schema.blocks || []).find((b) => b.type === block.type);
      if (!bdef) { if (!block.type.startsWith('shopify://')) report(`${where} › ${bid}`, `block type "${block.type}" not in schema`); continue; }
      changed = checkSettings(`${where} › ${bid}`, block.settings, bdef.settings) || changed;
    }
  }
  if (changed) fs.writeFileSync(file, head + JSON.stringify(data, null, 2) + '\n');
}
console.log(problems ? `${problems} problem(s)${fix ? ' (ranges fixed)' : ''}` : 'templates OK');
process.exitCode = problems && !fix ? 1 : 0;
