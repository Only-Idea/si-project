import { t, colorName, localizedUrl } from './i18n.js';
import { product, variantUrl } from './catalogue.js';
import { renderColorViewer } from './color-viewer-template.js';
import { updateProductPurchase } from './product-purchase.js';
import { initProductModel } from './product-model.js';

export function initColorViewers() {
  document.querySelectorAll('[data-color-preview]').forEach(viewer => {
    const isProductPage = viewer.hasAttribute('data-product-page');
    const colorId = new URLSearchParams(location.search).get('color');
    const first = (isProductPage && product.colors.find(color => color.id === colorId)) || product.colors[0];
    viewer.innerHTML = renderColorViewer(first, isProductPage);
    const model = initProductModel(viewer);
    model.setColor(first);
    const viewport = viewer.querySelector('.carousel-viewport');
    const images = [...viewport.querySelectorAll('img')];
    const buttons = [...viewer.querySelectorAll('[data-product-color]')];
    const dots = [...viewer.querySelectorAll('[data-carousel-slide]')];
    const status = viewer.querySelector('[data-color-status]');
    const error = viewer.querySelector('[data-color-error]');
    const orderLink = viewer.querySelector('[data-product-order]');
    let activeColor = first.name;
    let activeIndex = 0;
    let requestedColor = activeColor;
    let requestedIndex = activeIndex;
    let request = 0;
    if (isProductPage) updateProductPurchase(first);

    function getImage(color, index) {
      const view = product.views[index].id;
      let image = images.find(item => item.dataset.colorImage === color && item.dataset.view === view);
      if (!image) {
        image = new Image();
        image.dataset.colorImage = color;
        image.dataset.view = view;
        image.className = view === 'studio' ? '' : 'color-cutout';
        image.alt = t('gallery.alt', { color: colorName(color), view: t(`view.${view}`) });
        image.draggable = false;
        image.setAttribute('aria-hidden', 'true');
        image.src = variantUrl(color, view);
        viewport.append(image);
        images.push(image);
      }
      image.loading = 'eager';
      return image;
    }

    function preload() {
      buttons.forEach(button => getImage(button.dataset.productColor, activeIndex));
      getImage(activeColor, (activeIndex + 1) % product.views.length);
      getImage(activeColor, (activeIndex + product.views.length - 1) % product.views.length);
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { preload(); observer.disconnect(); }
      }, { rootMargin: '500px' });
      observer.observe(viewer);
    } else preload();

    async function select() {
      const currentRequest = ++request;
      const color = requestedColor;
      const index = requestedIndex;
      const target = getImage(color, index);
      viewport.setAttribute('aria-busy', 'true');
      error.textContent = '';
      if (target.complete && !target.naturalWidth) target.src = target.src;
      try {
        await target.decode();
        if (currentRequest !== request) return;
        images.forEach(image => {
          image.classList.toggle('is-selected', image === target);
          image.setAttribute('aria-hidden', String(image !== target));
        });
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.productColor === color)));
        dots.forEach((dot, position) => dot.setAttribute('aria-current', String(position === index)));
        activeColor = color;
        activeIndex = index;
        const selected = product.colors.find(item => item.name === color);
        model.setColor(selected);
        if (orderLink) orderLink.href = localizedUrl(`products.html?color=${selected.id}`);
        if (isProductPage) {
          updateProductPurchase(selected);
          document.dispatchEvent(new CustomEvent('product-color-change', { detail: selected }));
          const url = new URL(location.href);
          url.searchParams.set('color', selected.id);
          history.replaceState(history.state, '', url);
        }
        status.textContent = t('gallery.status', { color: colorName(selected), index: index + 1, total: product.views.length });
        preload();
      } catch {
        if (currentRequest === request) {
          requestedColor = activeColor;
          requestedIndex = activeIndex;
          error.textContent = t('gallery.error');
        }
      } finally {
        if (currentRequest === request) viewport.setAttribute('aria-busy', 'false');
      }
    }
    function move(step) {
      requestedIndex = (requestedIndex + step + product.views.length) % product.views.length;
      select();
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      requestedColor = button.dataset.productColor;
      select();
    }));
    dots.forEach(dot => dot.addEventListener('click', () => {
      requestedIndex = Number(dot.dataset.carouselSlide);
      select();
    }));
    viewer.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
    viewer.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
    viewport.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    let pointer;
    viewport.addEventListener('pointerdown', event => { pointer = { x: event.clientX, y: event.clientY, id: event.pointerId }; });
    viewport.addEventListener('pointerup', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
    });
    viewport.addEventListener('pointercancel', () => { pointer = null; });
  });
}
