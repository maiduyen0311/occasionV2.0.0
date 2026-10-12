// Generates templates/index.json for the Occasion demo (content from the old live theme:
// design/old-demo/live-settings.txt). Run from the project root.
const fs = require('fs');
const img = (n) => 'shopify://shop_images/' + n;
const blocks = (type, list) => {
  const b = {}, order = [];
  list.forEach((settings, i) => { const id = type + '_' + (i + 1); b[id] = { type, settings }; order.push(id); });
  return { blocks: b, block_order: order };
};
// Several block types in one section, in the given order
const mixed = (...groups) => groups.reduce((acc, g) => ({
  blocks: { ...acc.blocks, ...g.blocks },
  block_order: [...acc.block_order, ...g.block_order],
}), { blocks: {}, block_order: [] });
const sections = {
  home_hero: {
    type: 'home-hero',
    ...mixed(
      blocks('slide', [
        { image: img('slide_1_2000x_0c8b32ac0f310759731f2abded79b9c1.png'), link: 'shopify://collections/all', heading: 'Occasion', text: 'Shoes 2018', button_label: 'Collection now', content_position: 'left', text_color: '#673a3f' },
        { image: img('banner-2.jpg'), link: 'shopify://collections/all' },
        { image: img('banner-3.jpg'), link: 'shopify://collections/all' },
      ]),
      blocks('promo_banner', [
        { image: img('cl_1.png'), link: 'shopify://collections' },
        { image: img('cl_2.png'), link: 'shopify://collections/all' },
      ]),
    ),
    settings: { full_width: false, categories_space: true, side_width: 'quarter', desktop_height: 385, image_fit: 'cover', controls_style: 'none', overlay_opacity: 0, autoplay: true, autoplay_speed: 5, padding_top: 15, padding_bottom: 25 },
  },
  home_services: {
    type: 'home-services-bar',
    ...blocks('service', [
      { icon: 'none', icon_image: img('icon_5.png'), title: 'Support 24/7', subtitle: 'From $59.89' },
      { icon: 'none', icon_image: img('icon_2.png'), title: 'Payment method', subtitle: 'Secure Payment' },
      { icon: 'none', icon_image: img('icon_3.png'), title: 'Free return', subtitle: 'A Day 365' },
      { icon: 'none', icon_image: img('icon_4.png'), title: 'Free delivery', subtitle: 'Online 24 Hours' },
      { icon: 'none', icon_image: img('icon_1.png'), title: 'Big saving', subtitle: 'Weekend Sales' },
    ]),
    settings: { layout: 'boxed', background_color: '#ffffff', text_color: '#767676', title_color: '#000000', accent_color: '#bbd8b2', show_dividers: true, full_width: false, padding_top: 15, padding_bottom: 15 },
  },
  home_daily_deals: {
    type: 'home-daily-deals',
    ...blocks('deal', [
      { product: 'duis-aute-pariatur-1', use_inventory: false, available: 38, sold: 5 },
      { product: 'duis-aute-pariatur-2', use_inventory: false, available: 26, sold: 3 },
    ]),
    settings: { title: 'Daily Deals', countdown_mode: 'daily', padding_top: 15, padding_bottom: 10 },
  },
  home_deals_carousel: {
    type: 'home-product-grid',
    settings: { title: '', collection: 'furnicom', layout: 'carousel', show_swatches: false, products_to_show: 12, columns_desktop: 6, padding_top: 10, padding_bottom: 15 },
  },
  home_banner_grid: {
    type: 'home-banner-grid',
    ...blocks('banner', [
      { image: img('block_1.png'), link: 'shopify://collections/all' },
      { image: img('block_4.png'), link: 'shopify://collections/all' },
      { image: img('block_2.png'), link: 'shopify://collections/all' },
      { image: img('block_3.png'), link: 'shopify://collections/frontpage' },
    ]),
    settings: { layout: 'thirds_stacked', gap: 20, padding_top: 15, padding_bottom: 15 },
  },
  home_trending: {
    type: 'home-product-grid',
    settings: { title: 'Trending Items', collection: 'women', layout: 'grid', show_swatches: false, products_to_show: 10, columns_desktop: 5, padding_top: 15, padding_bottom: 15 },
  },
  home_banner_wide: {
    type: 'home-banner-grid',
    ...blocks('banner', [{ image: img('block_5.png'), link: 'shopify://products/magni-dolores-eos-qui-ratione-posuere-loremous-8' }]),
    settings: { layout: 'full', gap: 15, padding_top: 15, padding_bottom: 15 },
  },
  home_top_rated: {
    type: 'home-top-rated-tabs',
    ...blocks('tab', [
      { title: 'Mobile & accessories', icon: img('ico04.png'), collection: 'man', limit: 8 },
      { title: 'Headphone', icon: img('ico03.png'), collection: 'fashion-accessories', limit: 8 },
      { title: 'TV & audios', icon: img('ico05.png'), collection: 'women', limit: 8 },
      { title: 'All items', icon: img('ico01.png'), collection: 'camera-photo', limit: 8 },
      { title: 'Accessories', icon: img('ico02.png'), collection: 'furnicom', limit: 8 },
    ]),
    settings: { show_list: true, list_title: 'Top rated', list_collection: 'fashion-accessories', list_limit: 8, list_per_page: 4, tabs_title: 'Hot & New', padding_top: 15, padding_bottom: 15 },
  },
  home_banner_pair_1: {
    type: 'home-banner-grid',
    ...blocks('banner', [
      { image: img('bn_1.png'), link: 'shopify://collections/all' },
      { image: img('bn_2.png'), link: 'shopify://products/magni-dolores-eos-qui-ratione-posuere-loremous-7' },
    ]),
    settings: { layout: 'halves', gap: 20, padding_top: 15, padding_bottom: 15 },
  },
  home_new_items: {
    type: 'home-new-items',
    ...blocks('tab', [
      { title: 'Electronic light', collection: 'camera-photo', limit: 6 },
      { title: 'Furniture', collection: 'health-beauty', limit: 6 },
      { title: 'Office', collection: 'women', limit: 6 },
    ]),
    settings: { title: 'New Items', show_featured: true, product: 'various-versions-have-evolved-over', columns_desktop: 3, padding_top: 15, padding_bottom: 15 },
  },
  home_banner_pair_2: {
    type: 'home-banner-grid',
    ...blocks('banner', [
      { image: img('block_13.png'), link: 'shopify://collections/all' },
      { image: img('block_12.png'), link: 'shopify://collections/all' },
    ]),
    settings: { layout: 'quarter_left', gap: 20, padding_top: 15, padding_bottom: 15 },
  },
  home_blog: {
    type: 'home-latest-news',
    settings: { card_style: 'overlay', title: 'Blog posts', blog: 'news', articles_to_show: 3, columns_desktop: 3, show_image: true, show_date: true, show_excerpt: false, show_read_more: false, padding_top: 15, padding_bottom: 15 },
  },
  home_brand_logos: {
    type: 'home-brand-logos',
    ...blocks('logo', ['Layer_672.png', 'Layer_673.png', 'Layer_674.png', 'Layer_670.png', 'Logo_03.png', 'Layer_671.png'].map((n) => ({ image: img(n), alt: 'Brand', link: '' }))),
    settings: { title: '', grayscale: false, logo_height: 80, gap: 20, padding_top: 20, padding_bottom: 20 },
  },
  home_instagram: {
    type: 'home-instagram',
    disabled: true,
    ...blocks('image', [{}, {}, {}, {}, {}, {}]),
    settings: { title: 'Instagram', instagram_handle: '@occasion', show_overlay_logo: false, columns_desktop: 6, columns_mobile: '3', gap: 6, full_width: false, padding_top: 16, padding_bottom: 30 },
  },
};
const out = { sections, order: Object.keys(sections) };
fs.writeFileSync('templates/index.json', JSON.stringify(out, null, 2) + '\n');
console.log('sections', out.order.length);
