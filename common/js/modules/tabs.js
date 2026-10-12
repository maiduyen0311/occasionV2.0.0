const activateTab = (root, tabId) => {
  if (!root || !tabId) return;

  const buttons = root.querySelectorAll('[data-toggle="tab"]');
  const panes = root.querySelectorAll('.tabs__pane');
  const viewAll = root.querySelector('[data-best-selling-view-all]');

  buttons.forEach((btn) => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    btn.parentElement?.classList.toggle('active', isActive);
    // SCSS rules the orange/underlined state off `.is-active`; Liquid renders
    // it on the first tab. Toggle both so clicking moves the state correctly.
    btn.parentElement?.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  panes.forEach((pane) => {
    const isActive = pane.getAttribute('data-id') === tabId;
    pane.classList.toggle('is-active', isActive);
    pane.classList.toggle('show', isActive);
    if (isActive) {
      pane.removeAttribute('hidden');
    } else {
      pane.setAttribute('hidden', '');
    }
  });

  const activeBtn = root.querySelector(`[data-toggle="tab"][data-tab="${tabId}"]`);
  const collectionUrl = activeBtn?.getAttribute('data-collection-url');
  if (viewAll && collectionUrl) {
    viewAll.setAttribute('href', collectionUrl);
  }
};

const initTabsRoot = (root) => {
  if (!root || root.dataset.tabsInit === 'true') return;
  root.dataset.tabsInit = 'true';

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-toggle="tab"]');
    if (!button || !root.contains(button)) return;

    event.preventDefault();
    const tabId = button.getAttribute('data-tab');
    activateTab(root, tabId);
  });

  const firstButton = root.querySelector('[data-toggle="tab"]');
  if (firstButton) {
    activateTab(root, firstButton.getAttribute('data-tab'));
  }
};

const tabList = () => {
  document.querySelectorAll('[data-tabs-root]').forEach(initTabsRoot);
};

// Below 768px tab widgets render as an accordion: every panel carries its own
// [data-acc-toggle] header, and its body shows while [data-acc-item] is .is-open
// (see _tab-accordion.scss). One delegated listener covers every section,
// including ones re-rendered by the theme editor.
let accordionBound = false;
const accordionTabs = () => {
  if (accordionBound) return;
  accordionBound = true;
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-acc-toggle]');
    const item = button?.closest('[data-acc-item]');
    if (!item) return;
    const open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
};

export { tabList, activateTab, accordionTabs };
