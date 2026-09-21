/* Phase 1 interaction prototype. No network requests or form submissions. */
(() => {
  const palettes = [
    { id: 'blue', name: 'Studio Blue', color: '#0066cc' },
    { id: 'sage', name: 'Soft Sage', color: '#426b55' },
    { id: 'clay', name: 'Warm Clay', color: '#a34e35' }
  ];
  const paletteBar = document.createElement('aside');
  paletteBar.className = 'palette-bar';
  paletteBar.setAttribute('aria-label', 'Design color options');
  paletteBar.innerHTML = `<div class="container palette-bar-inner"><div class="palette-caption"><strong>Color studies</strong><span>One design. Three points of view.</span></div><div class="palette-options" role="group" aria-label="Choose a color palette">${palettes.map(palette => `<button class="palette-option" data-palette-option="${palette.id}" style="--option:${palette.color}" aria-pressed="false">${palette.name}</button>`).join('')}</div></div>`;
  document.querySelector('.site-header').after(paletteBar);
  function selectPalette(id, updateUrl = false) {
    document.documentElement.dataset.palette = id;
    paletteBar.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paletteOption === id)));
    try { localStorage.setItem('si-design-palette', id); } catch { /* Preview works without storage. */ }
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('palette', id);
      try { history.replaceState(null, '', url); } catch { /* Local-file previews may restrict history. */ }
    }
    // Preserve the selected direction on page links, including local-file previews.
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (raw.startsWith('#')) return;
      const url = new URL(raw, location.href);
      if (url.origin === location.origin && url.pathname.endsWith('.html')) {
        url.searchParams.set('palette', link.dataset.fixedPalette || id);
        link.href = url.href;
      }
    });
  }
  selectPalette(document.documentElement.dataset.palette || 'blue');
  paletteBar.addEventListener('click', event => {
    const button = event.target.closest('[data-palette-option]');
    if (button) selectPalette(button.dataset.paletteOption, true);
  });
  const navigation = document.querySelector('#navigation');
  const menu = document.querySelector('.menu-toggle');
  function closeMenu(restoreFocus = false) {
    navigation?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true' && !document.querySelector('dialog[open]')) closeMenu(true);
  });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const contact = document.createElement('dialog');
  contact.className = 'contact-dialog';
  contact.setAttribute('aria-labelledby', 'contact-title');
  contact.innerHTML = `<div class="dialog-top"><p class="eyebrow">Your next idea starts here</p><button class="dialog-close" aria-label="Close contact preview" autofocus>×</button></div><div class="dialog-copy"><h2 id="contact-title">Let’s give it shape.</h2><p>Tell us about the object you have in mind, how you’ll use it, and the finish you’re looking for.</p><p class="note">This is a design preview. SI 3D PROJECT’s public contact details and enquiry channel will be connected before launch. No enquiry can be sent from this preview.</p><button class="button secondary dialog-dismiss">Keep exploring <span aria-hidden="true">→</span></button></div>`;
  document.body.append(contact);
  let contactReturnFocus;
  document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
    contactReturnFocus = button;
    contact.showModal();
  }));
  contact.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => contact.close()));
  contact.addEventListener('close', () => contactReturnFocus?.focus());

  const productDialog = document.querySelector('#product-dialog');
  const galleryPhotos = [
    ['04', 'Front view', 'Orange masonry line holder, front view on white'],
    ['06', 'Top view', 'Top view showing the rod opening, steel screw, and line guide'],
    ['01', 'On the job', 'Orange line holder mounted on a reinforcing rod beside paving edges'],
    ['02', 'Installed detail', 'Angled view of the installed holder guiding a pink masonry line'],
    ['03', 'Line alignment', 'View from above of the mounted holder and masonry line'],
    ['05', 'Front detail', 'Front view of the orange holder and black adjustment knob on a tabletop'],
    ['07', 'Clamp detail', 'Top view of the holder with its steel screw and circular rod opening'],
    ['08', 'Side angle', 'Side angle showing the toothed line guide and clamping mechanism'],
    ['09', 'Our signature', 'Underside of the orange holder with the SI 3D PROJECT logo']
  ];
  const thumbnailGroup = productDialog?.querySelector('.gallery-thumbnails');
  function selectGalleryPhoto(index) {
    if (!thumbnailGroup) return;
    const [file, caption, alt] = galleryPhotos[index];
    const src = `../assets/images/line-holder/photo-${file}.jpg`;
    const mainImage = productDialog.querySelector('[data-gallery-image]');
    mainImage.src = src;
    mainImage.alt = alt;
    productDialog.querySelector('[data-gallery-caption]').textContent = `${caption} · ${index + 1} / ${galleryPhotos.length}`;
    productDialog.querySelector('[data-gallery-original]').href = src;
    thumbnailGroup.querySelectorAll('button').forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
  }
  if (thumbnailGroup) {
    galleryPhotos.forEach(([file, caption], index) => {
      const button = document.createElement('button');
      button.className = 'gallery-thumbnail';
      button.setAttribute('aria-label', `Show photo ${index + 1}: ${caption}`);
      button.setAttribute('aria-pressed', String(index === 0));
      const image = document.createElement('img');
      image.src = `../assets/images/line-holder/photo-${file}.jpg`;
      image.alt = '';
      image.width = 1080;
      image.height = 1440;
      button.append(image);
      button.addEventListener('click', () => selectGalleryPhoto(index));
      thumbnailGroup.append(button);
    });
  }
  // Keep focus on page controls rather than cycling into browser chrome.
  [contact, productDialog].filter(Boolean).forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]')].filter(control => control.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });
  const concepts = {
    'line-holder': { name: 'Masonry line holder', description: 'Keep your guide line in position for paving and brickwork. The orange 3D-printed holder clamps onto a rod with a hand-tightened adjustment knob.', category: 'SI 3D PROJECT / Tools', note: 'Printed in ABS with steel clamping hardware. Includes one holder and an M8 screw with adjustment knob.' },
    finish: { name: 'Finish palette', description: 'An exploration of color and texture, from quiet neutrals to vivid accents. A palette to inspire your next object.', category: 'Finishes / Color study', note: 'Illustrative color study. Real material and color availability will be confirmed per product.' },
    custom: { name: 'Your next idea', description: 'A starting point for your own project. Explore the kind of form, function, and finish you would like to create.', category: 'Custom / Project concept', note: 'Custom-project placeholder. Feasibility, specifications, pricing, and lead time require an individual review.' }
  };
  let productReturnFocus;
  function openConcept(key, trigger) {
    const concept = concepts[key];
    if (!productDialog || !concept) return;
    productReturnFocus = trigger;
    productDialog.querySelector('#product-title').textContent = concept.name;
    productDialog.querySelector('[data-product-category]').textContent = concept.category;
    productDialog.querySelector('[data-product-description]').textContent = concept.description;
    productDialog.querySelector('[data-product-note]').textContent = concept.note;
    productDialog.querySelectorAll('[data-concept-art]').forEach(art => { art.hidden = art.dataset.conceptArt !== key; });
    const isProduct = key === 'line-holder';
    productDialog.querySelectorAll('[data-concept-only]').forEach(element => { element.hidden = isProduct; });
    productDialog.querySelector('[data-real-product]').hidden = !isProduct;
    if (isProduct) selectGalleryPhoto(0);
    productDialog.querySelectorAll('.swatch').forEach((swatch, index) => swatch.setAttribute('aria-pressed', String(index === 0)));
    productDialog.querySelector('[data-finish-label]').textContent = 'Selected finish: Soft white';
    productDialog.showModal();
  }
  document.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', () => openConcept(button.dataset.concept, button)));
  productDialog?.querySelector('.dialog-close').addEventListener('click', () => productDialog.close());
  productDialog?.addEventListener('close', () => productReturnFocus?.focus());
  document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    const group = button.closest('.swatch-group');
    group.querySelectorAll('.swatch').forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch === button)));
    group.querySelector('[data-finish-label]').textContent = `Selected finish: ${button.dataset.finish}`;
  }));

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
  const requestedConcept = new URLSearchParams(location.search).get('concept');
  if (requestedConcept && concepts[requestedConcept]) openConcept(requestedConcept, document.querySelector(`[data-concept="${requestedConcept}"]`));
})();
