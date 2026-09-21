/* Prepared photographs: only the selected image changes, never a CSS tint. */
(() => {
  document.querySelectorAll('[data-color-preview]').forEach(viewer => {
    const images = [...viewer.querySelectorAll('[data-color-image]')];
    const buttons = [...viewer.querySelectorAll('[data-product-color]')];
    const label = viewer.querySelector('[data-color-label]');
    const status = viewer.querySelector('[data-color-status]');
    const viewButtons = [...viewer.querySelectorAll('[data-product-view]')];
    const stage = viewer.querySelector('.color-stage');
    const base = new URL('.', images[0].src);
    images.forEach(image => { image.dataset.view = 'studio'; });
    let request = 0;
    let requestedColor = 'Green';
    let requestedView = 'studio';

    function getImage(color, view) {
      let image = images.find(item => item.dataset.colorImage === color && item.dataset.view === view);
      if (!image) {
        image = new Image();
        image.dataset.colorImage = color;
        image.dataset.view = view;
        image.className = view === 'cinematic' ? 'color-cinematic' : 'color-cutout';
        image.alt = `${color} masonry line holder, ${view} view, with black knob and silver screw`;
        image.setAttribute('aria-hidden', 'true');
        image.src = new URL(`${view}/${color.toLowerCase()}.png`, base).href;
        stage.append(image);
        images.push(image);
      }
      return image;
    }

    const preload = () => images.forEach(image => { image.loading = 'eager'; });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          preload();
          observer.disconnect();
        }
      }, { rootMargin: '500px' });
      observer.observe(viewer);
    } else preload();

    async function select() {
      const currentRequest = ++request;
      const color = requestedColor;
      const view = requestedView;
      const target = getImage(color, view);
      status.textContent = `Loading ${color.toLowerCase()} ${view} view…`;
      target.loading = 'eager';
      if (target.complete && !target.naturalWidth) target.src = target.src;
      try {
        await target.decode();
        if (currentRequest !== request) return;
        images.forEach(image => {
          const selected = image === target;
          image.classList.toggle('is-selected', selected);
          image.setAttribute('aria-hidden', String(!selected));
        });
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.productColor === color)));
        viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.productView === view)));
        const button = buttons.find(item => item.dataset.productColor === color);
        viewer.dataset.view = view;
        label.textContent = `${color} · ${button.dataset.hex} · ${view[0].toUpperCase() + view.slice(1)}`;
        status.textContent = '';
        // Warm only the current view's colors, keeping the initial download small.
        buttons.forEach(item => { getImage(item.dataset.productColor, view).loading = 'eager'; });
      } catch {
        if (currentRequest === request) {
          requestedColor = buttons.find(item => item.getAttribute('aria-pressed') === 'true').dataset.productColor;
          requestedView = viewButtons.find(item => item.getAttribute('aria-pressed') === 'true').dataset.productView;
          status.textContent = 'This image could not load. Please try again.';
        }
      }
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      requestedColor = button.dataset.productColor;
      select();
    }));
    viewButtons.forEach(button => button.addEventListener('click', () => {
      requestedView = button.dataset.productView;
      select();
    }));
  });
})();
