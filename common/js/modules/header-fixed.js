// Keep `--header-section-height` in sync with the rendered height of the
// `.shopify-section-group-header-group.section-header` element so that the
// stacked sticky navigation right beneath it can sit at the correct offset.
//
// The two header sections (header + navigation) are rendered as siblings —
// both have `position: sticky`. Without this offset, both would pin at
// `top: 0` and the navigation would overlap the header on scroll.
//
// Recomputes on:
//   - DOMContentLoaded (initial)
//   - window load (in case fonts/images shifted the height)
//   - window resize
//   - shopify:section:load (Theme Editor re-renders a section)
//   - ResizeObserver on the header element

function getHeaderSection() {
  return document.querySelector(
    '.shopify-section-group-header-group.section-header'
  );
}

function applyHeaderHeight() {
  const header = getHeaderSection();
  // On mobile (≤991.98px) the desktop bars inside the header section are
  // display:none, leaving only `.header-mobile`. The element's measured
  // height still reflects whatever is visible — so the same code works at
  // every breakpoint.
  const h = header ? header.offsetHeight : 0;
  document.documentElement.style.setProperty(
    '--header-section-height',
    h + 'px'
  );
}

const HeaderFixed = {
  apply: applyHeaderHeight,

  init() {
    if (typeof document === 'undefined') return;
    if (document.body && document.body.dataset.headerFixedBound === '1') return;
    if (document.body) document.body.dataset.headerFixedBound = '1';

    applyHeaderHeight();
    window.addEventListener('load', applyHeaderHeight);

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyHeaderHeight, 80);
    });

    document.addEventListener('shopify:section:load', function (e) {
      const t = e && e.target;
      if (!t || t.closest('.shopify-section-group-header-group')) {
        setTimeout(applyHeaderHeight, 50);
      }
    });

    if (typeof ResizeObserver !== 'undefined') {
      const header = getHeaderSection();
      if (header) {
        const ro = new ResizeObserver(function () { applyHeaderHeight(); });
        ro.observe(header);
      }
    }
  },
};

export default HeaderFixed;
