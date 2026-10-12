// Pair a country-flag SVG with each language entry in the locale picker.
// Vanilla DOM — used to depend on jQuery for `$()`, `.data()`, `.prepend()`.

const LANGUAGE_FLAGS = [
  { lang: 'af', country: 'za' },
  { lang: 'sq', country: 'al' },
  { lang: 'ar', country: 'ae' },
  { lang: 'hy', country: 'am' },
  { lang: 'bn', country: 'bd' },
  { lang: 'bs', country: 'ba' },
  { lang: 'ca', country: 'es' },
  { lang: 'hr', country: 'hr' },
  { lang: 'cs', country: 'cz' },
  { lang: 'da', country: 'dk' },
  { lang: 'nl', country: 'nl' },
  { lang: 'en', country: 'en' },
  { lang: 'et', country: 'ee' },
  { lang: 'tl', country: 'ph' },
  { lang: 'fi', country: 'fi' },
  { lang: 'fr', country: 'fr' },
  { lang: 'de', country: 'de' },
  { lang: 'el', country: 'gr' },
  { lang: 'gu', country: 'in' },
  { lang: 'hi', country: 'in' },
  { lang: 'hu', country: 'hu' },
  { lang: 'is', country: 'is' },
  { lang: 'id', country: 'id' },
  { lang: 'it', country: 'it' },
  { lang: 'ja', country: 'jp' },
  { lang: 'jw', country: 'id' },
  { lang: 'km', country: 'kh' },
  { lang: 'ko', country: 'kr' },
  { lang: 'la', country: 'va' },
  { lang: 'lv', country: 'lv' },
  { lang: 'lt', country: 'lt' },
  { lang: 'mk', country: 'mk' },
  { lang: 'ml', country: 'in' },
  { lang: 'mr', country: 'in' },
  { lang: 'my', country: 'mm' },
  { lang: 'ne', country: 'np' },
  { lang: 'no', country: 'no' },
  { lang: 'pl', country: 'pl' },
  { lang: 'pt', country: 'pt' },
  { lang: 'ro', country: 'ro' },
  { lang: 'ru', country: 'ru' },
  { lang: 'sr', country: 'rs' },
  { lang: 'si', country: 'lk' },
  { lang: 'sk', country: 'sk' },
  { lang: 'sl', country: 'si' },
  { lang: 'es', country: 'es' },
  { lang: 'su', country: 'id' },
  { lang: 'sw', country: 'ke' },
  { lang: 'sv', country: 'se' },
  { lang: 'ta', country: 'in' },
  { lang: 'te', country: 'in' },
  { lang: 'th', country: 'th' },
  { lang: 'tr', country: 'tr' },
  { lang: 'uk', country: 'ua' },
  { lang: 'ur', country: 'pk' },
  { lang: 'vi', country: 'vn' },
  { lang: 'cy', country: 'en' },
  { lang: 'xh', country: 'za' },
  { lang: 'yi', country: 'us' },
  { lang: 'zu', country: 'za' },
];

function findFlag(lang) {
  return LANGUAGE_FLAGS.find((f) => f.lang === lang) || null;
}

function buildFlagImg(country, lang) {
  const img = document.createElement('img');
  img.src = `./assets/${country}.svg`;
  img.alt = String(lang || '').toUpperCase();
  img.className = 'svg';
  return img;
}

function prependFlag(target, lang) {
  if (!target || !lang) return;
  const flag = findFlag(lang);
  if (!flag) return;
  target.prepend(buildFlagImg(flag.country, lang));
}

const languageflag = () => {
  if (typeof document === 'undefined') return;

  const button = document.querySelector('.localization-form__button > .flag');
  if (button) {
    const lang = button.getAttribute('data-value');
    if (lang) prependFlag(button, lang);
  }

  const items = document.querySelectorAll('#HeaderLanguageList li');
  items.forEach((li) => {
    const anchor = li.querySelector('a');
    if (!anchor) return;
    const lang = anchor.getAttribute('data-value');
    const flagSlot = anchor.querySelector('.flag');
    if (lang && flagSlot) prependFlag(flagSlot, lang);
  });
};

export { languageflag };
