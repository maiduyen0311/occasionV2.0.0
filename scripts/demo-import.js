#!/usr/bin/env node
/**
 * Import a demo's store content (demos/<demo>/content.json) into a store:
 * metafield definitions, image files, products with variants, collections,
 * pages, blog posts and menus. Safe to re-run: everything is looked up by
 * handle and updated instead of duplicated.
 *
 *   node scripts/demo-import.js <demo> --store <shop>.myshopify.com [--only languages,files,products,collections,pages,blog,menus,discounts] [--prune]
 *   --prune archives this demo's products that are no longer in content.json
 *   npm run demo:import -- fashion --store haley-demo.myshopify.com
 *
 * Uses `shopify store execute` (Shopify CLI, Admin GraphQL API). Images are
 * fetched by Shopify straight from the URLs in content.json.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const demo = argv.find((a, i) => !a.startsWith('-') && !['--store', '--only'].includes(argv[i - 1]));
const store = flag('--store');
const only = flag('--only') ? flag('--only').split(',') : null;
const step = (name) => !only || only.includes(name);

if (!demo || !store) {
  console.error('Usage: node scripts/demo-import.js <demo> --store <shop>.myshopify.com [--only files,products,collections,pages,blog,menus]');
  process.exit(1);
}
const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'demos', demo, 'content.json'), 'utf8'));
const prefix = content.storeName ? content.storeName.toLowerCase() : demo;

// ---------------------------------------------------------------------------
// GraphQL through Shopify CLI
// ---------------------------------------------------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-import-'));
let n = 0;
function gql(query, variables = {}) {
  n += 1;
  const q = path.join(tmp, `q${n}.graphql`);
  const v = path.join(tmp, `v${n}.json`);
  const out = path.join(tmp, `o${n}.json`);
  fs.writeFileSync(q, query);
  fs.writeFileSync(v, JSON.stringify(variables));
  const args = ['shopify', 'store', 'execute', '--store', store, '--query-file', q, '--variable-file', v, '--output-file', out, '--allow-mutations', '--no-color'];
  // npx needs a shell on Windows → quote paths (the temp dir can contain spaces)
  const shell = process.platform === 'win32';
  const argv2 = shell ? args.map((x) => (/\s/.test(x) ? `"${x}"` : x)) : args;
  try {
    execFileSync('npx', argv2, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell, maxBuffer: 50e6 });
  } catch (e) {
    throw new Error(`GraphQL call failed:\n${(e.stdout || '').toString()}${(e.stderr || '').toString().slice(-2000)}`);
  }
  const json = JSON.parse(fs.readFileSync(out, 'utf8'));
  const data = json.data || json;
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return data;
}
function userErrors(result, label) {
  const errs = Object.values(result).flatMap((r) => (r && r.userErrors) || []);
  const real = errs.filter((e) => e.code !== 'TAKEN');
  if (real.length) console.warn(`  ! ${label}: ${real.map((e) => e.message).join('; ')}`);
  return real.length === 0;
}
// Images: remote ones (img.url) are fetched by Shopify; local ones (img.file,
// relative to demos/<demo>/) are uploaded once into Files through a staged
// upload, and their CDN url is reused everywhere (products, collections, blog).
const fileNameFor = (key) => {
  const entry = (content.files || []).find((x) => x.key === key);
  if (entry) return entry.filename;
  // product images: content hash in the name, so an edited image is uploaded again
  const abs = path.join(ROOT, 'demos', demo, content.images[key].file);
  const hash = require('crypto').createHash('md5').update(fs.readFileSync(abs)).digest('hex').slice(0, 8);
  return `${prefix}-hd-${key}-${hash}.jpg`;
};
const cdnCache = {};
// The filename search is fuzzy (banner-b-wide also matches banner-wide) → keep the exact name only.
// A file still processing has no url yet: accept it so the caller waits for it.
function findFile(filename) {
  const r = gql('query($q: String!) { files(first: 10, query: $q) { nodes { fileStatus ... on MediaImage { image { url } } } } }', { q: `filename:${filename}` });
  const base = (n) => decodeURIComponent(n.image.url.split('?')[0].split('/').pop());
  return r.files.nodes.find((n) => n.image && base(n) === filename) || r.files.nodes.find((n) => !n.image && n.fileStatus !== 'FAILED');
}
function sleepSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function uploadLocal(key) {
  if (cdnCache[key]) return cdnCache[key];
  const img = content.images[key];
  const filename = fileNameFor(key);
  let node = findFile(filename);
  if (!node) {
    const abs = path.join(ROOT, 'demos', demo, img.file);
    const size = fs.statSync(abs).size;
    const staged = gql('mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }', {
      input: [{ resource: 'IMAGE', filename, mimeType: 'image/jpeg', httpMethod: 'POST', fileSize: String(size) }],
    }).stagedUploadsCreate.stagedTargets[0];
    // multipart POST with curl (synchronous, no extra dependency)
    const form = staged.parameters.flatMap((p) => ['-F', `${p.name}=${p.value}`]).concat(['-F', `file=@${abs};type=image/jpeg`]);
    execFileSync('curl', ['-s', '-f', '-o', process.platform === 'win32' ? 'NUL' : '/dev/null', ...form, staged.url]);
    userErrors(gql('mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { field message code } } }', {
      files: [{ originalSource: staged.resourceUrl, filename, contentType: 'IMAGE', alt: alt(key) }],
    }), `fileCreate ${filename}`);
  }
  for (let i = 0; i < 30 && !(node && node.fileStatus === 'READY' && node.image); i++) { sleepSync(1500); node = findFile(filename); }
  if (!node || !node.image) throw new Error(`${filename} did not finish processing`);
  cdnCache[key] = node.image.url;
  return cdnCache[key];
}
const imageUrl = (key) => {
  const img = content.images[key];
  if (!img) throw new Error(`images.${key} missing in content.json`);
  return img.file ? uploadLocal(key) : img.url;
};
const alt = (key, fallback) => fallback || key.replace(/^p-/, '').replace(/-/g, ' ');

// ---------------------------------------------------------------------------
// Shared lookups
// ---------------------------------------------------------------------------
const pubs = gql('{ publications(first: 20) { nodes { id name } } }').publications.nodes;
const onlineStore = pubs.find((p) => /online store/i.test(p.name)) || pubs[0];
const location = gql('{ locations(first: 1) { nodes { id } } }').locations.nodes[0];
const publish = (id) => userErrors(gql(
  'mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }',
  { id, input: [{ publicationId: onlineStore.id }] },
), 'publish');
console.log(`▶ ${store} — publishing to "${onlineStore.name}"`);

// ---------------------------------------------------------------------------
// 0. Languages: publish them and attach them to the primary domain, so the
//    header language picker has options (needs read_locales/write_locales)
// ---------------------------------------------------------------------------
if (step('languages') && content.languages) {
  const { default: def, alternates = [] } = content.languages;
  for (const locale of [def, ...alternates]) {
    gql('mutation($l: String!) { shopLocaleEnable(locale: $l) { userErrors { field message } } }', { l: locale });
    userErrors(gql('mutation($l: String!) { shopLocaleUpdate(locale: $l, shopLocale: { published: true }) { userErrors { field message } } }', { l: locale }), `publish ${locale}`);
  }
  const presence = gql('{ webPresences(first: 10) { nodes { id domain { host } } } }').webPresences.nodes.find((w) => w.domain && w.domain.host === store);
  if (presence) {
    userErrors(gql('mutation($id: ID!, $i: WebPresenceUpdateInput!) { webPresenceUpdate(id: $id, input: $i) { userErrors { field message } } }', { id: presence.id, i: { defaultLocale: def, alternateLocales: alternates } }), 'web presence');
  }
  console.log(`✔ languages: ${def} + ${alternates.join(', ')}`);
}

// ---------------------------------------------------------------------------
// 1. Metafield definitions
// ---------------------------------------------------------------------------
if (step('products')) {
  for (const def of content.metafields || []) {
    const definition = { name: def.name, namespace: def.namespace, key: def.key, type: def.type, ownerType: 'PRODUCT' };
    if (def.choices) definition.validations = [{ name: 'choices', value: JSON.stringify(def.choices) }];
    const r = gql('mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id } userErrors { field message code } } }', { d: definition });
    userErrors(r, `metafield ${def.namespace}.${def.key}`);
  }
  console.log('✔ metafield definitions');
}

// ---------------------------------------------------------------------------
// 2. Files used by theme settings (shopify://shop_images/<filename>)
// ---------------------------------------------------------------------------
if (step('files')) {
  const local = content.files.filter((f) => content.images[f.key].file);
  for (const f of local) uploadLocal(f.key);
  const missing = content.files.filter((f) => !content.images[f.key].file).filter((f) => {
    const r = gql('query($q: String!) { files(first: 1, query: $q) { nodes { id } } }', { q: `filename:${f.filename}` });
    return r.files.nodes.length === 0;
  });
  for (let i = 0; i < missing.length; i += 20) {
    const batch = missing.slice(i, i + 20).map((f) => ({ originalSource: imageUrl(f.key), filename: f.filename, contentType: 'IMAGE', alt: alt(f.key) }));
    const r = gql('mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { field message code } } }', { files: batch });
    userErrors(r, 'fileCreate');
  }
  console.log(`✔ files: ${local.length} local (hi-res), ${missing.length} remote uploaded`);
}

// ---------------------------------------------------------------------------
// 3. Products (productSet upserts by handle)
// ---------------------------------------------------------------------------
const productIds = {};
if (step('products') || step('collections')) {
  for (const p of content.products) {
    const existing = gql('query($h: String!) { productByIdentifier(identifier: { handle: $h }) { id } }', { h: p.handle }).productByIdentifier;
    if (existing && !step('products')) { productIds[p.handle] = existing.id; continue; }

    const colors = p.colors || [];
    const sizes = p.sizes || [];
    const mediaKeys = [...new Set([...colors.map((c) => c.image), ...(p.extraImages || [])])];
    const files = mediaKeys.map((k) => ({ originalSource: imageUrl(k), contentType: 'IMAGE', alt: `${p.title}` }));
    const options = [];
    if (colors.length) options.push({ name: 'Color', position: 1, values: colors.map((c) => ({ name: c.name })) });
    if (sizes.length) options.push({ name: 'Size', position: options.length + 1, values: sizes.map((s) => ({ name: s })) });
    if (!options.length) options.push({ name: 'Title', position: 1, values: [{ name: 'Default Title' }] });

    const combos = [];
    const colorList = colors.length ? colors : [null];
    const sizeList = sizes.length ? sizes : [null];
    colorList.forEach((c) => sizeList.forEach((s) => combos.push({ c, s })));
    const variants = combos.map(({ c, s }, i) => {
      const optionValues = [];
      if (c) optionValues.push({ optionName: 'Color', name: c.name });
      if (s) optionValues.push({ optionName: 'Size', name: s });
      if (!c && !s) optionValues.push({ optionName: 'Title', name: 'Default Title' });
      const v = {
        optionValues,
        price: String(p.price),
        sku: `${prefix.slice(0, 2).toUpperCase()}-${p.handle.split('-').map((w) => w[0]).join('').toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
        inventoryPolicy: 'DENY',
        inventoryItem: { tracked: true },
        // A few sold-out sizes so the "crossed out" option state shows up
        inventoryQuantities: [{ locationId: location.id, name: 'available', quantity: s === 'XL' || s === '40' ? 0 : 12 + ((i * 7) % 30) }],
      };
      if (p.compare) v.compareAtPrice = String(p.compare);
      if (c) v.file = { originalSource: imageUrl(c.image), contentType: 'IMAGE' };
      return v;
    });

    const metafields = [];
    if (p.badge) metafields.push({ namespace: 'custom', key: 'badge', type: 'single_line_text_field', value: p.badge });
    if (p.shortDescription) metafields.push({ namespace: 'custom', key: 'short_description', type: 'multi_line_text_field', value: p.shortDescription });
    if (p.sold) metafields.push({ namespace: 'custom', key: 'sold_count', type: 'number_integer', value: String(p.sold) });
    if (p.rating) {
      metafields.push({ namespace: 'reviews', key: 'rating', type: 'rating', value: JSON.stringify({ value: String(p.rating[0]), scale_min: '1.0', scale_max: '5.0' }) });
      metafields.push({ namespace: 'reviews', key: 'rating_count', type: 'number_integer', value: String(p.rating[1]) });
    }

    const input = {
      title: p.title, handle: p.handle, descriptionHtml: p.body, vendor: p.vendor, productType: p.type, status: 'ACTIVE',
      tags: [p.type, ...(p.collections || []), ...(p.tags || [])], productOptions: options, variants, metafields,
    };
    if (files.length) input.files = files;
    const r = gql(
      'mutation($input: ProductSetInput!, $id: ProductSetIdentifiers) { productSet(synchronous: true, input: $input, identifier: $id) { product { id } userErrors { field message code } } }',
      { input, id: { handle: p.handle } },
    );
    if (!userErrors(r, p.handle) || !r.productSet.product) continue;
    productIds[p.handle] = r.productSet.product.id;
    publish(productIds[p.handle]);
    console.log(`  ✔ ${p.title}`);
  }
  console.log('✔ products');

  // --prune: archive this demo's products that are no longer in content.json
  if (argv.includes('--prune')) {
    const keep = new Set(content.products.map((p) => p.handle));
    const vendor = content.products[0] && content.products[0].vendor;
    const old = gql('query($q: String!) { products(first: 250, query: $q) { nodes { id handle status } } }', { q: `vendor:'${vendor}'` }).products.nodes
      .filter((p) => !keep.has(p.handle) && p.status !== 'ARCHIVED');
    for (const p of old) userErrors(gql('mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }', { p: { id: p.id, status: 'ARCHIVED' } }), `archive ${p.handle}`);
    console.log(`✔ archived ${old.length} old products`);
  }
}

// ---------------------------------------------------------------------------
// 4. Collections (custom collections with an explicit product list, manual order =
//    content.products order, or c.order — a list of product handles — when given)
// ---------------------------------------------------------------------------
if (step('collections')) {
  for (const c of content.collections) {
    const rank = (h) => (c.order && c.order.includes(h) ? c.order.indexOf(h) : (c.order || []).length);
    const members = content.products
      .filter((p) => (p.collections || []).includes(c.handle))
      .map((p, i) => ({ h: p.handle, i }))
      .sort((a, b) => rank(a.h) - rank(b.h) || a.i - b.i)
      .map((p) => productIds[p.h])
      .filter(Boolean);
    const existing = gql('query($h: String!) { collectionByIdentifier(identifier: { handle: $h }) { id } }', { h: c.handle }).collectionByIdentifier;
    let id = existing && existing.id;
    if (!id) {
      const r = gql('mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { field message } } }', {
        input: { title: c.title, handle: c.handle, descriptionHtml: `<p>${c.description}</p>`, image: { src: imageUrl(c.image), altText: c.title }, sortOrder: 'MANUAL', products: members },
      });
      if (!userErrors(r, c.handle) || !r.collectionCreate.collection) continue;
      id = r.collectionCreate.collection.id;
    } else {
      if (members.length) userErrors(gql('mutation($id: ID!, $p: [ID!]!) { collectionAddProducts(id: $id, productIds: $p) { userErrors { field message } } }', { id, p: members }), `${c.handle} products`);
      const update = { id, sortOrder: 'MANUAL', descriptionHtml: `<p>${c.description}</p>` };
      if (content.images[c.image]) update.image = { src: imageUrl(c.image), altText: c.title };
      userErrors(gql('mutation($input: CollectionInput!) { collectionUpdate(input: $input) { userErrors { field message } } }', { input: update }), `${c.handle} update`);
    }
    // Manual order: move every member to its index (products outside the list stay after them)
    const moves = members.map((pid, i) => ({ id: pid, newPosition: String(i) }));
    if (moves.length) userErrors(gql('mutation($id: ID!, $moves: [MoveInput!]!) { collectionReorderProducts(id: $id, moves: $moves) { userErrors { field message } } }', { id, moves }), `${c.handle} order`);
    publish(id);
    console.log(`  ✔ ${c.title} (${members.length})`);
  }
  console.log('✔ collections');

  // --prune: hide collections listed in content.prunedCollections
  if (argv.includes('--prune')) {
    for (const h of content.prunedCollections || []) {
      const c = gql('query($h: String!) { collectionByIdentifier(identifier: { handle: $h }) { id } }', { h }).collectionByIdentifier;
      if (c) userErrors(gql('mutation($id: ID!, $input: [PublicationInput!]!) { publishableUnpublish(id: $id, input: $input) { userErrors { field message } } }', { id: c.id, input: [{ publicationId: onlineStore.id }] }), `unpublish ${h}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Pages
// ---------------------------------------------------------------------------
if (step('pages')) {
  const existing = new Set(gql('{ pages(first: 250) { nodes { handle } } }').pages.nodes.map((p) => p.handle));
  for (const pg of content.pages) {
    if (existing.has(pg.handle)) { console.log(`  · ${pg.handle} exists`); continue; }
    const page = { title: pg.title, handle: pg.handle, body: pg.body || '', isPublished: true };
    if (pg.template) page.templateSuffix = pg.template;
    userErrors(gql('mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message code } } }', { page }), pg.handle);
  }
  console.log('✔ pages');
}

// ---------------------------------------------------------------------------
// 6. Blog + articles
// ---------------------------------------------------------------------------
if (step('blog') && content.blog) {
  const b = content.blog;
  let blog = gql('{ blogs(first: 50) { nodes { id handle } } }').blogs.nodes.find((x) => x.handle === b.handle);
  if (!blog) {
    const r = gql('mutation($blog: BlogCreateInput!) { blogCreate(blog: $blog) { blog { id handle } userErrors { field message } } }', { blog: { title: b.title, handle: b.handle, ...(b.commentPolicy ? { commentPolicy: b.commentPolicy } : {}) } });
    userErrors(r, 'blog');
    blog = r.blogCreate.blog;
  } else if (b.commentPolicy) {
    // Comments on → cards show the "Comment" link (clone01 blog)
    userErrors(gql('mutation($id: ID!, $blog: BlogUpdateInput!) { blogUpdate(id: $id, blog: $blog) { userErrors { field message } } }', { id: blog.id, blog: { commentPolicy: b.commentPolicy } }), 'blog comments');
  }
  const existingArticles = gql('query($q: String!) { articles(first: 100, query: $q) { nodes { id handle } } }', { q: `blog_id:${blog.id.split('/').pop()}` }).articles.nodes;
  const have = new Set(existingArticles.map((a) => a.handle));
  // Listed order = newest first: article i is published i hours before blog.publishedAt (default now)
  const base = b.publishedAt ? Date.parse(b.publishedAt) : Date.now();
  b.articles.forEach((a, i) => {
    const publishDate = new Date(base - i * 3600 * 1000).toISOString();
    if (have.has(a.handle)) {
      const found = existingArticles.find((x) => x.handle === a.handle);
      const article = { publishDate };
      if (content.images[a.image] && content.images[a.image].file) article.image = { url: imageUrl(a.image), altText: a.title };
      userErrors(gql('mutation($id: ID!, $article: ArticleUpdateInput!) { articleUpdate(id: $id, article: $article) { userErrors { field message } } }', { id: found.id, article }), `${a.handle} update`);
      return;
    }
    userErrors(gql('mutation($article: ArticleCreateInput!) { articleCreate(article: $article) { article { id } userErrors { field message code } } }', {
      article: { blogId: blog.id, title: a.title, handle: a.handle, body: a.body, summary: a.excerpt, tags: a.tags, isPublished: true, publishDate, author: { name: b.author || content.storeName }, image: { url: imageUrl(a.image), altText: a.title } },
    }), a.handle);
  });
  console.log('✔ blog');
}

// ---------------------------------------------------------------------------
// 7. Menus (created, or replaced when the handle exists — e.g. main-menu)
// ---------------------------------------------------------------------------
if (step('menus')) {
  // /collections/<handle> → real collection links (link.type == 'collection_link' in Liquid,
  // e.g. the collection sidebar's categories menu); everything else stays a plain URL
  const collectionIds = {};
  const collectionId = (h) => {
    if (!(h in collectionIds)) collectionIds[h] = (gql('query($h: String!) { collectionByIdentifier(identifier: { handle: $h }) { id } }', { h }).collectionByIdentifier || {}).id || null;
    return collectionIds[h];
  };
  const toItem = (it) => {
    const m = /^\/collections\/([\w-]+)$/.exec(it.url);
    if (m && m[1] === 'all') return { type: 'CATALOG', url: it.url };
    const id = m && collectionId(m[1]);
    return id ? { type: 'COLLECTION', resourceId: id, url: it.url } : { type: 'HTTP', url: it.url };
  };
  const toItems = (items) => items.map((it) => ({ title: it.title, ...toItem(it), items: it.items ? toItems(it.items) : [] }));
  const menus = gql('{ menus(first: 100) { nodes { id handle } } }').menus.nodes;
  for (const m of content.menus) {
    const found = menus.find((x) => x.handle === m.handle);
    const r = found
      ? gql('mutation($id: ID!, $title: String!, $handle: String, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } } }', { id: found.id, title: m.title, handle: m.handle, items: toItems(m.items) })
      : gql('mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) { menuCreate(title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } } }', { title: m.title, handle: m.handle, items: toItems(m.items) });
    userErrors(r, `menu ${m.handle}`);
    console.log(`  ✔ menu ${m.handle}`);
  }
  console.log('✔ menus');
}

// ---------------------------------------------------------------------------
// 8. Automatic discounts (e.g. "Buy 3 get 20% off" behind the product bundle).
//    Matched by title, so re-running never creates duplicates.
// ---------------------------------------------------------------------------
if (step('discounts') && (content.discounts || []).length) {
  const existing = gql('{ automaticDiscountNodes(first: 50) { nodes { id automaticDiscount { ... on DiscountAutomaticBasic { title } } } } }')
    .automaticDiscountNodes.nodes.map((n) => n.automaticDiscount && n.automaticDiscount.title);
  for (const d of content.discounts) {
    if (existing.includes(d.title)) { console.log(`  · discount "${d.title}" exists`); continue; }
    const r = gql('mutation($d: DiscountAutomaticBasicInput!) { discountAutomaticBasicCreate(automaticBasicDiscount: $d) { automaticDiscountNode { id } userErrors { field message } } }', {
      d: {
        title: d.title,
        startsAt: new Date().toISOString(),
        minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(d.minQuantity) } },
        customerGets: { value: { percentage: d.percent / 100 }, items: { all: true } },
      },
    });
    if (userErrors(r, `discount ${d.title}`)) console.log(`  ✔ discount "${d.title}"`);
  }
  console.log('✔ discounts');
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\nDone. Push the theme with: node scripts/deploy-demo.js ${demo} --store ${store} --live`);
