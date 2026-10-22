/* Occasion 2.0 — product intro page */
(function () {
  // Every "Buy" / "Purchase" button ([data-buy]) opens the Occasion item on ThemeForest.
  // The same URL is in the href of each button (index.html), so they work before this script runs.
  var BUY_URL = 'https://themeforest.net/item/occasion-sectioned-responsive-shopify-theme-for-supermarket-large-store-groceries-aliexpress/22750511';

  document.querySelectorAll('[data-buy]').forEach(function (a) {
    a.href = BUY_URL;
    a.target = '_blank';
    a.rel = 'noopener';
  });

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
