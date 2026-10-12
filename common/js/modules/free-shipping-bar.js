// Free-shipping progress bar — recomputes whenever the cart changes.
//
// Listens for:
//   - 'tm:cart:update' on document   (manual mutations dispatch this)
//   - 'cart:update'    on document   (Dawn's <cart-drawer> dispatches this)
//   - PJAX-y section reloads via shopify:section:load
//
// On each event, fetches /cart.js once and updates every visible
// `[data-free-shipping]` element with the new % + remaining amount.

function formatMoney(cents) {
  const format = window.moneyFormat || (window.Shopify && window.Shopify.money_format) || '${{amount}}';
  return format.replace(/\{\{\s*amount([a-z_]*)\s*\}\}/gi, function (_, variant) {
    const v = (variant || '').toLowerCase();
    const noDecimals = v.indexOf('no_decimals') >= 0;
    const decimals = noDecimals ? 0 : 2;
    try {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(cents / 100);
    } catch (e) {
      const amount = noDecimals ? Math.round(cents / 100) : (cents / 100).toFixed(2);
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  });
}

function updateBar(bar, totalCents) {
  const threshold = parseInt(bar.dataset.threshold, 10) || 0;
  if (threshold <= 0) return;

  const fillEl = bar.querySelector('[data-fs-fill]');
  const trackEl = bar.querySelector('[data-fs-track]');
  const msgEl = bar.querySelector('[data-fs-message]');
  const remainingEl = bar.querySelector('[data-fs-remaining]');

  const pct = Math.min(100, Math.max(0, Math.round((totalCents / threshold) * 100)));
  const reached = totalCents >= threshold;

  if (fillEl) fillEl.style.width = pct + '%';
  if (trackEl) trackEl.setAttribute('aria-valuenow', String(pct));
  bar.dataset.reached = reached ? 'true' : 'false';

  if (msgEl) {
    if (reached) {
      msgEl.textContent = bar.dataset.msgReached || '';
    } else if (remainingEl) {
      remainingEl.textContent = formatMoney(threshold - totalCents);
    } else {
      // Translated template from Liquid, "[amount]" stands for the remaining money
      msgEl.innerHTML = (bar.dataset.msgRemaining || '[amount]').replace('[amount]', formatMoney(threshold - totalCents));
    }
  }
}

function refreshAll() {
  const bars = document.querySelectorAll('[data-free-shipping]');
  if (!bars.length) return;
  fetch('/cart.js', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((cart) => {
      if (!cart) return;
      bars.forEach((bar) => updateBar(bar, cart.total_price));
    })
    .catch(() => {});
}

const FreeShippingBar = {
  refresh: refreshAll,

  init() {
    if (typeof document === 'undefined') return;
    if (document.body && document.body.dataset.fsBound === '1') return;
    if (document.body) document.body.dataset.fsBound = '1';

    document.addEventListener('tm:cart:update', refreshAll);
    document.addEventListener('cart:update', refreshAll);
    document.addEventListener('shopify:section:load', refreshAll);
  },
};

export default FreeShippingBar;
