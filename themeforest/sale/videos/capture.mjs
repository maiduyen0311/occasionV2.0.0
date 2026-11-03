// Screenshots of the 3 live demo stores for the YouTube videos.
// node themeforest/sale/videos/capture.mjs [name,name…]   → themeforest/sale/videos/frames/*.jpg
// Desktop: 1440 × 810 CSS px at 4/3 scale = 1920 × 1080. Mobile: 390 px wide at 1080/390 scale = 1080 px wide.
import { connect } from './cdp.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'frames');
fs.mkdirSync(OUT, { recursive: true });

const DEMOS = {
  occasion: { url: 'https://occasion-demo.myshopify.com', collection: '/collections/women', product: '/products/various-versions-have-evolved-over' },
  fashion1: { url: 'https://occasion-demo-1.myshopify.com', collection: '/collections/clothing', product: '/products/block-stripe-sweater' },
  fashion2: { url: 'https://occasion-demo-2.myshopify.com', collection: '/collections/clothing', product: '/products/cable-knit-sweater-dress' }
};
const only = process.argv[2] ? process.argv[2].split(',') : null;
const want = k => !only || only.includes(k);

const c = await connect();
// No newsletter popup or cookie banner unless a shot asks for it
await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.getItem('keepNl'))localStorage.setItem('tm_newsletter_popup','{"never":true}');localStorage.setItem('tm_cookie_consent',JSON.stringify({v:1,status:'accepted',prefs:{},ts:Date.now()}))}catch(e){}` });

const desktop = () => c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 810, deviceScaleFactor: 4 / 3, mobile: false });
const mobile = () => c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1080 / 390, mobile: true });
const clean = (keep = '') => c.ev(`document.querySelectorAll('.cookie-banner,[class*=social-proof],#shopify-pc__banner${keep.includes('sales') ? '' : ',.sales-popup'}').forEach(e=>e.remove()); 1`);
async function open(url, keep) {
  await c.send('Page.navigate', { url });
  for (let i = 0; i < 40; i++) { await c.sleep(500); if ((await c.ev('document.readyState')) === 'complete') break; }
  await c.sleep(2500);
  await clean(keep);
}
async function jpg(name, clip) {
  const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 88, ...(clip ? { captureBeyondViewport: true, clip: { scale: 1, ...clip } } : {}) });
  if (!s.result) { console.log('✘', name, JSON.stringify(s.error)); return; }
  fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(s.result.data, 'base64'));
  console.log('✔', name);
}
// Scroll the whole page so lazy images and reveal animations load, then back to top
async function warm() {
  await c.ev(`(async()=>{document.documentElement.style.scrollBehavior='auto';for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,180))}scrollTo(0,0);await new Promise(r=>setTimeout(r,800));document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')})()`);
  await c.sleep(1500);
  await clean();
}
async function fullPage(name, maxH) {
  await warm();
  const h = Math.min(await c.ev('document.documentElement.scrollHeight'), maxH);
  const w = await c.ev('innerWidth');
  await jpg(name, { x: 0, y: 0, width: w, height: h });
}
const rect = sel => c.ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}})()`);
const mouse = (x, y) => c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
const center = async sel => { await c.ev(`document.documentElement.style.scrollBehavior='auto';document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({block:'center'}); 1`); await c.sleep(1500); };

for (const [key, d] of Object.entries(DEMOS)) {
  if (!want(key)) continue;
  await desktop();
  await open(d.url + '/'); await fullPage(`${key}-home`, 7000);
  await open(d.url + d.collection); await warm(); await jpg(`${key}-collection`);
  await open(d.url + d.product); await warm(); await jpg(`${key}-product`);
  await mobile();
  await open(d.url + '/'); await fullPage(`${key}-m-home`, 9000);
}

if (want('features')) {
  const B = DEMOS.occasion.url;
  await desktop();
  // Mega menu: hover the first category that has a mega panel
  await open(B + '/');
  const m = await rect('.header-bottom__sidebar-item.has-mega');
  if (m) { await mouse(m.x + m.width / 2, m.y + m.height / 2); await c.sleep(1500); await jpg('f-mega'); }
  await mouse(1400, 800);
  // Card hover
  await open(B + DEMOS.occasion.collection); await warm();
  await center('#product-grid .card-wrapper');
  const card = await c.ev(`(()=>{const e=[...document.querySelectorAll('#product-grid .card-wrapper')][1];const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/3}})()`);
  await mouse(card.x, card.y); await c.sleep(1200); await jpg('f-card-hover');
  // Quick view
  await c.ev(`[...document.querySelectorAll('#product-grid [data-quick-view-trigger]')][2]?.click()`); await c.sleep(4500); await jpg('f-quick-view');
  // Wishlist popup, wishlist page, compare page
  await open(B + DEMOS.occasion.collection);
  await c.ev(`localStorage.removeItem('occasion:wishlist'); 1`);
  await open(B + DEMOS.occasion.collection); await warm();
  for (const i of [0, 3, 5]) { await c.ev(`[...document.querySelectorAll('#product-grid [data-wishlist-toggle]')][${i}]?.click(); 1`); await c.sleep(1800); await c.ev(`document.querySelector('[data-oc-notify-close]')?.click(); 1`); await c.sleep(400); }
  await center('#product-grid [data-wishlist-toggle]');
  await c.ev(`[...document.querySelectorAll('#product-grid [data-wishlist-toggle]')][7]?.click(); 1`); await c.sleep(2500); await jpg('f-wishlist-popup');
  await open(B + '/pages/wish-list'); await c.sleep(1500); await jpg('f-wishlist');
  const hs = await c.ev(`fetch('${DEMOS.occasion.collection}/products.json?limit=3').then(r=>r.json()).then(j=>j.products.map(p=>p.handle))`);
  await c.ev(`localStorage.setItem('tm_compare', JSON.stringify(${JSON.stringify(hs)})); 1`);
  await open(B + '/pages/compare?view=compare'); await c.sleep(2500); await jpg('f-compare');
  // Daily deals with countdown
  await open(B + '/'); await warm(); await center('.oc-deal'); await jpg('f-deal');
  // Product page: bundle block, then add to cart popup, then mini cart
  await open(B + DEMOS.occasion.product); await warm();
  if (await rect('[data-product-bundle]')) { await center('[data-product-bundle]'); await jpg('f-bundle'); }
  await c.ev(`scrollTo(0,0); 1`); await c.sleep(600);
  await c.ev(`document.querySelector('.main-product__add-to-cart')?.click()`); await c.sleep(4000); await jpg('f-cart-popup');
  await c.ev(`document.querySelector('[data-oc-notify-close]')?.click(); 1`); await c.sleep(600);
  await c.ev(`document.querySelector('.header-middle [data-cart-drawer-toggle], [data-cart-drawer-toggle]')?.click()`); await c.sleep(2500); await jpg('f-mini-cart');
  // Newsletter popup + sales popup (fashion 2 newsletter looks best; occasion sales popup)
  await c.ev(`sessionStorage.setItem('keepNl','1'); localStorage.removeItem('tm_newsletter_popup'); 1`);
  await open(B + '/', 'sales'); await c.sleep(9000); await jpg('f-popups');
  await c.ev(`sessionStorage.removeItem('keepNl'); 1`);
  // Mobile menu drawer
  await mobile();
  await open(B + '/');
  await c.ev(`document.querySelector('[data-mobile-drawer-open]')?.click(); 1`); await c.sleep(1500); await jpg('f-m-drawer');
}
console.log('errors', c.errors.slice(0, 5));
c.close();
