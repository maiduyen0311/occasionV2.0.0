// <tm-scroller> — lightweight horizontal carousel built on native scroll-snap.
// Used by the product thumbnails, Related Products and Recently Viewed.
//
// DOM contract:
//   <tm-scroller class="tm-scroller" style="--per-view:5;--per-view-md:3;--per-view-sm:2">
//     <button data-scroller-prev>…</button>
//     <ul data-scroller-track> <li>…</li> … </ul>
//     <button data-scroller-next>…</button>
//   </tm-scroller>
//
// Behaviour:
//   • prev/next scroll by one item (data-step="page" → by a full view)
//   • buttons get [disabled] at either end; host gets .is-scrollable when the
//     track overflows (CSS hides the arrows otherwise)
//   • watches the track for resizes + children changes, so content rendered
//     later (Section Rendering API, client-side fetch) just works
//   • scrollToItem(el) — bring a child into view (product thumbs ↔ variant)
// Defined as a custom element, so it initialises itself whenever it is
// inserted into the DOM (theme editor re-renders included).

class TmScroller extends HTMLElement {
  connectedCallback() {
    if (this.dataset.bound === '1') return;
    this.track = this.querySelector('[data-scroller-track]');
    if (!this.track) return;
    this.dataset.bound = '1';
    this.prevBtn = this.querySelector('[data-scroller-prev]');
    this.nextBtn = this.querySelector('[data-scroller-next]');

    this.update = this.update.bind(this);
    this.prevBtn?.addEventListener('click', () => this.go(-1));
    this.nextBtn?.addEventListener('click', () => this.go(1));

    let raf = 0;
    this.track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(this.update);
    }, { passive: true });

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.update);
      this.resizeObserver.observe(this.track);
    }
    this.mutationObserver = new MutationObserver(this.update);
    this.mutationObserver.observe(this.track, { childList: true });
    this.update();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    delete this.dataset.bound;
  }

  get stepSize() {
    const first = this.track.firstElementChild;
    if (!first) return this.track.clientWidth;
    const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  go(dir) {
    const step = this.stepSize;
    const perView = Math.max(1, Math.round(this.track.clientWidth / step));
    const distance = this.dataset.step === 'page' ? step * perView : step;
    this.track.scrollBy({ left: dir * distance, behavior: 'smooth' });
  }

  scrollToItem(el) {
    if (!el || !this.track.contains(el)) return;
    const trackBox = this.track.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (box.left >= trackBox.left - 1 && box.right <= trackBox.right + 1) return;
    const left = this.track.scrollLeft + (box.left - trackBox.left);
    this.track.scrollTo({ left, behavior: 'smooth' });
  }

  update() {
    const max = this.track.scrollWidth - this.track.clientWidth;
    const scrollable = max > 2;
    this.classList.toggle('is-scrollable', scrollable);
    if (this.prevBtn) this.prevBtn.disabled = !scrollable || this.track.scrollLeft <= 2;
    if (this.nextBtn) this.nextBtn.disabled = !scrollable || this.track.scrollLeft >= max - 2;
  }
}

if (!customElements.get('tm-scroller')) customElements.define('tm-scroller', TmScroller);

export default TmScroller;
