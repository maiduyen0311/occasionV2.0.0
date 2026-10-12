// Cart page extras (design/Cart.jpg) — sections/main-cart-footer.liquid.
//
//   • Gift wrap:       [data-gift-wrap-variant] → /cart/add.js, then reload
//   • Coupon code:     [data-cart-coupon] → on checkout, go through
//                      /discount/<code>?redirect=/checkout so the code applies
//   • Shipping estimate: [data-shipping-estimate] — province list from the
//                      country <option data-provinces> (all_country_option_tags)
//                      and rates from /cart/shipping_rates.json
//
// Quantity / remove behaviour stays with Dawn's assets/cart.js.

const money = (amount, currency) => {
  try {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency }).format(Number(amount));
  } catch (_) {
    return `${amount} ${currency}`;
  }
};

function bindGiftWrap(root) {
  root.querySelectorAll('[data-gift-wrap-variant]').forEach((btn) => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const resp = await fetch(`${window.routes?.cart_add_url || '/cart/add'}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: Number(btn.dataset.giftWrapVariant), quantity: 1 }),
        });
        if (!resp.ok) throw new Error('add failed');
        window.location.reload();
      } catch (_) {
        btn.disabled = false;
      }
    });
  });
}

function bindCoupon() {
  const form = document.getElementById('cart');
  const coupon = document.querySelector('[data-cart-coupon]');
  if (!form || !coupon || form.dataset.couponBound === '1') return;
  form.dataset.couponBound = '1';

  form.addEventListener('submit', (event) => {
    const code = coupon.value.trim();
    // Only the checkout submit; runs after native validation (terms checkbox)
    if (!code || event.submitter?.name !== 'checkout') return;
    event.preventDefault();
    window.location.href = `/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent('/checkout')}`;
  });
}

// ---- Shared shipping-estimate helpers (also used by mini-cart.js) ----

// Fill a province <select> from the chosen country <option data-provinces>
export function fillProvinces(country, province) {
  const opt = country.options[country.selectedIndex];
  let list = [];
  try {
    list = JSON.parse(opt?.dataset.provinces || '[]');
  } catch (_) {
    list = [];
  }
  province.innerHTML = '';
  province.disabled = list.length === 0;
  province.hidden = list.length === 0;
  list.forEach(([value, label]) => province.add(new Option(label, value)));
}

// Preselect the visitor's country (data-default = country name) once
export function preselectCountry(country) {
  const wanted = country.dataset.default;
  if (!wanted || country.dataset.preselected === '1') return;
  country.dataset.preselected = '1';
  const match = [...country.options].find((o) => o.value === wanted || o.textContent.trim() === wanted);
  if (match) country.value = match.value;
}

// Fetch /cart/shipping_rates.json and return ready-to-insert HTML
export async function estimateShippingHtml(country, province, zip, noRatesText) {
  const params = new URLSearchParams();
  params.set('shipping_address[country]', country.value);
  if (province && !province.disabled) params.set('shipping_address[province]', province.value);
  params.set('shipping_address[zip]', zip?.value.trim() || '');
  try {
    const resp = await fetch(`/cart/shipping_rates.json?${params}`, { headers: { Accept: 'application/json' } });
    const data = await resp.json();
    if (!resp.ok) {
      const msg = Object.entries(data).map(([k, v]) => `${k} ${[].concat(v).join(', ')}`).join('. ');
      return `<p class="is-error">${msg}</p>`;
    }
    const rates = data.shipping_rates || [];
    if (!rates.length) return `<p>${noRatesText || 'No shipping rates for this address.'}</p>`;
    return `<ul class="list-unstyled">${rates
      .map((r) => `<li><span>${r.name}</span><strong>${Number(r.price) === 0 ? 'Free' : money(r.price, r.currency)}</strong></li>`)
      .join('')}</ul>`;
  } catch (_) {
    return '<p class="is-error">Could not calculate shipping. Please try again.</p>';
  }
}

function bindShippingEstimate(box) {
  if (!box || box.dataset.bound === '1') return;
  box.dataset.bound = '1';
  const country = box.querySelector('[data-estimate-country]');
  const province = box.querySelector('[data-estimate-province]');
  const zip = box.querySelector('[data-estimate-zip]');
  const submit = box.querySelector('[data-estimate-submit]');
  const result = box.querySelector('[data-estimate-result]');
  if (!country || !province || !submit || !result) return;

  preselectCountry(country);
  const sync = () => {
    fillProvinces(country, province);
    province.closest('.col-12')?.toggleAttribute('hidden', province.disabled);
  };
  sync();
  country.addEventListener('change', sync);

  submit.addEventListener('click', async () => {
    result.textContent = '…';
    result.innerHTML = await estimateShippingHtml(country, province, zip, box.dataset.noRates);
  });
}

const CartPage = {
  init() {
    const footer = document.getElementById('main-cart-footer');
    if (!footer) return;
    bindGiftWrap(footer);
    bindCoupon();
    bindShippingEstimate(footer.querySelector('[data-shipping-estimate]'));
  },
};

export default CartPage;
