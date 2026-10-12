(() => {
  const forms = document.querySelectorAll('.header-middle__search-form[data-search-url]');

  forms.forEach((form) => {
    const select = form.querySelector('[data-category-select]');
    const defaultAction = form.dataset.searchUrl;

    if (!select || !defaultAction) return;

    form.addEventListener('submit', () => {
      const handle = select.value;

      if (handle) {
        const selected = select.options[select.selectedIndex];
        const collectionUrl = selected?.dataset?.url;
        form.action = collectionUrl || `/collections/${handle}`;
      } else {
        form.action = defaultAction;
      }
    });
  });
})();
