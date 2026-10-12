// Occasion — Product tabs widget.
// Idempotent init that binds tab/panel switching for every section instance
// found in the DOM. Re-runs on `shopify:section:load` so the theme editor
// reflects edits without a full page reload.
(function () {
  function init(root) {
    if (!root || root.dataset.tabsInit === '1') return;
    root.dataset.tabsInit = '1';
    var tabs = root.querySelectorAll('.product-tabs__tab');
    var panels = root.querySelectorAll('.product-tabs__panel');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab-target');
        tabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        if (target) {
          var panel = document.getElementById(target);
          if (panel) panel.classList.add('is-active');
        }
      });
    });
  }
  function initAll() {
    document.querySelectorAll('[data-product-tabs-root]').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', initAll);
})();
