#!/usr/bin/env node
/**
 * Register store-content translations for a demo (Shopify Translate API, translationsRegister):
 * theme section texts of the LIVE theme, menus, links, collections, pages, blogs, articles,
 * product titles / descriptions and the custom.short_description metafield.
 *
 *   node scripts/demo-translate.js clone01 --store occasion-demo-1.myshopify.com [--locales fr,de,es,it] [--dry]
 *
 * Dictionaries: scripts/demo/i18n/<demo>-ui.js (rows [en, fr, de, es, it]) and
 * scripts/demo/i18n/<demo>-products.js (product copy parts). Only exact matches are
 * translated; anything else keeps the default language. Product options (Color / Size)
 * are left alone on purpose: card swatches and filters match them by their English name.
 * --types ONLINE_STORE_THEME,MENU,… limits the run to some resource types.
 * Needs the store auth scopes read_translations,write_translations,read_products,
 * read_content,read_online_store_navigation,read_online_store_pages.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const flag = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined);
const demo = argv.find((a, i) => !a.startsWith('-') && !['--store', '--locales', '--types'].includes(argv[i - 1]));
const store = flag('--store');
const DRY = argv.includes('--dry');
const ALL = ['fr', 'de', 'es', 'it'];
const locales = (flag('--locales') || ALL.join(',')).split(',').map((l) => l.trim());
if (!demo || !store) {
  console.error('Usage: node scripts/demo-translate.js <demo> --store <shop>.myshopify.com [--locales fr,de,es,it] [--dry]');
  process.exit(1);
}

const TMP = path.join(ROOT, '.shopify');
fs.mkdirSync(TMP, { recursive: true });
function gql(query, variables = {}, mut = false) {
  fs.writeFileSync(path.join(TMP, 'tr-q.graphql'), query);
  fs.writeFileSync(path.join(TMP, 'tr-v.json'), JSON.stringify(variables));
  const args = ['shopify', 'store', 'execute', '-s', store, '--no-input', '-j', '--query-file', '.shopify/tr-q.graphql', '--variable-file', '.shopify/tr-v.json'];
  if (mut) args.push('--allow-mutations');
  const out = execFileSync('npx', args, { cwd: ROOT, shell: true, maxBuffer: 100e6, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  return JSON.parse(out.slice(out.indexOf('{\n')));
}

// --- Dictionaries ------------------------------------------------------------------------
const col = (l) => ALL.indexOf(l);
const ui = require(`./demo/i18n/${demo}-ui.js`);
const P = require(`./demo/i18n/${demo}-products.js`);
const dict = new Map();
for (const row of ui) if (!dict.has(row[0])) dict.set(row[0], row.slice(1));
const tr = (en, l) => {
  const row = dict.get(en) || dict.get(String(en).trim());
  return row ? row[col(l)] : undefined;
};

const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'demos', demo, 'content.json'), 'utf8'));
const copySrc = fs.readFileSync(path.join(__dirname, 'demo', `${demo}-copy.js`), 'utf8');
const COPY = eval(`(${copySrc.match(/const COPY = (\{[\s\S]*?\n\});/)[1]})`); // eslint-disable-line no-eval
const productByHandle = Object.fromEntries(content.products.map((p) => [p.handle, p]));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function composition(en, l) {
  let s = en;
  for (const k of Object.keys(P.materials).sort((a, b) => b.length - a.length)) {
    s = s.split(k).join(`\u0000${Object.keys(P.materials).indexOf(k)}\u0000`);
  }
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => P.materials[Object.keys(P.materials)[i]][col(l)]);
}

function productCopy(handle, l) {
  const p = productByHandle[handle];
  const c = COPY[handle];
  if (!p || !c || !P.leads[handle]) return null;
  const i = col(l);
  const short = `${P.leads[handle][i]} ${(P.more[p.type] || P.more.Tops)[i]}`;
  const details = c[1].map((d) => (P.details[d] ? P.details[d][i] : d));
  const body = [
    `<p>${esc(short)}</p>`,
    `<h5>${esc(P.headings.Details[i])}</h5>`,
    `<ul>${details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`,
    `<h5>${esc(P.headings['Composition & care'][i])}</h5>`,
    `<ul><li>${esc(composition(c[2], l))}</li><li>${esc((P.care[p.type] || P.care.Tops)[i])}</li></ul>`,
  ].join('');
  return { title: P.titles[handle] && P.titles[handle][i], short, body };
}

// --- Resources ---------------------------------------------------------------------------
function resources(type) {
  const all = [];
  let after = null;
  do {
    const r = gql('query($t: TranslatableResourceType!, $a: String) { translatableResources(first: 100, resourceType: $t, after: $a) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value digest } } } }', { t: type, a: after }).translatableResources;
    all.push(...r.nodes);
    after = r.pageInfo.hasNextPage ? r.pageInfo.endCursor : null;
  } while (after);
  return all;
}

// short_description metafield id → product handle
const metafieldHandle = {};
{
  let after = null;
  do {
    const r = gql('query($a: String) { products(first: 100, after: $a) { pageInfo { hasNextPage endCursor } nodes { handle metafield(namespace: "custom", key: "short_description") { id } } } }', { a: after }).products;
    r.nodes.forEach((n) => { if (n.metafield) metafieldHandle[n.metafield.id] = n.handle; });
    after = r.pageInfo.hasNextPage ? r.pageInfo.endCursor : null;
  } while (after);
}

const jobs = []; // { resourceId, translations: [...] }
const add = (resourceId, item, l, value) => {
  if (value == null || value === '' || value === item.value) return;
  let job = jobs.find((j) => j.resourceId === resourceId);
  if (!job) jobs.push((job = { resourceId, translations: [] }));
  job.translations.push({ locale: l, key: item.key, value, translatableContentDigest: item.digest });
};

const TYPES = (flag('--types') || 'ONLINE_STORE_THEME,MENU,LINK,COLLECTION,PAGE,BLOG,ARTICLE,PRODUCT,METAFIELD').split(',');
for (const type of TYPES) {
  const list = resources(type);
  let n = 0;
  for (const res of list) {
    const handle = (res.translatableContent.find((c) => c.key === 'handle') || {}).value;
    for (const item of res.translatableContent) {
      if (!item.value) continue;
      for (const l of locales) {
        let v;
        if (type === 'ONLINE_STORE_THEME') {
          if (item.key.startsWith('section.')) v = tr(item.value, l);
        } else if (type === 'MENU' || type === 'LINK' || type === 'PAGE' || type === 'BLOG' || type === 'ARTICLE') {
          if (item.key === 'title') v = tr(item.value, l);
        } else if (type === 'COLLECTION') {
          if (item.key === 'title') v = tr(item.value, l);
          const m = item.key === 'body_html' && item.value.match(/^<p>(.+) — Occasion Fashion collection\.<\/p>$/);
          if (m && tr(m[1], l)) v = `<p>${tr(m[1], l)} — ${P.collectionSuffix[col(l)]}</p>`;
        } else if (type === 'PRODUCT') {
          const copy = handle && productCopy(handle, l);
          if (copy && item.key === 'title') v = copy.title;
          if (copy && item.key === 'body_html') v = copy.body;
          if (copy && item.key === 'product_type') v = tr(item.value, l);
        } else if (type === 'METAFIELD') {
          const h = metafieldHandle[res.resourceId];
          const copy = h && productCopy(h, l);
          if (copy && item.key === 'value') v = copy.short;
        }
        if (v) { add(res.resourceId, item, l, v); n++; }
      }
    }
  }
  console.log(`${type}: ${list.length} resources, ${n} translations`);
}

if (DRY) {
  fs.writeFileSync(path.join(TMP, 'tr-dry.json'), JSON.stringify(jobs, null, 1));
  console.log(`dry run: ${jobs.length} resources → .shopify/tr-dry.json`);
  process.exit(0);
}

// --- Register: at most 100 keys per resource per mutation, so a big resource (the theme) is
// split into chunks of 100, and one call never holds two chunks of the same resource
const batches = [];
for (const job of jobs) {
  for (let i = 0; i < job.translations.length; i += 100) batches.push({ resourceId: job.resourceId, translations: job.translations.slice(i, i + 100) });
}
let errors = 0;
for (let i = 0; i < batches.length;) {
  const chunk = [];
  while (i < batches.length && chunk.length < 20 && !chunk.some((b) => b.resourceId === batches[i].resourceId)) chunk.push(batches[i++]);
  const defs = chunk.map((_, k) => `$id${k}: ID!, $t${k}: [TranslationInput!]!`).join(', ');
  const body = chunk.map((_, k) => `r${k}: translationsRegister(resourceId: $id${k}, translations: $t${k}) { userErrors { field message } }`).join(' ');
  const vars = {};
  chunk.forEach((b, k) => { vars[`id${k}`] = b.resourceId; vars[`t${k}`] = b.translations; });
  const r = gql(`mutation(${defs}) { ${body} }`, vars, true);
  Object.values(r).forEach((x) => { if (x.userErrors.length) { errors++; console.warn('  !', JSON.stringify(x.userErrors).slice(0, 300)); } });
  process.stdout.write(`  ${i}/${batches.length}\r`);
}
console.log(`\n✔ translations registered (${batches.length} batches, ${errors} with errors)`);
