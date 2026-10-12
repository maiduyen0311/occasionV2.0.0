// Home hero slider — vanilla replacement for the former Slick implementation.
//
// Why custom (not Swiper / Splide): the only carousel left in the theme is
// `.home-hero__slider`. A single-row, single-visible, autoplay+dots+arrows
// slider is ~120 lines of vanilla JS — pulling in a library would cost more
// in bundle size than it saves in code. The former `.slideshow` selector
// belonged to Dawn's own `<slideshow-component>` Web Component (which has
// its own JS); our jQuery init was double-binding it. The former `.carousel`
// selector wasn't used in any Liquid markup. Both are now dropped.
//
// DOM contract (sections/home-hero.liquid):
//   .home-hero__slider                container, data-autoplay/data-speed
//     .home-hero__slide                each slide
//   .home-hero__dots                  empty container, JS fills with .home-hero__dot
//   .home-hero__arrow--prev/--next    buttons (already in markup)
//
// State classes:
//   .home-hero__slider.is-ready       set after first paint with > 0 slides
//   .home-hero__slide.is-active       on the visible slide
//   .home-hero__dot.is-active         on the dot matching the current slide

const SLIDER_SELECTOR = '.home-hero__slider';
const BOUND_FLAG = 'sliderBound';

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function readAutoplay(slider) {
  // tolerate "true" string from Liquid data attributes
  const raw = slider.dataset.autoplay;
  return raw === 'true' || raw === '1';
}

function createDots(host, count, onClick) {
  host.innerHTML = '';
  const dots = [];
  for (let i = 0; i < count; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'home-hero__dot';
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    btn.addEventListener('click', () => onClick(i));
    host.appendChild(btn);
    dots.push(btn);
  }
  return dots;
}

function initSlider(slider) {
  if (slider.dataset[BOUND_FLAG] === '1') return;
  const slides = Array.from(slider.children).filter((el) =>
    el.classList.contains('home-hero__slide')
  );
  if (!slides.length) return;

  slider.dataset[BOUND_FLAG] = '1';

  const main = slider.closest('.home-hero__main');
  const dotsHost = main ? main.querySelector('.home-hero__dots') : null;
  const prevBtn = main ? main.querySelector('.home-hero__arrow--prev') : null;
  const nextBtn = main ? main.querySelector('.home-hero__arrow--next') : null;

  // Lay out slides side-by-side via flex; CSS does the rest.
  slider.classList.add('is-ready');
  slides.forEach((slide) => {
    slide.style.flex = '0 0 100%';
    slide.style.maxWidth = '100%';
  });

  const speed = num(slider.dataset.speed, 5) * 1000;
  const autoplay = readAutoplay(slider) && slides.length > 1;
  const infinite = slides.length > 1;

  let current = 0;
  let autoplayTimer = null;
  let dots = [];

  const apply = () => {
    slider.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      slide.inert = i !== current; // hidden slides: links not focusable either
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  };

  const goTo = (index) => {
    if (slides.length < 2) return;
    if (infinite) {
      current = ((index % slides.length) + slides.length) % slides.length;
    } else {
      current = Math.max(0, Math.min(slides.length - 1, index));
    }
    apply();
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };
  const startAutoplay = () => {
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = setInterval(next, speed);
  };

  if (slides.length > 1) {
    slider.style.transition = 'transform 0.5s ease';
    if (dotsHost) dots = createDots(dotsHost, slides.length, goTo);
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
  } else {
    // Single slide: hide controls + dots so they don't render dead UI.
    if (dotsHost) dotsHost.innerHTML = '';
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
  }

  apply();
  startAutoplay();
}

const initAllSliders = () => {
  document.querySelectorAll(SLIDER_SELECTOR).forEach(initSlider);
};

const refreshAllSliders = () => {
  // Vanilla impl uses CSS transforms; no layout-recompute hook needed like Slick's.
};

export { initAllSliders, refreshAllSliders };
