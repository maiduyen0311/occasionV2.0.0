/* Occasion — product intro page */
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

  // Toggle helper for the phone menu and the "All demos" dropdown
  function toggler(btn, panel) {
    if (!btn || !panel) return;
    var set = function (open) {
      panel.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
    };
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      set(!panel.classList.contains('is-open'));
    });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', function (e) { if (!panel.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }
  toggler(document.querySelector('.menu-toggle'), document.getElementById('site-nav'));
  toggler(document.querySelector('.alldemos__btn'), document.getElementById('alldemos-list'));

  // Demo tabs (also opened from the hero sidebar)
  var tabs = document.querySelectorAll('[data-demo-tab]');
  function showDemo(id) {
    tabs.forEach(function (t) {
      var on = t.dataset.demoTab === id;
      t.setAttribute('aria-selected', on);
      document.getElementById('demo-' + t.dataset.demoTab).hidden = !on;
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showDemo(t.dataset.demoTab); });
  });
  document.querySelectorAll('[data-show-demo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showDemo(a.dataset.showDemo);
      document.getElementById('demos').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Inner pages: filter tabs + prev / next
  var rail = document.getElementById('page-rail');
  var filters = document.querySelectorAll('[data-page-filter]');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.pageFilter;
      filters.forEach(function (b) { b.setAttribute('aria-selected', b === btn); });
      rail.querySelectorAll('[data-demo]').forEach(function (it) {
        it.hidden = f !== 'all' && it.dataset.demo !== f;
      });
      rail.scrollTo({ left: 0 });
    });
  });
  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      rail.scrollBy({ left: Number(btn.dataset.scroll) * rail.clientWidth * 0.9, behavior: 'smooth' });
    });
  });

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
    top.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
