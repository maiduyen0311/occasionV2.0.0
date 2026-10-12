/*
 * Shared script for the theme documentation (works offline from file://).
 * Builds the sidebar from NAV, highlights the current page / section,
 * filters the menu, adds copy buttons and the mobile menu toggle.
 *
 * To document a new theme in the package: add its page (copy haley.html)
 * and one entry in the "Themes in this package" group below.
 */
(function () {
  var NAV = [
    { group: 'Start here', items: [
      ['index.html', 'Welcome & choose a theme'],
      ['getting-started.html', 'Getting started'],
      ['getting-started.html#package', 'Package contents', 1],
      ['getting-started.html#requirements', 'Requirements', 1],
      ['getting-started.html#choose', 'Choose a theme', 1],
      ['getting-started.html#install', 'Install a theme', 1],
      ['getting-started.html#purchase-code', 'Purchase code', 1],
      ['getting-started.html#demo-content', 'About demo content', 1],
      ['getting-started.html#switch', 'Switch to another theme', 1],
      ['getting-started.html#updating', 'Update the theme', 1],
    ] },
    { group: 'Themes in this package', items: [
      ['top-market.html', 'Top Market — marketplace'],
      ['haley.html', 'Haley — fashion boutique'],
    ] },
    { group: 'Step 1 · Shopify admin', items: [
      ['store-setup.html#store-settings', 'Store settings'],
      ['store-setup.html#metafields', 'Metafield definitions'],
      ['store-setup.html#products', 'Products & variants'],
      ['store-setup.html#collections', 'Collections'],
      ['store-setup.html#menus', 'Menus'],
      ['store-setup.html#pages', 'Pages & page templates'],
      ['store-setup.html#blog-posts', 'Blog posts'],
      ['store-setup.html#discounts', 'Discounts for bundles'],
    ] },
    { group: 'Step 2 · Theme editor', items: [
      ['customize.html#editor-basics', 'Theme editor basics'],
      ['customize.html#theme-settings', 'Theme settings'],
      ['customize.html#header', 'Header'],
      ['customize.html#header-row', 'Header in one row & mega menus'],
      ['customize.html#navigation', 'Navigation bar & category mega menus'],
      ['customize.html#footer', 'Footer, services bar & popups'],
      ['customize.html#sections', 'Sections reference'],
      ['customize.html#extras', 'Popups & trust features'],
      ['customize.html#languages', 'Languages & currencies'],
    ] },
    { group: 'Step 3 · Pages', items: [
      ['pages.html#collection-page', 'Collection & search'],
      ['pages.html#collections-list', 'All collections page'],
      ['pages.html#product-page', 'Product page'],
      ['pages.html#quick-view', 'Product card & quick view'],
      ['pages.html#cart', 'Cart & mini cart'],
      ['pages.html#wishlist', 'Wishlist'],
      ['pages.html#compare', 'Compare'],
      ['pages.html#accounts', 'Customer accounts'],
      ['pages.html#content-pages', 'Blog, contact, FAQ, 404'],
    ] },
    { group: 'Help', items: [
      ['help.html#launch', 'Launch checklist'],
      ['help.html#accessibility', 'Accessibility'],
      ['help.html#faq', 'FAQ & troubleshooting'],
      ['help.html#custom-css', 'Custom CSS'],
      ['help.html#support', 'Support'],
      ['help.html#changelog', 'Changelog'],
      ['help.html#credits', 'Credits & licenses'],
    ] },
  ];

  var here = location.pathname.split('/').pop() || 'index.html';
  var sidebar = document.getElementById('sidebar');
  var html = '<div class="brand"><img class="brand__mark" src="assets/logo-iphoenix-white.svg" alt="iphoenix" width="132" height="31">' +
    '<a class="brand__logo" href="index.html">Theme <span>guide</span></a>' +
    '<div class="brand__meta">Top Market theme package · v1.1.0</div></div>' +
    '<div class="search"><input type="search" id="navSearch" placeholder="Search the menu…" aria-label="Search the documentation menu"></div>' +
    '<nav class="nav" id="nav" aria-label="Documentation">';
  var flat = [];
  NAV.forEach(function (g) {
    html += '<div class="nav__group">' + g.group + '</div>';
    g.items.forEach(function (it) {
      flat.push(it);
      html += '<a href="' + it[0] + '"' + (it[2] ? ' class="nav__sub"' : '') + '>' + it[1] + '</a>';
    });
  });
  sidebar.innerHTML = html + '</nav>';

  var links = Array.prototype.slice.call(sidebar.querySelectorAll('#nav a'));
  var page = function (href) { return href.split('#')[0]; };
  var hash = function (href) { return href.split('#')[1] || ''; };

  // Current page: highlight its plain link, or its first section link
  function highlight(id) {
    var best = null;
    links.forEach(function (a) {
      var h = a.getAttribute('href');
      if (page(h) !== here) return;
      if (id && hash(h) === id) best = a;
      if (!best && !hash(h)) best = a;
    });
    if (!best) best = links.filter(function (a) { return page(a.getAttribute('href')) === here; })[0];
    links.forEach(function (a) { a.classList.toggle('is-active', a === best); });
  }
  highlight(location.hash.slice(1));

  // Scroll-spy for sections of this page that are in the menu
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) highlight(e.target.id); });
    }, { rootMargin: '-10% 0px -80% 0px' });
    links.forEach(function (a) {
      var h = a.getAttribute('href');
      if (page(h) === here && hash(h)) { var s = document.getElementById(hash(h)); if (s) io.observe(s); }
    });
  }

  // Menu search (titles of every page + text of this page's sections)
  var search = document.getElementById('navSearch');
  search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    links.forEach(function (a) {
      var h = a.getAttribute('href');
      var s = page(h) === here && hash(h) ? document.getElementById(hash(h)) : null;
      var text = (a.textContent + ' ' + (s ? s.textContent : '')).toLowerCase();
      a.hidden = q !== '' && text.indexOf(q) === -1;
    });
  });

  // Copy buttons on code blocks
  document.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var text = pre.querySelector('code').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      }, function () {});
    });
    pre.appendChild(btn);
  });

  // Previous / next page
  var pages = [];
  flat.forEach(function (it) { var p = page(it[0]); if (pages.indexOf(p) === -1) pages.push(p); });
  var titles = {};
  flat.forEach(function (it) { if (!titles[page(it[0])]) titles[page(it[0])] = it[1]; });
  var i = pages.indexOf(here);
  var pager = document.getElementById('pager');
  if (pager && i !== -1) {
    var out = '';
    if (i > 0) out += '<a class="prev" href="' + pages[i - 1] + '"><small>Previous</small>' + titles[pages[i - 1]] + '</a>';
    if (i < pages.length - 1) out += '<a class="next" href="' + pages[i + 1] + '"><small>Next</small>' + titles[pages[i + 1]] + '</a>';
    pager.innerHTML = out;
  }

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('nav-open'); }); });
})();
