/* Top Market — product intro page */
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

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Tabs: [data-tabs] buttons with data-filter (inner pages) or aria-controls (editor panels)
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var buttons = group.querySelectorAll('button');
    var targetGrid = group.dataset.tabs ? document.getElementById(group.dataset.tabs) : null;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-selected', b === btn); });
        if (targetGrid) {
          var f = btn.dataset.filter;
          targetGrid.querySelectorAll('[data-theme]').forEach(function (card) {
            card.hidden = f !== 'all' && card.dataset.theme.split(' ').indexOf(f) === -1;
          });
        } else {
          buttons.forEach(function (b) {
            var panel = document.getElementById(b.getAttribute('aria-controls'));
            if (panel) panel.hidden = b !== btn;
          });
        }
      });
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
  if (top) {
    window.addEventListener('scroll', function () {
      top.classList.toggle('is-visible', window.scrollY > 900);
    }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
