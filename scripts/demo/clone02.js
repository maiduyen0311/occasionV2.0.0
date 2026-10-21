#!/usr/bin/env node
/**
 * Demo "clone02" (Home Fashion #2 — design/clone02/01_Layout/02_Homepage_*.jpg), store
 * occasion-demo-2.myshopify.com. Writes into demos/clone02/ (same files as demos/clone01/).
 *
 * Starts from the COMMITTED demos/clone01 output — catalogue, inner-page templates, header /
 * footer groups, theme settings — because scripts/demo/clone01.js is behind those files (they
 * were tuned by hand after generation; never regenerate clone01 to build on it). Then applies
 * the Fashion #2 design: centred logo header with a white menu row, 4 mega menus, 755px hero,
 * banner mosaic, pink sale strip, light footer, and 20 more products (the clone02 homepage
 * photos, Layer-7079xx). clone01 product photos are reused from demos/clone01/images.
 *
 *   node scripts/demo/clone02.js
 *   powershell -ExecutionPolicy Bypass -File scripts/demo/clone01-images.ps1 -Demo clone02
 *   npm run demo:import -- clone02 --store occasion-demo-2.myshopify.com
 *   npm run deploy:demo -- clone02 --store occasion-demo-2.myshopify.com --theme <id>
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const BASE = path.join(ROOT, 'demos', 'clone01');
const OUT = path.join(ROOT, 'demos', 'clone02');
const PREFIX = 'oc2'; // file names in the store's Files: oc2-<key>.jpg

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, ''));
const base = (rel) => readJson(path.join(BASE, rel));
const clone01 = base('content.json');

// ---------------------------------------------------------------------------
// Images: key → source in design/clone02 (crop = [x, y, w, h] on the layout jpg)
// ---------------------------------------------------------------------------
const LAYOUT = '01_Layout/02_Homepage_Banner-1.jpg';
const images = {};
const src = (key, file, opts = {}) => { images[key] = { src: `02_Image/${file}`, max: 1000, ...opts }; return key; };
const crop = (key, rect, opts = {}) => { images[key] = { src: LAYOUT, crop: rect, ...opts }; return key; };

// Hero slides: text and button are part of the artwork (Slider_01 has 322px of white on the right)
crop('hero-1', [0, 0, 1820, 755], { src: '02_Image/Slider_01.jpg' });
src('hero-2', 'Slider_02.jpg', { max: 1820 });
src('hero-3', 'Slider_03.jpg', { max: 1820 });
// Banner mosaic under Daily deals, 1:1 from the layout
crop('banner-sale-items', [320, 1764, 586, 278]);
crop('banner-off-50', [320, 2056, 286, 286]);
crop('banner-off-25', [620, 2056, 286, 286]);
crop('banner-fashion-trends', [922, 1764, 580, 580]);
// "Sale 50%" strip, full page width
crop('banner-sale-50', [0, 3450, 1820, 500]);
// Brand strip: each logo's own extent (+10px) inside the 1180px box; "logo-" keys because
// demo-import never re-uploads a Files name (the first equal-cell "brand-" crops cut into the
// neighbouring logos). Footer payment icons.
const LOGOS = [[341, 464], [512, 620], [683, 842], [896, 1059], [1128, 1271], [1327, 1471]];
LOGOS.forEach(([x0, x1], i) => crop(`logo-${i + 1}`, [x0 - 10, 5440, x1 - x0 + 21, 100]));
crop('payment', [1215, 6488, 290, 40]);
// Mega menus: Home thumbnails, Shop / Collection / New in banners
crop('menu-home-1', [531, 221, 212, 178], { src: '01_Layout/02_Homepage_Hover-Home.jpg' });
crop('menu-home-2', [773, 221, 212, 178], { src: '01_Layout/02_Homepage_Hover-Home.jpg' });
crop('menu-home-3', [1016, 221, 212, 178], { src: '01_Layout/02_Homepage_Hover-Home.jpg' });
crop('menu-shop', [1369, 228, 328, 263], { src: '01_Layout/02_Homepage_Hover-Shop-.jpg' });
crop('menu-collection', [774, 222, 454, 223], { src: '01_Layout/02_Homepage_Hover-Collection.jpg' });
crop('menu-new-in', [1125, 222, 356, 223], { src: '01_Layout/02_Homepage_Hover-new-in.jpg' });
// From our blog: the first two photos only exist in the layout render (280×196)
crop('blog-1', [320, 5061, 280, 196]);
crop('blog-2', [620, 5061, 280, 196]);
src('blog-3', 'Layer-70714.jpg');
src('blog-4', 'Layer-707151.jpg');
// Instagram (after the black @handle tile)
src('insta-1', 'Layer-70701.jpg');
src('insta-2', 'Layer-70705.jpg');
src('insta-3', 'Layer-70704.jpg');
src('insta-4', 'Layer-70702.jpg');
// Newsletter popup photo (left half of the box)
crop('popup-left', [489, 302, 336, 492], { src: '01_Layout/02_Homepage_hover-newletter-.jpg' });

// ---------------------------------------------------------------------------
// Products: the clone01 catalogue (photos from demos/clone01/images) + the clone02 homepage
// products. Homepage collections are rebuilt from the new products.
// ---------------------------------------------------------------------------
const HOME_COLLECTIONS = ['daily-deals', 'hot-deals', 'trending', 'new-items', 'items-new', 'clothes-new'];
// Products: only the clone02 photos (demos/clone02/images/product) — no clone01 / occasion-demo
// products (user request 2026-10-21)
const inherited = [];

const SIZES = ['S', 'M', 'L', 'XL'];
// Product photos: demos/clone02/images/product/p-*.jpg (7 have the background whitened by hand —
// don't regenerate them from the layout with clone01-images.ps1)
const BRANDS = ['Sunshine', 'MS Studio', 'Art Studio', 'Pure', 'Handcrafted', 'Handmade'];
const CARE = 'Machine wash at 30°C. Do not tumble dry. Iron at low temperature.';
const P = [];
// [handle, title, type, price, compare, photo, colour, collections, short description, details, composition]
const NEW = [
  // Daily deals
  ['sheer-mesh-turtleneck-top', 'Sheer mesh turtleneck top', 'Tops', 29, 0, 'Layer-707922.png', 'Black', ['daily-deals', 'clothing', 'shirts'],
    'A see-through mesh top with a high turtleneck and long fitted sleeves — layer it over a bralette or a slip dress.', ['Turtleneck', 'Long fitted sleeves', 'Sheer stretch mesh'], '92% polyamide, 8% elastane'],
  ['soft-blue-knit-sweater', 'Soft blue knit sweater', 'Sweaters', 34, 40, 'Layer-707919.jpg', 'Blue', ['daily-deals', 'clothing', 'sweaters', 'sale'],
    'A light, airy knit in powder blue with a round neck and relaxed fit.', ['Round neck', 'Dropped shoulders', 'Ribbed trims'], '60% acrylic, 25% polyamide, 15% mohair'],
  ['white-boxy-t-shirt', 'White boxy T-shirt', 'Tops', 19, 0, 'Layer-707920.jpg', 'White', ['daily-deals', 'clothing', 't-shirts'],
    'A boxy cotton T-shirt with a wide neckline — the easy base for every outfit.', ['Wide round neck', 'Short dropped sleeves', 'Boxy fit'], '100% cotton'],
  ['off-shoulder-poplin-top', 'Off-shoulder poplin top', 'Tops', 32, 38, 'Layer-707921.jpg', 'White', ['daily-deals', 'clothing', 'shirts', 'sale'],
    'A crisp cotton poplin top with an elasticated off-shoulder neckline and wide sleeves.', ['Elasticated bardot neckline', 'Wide 3/4 sleeves', 'Cropped length'], '100% cotton'],
  // Trending items
  ['jacquard-knit-sweater', 'Jacquard knit sweater', 'Sweaters', 45, 0, 'Layer-707910.jpg', 'Gray', ['trending', 'clothing', 'sweaters'],
    'A chunky turtleneck sweater with a black and white jacquard pattern.', ['Turtleneck', 'Jacquard knit pattern', 'Ribbed cuffs and hem'], '70% acrylic, 30% wool'],
  ['cable-knit-sweater-dress', 'Cable knit sweater dress', 'Dresses', 49, 59, 'Layer-707912.jpg', 'White', ['trending', 'clothing', 'dresses', 'sale'],
    'An oversized cable knit dress with a V-neck — wear it with boots on cold days.', ['V-neck', 'Cable knit front', 'Oversized fit'], '100% acrylic'],
  ['fair-isle-sweater', 'Fair Isle sweater', 'Sweaters', 39, 0, 'Layer-707911.jpg', 'Red', ['trending', 'clothing', 'sweaters'],
    'A classic Fair Isle sweater in red, white and black with a round yoke pattern.', ['Round neck', 'Fair Isle yoke', 'Regular fit'], '50% acrylic, 50% wool'],
  ['pleated-satin-slip-dress', 'Pleated satin slip dress', 'Dresses', 55, 69, 'Layer-707913.jpg', 'Beige', ['trending', 'clothing', 'dresses', 'sale'],
    'A midi slip dress in champagne satin with fine pleats and thin adjustable straps.', ['Adjustable straps', 'Fine pleats', 'Midi length'], '100% polyester'],
  ['tailored-wrap-jumpsuit', 'Tailored wrap jumpsuit', 'Dresses', 59, 0, 'Layer-707914.jpg', 'Black', ['trending', 'clothing', 'dresses'],
    'A sharp black jumpsuit with a wrap front, tie belt and wide legs.', ['Wrap front', 'Tie belt', 'Wide legs'], '64% polyester, 34% viscose, 2% elastane'],
  ['faux-fur-jacket', 'Faux fur jacket', 'Jackets', 79, 95, 'Layer-707915.jpg', 'White', ['trending', 'clothing', 'sale'],
    'A soft cream faux fur jacket with a short boxy shape and hook fastening.', ['Collarless', 'Hook and eye fastening', 'Lined'], '100% polyester'],
  ['red-lace-trim-cami', 'Red lace-trim cami', 'Tops', 22, 0, 'Layer-707916.jpg', 'Red', ['trending', 'clothing', 'shirts'],
    'A silky cami in deep red with a black lace trim along the neckline.', ['V-neck with lace trim', 'Adjustable straps', 'Relaxed fit'], '100% polyester'],
  ['glitter-v-neck-dress', 'Glitter V-neck dress', 'Dresses', 45, 52, 'Layer-707917.jpg', 'Gray', ['trending', 'clothing', 'dresses', 'sale'],
    'A fitted knit mini dress with a deep V-neck and a fine glitter thread.', ['Deep V-neck', 'Long sleeves', 'Fitted mini length'], '75% viscose, 20% polyamide, 5% metallic fibre'],
  // New items (tabs: All / Items / Clothes / Accessories / Discount)
  ['floral-balloon-sleeve-blouse', 'Floral balloon sleeve blouse', 'Tops', 35, 0, 'Layer-707923.jpg', 'White', ['new-items', 'clothes-new', 'clothing', 'shirts'],
    'A cropped floral blouse with a V-neck and full balloon sleeves.', ['V-neck', 'Balloon sleeves', 'Cropped length'], '100% viscose'],
  ['open-knit-sweater', 'Open knit sweater', 'Sweaters', 39, 45, 'Layer-707924.jpg', 'White', ['new-items', 'items-new', 'clothing', 'sweaters', 'sale'],
    'A loose open-knit sweater in ivory — light enough for spring evenings.', ['Round neck', 'Open knit', 'Relaxed fit'], '100% cotton'],
  ['pale-pink-sweater', 'Pale pink sweater', 'Sweaters', 32, 0, 'Layer-707926.jpg', 'Pink', ['new-items', 'items-new', 'clothing', 'sweaters'],
    'A soft fine-knit sweater in pale pink with a round neck.', ['Round neck', 'Long sleeves', 'Ribbed trims'], '80% viscose, 20% polyamide'],
  ['beige-utility-blouse', 'Beige utility blouse', 'Tops', 36, 42, 'Layer-707927.jpg', 'Beige', ['new-items', 'clothes-new', 'clothing', 'shirts', 'sale'],
    'A relaxed blouse with a grandad collar, chest pocket and button cuffs.', ['Grandad collar', 'Chest pocket', 'Button cuffs'], '100% lyocell'],
  ['green-striped-satin-shirt', 'Green striped satin shirt', 'Tops', 35, 0, 'Layer-707930.jpg', 'Green', ['new-items', 'clothes-new', 'clothing', 'shirts'],
    'A satin shirt with green and navy stripes and a relaxed fit.', ['Classic collar', 'Button front', 'Relaxed fit'], '100% polyester'],
  ['check-flannel-boyfriend-shirt', 'Check flannel boyfriend shirt', 'Tops', 29, 35, 'Layer-707929.jpg', 'Red', ['new-items', 'clothes-new', 'clothing', 'shirts', 'sale'],
    'An oversized brushed flannel shirt in a red and cream check.', ['Classic collar', 'Two chest pockets', 'Oversized fit'], '100% cotton'],
  ['white-peplum-wrap-blouse', 'White peplum wrap blouse', 'Tops', 32, 0, 'Layer-707931.jpg', 'White', ['new-items', 'items-new', 'clothing', 'shirts'],
    'A wrap blouse with a peplum waist and lace inserts on the shoulders.', ['Wrap V-neck', 'Peplum waist', 'Lace inserts'], '100% polyester'],
  ['ditsy-floral-blouse', 'Ditsy floral blouse', 'Tops', 29, 34, 'Layer-707928.jpg', 'Pink', ['new-items', 'clothes-new', 'clothing', 'shirts', 'sale'],
    'A light blouse with a small pink floral print and a tie neck.', ['Tie neck', 'Long sleeves with cuffs', 'Regular fit'], '100% viscose'],
];
// What each homepage card shows in the layout: [price, compare-at, NEW badge, swatch colours].
// The layout's struck-through prices don't add up to its badges (e.g. $105 / $165 under "-30%"):
// compare-at is set so the theme's computed badge reads the layout's -15% / -30%.
// Colour names → snippets/color-name-hex.liquid. No rating: five empty stars as in the layout.
const ROW_1 = [[345, 0, true, ['White', 'Tan', 'Sage', 'Black']], [105, 150, false, ['Purple', 'Cyan', 'Silver']],
  [141, 0, true, ['White', 'Tan', 'Sage', 'Black']], [114, 163, false, ['Camel', 'Yellow']]];
const ROW_2 = [[115, 165, false, ['Tan', 'Green']], [165, 0, true, ['Red', 'Cyan', 'Silver']],
  [241, 0, true, ['White', 'Tan', 'Sage', 'Black']], [111, 159, false, ['Camel', 'Yellow']]];
const LOOK = {
  'sheer-mesh-turtleneck-top': [90, 0, true, ['White', 'Yellow', 'Coral', 'Black']],
  'soft-blue-knit-sweater': [120, 141, false, ['White', 'Tan', 'Light blue', 'Aqua']],
  'white-boxy-t-shirt': [220, 0, true, ['White', 'Orange', 'Sage', 'Green']],
  'off-shoulder-poplin-top': [213, 251, false, ['White', 'Rose', 'Sage', 'Teal']],
};
['trending', 'new-items'].forEach((c) => NEW.filter((p) => p[7].includes(c)).forEach(([handle], i) => { LOOK[handle] = [...ROW_1, ...ROW_2][i]; }));

NEW.forEach(([handle, title, type, , , photo, , collections, short, details, composition], i) => {
  const key = src(`p-${handle}`, photo);
  const [price, compare, isNew, names] = LOOK[handle];
  const brand = BRANDS[(inherited.length + i) % BRANDS.length];
  const inCollections = [...collections.filter((c) => c !== 'sale'), ...(compare ? ['sale'] : [])];
  P.push({
    handle,
    title,
    shortDescription: short,
    body: `<p>${short}</p><h5>Details</h5><ul>${details.map((d) => `<li>${d}</li>`).join('')}</ul><h5>Composition &amp; care</h5><ul><li>${composition}</li><li>${CARE}</li></ul>`,
    vendor: brand,
    type,
    price,
    compare: compare || undefined,
    extraImages: [key],
    sizes: SIZES,
    collections: inCollections,
    tags: [...(isNew ? ['new'] : []), ...names, brand, ...SIZES],
    sold: collections.includes('daily-deals') ? 6 : undefined,
    colors: names.map((name) => ({ name, image: key })),
  });
});

// ---------------------------------------------------------------------------
// Collections, menus, store content
// ---------------------------------------------------------------------------
const homeCollection = {
  'daily-deals': ['Daily Deals', 'p-sheer-mesh-turtleneck-top'],
  trending: ['Trending Items', 'p-jacquard-knit-sweater'],
  'new-items': ['New Items', 'p-floral-balloon-sleeve-blouse'],
  'items-new': ['New Items — Items', 'p-open-knit-sweater'],
  'clothes-new': ['New Items — Clothes', 'p-beige-utility-blouse'],
};
// Homepage order = the layout's order
const ORDER = {
  'daily-deals': NEW.filter((p) => p[7].includes('daily-deals')).map((p) => p[0]),
  trending: NEW.filter((p) => p[7].includes('trending')).map((p) => p[0]),
  'new-items': NEW.filter((p) => p[7].includes('new-items')).map((p) => p[0]),
};
const collections = clone01.collections
  .filter((c) => c.handle !== 'hot-deals')
  .map((c) => {
    if (!homeCollection[c.handle]) return c;
    const [title, image] = homeCollection[c.handle];
    const { order, ...rest } = c;
    return { ...rest, title, image, ...(ORDER[c.handle] ? { order: ORDER[c.handle] } : {}) };
  });

const coll = (h) => `/collections/${h}`;
const search = (word) => `/search?type=product&q=title:${word}`;
// "Collection" / "New in" columns in the layout: Apparel … Sweaters
const APPAREL = [
  { title: 'Apparel', url: coll('clothing') }, { title: 'Blouses', url: coll('shirts') }, { title: 'Dresses', url: coll('dresses') },
  { title: 'Bodysuits', url: search('bodysuit') }, { title: 'Jumpsuits', url: search('jumpsuit') }, { title: 'T-Shirts', url: coll('t-shirts') },
  { title: 'Jackets', url: search('jacket') }, { title: 'Sweaters', url: coll('sweaters') },
];
// "New In" second column: collections that hold clone02 products (no accessories in the catalogue)
const ACCESSORIES = [
  { title: 'Shirts', url: coll('shirts') }, { title: 'Dresses', url: coll('dresses') }, { title: 'Sweaters', url: coll('sweaters') },
  { title: 'T-Shirts', url: coll('t-shirts') }, { title: 'Trending', url: coll('trending') }, { title: 'Sale', url: coll('sale') },
];
const menus = [
  { handle: 'clone02-main-menu', title: 'Main menu (Fashion #2)', items: [
    { title: 'Home', url: '/' },
    { title: 'Collection', url: '/collections', items: APPAREL },
    { title: 'Shop', url: coll('all'), items: [
      { title: 'Shop Pages', url: coll('all'), items: APPAREL },
      { title: 'Product Hovers', url: coll('all'), items: [
        { title: 'Summary on hover', url: coll('trending') }, { title: 'Icons on hover', url: coll('new-items') }, { title: 'Icons & Add to cart', url: coll('sale') },
        { title: 'Full info on image', url: coll('clothing') }, { title: 'All info on hover', url: coll('sweaters') }, { title: 'Button on image', url: coll('shirts') },
        { title: 'Standard button', url: coll('dresses') }, { title: 'Quick shop', url: coll('daily-deals') } ] },
      { title: 'Shopify', url: coll('all'), items: [
        { title: 'Simple product', url: '/products/sheer-mesh-turtleneck-top' }, { title: 'Variable product', url: '/products/floral-balloon-sleeve-blouse' },
        { title: 'Variant image product', url: '/products/soft-blue-knit-sweater' }, { title: 'Shopping Cart', url: '/cart' }, { title: 'Checkout', url: '/checkout' },
        { title: 'My account', url: '/account' }, { title: 'Wishlist', url: '/pages/wish-list' }, { title: '404 Not Found', url: '/404' } ] },
    ] },
    { title: 'New In', url: coll('new-items'), items: [
      { title: 'Clothing', url: coll('clothing'), items: APPAREL },
      { title: 'Categories', url: coll('clothing'), items: ACCESSORIES },
    ] },
    { title: 'Sale', url: coll('sale') },
    { title: 'Blog', url: '/blogs/news' },
    { title: 'Contact Us', url: '/pages/contact' },
  ] },
  ...clone01.menus.filter((m) => !['clone01-main-menu', 'clone01-footer-bottom', 'clone01-categories'].includes(m.handle)),
];
// Collection sidebar "Product categories": clone01's list, only categories with clone02 products,
// sub-links (title searches) only when a clone02 title matches
{
  const titles = P.map((p) => p.title.toLowerCase());
  const has = (h) => P.some((p) => p.collections.includes(h));
  const word = (url) => decodeURIComponent((url.match(/title:([^&]+)/) || [])[1] || '').toLowerCase();
  const cats = clone01.menus.find((m) => m.handle === 'clone01-categories');
  menus.push({
    handle: 'clone02-categories',
    title: 'Categories (Fashion #2)',
    items: cats.items
      .filter((i) => has(i.url.replace('/collections/', '')))
      .map((i) => ({ ...i, items: (i.items || []).filter((c) => !word(c.url) || titles.some((x) => x.includes(word(c.url)))) })),
  });
}

// ---------------------------------------------------------------------------
// Header / footer groups and theme settings: clone01's files + the Fashion #2 look
// ---------------------------------------------------------------------------
const shopImage = (key) => `shopify://shop_images/${PREFIX}-${key}.jpg`;
const blocks = (type, list) => {
  const b = {};
  const order = [];
  list.forEach((settings, i) => { const id = `${type}_${i + 1}`; b[id] = { type, settings }; order.push(id); });
  return { blocks: b, block_order: order };
};

const header = base('sections/header-group.json');
Object.assign(header.sections.header.settings, {
  header_layout: 'centered_split',
  wide_rows: true,
  logo_color: '#51402c',
  logo_max_width: 190,
  pickers_position: 'end',
  header_top_background: '#f7f7f7',
  header_top_text_color: '#000000',
  header_top_border_color: '',
  top_left_content: 'contact',
  help_label: 'Hotline',
  contact_phone: '(+123)4 567 890',
  show_checkout_link: true,
  show_register_link: false,
  enable_country_selector: false,
  language_label: '',
  header_middle_background: '#ffffff',
  header_middle_text_color: '#000000',
  search_placeholder: 'Search',
  wishlist_label: 'Wish List',
  cart_label: 'Shopping Cart',
  cart_style: 'icon',
  show_action_labels: true,
  count_badge_bg: '#000000',
  count_badge_text: '#ffffff',
});
delete header.sections.header.settings.logo_image; // the theme's SVG wordmark is the Fashion #2 logo
const nav = header.sections.navigation;
nav.blocks = {
  'mega-home': { type: 'megamenu_2', settings: {
    match_title: 'Home', link_columns: 3,
    card_1_title: 'Home Fashion #1', card_1_image: shopImage('menu-home-1'), card_1_url: '/',
    card_2_title: 'Home Fashion #2', card_2_image: shopImage('menu-home-2'), card_2_url: '/',
    card_3_title: 'Home Fashion #3', card_3_image: shopImage('menu-home-3'), card_3_url: '/',
  } },
  'mega-collection': { type: 'megamenu_3', settings: { match_title: 'Collection', link_columns: 2, heading_icons: false, banner_image: shopImage('menu-collection'), banner_url: coll('clothing') } },
  'mega-shop': { type: 'megamenu_3', settings: { match_title: 'Shop', link_columns: 3, heading_icons: false, banner_image: shopImage('menu-shop'), banner_url: coll('sweaters') } },
  'mega-new-in': { type: 'megamenu_3', settings: { match_title: 'New In', link_columns: 2, heading_icons: false, banner_image: shopImage('menu-new-in'), banner_url: coll('new-items') } },
};
nav.block_order = Object.keys(nav.blocks);
Object.assign(nav.settings, {
  show_categories: false,
  categories_menu: 'clone02-categories', // phone menu drawer: clone02 categories, not the store's old menu
  menu_alignment: 'center',
  header_bottom_background: '#ffffff',
  header_bottom_text_color: '#000000',
  menu_font_weight: '400',
  menu_font_size: 16,
  mega_width: 'content',
  menu: 'clone02-main-menu',
});

const footer = base('sections/footer-group.json');
const f = footer.sections.footer;
Object.assign(f.settings, {
  style: 'soft',
  logo_color: '#000000',
  newsletter_button_color: '#f59dad',
  newsletter_heading: 'Sign Up For Email',
  newsletter_style: 'row',
  newsletter_text: 'Receive news on the latest deals & see what happenings!',
  newsletter_placeholder: 'Your email address',
  newsletter_button_label: 'Subscribe',
  social_position: 'about',
  payment_image: shopImage('payment'),
  payment_position: 'bottom',
  bottom_menu: '',
  copyright_text: '© 2018 OCCASION. ALL RIGHTS RESERVED.',
});
f.blocks = {
  about: { type: 'about', settings: { text: '<p>Lorem ipsum dolor sit amet, consectetr adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>', link_label: '', logo_width: 160 } },
  col_service: { type: 'link_list', settings: { heading: 'Customer Services', menu: 'customer-services' } },
  col_delivery: { type: 'link_list', settings: { heading: 'Delivery & Returns', menu: 'delivery-returns' } },
  col_cards: { type: 'link_list', settings: { heading: 'Cards & Discounts', menu: 'cards-discounts' } },
  contact: { type: 'contact', settings: { heading: 'Contact Us', address: 'San Luis Potosí, Centro Historico, Potos', phone: '(+0214)0 315 215 - (+0214)0 315 215', email: 'Marketing@occasion.Com', hours: 'Open Time: 8:00AM - 6:00PM' } },
};
f.block_order = Object.keys(f.blocks);
Object.assign(footer.sections.newsletter_popup.settings, {
  layout: 'image_left', image: shopImage('popup-left'), image_2: '', title: 'Join Our Mailing List', subtitle: 'Sign up & get 10% your first order',
  placeholder: 'enter your email address', promise_text: 'We promise to only send you good things', button_label: 'Submit', button_color: '#222222',
});
const sales = footer.sections.sales_popup;
['sheer-mesh-turtleneck-top', 'soft-blue-knit-sweater', 'faux-fur-jacket', 'floral-balloon-sleeve-blouse'].forEach((handle, i) => {
  sales.blocks[sales.block_order[i]].settings.product = handle;
});

const data = base('config/settings_data.json');
Object.assign(data.presets.Default, {
  color_primary: '#000000',
  color_secondary: '#c0dcdd',
  color_accent_dark: '#000000',
  color_accent_ink: '#000000',
  color_price: '#333333', // user request 2026-10-21 (the layout has pink prices)
  color_price_regular: '#333333',
  color_badge_sale: '#fed38e',
  color_heading: '#000000',
  color_text: '#000000',
  color_product_title: '#000000',
  color_footer_bg: '#f6f6f6',
  color_badge_sale_text: '#000000',
  color_badge_new_text: '#428985',
  // Popups (layout hover-Quickview / Button-add): 2px green line under the add-to-cart popup
  // only, colour dots in the quick view
  notify_accent_bar: true,
  notify_bar_color: '#95cc66',
  notify_bar_size: 2,
  notify_bar_quick_view: false,
  quick_view_color_style: 'swatch',
  pagination_radius: 5,
  grid_swatch_size: 13,
  body_font_size: 14,
  card_badge_shape: 'tag',
  card_hover_actions: 'bar',
  // Cards: full-width 271×313 photo boxes
  card_image_shape: 'tall',
  card_image_fit: 'cover',
  card_image_padding: 0,
});
delete data.presets.Default.logo;

// ---------------------------------------------------------------------------
// Homepage (templates/index.json), top to bottom as in the layout
// ---------------------------------------------------------------------------
const TEAL = '#c0dcdd';
const index = base('templates/index.json');
const s = index.sections;
const keep = ['home_hero', 'home_services', 'home_daily_deals', 'home_trending', 'home_new_items', 'home_blog', 'home_brand_logos', 'home_instagram'];
Object.keys(s).filter((k) => !keep.includes(k)).forEach((k) => delete s[k]);
const banner = (key, link) => ({ image: shopImage(key), link });
const heading = { heading_size: 20, heading_accent: TEAL, heading_rule: true };

Object.assign(s.home_hero, blocks('slide', [
  { image: shopImage('hero-1'), link: coll('trending') },
  { image: shopImage('hero-2'), link: coll('new-items') },
  { image: shopImage('hero-3'), link: coll('sale') },
]));
Object.assign(s.home_hero.settings, { desktop_height: 755, controls_style: 'dots' });
Object.assign(s.home_services.settings, { text_color: '#999999', title_color: '#000000', accent_color: '#000000', padding_top: 30 });
Object.assign(s.home_daily_deals, blocks('deal', ORDER['daily-deals'].map((product) => ({ product, use_inventory: false, available: 38, sold: 6 }))));
// Layout countdown: 185 days → a fixed end date instead of the daily reset
Object.assign(s.home_daily_deals.settings, heading, {
  title: 'Daily Deals', card_layout: 'vertical', per_view: '4', show_swatches: true, show_excerpt: false, hurry_label: '', bar_color: '#fed38e',
  countdown_mode: 'date', end_date: '2027-04-23', padding_top: 46,
});
s.home_banner_mosaic = {
  type: 'home-banner-grid',
  ...blocks('banner', [banner('banner-sale-items', coll('sale')), banner('banner-off-50', coll('sale')), banner('banner-off-25', coll('sweaters')), banner('banner-fashion-trends', coll('trending'))]),
  settings: { layout: 'mosaic_left', gap: 15, padding_top: 60, padding_bottom: 0 },
};
Object.assign(s.home_trending.settings, heading, { products_to_show: 8, columns_desktop: 4, show_swatches: true, padding_top: 70, view_all_action: 'load_more', column_gap: 25 });
s.home_banner_sale = {
  type: 'home-banner-grid',
  ...blocks('banner', [banner('banner-sale-50', coll('sale'))]),
  settings: { layout: 'full', full_width: true, gap: 0, padding_top: 80, padding_bottom: 0 },
};
Object.assign(s.home_new_items, blocks('tab', [
  { title: 'All', collection: 'new-items', limit: 8 },
  { title: 'Items', collection: 'items-new', limit: 8 },
  { title: 'Clothes', collection: 'clothes-new', limit: 8 },
  { title: 'Sweaters', collection: 'sweaters', limit: 8 },
  { title: 'Discount', collection: 'sale', limit: 8 },
]));
Object.assign(s.home_new_items.settings, heading, { show_featured: false, show_swatches: true, card_image_shape: 'theme', columns_desktop: 4, padding_top: 70 });
delete s.home_new_items.settings.product;
Object.assign(s.home_blog.settings, heading, { title: 'From Our Blog', card_style: 'simple', articles_to_show: 4, columns_desktop: 4, accent_color: '#999999', padding_top: 70 });
Object.assign(s.home_brand_logos, blocks('logo', [1, 2, 3, 4, 5, 6].map((i) => ({ image: shopImage(`logo-${i}`), link: coll('all'), alt: `Brand ${i}` }))));
Object.assign(s.home_brand_logos.settings, { boxed: true, box_background: '#ffffff', logo_height: 100, gap: 20, padding_top: 70 });
Object.assign(s.home_instagram, blocks('image', [1, 2, 3, 4].map((i) => ({ image: shopImage(`insta-${i}`), link: 'https://instagram.com/' }))));
Object.assign(s.home_instagram.settings, heading, { instagram_handle: '@osscar. oficial', layout: 'grid', show_handle_tile: true, show_follow_link: false, columns_desktop: 4, padding_top: 60, padding_bottom: 100 });
index.order = ['home_hero', 'home_services', 'home_daily_deals', 'home_banner_mosaic', 'home_trending', 'home_banner_sale', 'home_new_items', 'home_blog', 'home_brand_logos', 'home_instagram'];

// ---------------------------------------------------------------------------
// Store content. clone01 files (photos, inner-page banners) come from demos/clone01/images.
// ---------------------------------------------------------------------------
const INNER = ['collection', 'product', 'cart', 'blog', 'article', 'list-collections', 'page.wish-list', 'page.about'];
const innerTemplates = Object.fromEntries(INNER.map((name) => [name, base(`templates/${name}.json`)]));
// Product page: thumbnails in a row under the large image (user request 2026-10-21)
// Blog: collage (newest post across the row, the rest in 3 editorial columns), no sidebar —
// a different look from clone01 (boxed grid + sidebar) and the classic theme (list)
Object.assign(innerTemplates.blog.sections.main.settings, { layout: 'collage', columns_desktop: '3', card_style: 'editorial', sidebar_position: 'none', articles_per_page: 7 });
// Contact page: info cards over a centred form (the classic theme and clone01 use side-by-side)
const contactPage = readJson(path.join(ROOT, 'templates', 'page.contact.json'));
contactPage.sections.form.settings = {
  ...contactPage.sections.form.settings,
  layout: 'cards',
  info_heading: 'Get In Touch',
  info_text: '<p>Questions about an order, sizing or a collaboration? Write to us or drop by the studio — we answer within one business day.</p>',
  heading: 'Send Us A Message',
  form_text: '',
  submit_label: 'Send message',
};
contactPage.sections.form.blocks = {
  address: { type: 'info', settings: { icon: 'address', title: 'Address', text: '<p>San Luis Potosí, Centro Historico, Potos</p>' } },
  phone: { type: 'info', settings: { icon: 'phone', title: 'Phone', text: '<p>(+0214) 0 315 215</p>' } },
  email: { type: 'info', settings: { icon: 'email', title: 'Email', text: '<p>marketing@occasion.com</p>' } },
  hours: { type: 'info', settings: { icon: 'clock', title: 'Opening hours', text: '<p>Mon – Sat: 8:00AM – 6:00PM</p>' } },
};
contactPage.sections.form.block_order = ['address', 'phone', 'email', 'hours'];
Object.assign(innerTemplates.product.sections.main.settings, {
  thumbs_position: 'bottom',
  bundle_products: ['white-boxy-t-shirt', 'pleated-satin-slip-dress', 'soft-blue-knit-sweater'],
});
// Collection page (user request 2026-10-21): 3 columns first, Add to cart / Select options +
// wishlist / compare under every card, image 75% of the card, 2.5rem columns, roomier rows,
// collection image under the breadcrumb, + / − on categories with sub-categories
Object.assign(innerTemplates.collection.sections['product-grid'].settings, {
  sidebar_categories_menu: 'clone02-categories', products_per_page: 18, view_columns: '2_3', default_view: 'grid-3', grid_card_actions: true, grid_button_color: '#f59dad', list_swatch_position: 'after_buttons', card_image_width: 100, grid_column_gap: 3, grid_row_gap: 6,
  collection_image_position: 'top', categories_toggle_icon: 'plus',
});
// Theme-setting images clone02 still takes from clone01 (inner-page banners, about photos…)
const used = JSON.stringify([index, innerTemplates, header, footer, data]);
const inheritedFiles = clone01.files.filter((x) => !images[x.key] && used.includes(`shopify://shop_images/${x.filename}`));

const contentImages = {};
// clone01 images: theme / page images only, no clone01 product photos
Object.keys(clone01.images).filter((k) => !k.startsWith('p-')).forEach((k) => { contentImages[k] = { file: `../clone01/${clone01.images[k].file}` }; });
// Product photos (and the popup photo) live in demos/clone02/images/product
Object.keys(images).forEach((k) => {
  const inProduct = fs.existsSync(path.join(OUT, 'images', 'product', `${k}.jpg`));
  contentImages[k] = { file: inProduct ? `images/product/${k}.jpg` : `images/${k}.jpg` };
});
// Trending: every clone02 product (the layout's 8 first, see ORDER) so "Show more" loads more
P.forEach((p) => { if (!p.collections.includes('trending')) p.collections.push('trending'); });
// Product gallery: detail crops of each photo (images/product/p-<handle>-v2..v4.jpg — upper body,
// lower half, close-up) so the product page has thumbnails
P.forEach((p) => {
  ['v2', 'v3', 'v4'].forEach((v) => {
    const key = `${p.extraImages[0]}-${v}`;
    if (!fs.existsSync(path.join(OUT, 'images', 'product', `${key}.jpg`))) return;
    contentImages[key] = { file: `images/product/${key}.jpg` };
    p.extraImages.push(key);
  });
});
// Collection images: a clone02 product of the collection (the first clone02 product when empty)
collections.forEach((c) => {
  if (homeCollection[c.handle]) return;
  const member = P.find((p) => p.collections.includes(c.handle)) || P[0];
  c.image = member.extraImages[0];
});

const content = {
  ...clone01,
  storeName: 'clone02',
  images: contentImages,
  files: [
    ...inheritedFiles,
    ...Object.keys(images).filter((k) => !k.startsWith('p-')).map((key) => ({ key, filename: `${PREFIX}-${key}.jpg` })),
  ],
  products: [...inherited, ...P],
  collections,
  menus,
  // "From our blog": four posts (May 19, 2018) with the layout's photos
  blog: { ...clone01.blog, articles: clone01.blog.articles.slice(0, 4).map((a, i) => ({ ...a, image: `blog-${i + 1}` })) },
};

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
const write = (rel, obj) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`);
  console.log(`  demos/clone02/${rel}`);
};
write('content.json', content);
write('templates/index.json', index);
INNER.forEach((name) => write(`templates/${name}.json`, innerTemplates[name]));
write('templates/page.contact.json', contactPage);
write('sections/header-group.json', header);
write('sections/footer-group.json', footer);
write('config/settings_data.json', data);
write('images.manifest.json', images);
console.log(`${content.products.length} products (${P.length} new), ${collections.length} collections, ${Object.keys(images).length} new images`);
