#!/usr/bin/env node
/**
 * Writes the per-design guides of the buyer documentation:
 *   documentation/occasion.html, documentation/fashion-1.html, documentation/fashion-2.html
 * Content (style, collections, menus, header, homepage, pages, image sizes) lives in DEMOS below;
 * screenshots are in documentation/images/<slug>/ (taken from the live demos).
 *
 *   node scripts/docs-demo-pages.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'documentation');
const VERSION = require('../package.json').version;
const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');

const DEMOS = [
  {
    file: 'occasion.html',
    img: 'occasion',
    title: 'Occasion — multi-category store',
    short: 'Occasion',
    lead: 'The classic Occasion design rebuilt for Online Store 2.0: a dark header with an orange All Categories sidebar, four mega menu styles, Daily Deals with countdown, product tabs and a busy multi-category homepage.',
    badges: ['Theme file: occasion-theme', 'Poppins', 'Orange #FB9455', 'Classic header with category sidebar'],
    live: 'https://occasion-demo.myshopify.com/',
    cards: [
      ['All Categories sidebar', 'Category list with icons, “See more”, and four mega menu styles (columns, icons, banners, compact).'],
      ['Daily Deals', 'Two deals with stock bar and countdown, then a product carousel.'],
      ['Product tabs', 'Top Rated list next to Hot & New tabs, and New Items with a featured product.'],
      ['Sidebar pages', 'Collection and product pages with categories, filters, top sellers and a banner.'],
    ],
    swatches: [['#FB9455', 'Primary / buttons #FB9455'], ['#BBD8B2', 'Secondary / NEW labels #BBD8B2'], ['#2D2D2D', 'Text #2D2D2D'], ['#33302B', 'Header #33302B'], ['#FFFCFA', 'Footer #FFFCFA']],
    style: [
      ['Fonts', 'Headings and body <strong>Poppins</strong>'],
      ['Colors', 'Primary <code>#FB9455</code>, secondary <code>#BBD8B2</code>, text <code>#2D2D2D</code>, footer <code>#FFFCFA</code>'],
      ['Product cards', '<strong>Occasion</strong> layout: round quick view, cart and compare buttons over the image; round sale and NEW labels top right'],
      ['After adding to cart', 'Confirmation popup (Continue shopping / Go to cart)'],
    ],
    collections: [
      ['Optimum electronics, Furnicom, Camera & photo, Fashion & accessories, Health & beauty, Jewelry, bags & shoes', 'optimum-electronics, furnicom, camera-photo, fashion-accessories, health-beauty, jewelry-bags-shoes', 'Collection sidebar, homepage banners and tabs'],
      ['Women, Man', 'women, man', 'Trending Items, sub-categories of Fashion & accessories'],
      ['Home page', 'frontpage', 'Daily Deals carousel'],
    ],
    menus: [
      ['All Categories (handle <code>main-menu</code>)', 'One item per category (Fashion & Clothing, Computer & Fax, Electronics…), sub-links for the mega menus', 'Navigation → Categories menu'],
      ['Main menu (handle <code>home-menu</code>)', 'Home, Shop, Collection, Blog, Contact Us', 'Navigation → Menu'],
      ['Footer menus', 'Customer Services, Delivery & Returns, Cards & Discounts', 'Footer → Link list blocks'],
    ],
    header: [
      ['Desktop layout', 'Classic (with navigation bar)'],
      ['Top bar', 'Announcement, language and currency pickers (currency list from Settings → Markets), My Account, Checkout, Sign in'],
      ['Navigation', 'All Categories button + Main menu, menu badges <code>Shop|NEW|#bbd8b2|#000000</code> and <code>Blog|HOT|#fb9455|#000000</code>'],
      ['Category icons', 'Files named after each menu item (for example <code>fashion-clothing.png</code>) or Category icon blocks'],
    ],
    megas: [
      ['Fashion & Clothing', 'Mega menu style 3', 'Columns with an icon above each heading, side banner'],
      ['Computer & Fax', 'Mega menu style 4', 'Four columns and a wide bottom banner'],
      ['Electronics / Digital & Electric', 'Mega menu compact', '3 or 2 columns in a narrow panel (600 / 440 px)'],
    ],
    homepage: [
      ['Home hero', 'Slides next to the categories sidebar, square arrows at the sides, two side banners'],
      ['Home services bar', 'Five services with icons'],
      ['Daily deals', 'Two deal products, stock numbers, daily countdown'],
      ['Product grid / carousel', 'Collection Furnicom as a carousel'],
      ['Image banners (×4)', 'Banner grid, wide banner and banner pairs between the product sections'],
      ['Product grid / carousel', '“Trending Items”, collection Women, grid'],
      ['Top rated + tabs', 'Top Rated list and Hot & New tabs'],
      ['New items', 'Featured product with colour dots and thumbnails, collection tabs'],
      ['Home latest news', 'Blog News, overlay cards'],
      ['Home Brand Logos, Home Instagram', 'Six brand logos, six Instagram photos'],
    ],
    pages: [
      ['Collection', 'Sidebar with categories, price slider, colour / size / brand filters, tags, sale products and a banner; grid / list view switcher (3 and 4 columns)'],
      ['Product', 'Left sidebar (categories, top sellers, banner, custom block), thumbnails under the image, tabs for description, reviews and additional information'],
      ['Cart, wishlist, compare', 'Free shipping progress, shipping estimate, coupon; wishlist and compare pages'],
      ['Blog, contact', 'Blog with sidebar and recent posts; contact form with map and store details'],
    ],
    shots: [['home.jpg', 'Occasion homepage'], ['f-mega.jpg', 'Category mega menu'], ['f-deal.jpg', 'Daily Deals'], ['collection.jpg', 'Collection with sidebar'], ['product.jpg', 'Product page with sidebar']],
  },
  {
    file: 'fashion-1.html',
    img: 'fashion1',
    title: 'Home Fashion #1 — fashion store',
    short: 'Home Fashion #1',
    lead: 'A fashion store with a centered logo, text links in the top bar, a green All Categories menu with icons and four mega menus, a deals carousel, list view with Add to cart, and the store translated into five languages.',
    badges: ['Theme file: occasion-fashion-1-theme', 'Poppins 15 px', 'Green #96CC66', 'Centered logo header'],
    live: 'https://occasion-demo-1.myshopify.com/',
    cards: [
      ['Centered logo', 'Hotline left, logo centre, underline search right; top bar with text links and the cart icon.'],
      ['All Categories', 'Icons with dividers, + / − toggles, four mega menus (compact, icon headings, banners).'],
      ['Deals & New Items', 'Daily Deals carousel, Trending Items, New Items tabs.'],
      ['Five languages', 'English, French, German, Spanish and Italian, including product texts.'],
    ],
    swatches: [['#96CC66', 'Primary / buttons #96CC66'], ['#FFBD2E', 'Sale price #FFBD2E'], ['#333333', 'Regular price #333333'], ['#51412C', 'Text #51412C'], ['#1B1B1B', 'Footer #1B1B1B']],
    style: [
      ['Fonts', 'Headings and body <strong>Poppins</strong>; Theme settings → Typography → Body text size <strong>15 px</strong>'],
      ['Colors', 'Primary <code>#96CC66</code>; Price color (sale) <code>#FFBD2E</code>; Regular price color <code>#333333</code>; footer <code>#1B1B1B</code>'],
      ['Product cards', '<strong>Occasion</strong> layout with round labels; Accent line under popups on'],
      ['Collection grid', 'Colour dot size 15 px'],
    ],
    collections: [
      ['Daily Deals, Hot Deals, Trending Items, New Items', 'daily-deals, hot-deals, trending, new-items', 'Homepage sections'],
      ['New Items — Items / Clothes / Accessories, Discount', 'items-new, clothes-new, accessories-new, sale', 'New Items tabs, Sale banners'],
      ['Clothing and its categories', 'clothing, shirts, t-shirts, dresses, jeans, skirts, shorts, sweaters, swimwear', 'Menus, collection sidebar'],
      ['Accessories', 'accessories, sunglasses, hats, jewelry, bags, handbags, belts, shoes', 'Menus, banners'],
    ],
    menus: [
      ['Main menu (Fashion #1)', 'Home, Shop (Clothing, Accessories, Bags & Shoes, Collections, Shopify), Collection, Blog, Contact Us', 'Navigation → Menu'],
      ['All Categories (handle <code>main-menu</code>)', 'Men\'s Clothing, Ladies, Kids & Baby, Health & Beauty, Accessories… with sub-links', 'Navigation → Categories menu'],
      ['Categories (Fashion #1)', 'Shirts, T-Shirts, Dress, Jeans, Skirts… with sub-categories', 'Collection page → Product grid → Categories menu'],
      ['Footer menus', 'Customer Services, Delivery & Returns, Cards & Discounts, Footer bottom', 'Footer'],
    ],
    header: [
      ['Desktop layout', 'Centered logo (hotline, logo, search)'],
      ['Top bar', 'Announcement “Welcome Our Occasion!”, Languages: / Currencies: labels, My Account, Checkout, Sign in or Register, <strong>Top bar wishlist as text</strong> on, currency symbol off'],
      ['Currencies', 'Currency list: <em>Manual list below</em> (USD, EUR, GBP, AUD, CAD, JPY, KRW, SGD, CNY, VND)'],
      ['Navigation', 'List style <strong>Icons with dividers (Occasion 1.x)</strong>, “See more” colour <code>#FB9455</code>, mega menu width <em>Full container</em>'],
    ],
    megas: [
      ['Home', 'Mega menu style 2', 'Three image cards (Home Fashion #1, #2, #3)'],
      ['Men\'s Clothing', 'Mega menu compact', '2 columns, 540 px panel'],
      ['Ladies', 'Mega menu style 3', 'Icon above each heading, headings per column 1,1,1,1,1,1, no banner'],
      ['Kids & Baby', 'Mega menu style 4', 'Four columns, one bottom banner'],
      ['Health & Beauty', 'Mega menu style 3', 'Three headings per row, side banner'],
    ],
    homepage: [
      ['Home hero', 'Full-width slides that follow the image ratio, dots + arrows at the sides'],
      ['Home services bar', 'Five services'],
      ['Daily deals', 'Two deals in a carousel'],
      ['Product grid / carousel', 'Collection Hot Deals as a carousel'],
      ['Image banners', 'Two banner grids, a wide banner, a pair and a seasonal banner'],
      ['Product grid / carousel', '“Trending Items”, collection Trending, Show more'],
      ['New items', 'Tabs: All, Items, Clothes, Accessories, Discount; featured product with thumbnails'],
      ['Home latest news', '“New Our Blog”, boxed cards'],
      ['Home Brand Logos, Home Instagram', 'Six logos; staggered Instagram grid with a Follow us link'],
    ],
    pages: [
      ['Collection', 'Collection banner, sidebar with + / − categories, filters; grid or list view (list: short description, Select options / Add to cart, wishlist, compare; colour dots under the image)'],
      ['Product', 'Product information with bundle “Buy 3 get 20% OFF”, size guide, related products'],
      ['Contact, About, FAQ, Size Guide', 'Pages with templates <code>page.contact</code>, <code>page.about</code>, <code>page.faq</code>'],
      ['Languages', 'Theme texts translated in the theme; store content (menus, products, collections) translated with Shopify Translate & Adapt'],
    ],
    shots: [['home.jpg', 'Home Fashion #1 homepage'], ['f-fashion1-categories.jpg', 'All Categories and a mega menu'], ['f-fashion1-list.jpg', 'Collection list view'], ['collection.jpg', 'Collection page'], ['product.jpg', 'Product page']],
  },
  {
    file: 'fashion-2.html',
    img: 'fashion2',
    title: 'Home Fashion #2 — minimal boutique',
    short: 'Home Fashion #2',
    lead: 'A light, minimal boutique: search, logo and cart on one row, a centred menu with banner mega menus, cards with small tag labels and a dark action bar, a Show more button, a collage blog and a contact page with info cards.',
    badges: ['Theme file: occasion-fashion-2-theme', 'Poppins 14 px', 'Pastels #C0DCDD / #F59DAD', 'Centered logo, no category button'],
    live: 'https://occasion-demo-2.myshopify.com/',
    cards: [
      ['Centered header', 'Search left, logo centre, wishlist and cart right; centred menu without a categories button.'],
      ['Banner mega menus', 'Collection, Shop and New In open link columns with a promo banner.'],
      ['Product cards', 'Small tag labels top left, one dark hover bar with quick view, cart and wishlist.'],
      ['Inner pages', 'Collection with buttons under the cards, collage blog, contact info cards.'],
    ],
    swatches: [['#000000', 'Primary / text #000000'], ['#C0DCDD', 'Secondary #C0DCDD'], ['#F59DAD', 'Collection button #F59DAD'], ['#FED38E', 'Sale label #FED38E'], ['#F6F6F6', 'Footer #F6F6F6']],
    style: [
      ['Fonts', 'Headings and body <strong>Poppins</strong>; Body text size <strong>14 px</strong>'],
      ['Colors', 'Primary <code>#000000</code>, secondary <code>#C0DCDD</code>, prices <code>#333333</code>, sale label <code>#FED38E</code>, footer <code>#F6F6F6</code>'],
      ['Product cards', 'Theme settings → Product cards: NEW / sale label shape <strong>Small tag, top left</strong>; Hover buttons <strong>One dark bar</strong> (<code>#333333</code>); colour dot size 13 px; pagination corner radius 5 px'],
      ['Popups', 'Add-to-cart popup with a 2 px <code>#95CC66</code> line, no line under the quick view; quick view colours as dots'],
    ],
    collections: [
      ['Daily Deals, Trending Items, New Items', 'daily-deals, trending, new-items', 'Homepage sections (Trending holds every product: the first 8 show, Show more loads the rest)'],
      ['New Items — Items / Clothes, Discount', 'items-new, clothes-new, sale', 'New Items tabs, Sale menu'],
      ['Clothing and its categories', 'clothing, shirts, t-shirts, dresses, sweaters', 'Menus, collection sidebar'],
    ],
    menus: [
      ['Main menu (Fashion #2)', 'Home, Collection, Shop (Shop Pages, Product Hovers, Shopify), New In, Sale, Blog, Contact Us', 'Navigation → Menu'],
      ['Categories (Fashion #2)', 'Shirts, T-Shirts, Dress, Sweaters with sub-links', 'Navigation → Categories menu (phone drawer) and Collection page → Categories menu'],
      ['Footer menus', 'Customer Services, Delivery & Returns, Cards & Discounts', 'Footer'],
    ],
    header: [
      ['Desktop layout', 'Centered logo (search, logo, cart)'],
      ['Top bar', 'Help label and phone on the left; My Account, Checkout, Sign in, language on the right'],
      ['Navigation', 'Show categories button <em>off</em>, menu alignment <em>Center</em>, mega menu width <em>Under the menu item, sized to its columns</em>'],
    ],
    megas: [
      ['Home', 'Mega menu style 2', 'Three image cards'],
      ['Collection / Shop / New In', 'Mega menu style 3', 'Link columns and a banner (the main menu shows the banner of the block with the same title)'],
    ],
    homepage: [
      ['Home hero', 'Three full-width slides, dots + arrows at the sides'],
      ['Home services bar', 'Five services'],
      ['Daily deals', 'Card layout <em>Image above the details</em>, four per view, colour dots, progress bar colour'],
      ['Image banners', 'Layout “Wide over two small + tall” (mosaic)'],
      ['Product grid / carousel', '“Trending Items”: 8 products, 4 columns, column gap 25 px, View all button action <em>Load more products</em>'],
      ['Image banners', 'Full-width sale strip'],
      ['New items', 'Tabs All, Items, Clothes, Sweaters, Discount; colour dots'],
      ['Home latest news', '“From Our Blog”, simple cards'],
      ['Home Brand Logos, Home Instagram', 'Logos in a box; Instagram grid with a handle tile'],
    ],
    pages: [
      ['Collection', 'Collection image under the breadcrumb (full container width), + / − categories, view switcher <em>2 and 3 columns</em> (first view 3), 18 products per page, cart button with wishlist and compare under every card (<code>#F59DAD</code>), column gap 3 rem, row gap 6 rem; list view with colour dots under the buttons'],
      ['Product', 'Thumbnails in a row under the large image, bundle, size guide'],
      ['Blog', 'Layout <em>Collage</em>, Editorial cards, no sidebar'],
      ['Contact', 'Layout <em>Info cards over a centred form</em>: four info blocks (address, phone, email, opening hours)'],
      ['Newsletter popup', 'Layout <em>Photo left, close button outside</em>'],
    ],
    shots: [['home.jpg', 'Home Fashion #2 homepage'], ['f-fashion2-mega.jpg', 'Shop mega menu with a banner'], ['f-fashion2-cards.jpg', 'Cards with the dark hover bar'], ['f-fashion2-quickview.jpg', 'Quick view'], ['f-fashion2-newsletter.jpg', 'Newsletter popup'], ['collection.jpg', 'Collection page'], ['blog.jpg', 'Collage blog'], ['contact.jpg', 'Contact page']],
  },
];

const IMAGE_SIZES = [
  ['Products', '1334 × 2000 (portrait 2 : 3) or larger', 'Light, even background'],
  ['Hero slides', '2400 × 1000 (full width) / 1500 × 790 (next to the categories)', 'Wide'],
  ['Image banners', '1200 × 700 (half), 2400 × 600 (wide strip)', 'Landscape'],
  ['Collection banner / image', '2400 × 700', 'Wide'],
  ['Mega menu banners', '900 × 600 (side) / 1100 × 300 (bottom)', 'Landscape'],
  ['Blog featured images', '1200 × 900', 'Landscape 4 : 3'],
  ['Newsletter popup photo', '700 × 1000', 'Portrait'],
  ['Brand logos, Instagram', '400 × 200 / 800 × 800', 'Wide / square'],
];

const table = (head, rows) => `<table>
          <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>
${rows.map((r) => `            <tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n')}
          </tbody>
        </table>`;
const fig = (d, [file, cap]) => `<figure><img src="images/${d.img}/${file}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`;

for (const d of DEMOS) {
  const id = d.file.replace('.html', '');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(d.short)} — Occasion theme package</title>
  <meta name="description" content="${esc(d.short)}: rebuild the demo store — style, collections, menus, header, homepage sections, pages and image sizes.">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/docs.css">
</head>
<body>
  <button class="menu-toggle" type="button" aria-controls="sidebar" aria-expanded="false">☰ Contents</button>
  <aside class="sidebar" id="sidebar"></aside>

  <main data-theme="${id}">
    <div class="content">
      <header class="hero">
        <h1>${esc(d.title)}</h1>
        <p>${esc(d.lead)}</p>
        <div class="badges">${d.badges.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}</div>
      </header>

      <section class="doc" id="${id}-overview">
        <h2>Overview</h2>
        <figure><img src="images/${d.img}/home.jpg" alt="${esc(d.short)} homepage" loading="lazy"><figcaption>${esc(d.short)} · <a href="${d.live}" target="_blank" rel="noopener">live demo</a> · <a href="images/${d.img}/home-full.jpg" target="_blank" rel="noopener">full homepage</a></figcaption></figure>
        <p>Install <code>${d.badges[0].replace('Theme file: ', '')}-v${VERSION}.zip</code> (<a href="getting-started.html#install">how</a>). Every setting below is already in that file: create the content in the Shopify admin, upload your images and pick them in the theme editor. Shared steps (products, variants, swatches, metafields) are in <a href="store-setup.html">Step 1 · Shopify admin</a>.</p>
        <div class="grid">
${d.cards.map(([h, p]) => `          <div class="card"><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`).join('\n')}
        </div>
      </section>

      <section class="doc" id="${id}-style">
        <h2>Style</h2>
        <p>Set in <span class="path">Theme settings</span>. Change them to match your brand; everything else follows.</p>
        <div class="swatches">
${d.swatches.map(([c, l]) => `          <span class="swatch"><i style="background:${c}"></i>${esc(l)}</span>`).join('\n')}
        </div>
        ${table(['Setting', `${esc(d.short)} value`], d.style)}
      </section>

      <section class="doc" id="${id}-roadmap">
        <h2>Build the store: roadmap</h2>
        ${table(['#', 'Where', 'What to do', 'Guide'], [
          ['1', 'Admin', 'Store settings, metafields, products with Color / Size variants', '<a href="store-setup.html">Step 1</a>'],
          ['2', 'Admin', 'Create the collections below', `<a href="#${id}-collections">Collections</a>`],
          ['3', 'Admin', 'Create the menus below', `<a href="#${id}-menus">Menus</a>`],
          ['4', 'Admin', 'Pages (Contact, About, FAQ, Size Guide, Wish list, Compare) and the News blog', `<a href="#${id}-pages">Pages</a>`],
          ['5', 'Admin', 'Automatic discount “Buy 3 get 20% OFF” for the bundle', '<a href="store-setup.html#discounts">Discounts</a>'],
          ['6', 'Editor', 'Header, navigation and mega menu blocks', `<a href="#${id}-header">Header</a>`],
          ['7', 'Editor', 'Homepage: images, texts and collections of each section', `<a href="#${id}-homepage">Homepage</a>`],
          ['8', 'Editor', 'Collection, product, blog and contact pages', `<a href="#${id}-pages">Pages</a>`],
        ])}
      </section>

      <section class="doc" id="${id}-collections">
        <h2>Collections</h2>
        <p>Create these collections (<a href="store-setup.html#collections">how</a>). The handle matters: theme settings and menus link to it.</p>
        ${table(['Title', 'Handle', 'Used by'], d.collections.map(([a, b, c]) => [a, b.split(', ').map((h) => `<code>${h}</code>`).join(', '), c]))}
      </section>

      <section class="doc" id="${id}-menus">
        <h2>Menus</h2>
        <p>Create them in <span class="path">Online Store → Navigation</span> (<a href="store-setup.html#menus">how</a>), then pick them where shown.</p>
        ${table(['Menu', 'Items', 'Selected in'], d.menus)}
      </section>

      <section class="doc" id="${id}-header">
        <h2>Header</h2>
        ${table(['Setting', `${esc(d.short)} value`], d.header)}
        <h3>Mega menu blocks</h3>
        <p>In <span class="path">Navigation</span>, add one block per menu item. <em>Category menu title</em> must match the menu item's title.</p>
        ${table(['Menu item', 'Block', 'Content'], d.megas)}
      </section>

      <section class="doc" id="${id}-homepage">
        <h2>Homepage</h2>
        <p>Sections from top to bottom. Open each one in the editor and replace images, texts and collections.</p>
        ${table(['#', 'Section (editor name)', 'What to set'], d.homepage.map((r, i) => [String(i + 1), ...r]))}
      </section>

      <section class="doc" id="${id}-pages">
        <h2>Pages</h2>
        ${table(['Page', `${esc(d.short)} setup`], d.pages)}
        <div class="figs-2">
${d.shots.slice(1).map((s) => `          ${fig(d, s)}`).join('\n')}
        </div>
        <div class="figs-2">
          ${fig(d, ['m-home.jpg', 'Homepage on a phone'])}
          ${fig(d, ['m-product.jpg', 'Product page on a phone'])}
        </div>
      </section>

      <section class="doc" id="${id}-images">
        <h2>Image sizes</h2>
        <p>About twice the displayed size so images stay sharp on retina screens. Set the focal point after picking an image.</p>
        ${table(['Where', 'Recommended size (px)', 'Shape'], IMAGE_SIZES)}
      </section>

      <nav class="pager" id="pager" aria-label="Previous and next page"></nav>
      <footer class="doc-footer">
        Occasion theme package · v${VERSION} · Questions? See <a href="help.html#support">Support</a>.
      </footer>
    </div>
  </main>
  <script src="assets/docs.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, d.file), html);
  console.log('✔ documentation/' + d.file);
}
