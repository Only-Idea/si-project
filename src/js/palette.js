export function initPalette() {
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
}
