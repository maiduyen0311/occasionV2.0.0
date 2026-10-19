#!/usr/bin/env node
/**
 * Demo "clone01" (Home Fashion #1 — design/clone01/01_Layout/01_Homepage.psd).
 * Single source for everything the demo needs; writes into demos/clone01/:
 *
 *   content.json                  store content for scripts/demo-import.js
 *   templates/*.json              homepage + inner pages (main templates with this store's images / tags)
 *   sections/header-group.json    header + navigation
 *   sections/footer-group.json    footer + popups
 *   config/settings_data.json     theme settings (colors, fonts, cards)
 *   images.manifest.json          input of scripts/demo/clone01-images.ps1
 *
 *   node scripts/demo/clone01.js
 *   powershell -File scripts/demo/clone01-images.ps1     (needs design/clone01, local only)
 *   npm run demo:import -- clone01 --store occasion-demo-3.myshopify.com
 *   npm run deploy:demo -- clone01 --store occasion-demo-3.myshopify.com --live
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'demos', 'clone01');
const STORE = 'Occasion';
const PREFIX = 'oc1'; // file names in the store's Files: oc1-<key>.jpg

// ---------------------------------------------------------------------------
// Images: key → source in design/clone01 (crop = [x, y, w, h] on the layout jpg)
// ---------------------------------------------------------------------------
const LAYOUT = '01_Layout/01_Homepage_Home.jpg';
const images = {};
const src = (key, file, opts = {}) => { images[key] = { src: `02_Image/${file}`, max: 1000, ...opts }; return key; };
const crop = (key, rect, opts = {}) => { images[key] = { src: LAYOUT, crop: rect, ...opts }; return key; };

// Hero slides (text is part of the artwork)
src('hero-1', 'BANNER_02.jpg', { max: 1820 });
src('hero-2', 'BANNER_01.jpg', { max: 1820 });
src('hero-3', 'BANNER_03.jpg', { max: 1820 });
// Banners, cropped 1:1 from the PSD render
crop('banner-sale-items', [319, 1661, 782, 354]);
crop('banner-woman-skirt', [1119, 1661, 382, 354]);
crop('banner-bags', [320, 2031, 382, 354]);
crop('banner-accessories', [719, 2031, 782, 354]);
crop('banner-new-arrivals', [319, 3330, 1183, 229]);
crop('banner-fashion', [319, 4375, 783, 451]);
crop('banner-sale-30', [1119, 4375, 383, 451]);
crop('banner-new-season', [319, 4843, 1183, 229]);
// Brand logos (on the #f9f9f9 strip) and footer payment icons
crop('brand-1', [342, 5719, 156, 96]);
crop('brand-2', [523, 5719, 141, 96]);
crop('brand-3', [688, 5719, 181, 96]);
crop('brand-4', [899, 5719, 185, 96]);
crop('brand-5', [1112, 5719, 166, 96]);
crop('brand-6', [1306, 5719, 167, 96]);
crop('payment', [1212, 6788, 292, 33]);
crop('logo', [812, 52, 201, 46]);
// "Home" mega menu: the three homepage thumbnails
crop('menu-home-1', [584, 206, 212, 179]);
crop('menu-home-2', [826, 206, 212, 179]);
crop('menu-home-3', [1069, 206, 212, 179]);
// Instagram + blog
src('insta-1', 'Layer-70628.jpg');
src('insta-2', '30664541f34029093debdcef57dd9628 (1).jpg');
src('insta-3', 'Layer-70630.jpg');
src('insta-4', 'Layer-70629.jpg');
src('blog-1', '9591330481_2_3_2.jpg');
src('blog-2', 'Layer-70637.jpg');
src('blog-3', 'Layer-70692.jpg');
src('blog-4', 'Layer-70702.jpg');
src('blog-5', 'Layer-70714.jpg');
src('blog-6', '2cfbceded04e142e516de18136c069ee.jpg');
// About page photos (large originals; the Instagram tiles are too small at half page width)
src('about-hero', 'image-woman-985783922-LOOKBOOK WEB 007.jpg', { max: 1200 });
src('about-split', '145611_dt1.jpg', { max: 1200 });
// Inner-page banners drawn by scripts/demo/clone01-banners.js (no source to crop)
const drawn = (key) => { images[key] = { drawn: 'clone01-banners.js' }; return key; };
drawn('banner-collection');
drawn('banner-sidebar-shop');
drawn('banner-sidebar-blog');
// Newsletter popup
// Popup corner photos: the visible (box-clipped) parts of PSD layers 7062 / 7061
// Quick view payment strip (light background), 1:1 from the Quickview state
crop('payment-light', [905, 908, 334, 26], { src: '01_Layout/01_Homepage_Quickview.jpg' });
crop('popup-left', [619, 476, 99, 165], { src: '01_Layout/01_Homepage_Popup-Newletters.jpg' });
crop('popup-right', [1109, 460, 94, 181], { src: '01_Layout/01_Homepage_Popup-Newletters.jpg' });

// ---------------------------------------------------------------------------
// Products. img: list of 02_Image files (first = featured image).
// ---------------------------------------------------------------------------
const SIZES = ['S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40'];
const lorem = '<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>';

const P = [];
function product(handle, title, type, price, compare, img, opts = {}) {
  const keys = img.map((file, i) => src(`p-${handle}${i ? `-${i + 1}` : ''}`, file));
  const sizes = opts.sizes !== undefined ? opts.sizes : (['Tops', 'Sweaters', 'Skirts', 'Shorts', 'Trousers', 'Swimwear', 'Dresses'].includes(type) ? SIZES : type === 'Shoes' ? SHOE_SIZES : []);
  P.push({
    handle,
    title,
    body: opts.body || lorem,
    vendor: STORE,
    type,
    price,
    compare: compare || undefined,
    extraImages: keys,
    sizes,
    collections: opts.collections || [],
    tags: opts.isNew ? ['new'] : [],
    sold: opts.sold,
    rating: opts.rating || [4 + ((P.length * 7) % 10) / 10, 3 + ((P.length * 5) % 20)],
  });
}

// Homepage — Daily deals
product('rainbow-stripe-crop-t-shirt', 'Rainbow stripe crop T-shirt', 'Tops', 220, 265, ['Layer-01.jpg', 'Layer-06.png'], { collections: ['daily-deals', 'trending', 'clothing', 't-shirts', 'sale'], sold: 6 });
product('red-bow-bardot-top', 'Red bow bardot top', 'Tops', 188, 345, ['Layer-0.jpg', '9238375600_2_6_2.jpg', '9238375600_2_3_1.jpg'], { collections: ['daily-deals', 'clothing', 'shirts', 'sale'], isNew: true, sold: 5 });
// Homepage — deals carousel
product('green-knit-sweater', 'Green knit sweater', 'Sweaters', 51, 58, ['Layer-70691.jpg'], { collections: ['hot-deals', 'clothing', 'sweaters', 'sale'] });
product('pink-pompom-scarf', 'Pink pompom scarf', 'Accessories', 23, 0, ['Layer-70688.jpg'], { collections: ['hot-deals', 'accessories'], isNew: true });
product('colour-block-hoodie', 'Colour block hoodie', 'Sweaters', 67, 0, ['Layer-70690.jpg'], { collections: ['hot-deals', 'clothing', 'sweaters'], isNew: true });
product('fringed-block-heel-sandals', 'Fringed block heel sandals', 'Shoes', 91, 103, ['Layer-02.jpg', '1626311088_2_5_2.jpg', '1626311088_2_6_2.jpg'], { collections: ['hot-deals', 'shoes', 'sale'] });
product('gold-chain-link-earrings', 'Gold chain link earrings', 'Jewelry', 66, 0, ['Layer-70689.jpg'], { collections: ['hot-deals', 'accessories', 'jewelry'], isNew: true });
product('round-mirrored-sunglasses', 'Round mirrored sunglasses', 'Sunglasses', 39, 45, ['9896301400_2_2_2.jpg', '9896301400_2_4_2.jpg'], { collections: ['hot-deals', 'accessories', 'sunglasses', 'sale'] });
product('pompom-knit-beanie', 'Pompom knit beanie', 'Hats', 29, 0, ['9833315401_2_4_2.jpg', '9833315401_2_3_2.jpg'], { collections: ['hot-deals', 'accessories', 'hats'], isNew: true });
// Homepage — Trending items
product('ankle-strap-platform-sandals', 'Ankle strap platform sandals', 'Shoes', 145, 165, ['Layer-05.png', '1619311098_2_1_2.jpg', '1619311098_2_2_2.jpg', '1619311098_2_3_2.jpg'], { collections: ['trending', 'shoes', 'sale'], isNew: true });
product('mustard-silk-scarf', 'Mustard silk scarf', 'Accessories', 145, 165, ['Layer-011.png', '9844305305_2_4_2.jpg', '9844305305_2_3_2.jpg'], { collections: ['trending', 'accessories', 'new-items', 'accessories-new'], isNew: true });
product('ruffled-wrap-blouse', 'Ruffled wrap blouse', 'Tops', 145, 165, ['Layer-07.png', '9241300658_2_3_1.jpg', '9241300658_2_6_2.jpg'], { collections: ['trending', 'clothing', 'shirts', 'sale'] });
product('tropical-print-bikini-bottoms', 'Tropical print bikini bottoms', 'Swimwear', 145, 165, ['Layer-08.png', 'Floral print bikini bottoms.jpg'], { collections: ['trending', 'clothing', 'swimwear'], isNew: true, sizes: ['S', 'M', 'L'] });
product('button-front-mini-skirt', 'Button front mini skirt', 'Skirts', 145, 165, ['Layer-09.png', '9398318800_2_1_2.jpg', '9398318800_2_6_2.jpg'], { collections: ['trending', 'clothing', 'skirts'], isNew: true });
product('floral-tie-front-crop-top', 'Floral tie-front crop top', 'Tops', 145, 165, ['Layer-1.png', '9241302687_2_1_2.jpg', '9241302687_2_3_2.jpg'], { collections: ['trending', 'clothing', 'shirts', 'sale'] });
product('ribbed-washed-beanie', 'Ribbed washed beanie', 'Hats', 145, 165, ['Layer-010.png', '9833522015_2_1_2.jpg', '9833522015_2_2_2.jpg'], { collections: ['trending', 'accessories', 'hats'], isNew: true });
product('yellow-faux-leather-belt-bag', 'Yellow faux leather belt bag', 'Bags', 145, 165, ['Layer-70658.png', '6255314124_4_1_2.jpg'], { collections: ['trending', 'bags', 'handbags', 'sale'] });
product('metal-frame-round-sunglasses', 'Metal frame round sunglasses', 'Sunglasses', 145, 165, ['Layer-012.png', '9896373910_2_1_2.jpg', '9896373910_2_2_2.jpg'], { collections: ['trending', 'accessories', 'sunglasses'], isNew: true });
// Homepage — New items (featured + tabs)
product('bell-sleeve-crochet-top', 'Bell sleeve crochet top', 'Tops', 890, 0, ['Layer-70718.jpg', 'Layer-707897.png', 'Layer-707875.jpg', 'Layer-707873.png'], { collections: ['new-items', 'clothing', 'shirts', 'clothes-new'], isNew: true });
product('tropical-print-tie-shirt', 'Tropical print tie shirt', 'Tops', 123, 128, ['Layer-70717.jpg', '9241306916_2_2_2.jpg'], { collections: ['new-items', 'clothing', 'shirts', 'clothes-new', 'sale'] });
product('woven-tote-bag', 'Woven tote bag', 'Bags', 154, 200, ['Layer-70725.jpg'], { collections: ['new-items', 'bags', 'handbags', 'accessories-new', 'sale'] });
product('denim-cami-crop-top', 'Denim cami crop top', 'Tops', 196, 0, ['Layer-70724.jpg'], { collections: ['new-items', 'clothing', 't-shirts', 'clothes-new'], isNew: true });
product('olive-pointed-stilettos', 'Olive pointed stilettos', 'Shoes', 423, 600, ['Layer-70726.jpg'], { collections: ['new-items', 'shoes', 'items-new', 'sale'] });
product('enamel-triangle-earrings', 'Enamel triangle earrings', 'Jewelry', 188, 0, ['Layer-70728.jpg'], { collections: ['new-items', 'accessories', 'jewelry', 'accessories-new', 'items-new'], isNew: true });
product('yellow-short-sleeve-shirt', 'Yellow short sleeve shirt', 'Tops', 666, 733, ['Layer-70723.jpg', 'Layer-70702.jpg'], { collections: ['new-items', 'clothing', 'shirts', 'items-new', 'sale'] });
// Catalogue (collection pages, search)
product('hug-me-tender-t-shirt', '"Hug me tender" T-shirt', 'Tops', 25, 0, ['9231333300_2_6_2.jpg', '9231333300_2_1_1.jpg', '9231333300_2_2_1.jpg', '9231333300_2_5_1.jpg'], { collections: ['clothing', 't-shirts'] });
product('mustard-striped-top', 'Mustard striped top', 'Tops', 29, 35, ['9238365305_2_5_2.jpg', '9238365305_2_1_2.jpg'], { collections: ['clothing', 't-shirts', 'sale'] });
product('sporty-stripe-crop-top', 'Sporty stripe crop top', 'Tops', 19, 0, ['9238384430_2_3_2.jpg', '9238384430_2_5_2.jpg', '9238384430_2_1_1.jpg'], { collections: ['clothing', 't-shirts'] });
product('mustard-tie-front-bodysuit', 'Mustard tie-front bodysuit', 'Tops', 25, 0, ['9241313305_2_6_2.jpg', '9241313305_2_2_2.jpg'], { collections: ['clothing', 'shirts'] });
product('yellow-tube-mini-skirt', 'Yellow tube mini skirt', 'Skirts', 22, 0, ['9398342305_2_6_2.jpg', '9398342305_2_1_1.jpg', '9398342305_2_5_1.jpg'], { collections: ['clothing', 'skirts'] });
product('mustard-buttoned-mini-skirt', 'Mustard buttoned mini skirt', 'Skirts', 26, 0, ['9398344305_2_1_2.jpg', '9398344305_2_1_1.jpg'], { collections: ['clothing', 'skirts'] });
product('pink-knit-mini-skirt', 'Pink knit mini skirt', 'Skirts', 23, 0, ['9398345620_2_6_2.jpg', '9398345620_2_1_2.jpg', '9398345620_2_5_2.jpg'], { collections: ['clothing', 'skirts'] });
product('buttoned-denim-midi-skirt', 'Buttoned denim midi skirt', 'Skirts', 36, 42, ['9398350420_2_6_2.jpg', '9398350420_2_1_1.jpg'], { collections: ['clothing', 'skirts', 'jeans', 'sale'] });
product('checked-flannel-shirt', 'Checked flannel shirt', 'Tops', 32, 0, ['9473316716_2_6_2.jpg', '9473316716_2_5_2.jpg'], { collections: ['clothing', 'shirts'] });
product('rust-cable-knit-sweater', 'Rust cable knit sweater', 'Sweaters', 39, 0, ['9559361658_2_6_2.jpg', '9559361658_2_5_2.jpg'], { collections: ['clothing', 'sweaters'] });
product('block-stripe-sweater', 'Block stripe sweater', 'Sweaters', 39, 49, ['9559366681_2_6_2.jpg', '9559366681_2_5_2.jpg'], { collections: ['clothing', 'sweaters', 'sale'] });
product('cream-chunky-knit-sweater', 'Cream chunky knit sweater', 'Sweaters', 45, 0, ['9559370712_2_6_2.jpg', '9559370712_2_1_1.jpg'], { collections: ['clothing', 'sweaters'] });
product('danville-varsity-sweatshirt', 'Danville varsity sweatshirt', 'Sweaters', 29, 0, ['9591330481_2_3_2 (1).jpg'], { collections: ['clothing', 'sweaters'] });
product('yellow-corduroy-trousers', 'Yellow corduroy trousers', 'Trousers', 35, 0, ['9680328300_2_6_2.jpg', '9680328300_2_4_2.jpg', '9680328300_2_3_2.jpg'], { collections: ['clothing', 'jeans'] });
product('pineapple-print-denim-shorts', 'Pineapple print denim shorts', 'Shorts', 25, 0, ['9697300407_2_3_2.jpg', '9697300407_2_1_2.jpg'], { collections: ['clothing', 'shorts', 'jeans'] });
product('ripped-denim-mini-skirt', 'Ripped denim mini skirt', 'Skirts', 26, 32, ['5397306427_2_6_2.jpg', '5397306427_2_2_1.jpg', '5397306427_2_3_2.jpg'], { collections: ['clothing', 'skirts', 'jeans', 'sale'] });
product('rainbow-stripe-sweatshirt', 'Rainbow stripe sweatshirt', 'Sweaters', 32, 0, ['5590312824_2_6_2.jpg', '5590312824_2_5_2.jpg'], { collections: ['clothing', 'sweaters'] });
product('pink-faux-leather-backpack', 'Pink faux leather backpack', 'Bags', 49, 0, ['6015314098_2_2_2.jpg', '6015314098_2_4_2.jpg'], { collections: ['bags', 'handbags'] });
product('quilted-belt-bag', 'Quilted belt bag', 'Bags', 26, 0, ['6239314098_2_4_2.jpg', '6239314098_2_2_2.jpg'], { collections: ['bags', 'belts'] });
product('chunky-sole-trainers', 'Chunky sole trainers', 'Shoes', 46, 0, ['5331311202_2_5_2.jpg', '5331311202_2_2_2.jpg'], { collections: ['shoes'] });
product('track-sole-lace-up-shoes', 'Track sole lace-up shoes', 'Shoes', 49, 0, ['5405311040_2_2_2.jpg', '5405311040_2_5_2.jpg'], { collections: ['shoes'] });
product('basic-coloured-shorts', 'Basic coloured shorts', 'Shorts', 15, 0, ['Basic coloured shorts.jpg'], { collections: ['clothing', 'shorts'] });
product('bermuda-shorts-with-an-elastic-waistband', 'Bermuda shorts with an elastic waistband', 'Shorts', 19, 0, ['Bermuda shorts with an elastic waistband.jpg'], { collections: ['clothing', 'shorts'] });
product('blue-varsity-sweatshirt-with-embroidery', 'Blue varsity sweatshirt with embroidery', 'Sweaters', 29, 0, ['Blue varsity sweatshirt with embroidery.jpg'], { collections: ['clothing', 'sweaters'] });
product('cap-with-embroidered-donuts', 'Cap with embroidered donuts', 'Hats', 15, 0, ['Cap with embroidered donuts.jpg'], { collections: ['accessories', 'hats'] });
product('cropped-t-shirt-with-text', 'Cropped T-shirt with text', 'Tops', 13, 0, ['Cropped T-shirt with text.jpg'], { collections: ['clothing', 't-shirts'] });
product('fashion-trainers', 'Fashion trainers', 'Shoes', 36, 0, ['Fashion trainers.jpg'], { collections: ['shoes'] });
product('mustard-yellow-faux-leather-mini-skirt', 'Mustard yellow faux leather mini skirt', 'Skirts', 23, 0, ['Mustard yellow faux leather mini skirt.jpg'], { collections: ['clothing', 'skirts'] });
product('nautical-stripe-sweatshirt', 'Nautical stripe sweatshirt', 'Sweaters', 26, 0, ['Nautical stripe sweatshirt.jpg'], { collections: ['clothing', 'sweaters'] });
product('oversized-chenille-sweater', 'Oversized chenille sweater', 'Sweaters', 32, 0, ['Oversized chenille sweater.jpg'], { collections: ['clothing', 'sweaters'] });
product('oversized-striped-sweatshirt', 'Oversized striped sweatshirt', 'Sweaters', 26, 0, ['Oversized striped sweatshirt.jpg'], { collections: ['clothing', 'sweaters'] });
product('pacific-republic-hooded-sweatshirt', 'Pacific Republic hooded sweatshirt', 'Sweaters', 32, 0, ['Pacific Republic hooded sweatshirt.jpg'], { collections: ['clothing', 'sweaters'] });
product('paradise-multicoloured-striped-top', 'Paradise multicoloured striped top', 'Tops', 19, 0, ['Paradise multicoloured striped top.jpg'], { collections: ['clothing', 'shirts'] });
product('pine-trees-and-stripes-t-shirt', 'Pine trees and stripes T-shirt', 'Tops', 13, 0, ['Pine trees and stripes T-shirt.jpg'], { collections: ['clothing', 't-shirts'] });
product('rustic-jumpsuit-with-knots', 'Rustic jumpsuit with knots', 'Dresses', 29, 0, ['Rustic jumpsuit with knots.jpg'], { collections: ['clothing', 'dresses'] });
product('strappy-top-with-central-panel', 'Strappy top with central panel', 'Tops', 13, 0, ['Strappy top with central panel.jpg'], { collections: ['clothing', 't-shirts'] });
product('stretch-corduroy-trousers', 'Stretch corduroy trousers', 'Trousers', 29, 0, ['Stretch corduroy trousers.jpg'], { collections: ['clothing', 'jeans'] });
product('striped-swimsuit-with-one-strap', 'Striped swimsuit with one strap', 'Swimwear', 25, 0, ['Striped swimsuit with one strap.jpg'], { collections: ['clothing', 'swimwear'] });
product('three-tone-striped-t-shirt', 'Three-tone striped T-shirt', 'Tops', 13, 0, ['Three-tone striped T-shirt.jpg'], { collections: ['clothing', 't-shirts'] });
product('tropical-print-shorts', 'Tropical print shorts', 'Shorts', 19, 0, ['Tropical print shorts.jpg', '9696306739_2_4_2.jpg'], { collections: ['clothing', 'shorts'] });
product('varsity-t-shirt-with-panelled-sleeves', 'Varsity T-shirt with panelled sleeves', 'Tops', 15, 0, ['Varsity T-shirt with panelled sleeves.jpg'], { collections: ['clothing', 't-shirts'] });
product('wandler-hortensia-bag', 'Wandler Hortensia bag', 'Bags', 129, 0, ['Wandler.jpg', 'h3-list-img-10.jpg'], { collections: ['bags', 'handbags'] });
product('white-lace-up-trainers', 'White lace-up trainers', 'Shoes', 29, 0, ['White lace-up trainers.jpg'], { collections: ['shoes'] });
product('white-platform-trainers', 'White platform trainers', 'Shoes', 32, 0, ['White platform trainers.jpg', '5322311001_2_3_2.jpg'], { collections: ['shoes'] });

// Collection sidebar filters (tag based, like the old demo): one Color option per product
// (card dots + PDP swatch), plus colour / size / brand tags. Brands = the logo strip.
const BRANDS = ['Sunshine', 'MS Studio', 'Art Studio', 'Pure', 'Handcrafted', 'Handmade'];
const COLORS = {
  Black: ['tropical-print-bikini-bottoms', 'button-front-mini-skirt', 'track-sole-lace-up-shoes', 'stretch-corduroy-trousers'],
  White: ['bell-sleeve-crochet-top', 'chunky-sole-trainers', 'basic-coloured-shorts', 'fashion-trainers', 'nautical-stripe-sweatshirt', 'oversized-striped-sweatshirt',
    'paradise-multicoloured-striped-top', 'striped-swimsuit-with-one-strap', 'tropical-print-shorts', 'white-lace-up-trainers', 'white-platform-trainers'],
  Beige: ['ankle-strap-platform-sandals', 'cream-chunky-knit-sweater', 'quilted-belt-bag', 'cropped-t-shirt-with-text'],
  Red: ['red-bow-bardot-top', 'checked-flannel-shirt', 'rust-cable-knit-sweater', 'bermuda-shorts-with-an-elastic-waistband', 'oversized-chenille-sweater'],
  Pink: ['pink-pompom-scarf', 'pompom-knit-beanie', 'ruffled-wrap-blouse', 'floral-tie-front-crop-top', 'pink-knit-mini-skirt', 'pink-faux-leather-backpack', 'pacific-republic-hooded-sweatshirt'],
  Orange: ['mustard-silk-scarf', 'enamel-triangle-earrings'],
  Yellow: ['colour-block-hoodie', 'yellow-faux-leather-belt-bag', 'yellow-short-sleeve-shirt', 'hug-me-tender-t-shirt', 'mustard-striped-top', 'mustard-tie-front-bodysuit',
    'yellow-tube-mini-skirt', 'mustard-buttoned-mini-skirt', 'yellow-corduroy-trousers', 'mustard-yellow-faux-leather-mini-skirt'],
  Green: ['green-knit-sweater', 'tropical-print-tie-shirt', 'olive-pointed-stilettos', 'rustic-jumpsuit-with-knots', 'wandler-hortensia-bag'],
  Blue: ['rainbow-stripe-crop-t-shirt', 'round-mirrored-sunglasses', 'ribbed-washed-beanie', 'denim-cami-crop-top', 'buttoned-denim-midi-skirt', 'pineapple-print-denim-shorts',
    'ripped-denim-mini-skirt', 'cap-with-embroidered-donuts', 'pine-trees-and-stripes-t-shirt'],
  Navy: ['sporty-stripe-crop-top', 'danville-varsity-sweatshirt', 'blue-varsity-sweatshirt-with-embroidery', 'strappy-top-with-central-panel'],
  Gray: ['fringed-block-heel-sandals', 'rainbow-stripe-sweatshirt', 'three-tone-striped-t-shirt', 'varsity-t-shirt-with-panelled-sleeves'],
  Brown: ['metal-frame-round-sunglasses', 'woven-tote-bag', 'block-stripe-sweater'],
  Gold: ['gold-chain-link-earrings'],
};
const colorOf = Object.fromEntries(Object.entries(COLORS).flatMap(([c, list]) => list.map((h) => [h, c])));
// Every product gets 3 colour variants (× its sizes): the real colour first, then two
// alternates. Each colour shows one of the product's photos when there are enough.
const ALT_COLORS = ['Black', 'White', 'Beige', 'Pink', 'Blue', 'Green', 'Red', 'Navy', 'Gray', 'Yellow'];
P.forEach((p, i) => {
  const color = colorOf[p.handle];
  if (!color) throw new Error(`No colour for ${p.handle}`);
  const alts = ALT_COLORS.filter((c) => c !== color);
  const names = [color, alts[(i * 3) % alts.length], alts[(i * 3 + 4) % alts.length]];
  p.colors = names.map((name, k) => ({ name, image: p.extraImages[k % p.extraImages.length] }));
  p.tags.push(...names, BRANDS[i % BRANDS.length], ...p.sizes.filter((s) => SIZES.includes(s)));
});

// ---------------------------------------------------------------------------
// Collections, pages, blog, menus
// ---------------------------------------------------------------------------
const C = (handle, title, image, order) => ({ handle, title, description: `${title} — Occasion Fashion collection.`, image, ...(order ? { order } : {}) });
const collections = [
  C('daily-deals', 'Daily Deals', 'p-red-bow-bardot-top'),
  C('hot-deals', 'Hot Deals', 'p-green-knit-sweater'),
  // PSD order: the striped tee (also a daily deal) is the 2nd trending item
  C('trending', 'Trending Items', 'p-ankle-strap-platform-sandals', ['ankle-strap-platform-sandals', 'rainbow-stripe-crop-t-shirt']),
  C('new-items', 'New Items', 'p-bell-sleeve-crochet-top'),
  C('items-new', 'New Items — Items', 'p-olive-pointed-stilettos'),
  C('clothes-new', 'New Items — Clothes', 'p-tropical-print-tie-shirt'),
  C('accessories-new', 'New Items — Accessories', 'p-woven-tote-bag'),
  C('sale', 'Discount', 'p-ruffled-wrap-blouse'),
  C('clothing', 'Clothing', 'p-hug-me-tender-t-shirt'),
  C('shirts', 'Shirts', 'p-checked-flannel-shirt'),
  C('t-shirts', 'T-Shirts', 'p-rainbow-stripe-crop-t-shirt'),
  C('dresses', 'Dress', 'p-rustic-jumpsuit-with-knots'),
  C('jeans', 'Jeans', 'p-ripped-denim-mini-skirt'),
  C('skirts', 'Skirts', 'p-button-front-mini-skirt'),
  C('shorts', 'Shorts', 'p-pineapple-print-denim-shorts'),
  C('sweaters', 'Sweaters', 'p-rust-cable-knit-sweater'),
  C('swimwear', 'Swimwear', 'p-striped-swimsuit-with-one-strap'),
  C('accessories', 'Accessories', 'p-mustard-silk-scarf'),
  C('sunglasses', 'Goggles', 'p-metal-frame-round-sunglasses'),
  C('hats', 'Hats', 'p-pompom-knit-beanie'),
  C('jewelry', 'Jewelry', 'p-gold-chain-link-earrings'),
  C('bags', 'Bags', 'p-pink-faux-leather-backpack'),
  C('handbags', 'Handbags', 'p-wandler-hortensia-bag'),
  C('belts', 'Belt', 'p-quilted-belt-bag'),
  C('shoes', 'Shoes', 'p-white-platform-trainers'),
];

const articles = [
  ['ballaring-retreat-by-branch-studio', 'Ballaring retreat by branch studio', 'blog-1'],
  ['new-design-for-youth-in-summer', 'New Design For Youth In Summer', 'blog-2'],
  ['honcus-imperdiet-nisi-vel-pulvinar-fermentum', 'Honcus imperdiet nisi vel pulvinar fermentum', 'blog-3'],
  ['the-yellow-shirt-everyone-wants', 'The yellow shirt everyone wants this season', 'blog-4'],
  ['hair-pins-and-pastel-sweaters', 'Hair pins and pastel sweaters', 'blog-5'],
  ['a-hat-for-every-weekend', 'A hat for every weekend', 'blog-6'],
].map(([handle, title, image]) => ({
  handle, title, image, tags: ['Life Style'],
  excerpt: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  body: `${lorem}<blockquote><p>Fashion is the armor to survive the reality of everyday life.</p></blockquote>${lorem}`,
}));

const coll = (h) => `/collections/${h}`;
const menus = [
  { handle: 'clone01-main-menu', title: 'Main menu (Fashion #1)', items: [
    { title: 'Home', url: '/' },
    { title: 'Shop', url: coll('all'), items: [
      { title: 'Clothing', url: coll('clothing'), items: [
        { title: 'Shirts', url: coll('shirts') }, { title: 'T-Shirts', url: coll('t-shirts') }, { title: 'Sweaters', url: coll('sweaters') }, { title: 'Skirts', url: coll('skirts') }, { title: 'Shorts', url: coll('shorts') } ] },
      { title: 'Accessories', url: coll('accessories'), items: [
        { title: 'Goggles', url: coll('sunglasses') }, { title: 'Hats', url: coll('hats') }, { title: 'Jewelry', url: coll('jewelry') }, { title: 'Belt', url: coll('belts') } ] },
      { title: 'Bags & Shoes', url: coll('bags'), items: [
        { title: 'Handbags', url: coll('handbags') }, { title: 'Bags', url: coll('bags') }, { title: 'Shoes', url: coll('shoes') } ] },
      { title: 'Collections', url: '/collections', items: [
        { title: 'Trending Items', url: coll('trending') }, { title: 'New Items', url: coll('new-items') }, { title: 'Hot Deals', url: coll('hot-deals') }, { title: 'Daily Deals', url: coll('daily-deals') }, { title: 'Discount', url: coll('sale') } ] },
      { title: 'Shopify', url: coll('all'), items: [
        { title: 'Simple product', url: '/products/gold-chain-link-earrings' }, { title: 'Variable product', url: '/products/bell-sleeve-crochet-top' },
        { title: 'Shopping Cart', url: '/cart' }, { title: 'Checkout', url: '/checkout' }, { title: 'My account', url: '/account' },
        { title: 'Wishlist', url: '/pages/wish-list' }, { title: 'Compare', url: '/pages/compare' }, { title: '404 Not Found', url: '/404' } ] },
    ] },
    { title: 'Collection', url: '/collections', items: [
      { title: 'Trending Items', url: coll('trending') }, { title: 'New Items', url: coll('new-items') }, { title: 'Hot Deals', url: coll('hot-deals') }, { title: 'Discount', url: coll('sale') } ] },
    { title: 'Blog', url: '/blogs/news' },
    { title: 'Contact Us', url: '/pages/contact' },
  ] },
  // Level 2 (hover flyout in ALL CATEGORIES, "+" rows in the collection sidebar): product
  // search on a title word, so every sub-category lists real products
  { handle: 'clone01-categories', title: 'Categories (Fashion #1)', items: [
    ['Shirts', 'shirts', [['Blouses', 'blouse'], ['Crop tops', 'crop'], ['Printed shirts', 'print'], ['Checked shirts', 'checked']]],
    ['T-Shirts', 't-shirts', [['Graphic T-shirts', 't-shirt'], ['Striped tops', 'stripe'], ['Crop tops', 'crop']]],
    ['Dress', 'dresses', [['Jumpsuits', 'jumpsuit']]],
    ['Jeans', 'jeans', [['Denim', 'denim'], ['Corduroy trousers', 'corduroy']]],
    ['Skirts', 'skirts', [['Mini skirts', 'mini'], ['Midi skirts', 'midi'], ['Denim skirts', 'denim']]],
    ['Goggles', 'sunglasses', [['Round sunglasses', 'round'], ['Mirrored sunglasses', 'mirrored']]],
    ['Handbags', 'handbags', [['Backpacks', 'backpack'], ['Belt bags', 'belt'], ['Tote bags', 'tote']]],
    ['Belt', 'belts'],
    ['Hats', 'hats', [['Beanies', 'beanie'], ['Caps', 'cap']]],
    ['Shoes', 'shoes', [['Trainers', 'trainers'], ['Sandals', 'sandals'], ['Stilettos', 'stilettos']]],
    ['Sweaters', 'sweaters', [['Knit sweaters', 'knit'], ['Sweatshirts', 'sweatshirt'], ['Hoodies', 'hoodie']]],
    ['Swimwear', 'swimwear', [['Bikinis', 'bikini'], ['Swimsuits', 'swimsuit']]],
  ].map(([title, h, subs = []]) => ({
    title,
    url: coll(h),
    items: subs.map(([subTitle, word]) => ({ title: subTitle, url: `/search?type=product&q=title:${word}` })),
  })) },
  { handle: 'customer-services', title: 'Customer Services', items: [
    { title: 'FAQ', url: '/pages/faq' }, { title: 'Size Guide', url: '/pages/size-guide' }, { title: 'Contact Us', url: '/pages/contact' }, { title: 'Sell With Us', url: '/pages/about-us' }, { title: 'Sitemap', url: '/sitemap.xml' } ] },
  { handle: 'delivery-returns', title: 'Delivery & Returns', items: [
    { title: 'Delivery', url: '/policies/shipping-policy' }, { title: 'Order Tracking', url: '/account' }, { title: 'Returns', url: '/policies/refund-policy' }, { title: 'E-Receipts', url: '/account' }, { title: 'Buying Guides', url: '/pages/faq' } ] },
  { handle: 'cards-discounts', title: 'Cards & Discounts', items: [
    { title: 'Gift Cards', url: coll('all') }, { title: 'Store Cards', url: coll('all') }, { title: 'Buy Gift Cards', url: coll('all') }, { title: 'Sale Cards', url: coll('sale') } ] },
  { handle: 'clone01-footer-bottom', title: 'Footer bottom (Fashion #1)', items: [
    { title: 'About Us.', url: '/pages/about-us' }, { title: 'Job.', url: '/pages/about-us' }, { title: 'Press.', url: '/blogs/news' }, { title: 'Hel&Support.', url: '/pages/contact' }, { title: 'Return Policy', url: '/policies/refund-policy' } ] },
];

const pages = [
  { handle: 'contact', title: 'Contact', template: 'contact' },
  { handle: 'about-us', title: 'About Us', template: 'about', body: lorem },
  { handle: 'faq', title: 'FAQ', template: 'faq' },
  { handle: 'size-guide', title: 'Size Guide', body: lorem },
  { handle: 'wish-list', title: 'Wish list', template: 'wish-list' },
  { handle: 'compare', title: 'Compare', template: 'compare' },
];

// Theme-setting images live in Files under fixed names → shopify://shop_images/<name>
const settingImages = Object.keys(images).filter((k) => !k.startsWith('p-') && !k.startsWith('blog-'));
const fileName = (key) => `${PREFIX}-${key}.jpg`;
const shopImage = (key) => `shopify://shop_images/${fileName(key)}`;

const content = {
  storeName: 'clone01',
  languages: { default: 'en', alternates: ['vi'] },
  metafields: [
    { name: 'Badge', namespace: 'custom', key: 'badge', type: 'single_line_text_field', choices: ['new', 'hot', 'bestseller', 'sale'] },
    { name: 'Sold count', namespace: 'custom', key: 'sold_count', type: 'number_integer' },
  ],
  images: Object.fromEntries(Object.keys(images).map((k) => [k, { file: `images/${k}.jpg` }])),
  files: settingImages.map((key) => ({ key, filename: fileName(key) })),
  products: P,
  collections,
  pages,
  blog: { handle: 'news', title: 'News', author: 'Occasion', publishedAt: '2018-05-19T12:00:00Z', commentPolicy: 'MODERATED', articles }, // PSD dates: May 19, 2018
  menus,
  // Behind the product page bundle ("Buy 3 get 20% OFF")
  discounts: [{ title: 'Buy 3 get 20% OFF', minQuantity: 3, percent: 20 }],
};

// ---------------------------------------------------------------------------
// Homepage (templates/index.json)
// ---------------------------------------------------------------------------
const blocks = (type, list) => {
  const b = {};
  const order = [];
  list.forEach((settings, i) => { const id = `${type}_${i + 1}`; b[id] = { type, settings }; order.push(id); });
  return { blocks: b, block_order: order };
};
const banner = (key, link) => ({ image: shopImage(key), link });

const index = {
  sections: {
    home_hero: {
      type: 'home-hero',
      ...blocks('slide', [
        { image: shopImage('hero-1'), link: coll('sale') },
        { image: shopImage('hero-2'), link: coll('trending') },
        { image: shopImage('hero-3'), link: coll('new-items') },
      ]),
      // Banner artwork is 1820×550 with the text in the image: the slide follows the image shape
      settings: { full_width: true, categories_space: false, desktop_height: 550, slide_ratio: 'image', image_fit: 'cover', controls_style: 'dots', overlay_opacity: 0, autoplay: true, autoplay_speed: 5, padding_top: 0, padding_bottom: 0 },
    },
    home_services: {
      type: 'home-services-bar',
      ...blocks('service', [
        { icon: 'umbrella', title: 'Big Saving', subtitle: 'Weeken Sales' },
        { icon: 'headphones', title: 'Payment Method', subtitle: 'Secure Payment' },
        { icon: 'wallet', title: 'Free Return', subtitle: 'A Day 365' },
        { icon: 'money-bag', title: 'Support 24/7', subtitle: 'Online 24 Hours' },
        { icon: 'rocket', title: 'Free Delivery', subtitle: 'From $59.89' },
      ]),
      settings: { layout: 'circle', background_color: '#ffffff', text_color: '#8c8b8b', title_color: '#51412c', accent_color: '#51412c', show_dividers: false, full_width: false, padding_top: 31, padding_bottom: 0 },
    },
    home_daily_deals: {
      type: 'home-daily-deals',
      ...blocks('deal', [
        { product: 'rainbow-stripe-crop-t-shirt', use_inventory: false, available: 38, sold: 6 },
        { product: 'red-bow-bardot-top', use_inventory: false, available: 35, sold: 5 },
      ]),
      settings: { title: 'Daily Deals', heading_size: 20, heading_accent: '#ffbd2e', heading_rule: false, image_shape: 'tall', show_rating: true, countdown_mode: 'daily', padding_top: 39, padding_bottom: 0 },
    },
    home_deals_carousel: {
      type: 'home-product-grid',
      settings: { title: '', collection: 'hot-deals', layout: 'carousel', boxed: true, show_arrows: false, title_color: '#51412c', show_swatches: false, show_rating: false, card_info: 'price', products_to_show: 12, columns_desktop: 5, padding_top: 26, padding_bottom: 0 },
    },
    home_banner_grid_1: {
      type: 'home-banner-grid',
      ...blocks('banner', [banner('banner-sale-items', coll('sale')), banner('banner-woman-skirt', coll('skirts'))]),
      settings: { layout: 'two_thirds_left', gap: 18, padding_top: 34, padding_bottom: 0 },
    },
    home_banner_grid_2: {
      type: 'home-banner-grid',
      ...blocks('banner', [banner('banner-bags', coll('bags')), banner('banner-accessories', coll('accessories'))]),
      settings: { layout: 'two_thirds_right', gap: 18, padding_top: 16, padding_bottom: 0 },
    },
    home_trending: {
      type: 'home-product-grid',
      settings: { title: 'Trending Items', heading_size: 20, heading_accent: '#ffbd2e', heading_rule: false, collection: 'trending', layout: 'grid', row_gap: 43, show_swatches: false, show_rating: true, products_to_show: 10, columns_desktop: 5, show_view_all: true, view_all_label: 'Show more', view_all_style: 'outline', padding_top: 64, padding_bottom: 0 },
    },
    home_banner_wide: {
      type: 'home-banner-grid',
      ...blocks('banner', [banner('banner-new-arrivals', coll('new-items'))]),
      settings: { layout: 'full', gap: 15, padding_top: 68, padding_bottom: 0 },
    },
    home_new_items: {
      type: 'home-new-items',
      ...blocks('tab', [
        { title: 'All', collection: 'new-items', limit: 6 },
        { title: 'Items', collection: 'items-new', limit: 6 },
        { title: 'Clothes', collection: 'clothes-new', limit: 6 },
        { title: 'Accessories', collection: 'accessories-new', limit: 6 },
        { title: 'Discount', collection: 'sale', limit: 6 },
      ]),
      settings: { title: 'New Items', heading_size: 18, heading_accent: '#bbd8b2', show_featured: true, product: 'bell-sleeve-crochet-top', featured_background: '#ffffff', show_rating: true, card_image_shape: 'landscape', card_info_gap: 8, columns_desktop: 3, padding_top: 66, padding_bottom: 0 },
    },
    home_banner_pair: {
      type: 'home-banner-grid',
      ...blocks('banner', [banner('banner-fashion', coll('clothing')), banner('banner-sale-30', coll('sale'))]),
      settings: { layout: 'two_thirds_left', gap: 17, padding_top: 90, padding_bottom: 0 },
    },
    home_banner_season: {
      type: 'home-banner-grid',
      ...blocks('banner', [banner('banner-new-season', coll('t-shirts'))]),
      settings: { layout: 'full', gap: 15, padding_top: 17, padding_bottom: 0 },
    },
    home_blog: {
      type: 'home-latest-news',
      settings: { card_style: 'boxed', title: 'New Our Blog', heading_size: 18, heading_accent: '#ff8f39', heading_rule: false, blog: 'news', articles_to_show: 3, columns_desktop: 3, show_image: true, show_date: true, show_excerpt: false, show_read_more: false, accent_color: '#96cc66', padding_top: 68, padding_bottom: 0 },
    },
    home_brand_logos: {
      type: 'home-brand-logos',
      ...blocks('logo', ['brand-1', 'brand-2', 'brand-3', 'brand-4', 'brand-5', 'brand-6'].map((k, i) => ({ image: shopImage(k), link: coll('all'), alt: `Brand ${i + 1}` }))),
      settings: { title: '', grayscale: false, boxed: true, logo_height: 96, gap: 20, padding_top: 68, padding_bottom: 0 },
    },
    home_instagram: {
      type: 'home-instagram',
      ...blocks('image', ['insta-1', 'insta-2', 'insta-3', 'insta-4'].map((k) => ({ image: shopImage(k), link: 'https://instagram.com/' }))),
      settings: { title: 'Instagram', heading_size: 18, heading_accent: '#ffbd2e', heading_rule: false, instagram_handle: '@occasion', instagram_url: 'https://instagram.com/', layout: 'staggered', columns_desktop: 4, columns_mobile: '2', gap: 0, full_width: false, padding_top: 64, padding_bottom: 76 },
    },
  },
  order: [],
};
index.order = Object.keys(index.sections);

// ---------------------------------------------------------------------------
// Header / footer groups and theme settings: the main theme's files + overrides
// ---------------------------------------------------------------------------
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, ''));

const header = readJson('sections/header-group.json');
Object.assign(header.sections.header.settings, {
  header_layout: 'centered',
  header_top_background: '#ffffff',
  header_top_text_color: '#51412c',
  header_top_border_color: '',
  top_message: 'Welcome Our Occasion!',
  language_label: 'Laguage:',
  currency_label: 'Currency:',
  show_checkout_link: true,
  show_register_link: false,
  header_middle_background: '#ffffff',
  header_middle_text_color: '#51412c',
  logo_image: shopImage('logo'),
  logo_max_width: 190,
  search_placeholder: 'Search Item...',
  show_search_categories: false,
  help_label: 'Hotline',
  contact_phone: '(+123)4 567 890',
  show_wishlist: true,
  show_cart: true,
  cart_label: 'My Cart',
  cart_style: 'icon',
  show_action_labels: true,
  count_badge_bg: '#96cc66',
  count_badge_text: '#ffffff',
});
const nav = header.sections.navigation;
nav.blocks = {
  'mega-home': {
    type: 'megamenu_2',
    settings: {
      match_title: 'Home', link_columns: 3,
      card_1_title: 'Home Fashion #1', card_1_image: shopImage('menu-home-1'), card_1_url: '/',
      card_2_title: 'Home Fashion #2', card_2_image: shopImage('menu-home-2'), card_2_url: '/',
      card_3_title: 'Home Fashion #3', card_3_image: shopImage('menu-home-3'), card_3_url: '/',
    },
  },
};
nav.block_order = ['mega-home'];
Object.assign(nav.settings, {
  header_bottom_background: '#382b1b',
  header_bottom_categories_background: '#96cc66',
  header_bottom_text_color: '#ffffff',
  menu_font_weight: '400',
  menu_font_size: 16,
  mega_width: 'container', // mega panel across the container (was 'content', the PSD's narrower panel)
  categories_label: 'All Categories',
  categories_menu: 'clone01-categories',
  categories_style: 'plain',
  categories_more_label: 'More categories',
  categories_less_label: 'Less categories',
  open_on_home: false,
  categories_visible: 10,
  icons_from_files: false,
  menu: 'clone01-main-menu',
  menu_badges: '',
  show_track_link: false,
  hotline_text: '',
  show_promotion: false,
});

const footer = readJson('sections/footer-group.json');
const f = footer.sections.footer;
Object.assign(f.settings, {
  style: 'dark',
  newsletter_enable: true,
  newsletter_heading: 'Sign Up For Email',
  newsletter_style: 'column',
  newsletter_text: '',
  newsletter_placeholder: 'Your email address',
  newsletter_button_label: 'Subscribe',
  show_social: true,
  social_position: 'newsletter',
  payment_enable: true,
  payment_mode: 'manual',
  payment_image: shopImage('payment'),
  payment_position: 'bottom',
  bottom_menu: 'clone01-footer-bottom',
  copyright_text: '© 2018 OCCASION. ALL RIGHTS RESERVED',
});
f.blocks = {
  contact: { type: 'contact', settings: { heading: 'Contact Us', address: 'San Luis Potosí, Centro Historico, Potos', phone: '(+0214)0 315 215 - (+0214)0 315 215', email: 'Marketing@occasion.Com', hours: 'Open Time: 8:00AM - 6:00PM' } },
  col_service: { type: 'link_list', settings: { heading: 'Customer Services', menu: 'customer-services' } },
  col_delivery: { type: 'link_list', settings: { heading: 'Delivery & Returns', menu: 'delivery-returns' } },
  col_cards: { type: 'link_list', settings: { heading: 'Cards & Discounts', menu: 'cards-discounts' } },
  newsletter: { type: 'newsletter', settings: { intro_text: '', placeholder: 'Your email address' } },
};
f.block_order = ['contact', 'col_service', 'col_delivery', 'col_cards', 'newsletter'];
Object.assign(footer.sections.side_toolbar.settings, { accent_color: '#96cc66', gift_link: coll('sale') });
Object.assign(footer.sections.newsletter_popup.settings, {
  layout: 'framed', image: shopImage('popup-left'), image_2: shopImage('popup-right'), title: 'Join Our Mailing List', subtitle: 'Sign up & get 10% your first order',
  promise_text: 'We promise to only send you good things', button_label: 'Submit', button_color: '#94ca65',
});
const sales = footer.sections.sales_popup;
['rainbow-stripe-crop-t-shirt', 'red-bow-bardot-top', 'bell-sleeve-crochet-top', 'woven-tote-bag'].forEach((handle, i) => {
  sales.blocks[sales.block_order[i]].settings.product = handle;
});

const data = readJson('config/settings_data.json');
const preset = data.presets.Default;
Object.assign(preset, {
  logo: shopImage('logo'),
  logo_width: 190,
  color_primary: '#96cc66',
  color_secondary: '#96cc66',
  color_accent_dark: '#7fb84f',
  color_accent_ink: '#96cc66',
  color_price: '#ffbd2e',
  color_badge_sale: '#bbbbbb',
  color_heading: '#000000',
  color_text: '#51412c',
  color_product_title: '#000000', // PSD: black titles (deals carousel overrides with #51412c)
  color_border: '#f0f0f0',
  color_footer_bg: '#1b1b1b',
  card_layout: 'occasion',
  card_image_shape: 'portrait',
  card_image_padding: 12,
  card_info_gap: 16,
  badge_position: 'top right',
  badge_new_tag: 'new',
  badge_new_first: true,
  notify_accent_bar: true,
  card_discount_badge: true,
  quick_view_payment_image: shopImage('payment-light'),
});
data.current = 'Default';

// ---------------------------------------------------------------------------
// Inner pages: the main theme's templates (old demo layout) with this store's
// images, menus and filter tags
// ---------------------------------------------------------------------------
const collectionTpl = readJson('templates/collection.json');
const grid = collectionTpl.sections['product-grid'];
Object.assign(grid.settings, {
  default_collection_image: shopImage('banner-collection'),
  always_default_image: true, // collection images are product photos (collection list page)
  sidebar_categories_menu: 'clone01-categories',
});
Object.assign(grid.blocks.color.settings, { tags: Object.keys(COLORS).join(', ') });
Object.assign(grid.blocks.size.settings, { tags: SIZES.join(', ') });
Object.assign(grid.blocks.brand.settings, { tags: BRANDS.join('\n') });
Object.assign(grid.blocks.tags.settings, { tags: 'Accessories, Bags, Shoes, Tops, Skirts, Sweaters, Jewelry, Hats' });
Object.assign(grid.blocks.sellers.settings, { collection: 'sale' });
Object.assign(grid.blocks.banner.settings, { image: shopImage('banner-sidebar-shop'), link: '/collections/sweaters' });

const productTpl = readJson('templates/product.json');
// Haley product layout from the main template; bundle = three catalogue products
// Thumbnails in a column right of the main image
Object.assign(productTpl.sections.main.settings, { bundle_products: ['hug-me-tender-t-shirt', 'button-front-mini-skirt', 'white-platform-trainers'], thumbs_position: 'right' });

const cartTpl = readJson('templates/cart.json');
Object.assign(cartTpl.sections['cart-items'].settings, { free_shipping_threshold: 600 });

const sidebarBanner = { sidebar_image: shopImage('banner-sidebar-blog'), sidebar_link: '/collections/new-items' };
const blogTpl = readJson('templates/blog.json');
// Blog as a grid of the homepage "New Our Blog" cards (2 columns beside the sidebar)
Object.assign(blogTpl.sections.main.settings, sidebarBanner, { layout: 'grid', columns_desktop: '2', card_style: 'boxed', articles_per_page: 6 });
const articleTpl = readJson('templates/article.json');
Object.assign(articleTpl.sections.main.settings, sidebarBanner);

// Collections page: hide the homepage helper collections (tabs, deals, frontpage)
const listCollectionsTpl = readJson('templates/list-collections.json');
Object.assign(listCollectionsTpl.sections.main.settings, {
  exclude_prefix: 'tm-, frontpage, daily-deals, hot-deals, trending, items-new, clothes-new, accessories-new',
});

// Wishlist as on occasion-demo: heading + intro + benefits strip
const wishTpl = readJson('templates/page.wish-list.json');
Object.assign(wishTpl.sections.wishlist.settings, { layout: 'default', heading: 'My Wishlist', show_benefits: true });

const aboutTpl = readJson('templates/page.about.json');
Object.assign(aboutTpl.sections.brand_story_hero.settings, { image: shopImage('about-hero') });
Object.assign(aboutTpl.sections.brand_story_split.settings, { image: shopImage('about-split') });

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
const write = (rel, obj) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`);
  console.log(`  demos/clone01/${rel}`);
};
write('content.json', content);
write('templates/index.json', index);
write('templates/collection.json', collectionTpl);
write('templates/product.json', productTpl);
write('templates/cart.json', cartTpl);
write('templates/blog.json', blogTpl);
write('templates/article.json', articleTpl);
write('templates/list-collections.json', listCollectionsTpl);
write('templates/page.wish-list.json', wishTpl);
write('templates/page.about.json', aboutTpl);
write('sections/header-group.json', header);
write('sections/footer-group.json', footer);
write('config/settings_data.json', data);
write('images.manifest.json', images);
console.log(`${P.length} products, ${collections.length} collections, ${Object.keys(images).length} images`);
