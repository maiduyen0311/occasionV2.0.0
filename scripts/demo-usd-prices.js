#!/usr/bin/env node
/**
 * Store whose base currency is not USD (occasion-demo-3 is VND): fixed USD prices for the
 * USD + Viet Nam markets = each variant's price / compare-at as dollars (22 → $22.00).
 * The International market uses USD as base currency with local currencies on, so EUR etc.
 * convert from these. Re-run after a demo:import that changes prices.
 *
 *   node scripts/demo-usd-prices.js --store occasion-demo-3.myshopify.com
 */
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..'); const S = process.argv[process.argv.indexOf('--store') + 1]; if (!process.argv.includes('--store')) { console.error('Usage: node scripts/demo-usd-prices.js --store <shop>.myshopify.com'); process.exit(1); } fs.mkdirSync(path.join(ROOT, '.shopify'), { recursive: true }); const T = path.join(ROOT, '.shopify');
function gql(q, v = {}, mut = false) {
  fs.writeFileSync(path.join(T, 'q.graphql'), q); fs.writeFileSync(path.join(T, 'v.json'), JSON.stringify(v));
  const a = ['shopify', 'store', 'execute', '-s', S, '--no-input', '-j', '--query-file', '.shopify/q.graphql', '--variable-file', '.shopify/v.json'];
  if (mut) a.push('--allow-mutations');
  const o = execFileSync('npx', a, { cwd: ROOT, shell: true, maxBuffer: 50e6, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  return JSON.parse(o.slice(o.indexOf('{\n')));
}
const markets = gql('{ markets(first: 10) { nodes { id name } } }').markets.nodes.filter((m) => ['USD', 'Viet Nam'].includes(m.name));
// Reuse the 'USD prices' price list when it exists (re-run after changing prices)
const existing = gql('{ priceLists(first: 20) { nodes { id name } } }').priceLists.nodes.find((p) => p.name === 'USD prices');
const cat = existing ? null : gql('mutation($i: CatalogCreateInput!) { catalogCreate(input: $i) { catalog { id } userErrors { field message } } }',
  { i: { title: 'USD prices', status: 'ACTIVE', context: { marketIds: markets.map((m) => m.id) } } }, true).catalogCreate;
const pl = existing ? { priceList: existing } : gql('mutation($i: PriceListCreateInput!) { priceListCreate(input: $i) { priceList { id } userErrors { field message } } }',
  { i: { name: 'USD prices', currency: 'USD', catalogId: cat && cat.catalog.id, parent: { adjustment: { type: 'PERCENTAGE_DECREASE', value: 0 } } } }, true).priceListCreate;
console.log('price list', pl.priceList.id);
const prices = []; let after = null;
do {
  const r = gql('query($a: String) { productVariants(first: 250, after: $a) { pageInfo { hasNextPage endCursor } nodes { id price compareAtPrice } } }', { a: after }).productVariants;
  r.nodes.forEach((v) => prices.push({ variantId: v.id, price: { amount: v.price, currencyCode: 'USD' }, ...(v.compareAtPrice ? { compareAtPrice: { amount: v.compareAtPrice, currencyCode: 'USD' } } : {}) }));
  after = r.pageInfo.hasNextPage ? r.pageInfo.endCursor : null;
} while (after);
console.log('variants', prices.length);
for (let i = 0; i < prices.length; i += 250) {
  const r = gql('mutation($id: ID!, $p: [PriceListPriceInput!]!) { priceListFixedPricesAdd(priceListId: $id, prices: $p) { prices { price { amount } } userErrors { field message } } }', { id: pl.priceList.id, p: prices.slice(i, i + 250) }, true).priceListFixedPricesAdd;
  console.log('batch', i, r.prices.length, JSON.stringify(r.userErrors));
}
