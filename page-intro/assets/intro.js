/* Occasion 2.0 — product intro page */
(function () {
  // Set this to the ThemeForest item URL once the theme is approved.
  // Until then the "Buy" buttons point to the iPhoenix Themes website.
  var BUY_URL = '';
  var FALLBACK_URL = 'https://iphoenixthemes.com';

  document.querySelectorAll('[data-buy]').forEach(function (a) {
    a.href = BUY_URL || FALLBACK_URL;
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
