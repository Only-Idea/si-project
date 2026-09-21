export function initFilters() {
  const search = document.querySelector('#product-search');
  const cards = [...document.querySelectorAll('[data-product-card]')];
  const categoryButtons = [...document.querySelectorAll('[data-category]')];
  let selectedCategory = 'all';
  function filterProducts() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      card.hidden = !((selectedCategory === 'all' || card.dataset.productCategory === selectedCategory) && card.textContent.toLowerCase().includes(query));
      if (!card.hidden) visible++;
    });
    document.querySelector('[data-result-count]').textContent = `${visible} item${visible === 1 ? '' : 's'}`;
    document.querySelector('[data-empty-state]').hidden = visible > 0;
  }
  categoryButtons.forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    categoryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterProducts();
  }));
  let searchTimer;
  search?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(filterProducts, 300); });
  document.querySelector('[data-reset-filters]')?.addEventListener('click', () => {
    search.value = '';
    selectedCategory = 'all';
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === 'all')));
    filterProducts();
    search.focus();
  });
  const filterPanel = document.querySelector('.filters');
  const desktop = matchMedia('(min-width: 1024px)');
  if (filterPanel) {
    filterPanel.open = desktop.matches;
    desktop.addEventListener('change', event => { filterPanel.open = event.matches; });
  }
}
