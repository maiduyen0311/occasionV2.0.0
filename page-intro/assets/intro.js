/* Occasion 2.0 — product intro page */
(function () {
  // ---- Sale settings (see themeforest/sale/README.md) -------------------------------------
  // ITEM_URL: the Occasion item on ThemeForest. AFFILIATE_URL: your Envato affiliate link to the
  // same item; when set, every buy button uses it. Leave '' to link straight to the item.
  var ITEM_URL = 'https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511';
  var AFFILIATE_URL = '';
  // Measurement IDs: Google Analytics 4 ("G-XXXXXXX") and Meta Pixel (digits). Empty = not loaded.
  var GA4_ID = '';
  var META_PIXEL_ID = '';
  // Sale strip above the menu, shown only between start and end (dates in UTC, end excluded).
  var SALE = {
    enabled: false,
    start: '2026-11-22',
    end: '2026-12-02',
    text: '<b>Black Friday</b> Occasion is 30% off until December 1',
    cta: 'Get the deal'
  };
  // ------------------------------------------------------------------------------------------

  var BUY_URL = AFFILIATE_URL || ITEM_URL;

  // Analytics (only when an ID is set)
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
  }
  if (META_PIXEL_ID) {
    /* Meta Pixel base code */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
  function track(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
    if (window.fbq) window.fbq('trackCustom', name, params || {});
  }

  // Every "Buy" / "Purchase" / "Add to cart" button ([data-buy]) opens the item on ThemeForest.
  // The plain item URL is also in each href (index.html), so the buttons work before this runs.
  document.querySelectorAll('[data-buy]').forEach(function (a) {
    a.href = BUY_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      var where = a.closest('.demo') ? 'demo-card' : a.closest('.hero') ? 'hero' : a.closest('.cta') ? 'cta' : a.closest('.sale-strip') ? 'sale-strip' : 'nav';
      track('buy_click', { location: where });
      if (window.fbq) window.fbq('track', 'InitiateCheckout');
    });
  });
  document.querySelectorAll('.demo__actions a:not([data-buy]), .demo__shot').forEach(function (a) {
    a.addEventListener('click', function () { track('demo_click', { demo: a.getAttribute('href') }); });
  });

  // Sale strip
  var now = Date.now();
  if (SALE.enabled && now >= Date.parse(SALE.start) && now < Date.parse(SALE.end)) {
    var strip = document.createElement('div');
    strip.className = 'sale-strip';
    strip.innerHTML = '<div class="wrap sale-strip__row"><span>' + SALE.text + '</span><a class="btn btn--sm sale-strip__btn" data-buy href="' + BUY_URL + '" target="_blank" rel="noopener">' + SALE.cta + '</a></div>';
    document.body.insertBefore(strip, document.getElementById('nav'));
    strip.querySelector('a').addEventListener('click', function () { track('buy_click', { location: 'sale-strip' }); });
  }

  // Phone menu
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('site-nav');
  if (toggle && menu) {
    var set = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
    };
    toggle.addEventListener('click', function () { set(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  // Active menu item: the last section whose top has passed the sticky nav
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var navH = (document.getElementById('nav') || {}).offsetHeight || 0;
  function spy() {
    var line = navH + window.innerHeight * 0.3;
    var current = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    // Bottom of the page: the last item (FAQ) even if its top never reaches the line
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = targets.length - 1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Back to top
  var top = document.querySelector('.to-top');
  window.addEventListener('scroll', function () {
    top.classList.toggle('is-visible', window.scrollY > 700);
  }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
