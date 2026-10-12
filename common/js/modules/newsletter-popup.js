// Newsletter popup — vanilla, idempotent.
//
// Markup: sections/newsletter-popup.liquid ([data-newsletter-popup]).
//
// Storage (localStorage `tm_newsletter_popup`):
//   { until: <timestamp> }  — closed; hidden until that time
//   { never: true }         — "Don't show again" checked, or subscribed
//
// Opens immediately (ignoring storage) after a form submit redirects back with
// `#<form id>` in the URL, so the success / error message is visible.
// In the theme editor it opens only while its section is selected.

const STORAGE_KEY = 'tm_newsletter_popup';
const DAY_MS = 24 * 60 * 60 * 1000;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function safeRead() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || null;
  } catch (_) {
    return null;
  }
}

function safeWrite(payload) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {
    /* private mode / quota — silently drop */
  }
}

function isSuppressed() {
  const stored = safeRead();
  if (!stored) return false;
  if (stored.never) return true;
  return typeof stored.until === 'number' && Date.now() < stored.until;
}

function open(popup) {
  if (!popup || !popup.hidden) return;
  popup._lastFocus = document.activeElement;
  popup.hidden = false;
  document.documentElement.classList.add('newsletter-popup-open');
  requestAnimationFrame(() => {
    popup.classList.add('is-visible');
    const dialog = popup.querySelector('[role="dialog"]');
    if (dialog) dialog.focus({ preventScroll: true });
  });
}

function close(popup, { remember = true } = {}) {
  if (!popup || popup.hidden) return;

  if (remember && !Shopify.designMode) {
    const never = popup.querySelector('[data-newsletter-popup-never]');
    if (never && never.checked) {
      safeWrite({ never: true });
    } else {
      const days = parseInt(popup.dataset.dismissDays, 10) || 7;
      safeWrite({ until: Date.now() + days * DAY_MS });
    }
  }

  popup.classList.remove('is-visible');
  document.documentElement.classList.remove('newsletter-popup-open');
  setTimeout(() => {
    popup.hidden = true;
  }, 250);

  if (popup._lastFocus && typeof popup._lastFocus.focus === 'function') {
    popup._lastFocus.focus({ preventScroll: true });
  }
}

function trapFocus(popup, event) {
  const nodes = Array.from(popup.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null
  );
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bind(popup) {
  if (popup.dataset.bound === '1') return;
  popup.dataset.bound = '1';

  popup.querySelectorAll('[data-newsletter-popup-close]').forEach((el) => {
    el.addEventListener('click', () => close(popup));
  });

  popup.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close(popup);
    if (event.key === 'Tab') trapFocus(popup, event);
  });

  // Subscribed → never show again (success message is still rendered after
  // the redirect because the hash forces the popup open).
  if (popup.querySelector('[data-newsletter-popup-success]')) {
    safeWrite({ never: true });
  }

  const formId = popup.dataset.formId;
  const returnedFromSubmit = formId && window.location.hash === `#${formId}`;

  if (Shopify.designMode) return; // editor: driven by section select events

  if (returnedFromSubmit) {
    open(popup);
    return;
  }

  if (popup.hasAttribute('data-disabled') || isSuppressed()) return;

  const delay = (parseInt(popup.dataset.delay, 10) || 0) * 1000;
  popup._timer = setTimeout(() => open(popup), delay);
}

function popupForSection(sectionId) {
  return document.querySelector(`[data-newsletter-popup][data-section-id="${sectionId}"]`);
}

let editorBound = false;
function bindEditorEvents() {
  if (editorBound || !window.Shopify || !Shopify.designMode) return;
  editorBound = true;

  // Settings edits re-render the section (load) without a new select event —
  // keep the freshly rendered popup open so the merchant sees the change.
  ['shopify:section:select', 'shopify:section:load'].forEach((type) => {
    document.addEventListener(type, (event) => {
      const popup = popupForSection(event.detail.sectionId);
      if (popup) open(popup);
    });
  });
  document.addEventListener('shopify:section:deselect', (event) => {
    const popup = popupForSection(event.detail.sectionId);
    if (popup) close(popup, { remember: false });
  });
  document.addEventListener('shopify:section:unload', (event) => {
    const popup = popupForSection(event.detail.sectionId);
    if (popup) {
      clearTimeout(popup._timer);
      document.documentElement.classList.remove('newsletter-popup-open');
    }
  });
}

const NewsletterPopup = {
  init() {
    window.Shopify = window.Shopify || {};
    document.querySelectorAll('[data-newsletter-popup]').forEach(bind);
    bindEditorEvents();
  },

  // Re-open manually, e.g. from a footer link: OccasionNewsletter.open()
  open() {
    const popup = document.querySelector('[data-newsletter-popup]');
    if (popup) open(popup);
  },
};

window.OccasionNewsletter = NewsletterPopup;

export default NewsletterPopup;
