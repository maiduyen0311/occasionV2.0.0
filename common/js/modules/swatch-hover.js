// Swatch hover module — preview variant image on swatch hover/tap.
// See SPEC §5.7. Vanilla JS, idempotent, re-init safe on shopify:section:load.
//
// DOM contract (set up by card-product.liquid):
//   .card-product, .card-wrapper, or .product-card-wrapper  — card root
//   [data-card-image]                                       — wrapping element containing the <img>
//   [data-variant-image="<image_url>"]                      — element acting as swatch trigger
//
// Behavior:
//   Desktop (no touch): mouseenter swatch -> swap img.src to data-variant-image.
//                       mouseleave swatch -> revert to cached original.
//   Touch: touchstart swatch -> permanent switch (no revert) + update cached "default".
//
// Edge cases:
//   - No image element inside card             -> skip card silently
//   - Swatch without data-variant-image        -> skip swatch silently
//   - Same swatch already bound (data flag)    -> skip
//   - Image swapped via mouseenter then card receives section:load re-init -> still safe.

const CARD_SELECTOR =
  '.card-product, .product-card-wrapper, .card-wrapper, [data-card-product]';
// Bind ALL swatch dots — even ones without a variant image — so every dot
// is clickable (prevents card-link navigation + shows is-active feedback).
// Swatches with data-variant-image additionally swap the card image.
const SWATCH_SELECTOR = '.card-product__swatch-item';
const BOUND_FLAG = 'swatchHoverBound';

const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));

function findCardImage(card) {
  const wrap = card.querySelector('[data-card-image]');
  if (wrap) {
    const img = wrap.querySelector('img');
    if (img) return img;
  }
  // Fallback: first <img> inside .card__media or any <img> in card.
  const fallback =
    card.querySelector('.card__media img') || card.querySelector('img');
  return fallback || null;
}

function cacheOriginal(img) {
  if (img.dataset.swatchOrigSrc) return;
  img.dataset.swatchOrigSrc = img.getAttribute('src') || '';
  const srcset = img.getAttribute('srcset');
  if (srcset) img.dataset.swatchOrigSrcset = srcset;
}

function applyImage(img, url) {
  if (!url) return;
  img.setAttribute('src', url);
  // Variant URL is a single-resolution Shopify image_url — clear srcset so
  // the browser doesn't pick a different (cached original) source.
  img.removeAttribute('srcset');
}

function revertImage(img) {
  const orig = img.dataset.swatchOrigSrc;
  if (orig) {
    img.setAttribute('src', orig);
  }
  if (img.dataset.swatchOrigSrcset) {
    img.setAttribute('srcset', img.dataset.swatchOrigSrcset);
  }
}

function setPermanent(swatch, img, url) {
  cacheOriginal(img);
  applyImage(img, url);
  // Update cached default so future hover reverts land here, not the original.
  img.dataset.swatchOrigSrc = url;
  delete img.dataset.swatchOrigSrcset;
  setActive(swatch);
  applyVariantInfo(swatch);
}

function setActive(swatch) {
  const siblings = swatch.parentElement
    ? swatch.parentElement.querySelectorAll('.card-product__swatch-item')
    : [];
  siblings.forEach((s) => s.classList.toggle('is-active', s === swatch));
}

// Update the per-variant info on the card (price, compare-at, sale %, badge,
// availability) using data-variant-* attributes the Liquid layer emits.
// Falls back to cached defaults from the first init when the clicked swatch
// has no variant info (so other dots can still "reset" to product defaults).
function cacheCardDefaults(card) {
  if (card.dataset.swatchDefaultsCached === '1') return;
  card.dataset.swatchDefaultsCached = '1';

  const priceWrap = card.querySelector('.price');
  if (priceWrap) {
    card.dataset.swatchPriceClasses = priceWrap.className;
  }
  const reg = card.querySelector('.price__regular .price-item--regular');
  if (reg) card.dataset.swatchDefaultPrice = reg.textContent.trim();
  const saleEl = card.querySelector('.price__sale .price-item--sale');
  if (saleEl) card.dataset.swatchDefaultSale = saleEl.textContent.trim();
  const compareEl = card.querySelector('s.price-item, .price__sale s.price-item--regular');
  if (compareEl) card.dataset.swatchDefaultCompare = compareEl.textContent.trim();
  const badge = card.querySelector('.card-product__badge.badge--sale');
  if (badge) card.dataset.swatchDefaultBadge = badge.textContent.trim();
}

function applyVariantInfo(swatch) {
  const card =
    swatch.closest('.card-wrapper') ||
    swatch.closest('.product-card-wrapper') ||
    swatch.closest('.card-product') ||
    swatch.closest('[data-card-product]');
  if (!card) return;
  cacheCardDefaults(card);

  const price = swatch.getAttribute('data-variant-price') || card.dataset.swatchDefaultPrice || '';
  const compare = swatch.getAttribute('data-variant-compare') || '';
  const pct = swatch.getAttribute('data-variant-pct') || '';
  const available = swatch.getAttribute('data-variant-available');

  // Update price text in both regular + sale layouts (Dawn renders both,
  // CSS toggles visibility via `.price--on-sale` / `.price--sold-out`).
  const regularEls = card.querySelectorAll(
    '.price__regular .price-item--regular, .price__sale .price-item--sale'
  );
  regularEls.forEach((el) => { if (price) el.textContent = price; });

  // Compare-at strikethrough.
  const compareEls = card.querySelectorAll('s.price-item');
  compareEls.forEach((el) => {
    if (compare) el.textContent = compare;
  });

  // Toggle wrapper state classes.
  const priceWrap = card.querySelector('.price');
  if (priceWrap) {
    priceWrap.classList.toggle('price--on-sale', !!compare);
    if (available === 'false') {
      priceWrap.classList.add('price--sold-out');
    } else if (available === 'true') {
      priceWrap.classList.remove('price--sold-out');
    }
  }

  // Sale circle badge (-XX%): update existing or inject for variants where
  // product itself isn't on sale but THIS variant is.
  let saleBadge = card.querySelector('.card-product__badge.badge--sale');
  if (pct) {
    if (!saleBadge) {
      const mediaWrap = card.querySelector('.card__media');
      if (mediaWrap) {
        saleBadge = document.createElement('span');
        saleBadge.className = 'card-product__badge badge--sale';
        saleBadge.setAttribute('aria-label', window.tmStrings?.onSale || 'Sale');
        // Insert at start so it's above the image like the Liquid version.
        mediaWrap.insertBefore(saleBadge, mediaWrap.firstChild);
      }
    }
    if (saleBadge) {
      saleBadge.textContent = pct;
      saleBadge.style.display = '';
    }
  } else if (saleBadge) {
    saleBadge.style.display = 'none';
  }
}

function bindSwatch(swatch, img) {
  if (swatch.dataset[BOUND_FLAG] === '1') return;
  swatch.dataset[BOUND_FLAG] = '1';
  const url = swatch.getAttribute('data-variant-image');

  // Make the <span> focusable + announce as button for screen readers / keyboard.
  if (!swatch.hasAttribute('tabindex')) swatch.setAttribute('tabindex', '0');
  if (!swatch.hasAttribute('role')) swatch.setAttribute('role', 'button');

  // Click — bind regardless of data-variant-image so EVERY swatch is
  // interactive (prevents navigation + visual is-active feedback). The
  // image only swaps when this swatch has a configured variant image.
  swatch.addEventListener('click', (e) => {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (url) {
      setPermanent(swatch, img, url);
    } else {
      setActive(swatch);
      applyVariantInfo(swatch);
    }
  });

  // Keyboard accessibility — Enter/Space commits like click.
  swatch.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (url) {
      setPermanent(swatch, img, url);
    } else {
      setActive(swatch);
      applyVariantInfo(swatch);
    }
  });

  if (!url) return;  // No hover preview if there's no variant image to show.

  if (isTouchDevice) {
    swatch.addEventListener(
      'touchstart',
      () => setPermanent(swatch, img, url),
      { passive: true }
    );
  } else {
    // Desktop preview on hover, revert on leave.
    swatch.addEventListener('mouseenter', () => {
      cacheOriginal(img);
      applyImage(img, url);
    });
    swatch.addEventListener('mouseleave', () => {
      revertImage(img);
    });
    swatch.addEventListener('focus', () => {
      cacheOriginal(img);
      applyImage(img, url);
    });
    swatch.addEventListener('blur', () => {
      revertImage(img);
    });
  }
}

const SwatchHover = {
  init() {
    if (typeof document === 'undefined') return;
    const cards = document.querySelectorAll(CARD_SELECTOR);
    cards.forEach((card) => {
      const swatches = card.querySelectorAll(SWATCH_SELECTOR);
      if (!swatches.length) return;
      const img = findCardImage(card);
      if (!img) return;
      swatches.forEach((swatch) => bindSwatch(swatch, img));
    });
  },
};

export default SwatchHover;
