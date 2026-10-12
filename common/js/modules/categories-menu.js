// "Shop by Categories" — sidebar + flyout mega menu (desktop header-bottom).
//
// Markup contract (see snippets/header-bottom-categories.liquid):
//   [data-header-categories]                    root wrapper
//     [data-categories-toggle]                  the "SHOP BY CATEGORIES" button
//     [data-categories-panel]                   dropdown shell, hidden by default via [hidden]
//       [data-categories-sidebar-list]           <ul> of sidebar rows
//         [data-mega-sidebar-item][data-mega-index="n"]   <li> — has a flyout
//           [data-mega-sidebar-link]             <a> — hover/focus/click target
//         [data-categories-more]                 "More" toggle button (last row)
//       [data-mega-body]
//         [data-mega-flyout][data-mega-index="n"]  flyout panel, hidden via [hidden] unless active
//
// Behaviour:
//   • Click the toggle button → open/close the whole dropdown.
//   • Hover (or click, for touch/keyboard) a sidebar row with a flyout (it has sub-links or a
//     mega menu block) → show that flyout, matched by data-mega-index. The white flyout area
//     (.has-flyout on the panel) only appears then: hovering a plain row or leaving the
//     panel hides it again.
//   • Click "More" → reveal the collapsed sidebar rows (.is-expanded on the list),
//     swap the button label/icon between the more/less variants.
//   • Outside click, Escape, or a link inside the panel being activated → close.
//
//   • Pinned ([data-categories-pinned], Occasion homepage): the panel stays open under the
//     button (it fills the hero's left column); only the flyouts open and close.
//   • Fine pointers: hovering the button / panel opens it, leaving closes it after a short delay.
//
// Idempotent: safe to call init() again (e.g. after `shopify:section:load`).

const BOUND_FLAG = 'categoriesMenuWired';

// Pinned only near the top of the page: once the sticky header scrolls over the content the
// list behaves like a normal dropdown again.
const isPinned = (root) =>
  root.hasAttribute('data-categories-pinned') &&
  window.matchMedia('(min-width: 1200px)').matches &&
  window.scrollY < 120;

function closePanel(root) {
  const toggle = root.querySelector('[data-categories-toggle]');
  const panel = root.querySelector('[data-categories-panel]');
  if (!panel || panel.hidden) return;
  setActiveFlyout(root, null);
  if (isPinned(root)) return;
  panel.hidden = true;
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function openPanel(root) {
  const toggle = root.querySelector('[data-categories-toggle]');
  const panel = root.querySelector('[data-categories-panel]');
  if (!panel) return;
  panel.hidden = false;
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

// index = null → no flyout (plain row hovered, or pointer left the panel)
function setActiveFlyout(root, index) {
  let shown = false;
  root.querySelectorAll('[data-mega-sidebar-item]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.megaIndex === index);
  });
  root.querySelectorAll('[data-mega-flyout]').forEach((panel) => {
    const isMatch = index !== null && panel.dataset.megaIndex === index;
    panel.classList.toggle('is-active', isMatch);
    panel.hidden = !isMatch;
    if (isMatch) shown = true;
  });
  const shell = root.querySelector('[data-categories-panel]');
  if (shell) shell.classList.toggle('has-flyout', shown);
}

function wireSidebarItems(root) {
  // Plain rows (no sub-links, no mega menu) close any open flyout
  root.querySelectorAll('[data-categories-sidebar-list] > li:not([data-mega-sidebar-item])').forEach((item) => {
    item.addEventListener('mouseenter', () => setActiveFlyout(root, null));
    item.addEventListener('focusin', () => setActiveFlyout(root, null));
  });
  const shell = root.querySelector('[data-categories-panel]');
  if (shell) shell.addEventListener('mouseleave', () => setActiveFlyout(root, null));

  root.querySelectorAll('[data-mega-sidebar-item]').forEach((item) => {
    const index = item.dataset.megaIndex;
    const link = item.querySelector('[data-mega-sidebar-link]');
    if (!link) return;

    const activate = () => setActiveFlyout(root, index);

    item.addEventListener('mouseenter', activate);
    link.addEventListener('focus', activate);
    link.addEventListener('click', (event) => {
      // Sidebar rows with a flyout are still real links (category URL) — only
      // intercept when the flyout isn't already showing, so a second click/tap
      // (mobile / no-hover devices) opens the panel instead of navigating away.
      const flyout = root.querySelector(`[data-mega-flyout][data-mega-index="${index}"]`);
      if (flyout && flyout.hidden) {
        event.preventDefault();
        activate();
      }
    });
  });
}

function wireMoreToggle(root) {
  const button = root.querySelector('[data-categories-more]');
  const list = root.querySelector('[data-categories-sidebar-list]');
  if (!button || !list) return;

  const plusIcon = button.querySelector('[data-categories-more-icon-plus]');
  const minusIcon = button.querySelector('[data-categories-more-icon-minus]');
  const label = button.querySelector('[data-categories-more-label]');
  const moreText = button.dataset.moreLabel;
  const lessText = button.dataset.lessLabel;

  button.addEventListener('click', () => {
    const expanded = list.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (plusIcon) plusIcon.hidden = expanded;
    if (minusIcon) minusIcon.hidden = !expanded;
    if (label) label.textContent = expanded ? lessText : moreText;
  });
}

function wireToggleButton(root) {
  const toggle = root.querySelector('[data-categories-toggle]');
  const panel = root.querySelector('[data-categories-panel]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (isPinned(root)) return;
    if (panel.hidden) {
      openPanel(root);
    } else {
      closePanel(root);
    }
  });

  // Close when a plain (non-flyout) sidebar link or a flyout link is clicked —
  // it's about to navigate anyway, so drop the open state to avoid a stale
  // panel flashing on back/forward navigation.
  panel.addEventListener('click', (event) => {
    const isSidebarFlyoutLink = event.target.closest('[data-mega-sidebar-link]');
    const isPlainLink = event.target.closest('a') && !isSidebarFlyoutLink;
    if (isPlainLink) closePanel(root);
  });
}

function wireDismiss(root) {
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) closePanel(root);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel(root);
  });
}

function wireHover(root) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let timer;
  root.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    openPanel(root);
  });
  root.addEventListener('mouseleave', () => {
    timer = setTimeout(() => closePanel(root), 220);
  });
}

function syncPinned(root) {
  if (isPinned(root)) {
    openPanel(root);
  } else if (root.hasAttribute('data-categories-pinned')) {
    // Rendered open for the homepage; below 1200px it behaves like a normal dropdown
    const panel = root.querySelector('[data-categories-panel]');
    const toggle = root.querySelector('[data-categories-toggle]');
    if (panel && !panel.hidden && !root.matches(':hover')) {
      panel.hidden = true;
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }
}

function initRoot(root) {
  if (!root || root.dataset[BOUND_FLAG] === '1') return;
  root.dataset[BOUND_FLAG] = '1';

  wireToggleButton(root);
  wireSidebarItems(root);
  wireMoreToggle(root);
  wireDismiss(root);
  wireHover(root);
  syncPinned(root);
  window.addEventListener('resize', () => syncPinned(root), { passive: true });
  if (root.hasAttribute('data-categories-pinned')) {
    window.addEventListener('scroll', () => syncPinned(root), { passive: true });
  }
}

function init() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-header-categories]').forEach(initRoot);
}

export default { init };
