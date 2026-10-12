// Header "Account" dropdown — snippets/header-account-dropdown.liquid.
//
// DOM contract:
//   [data-account-dropdown]            <li> wrapper, gets .is-open
//     > a[aria-expanded]               trigger (still a real link to /account)
//     > .header-account__panel          panel
//
// Behaviour:
//   • mouse: opens on hover, closes 200ms after leaving (so the pointer can
//     cross the gap to the panel)
//   • touch / no-hover devices: first tap opens the panel instead of
//     navigating; a second tap follows the link
//   • keyboard: focus inside keeps it open; Esc closes and returns focus
//   • click outside closes

const BOUND = 'accountBound';
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function bind(root) {
  if (root.dataset[BOUND] === '1') return;
  root.dataset[BOUND] = '1';
  const trigger = root.querySelector(':scope > a');
  const panel = root.querySelector('.header-account__panel');
  if (!trigger || !panel) return;
  let timer = 0;

  const setOpen = (open) => {
    clearTimeout(timer);
    root.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  root.addEventListener('mouseenter', () => { if (canHover()) setOpen(true); });
  root.addEventListener('mouseleave', () => {
    if (!canHover()) return;
    // keep it open while the user is typing in the quick-login form
    if (root.contains(document.activeElement) && document.activeElement.matches('input')) return;
    timer = setTimeout(() => setOpen(false), 200);
  });

  trigger.addEventListener('click', (event) => {
    if (canHover() || root.classList.contains('is-open')) return; // follow the link
    event.preventDefault();
    setOpen(true);
  });

  root.addEventListener('focusin', () => setOpen(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !root.classList.contains('is-open')) return;
    setOpen(false);
    trigger.focus();
  });

  document.addEventListener('click', (event) => {
    if (root.classList.contains('is-open') && !root.contains(event.target)) setOpen(false);
  });
}

export default {
  init() {
    document.querySelectorAll('[data-account-dropdown]').forEach(bind);
  },
};
