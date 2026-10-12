(() => {
  const blocks = document.querySelectorAll('[data-header-categories]');

  blocks.forEach((block) => {
    const toggle = block.querySelector('[data-categories-toggle]');
    const panel = block.querySelector('[data-categories-panel]');
    if (!toggle || !panel) return;

    const sidebarList = block.querySelector('[data-categories-sidebar-list]');
    const moreBtn = block.querySelector('[data-categories-more]');
    const sidebarItems = block.querySelectorAll('[data-mega-sidebar-item]');
    const flyouts = block.querySelectorAll('[data-mega-flyout]');

    const isCoarse =
      window.matchMedia && window.matchMedia('(hover: none)').matches;

    let closeTimer;

    const resetSidebarMore = () => {
      if (!sidebarList || !moreBtn) return;
      sidebarList.classList.remove('is-expanded');
      moreBtn.setAttribute('aria-expanded', 'false');
      const labelEl = moreBtn.querySelector('[data-categories-more-label]');
      const iconPlus = moreBtn.querySelector('[data-categories-more-icon-plus]');
      const iconMinus = moreBtn.querySelector('[data-categories-more-icon-minus]');
      if (labelEl) labelEl.textContent = moreBtn.dataset.moreLabel || 'More';
      if (iconPlus) iconPlus.hidden = false;
      if (iconMinus) iconMinus.hidden = true;
    };

    if (moreBtn && sidebarList) {
      const labelEl = moreBtn.querySelector('[data-categories-more-label]');
      const iconPlus = moreBtn.querySelector('[data-categories-more-icon-plus]');
      const iconMinus = moreBtn.querySelector('[data-categories-more-icon-minus]');

      moreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const expanded = sidebarList.classList.toggle('is-expanded');
        moreBtn.setAttribute('aria-expanded', String(expanded));
        if (labelEl) {
          labelEl.textContent = expanded
            ? moreBtn.dataset.lessLabel || 'Less'
            : moreBtn.dataset.moreLabel || 'More';
        }
        if (iconPlus) iconPlus.hidden = expanded;
        if (iconMinus) iconMinus.hidden = !expanded;
      });
    }

    const activateFlyout = (index) => {
      const idx = Number(index);
      flyouts.forEach((flyout) => {
        const match = Number(flyout.dataset.megaIndex) === idx;
        flyout.hidden = !match;
        flyout.classList.toggle('is-active', match);
      });
      sidebarItems.forEach((item) => {
        const match = Number(item.dataset.megaIndex) === idx;
        item.classList.toggle('is-active', match);
      });
    };

    const open = () => {
      clearTimeout(closeTimer);
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      if (flyouts.length > 0) {
        const first = flyouts[0].dataset.megaIndex;
        activateFlyout(first);
      }
    };

    const close = () => {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      sidebarItems.forEach((item) => item.classList.remove('is-active'));
      resetSidebarMore();
    };

    block.openPanel = open;
    block.closePanel = close;

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      panel.hasAttribute('hidden') ? open() : close();
    });

    sidebarItems.forEach((item) => {
      const index = item.dataset.megaIndex;
      item.addEventListener('mouseenter', () => activateFlyout(index));
      item.addEventListener('focusin', () => activateFlyout(index));
    });

    if (!isCoarse) {
      block.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        open();
      });
      block.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(close, 220);
      });
    }

    document.addEventListener('click', (event) => {
      if (!block.contains(event.target)) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && !panel.hasAttribute('hidden')) {
        close();
        toggle.focus();
      }
    });
  });
})();
