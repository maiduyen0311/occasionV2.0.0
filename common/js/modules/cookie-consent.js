// Cookie consent banner — vanilla, idempotent.
//
// Stores choice in localStorage under `tm_cookie_consent`:
//   { v: 1, status: 'accepted' | 'rejected' | 'custom', prefs: { analytics, marketing }, ts }
//
// Public API on window.OccasionConsent:
//   has(category)     -> boolean (true if consent given for that pref)
//   getStatus()       -> 'accepted' | 'rejected' | 'custom' | null
//   open()            -> re-open banner (for "Cookie preferences" footer link)
//
// Integrates with Shopify Customer Privacy API when present so analytics only
// fire after explicit consent.

const STORAGE_KEY = 'tm_cookie_consent';
const STORAGE_VERSION = 1;

function safeRead() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== STORAGE_VERSION) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function safeWrite(payload) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...payload, v: STORAGE_VERSION, ts: Date.now() })
    );
  } catch (_) {
    /* private mode / quota — silently drop */
  }
}

function applyShopifyPrivacy(prefs) {
  // Shopify Customer Privacy API: window.Shopify.customerPrivacy
  // https://shopify.dev/docs/api/customer-privacy
  try {
    const cp = window.Shopify && window.Shopify.customerPrivacy;
    if (!cp || typeof cp.setTrackingConsent !== 'function') return;
    cp.setTrackingConsent(
      {
        analytics: !!prefs.analytics,
        marketing: !!prefs.marketing,
        preferences: !!prefs.analytics,
        sale_of_data: !!prefs.marketing,
      },
      () => {}
    );
  } catch (_) {}
}

function show(banner) {
  if (!banner) return;
  banner.hidden = false;
  // Allow transition-in
  requestAnimationFrame(() => banner.classList.add('is-visible'));
}

function hide(banner) {
  if (!banner) return;
  banner.classList.remove('is-visible');
  setTimeout(() => {
    banner.hidden = true;
  }, 250);
}

function bindBanner(banner) {
  if (!banner || banner.dataset.cookieBound === '1') return;
  banner.dataset.cookieBound = '1';

  const detailsEl = banner.querySelector('[data-cookie-details]');
  const customizeBtn = banner.querySelector('[data-cookie-customize]');
  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  const rejectBtn = banner.querySelector('[data-cookie-reject]');

  function readPrefs() {
    const prefs = { analytics: true, marketing: true };
    banner.querySelectorAll('[data-cookie-pref]').forEach((input) => {
      prefs[input.getAttribute('data-cookie-pref')] = !!input.checked;
    });
    return prefs;
  }

  function finalize(status, prefs) {
    safeWrite({ status, prefs });
    applyShopifyPrivacy(prefs);
    document.dispatchEvent(
      new CustomEvent('tm:consent:change', { detail: { status, prefs } })
    );
    hide(banner);
  }

  if (customizeBtn && detailsEl) {
    customizeBtn.addEventListener('click', () => {
      const open = detailsEl.hidden;
      detailsEl.hidden = !open;
      customizeBtn.setAttribute('aria-expanded', String(open));
    });
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () =>
      finalize('accepted', { analytics: true, marketing: true })
    );
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () =>
      finalize('rejected', { analytics: false, marketing: false })
    );
  }

  // "Customise & save" — when details panel is open, the Accept button doubles
  // as a "Save preferences" button. We honor the checkboxes if details visible.
  if (acceptBtn && detailsEl) {
    acceptBtn.addEventListener(
      'click',
      (e) => {
        if (!detailsEl.hidden) {
          // Re-finalize using whatever the user toggled
          e.stopImmediatePropagation();
          finalize('custom', readPrefs());
        }
      },
      true
    );
  }
}

const CookieConsent = {
  STORAGE_KEY,

  has(category) {
    const stored = safeRead();
    if (!stored) return false;
    if (stored.status === 'rejected') return false;
    if (stored.status === 'accepted') return true;
    return !!(stored.prefs && stored.prefs[category]);
  },

  getStatus() {
    const stored = safeRead();
    return stored ? stored.status : null;
  },

  open() {
    const banner = document.getElementById('CookieBanner');
    if (banner) show(banner);
  },

  init() {
    const banner = document.getElementById('CookieBanner');
    if (!banner) return;
    bindBanner(banner);

    const stored = safeRead();
    if (!stored) {
      // Show after a short delay so it doesn't fight with the hero LCP.
      setTimeout(() => show(banner), 800);
    } else {
      // Re-apply previously stored prefs to Customer Privacy API on each load.
      applyShopifyPrivacy(stored.prefs || {});
    }

    // Footer / settings link can call this to re-open the banner.
    document.querySelectorAll('[data-cookie-open]').forEach((el) => {
      if (el.dataset.cookieOpenBound === '1') return;
      el.dataset.cookieOpenBound = '1';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        show(banner);
      });
    });

    window.OccasionConsent = CookieConsent;
  },
};

export default CookieConsent;
