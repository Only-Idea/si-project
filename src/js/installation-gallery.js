import { t, colorName } from './i18n.js';
import { product, assetUrl } from './catalogue.js';

export function initInstallationGallery() {
  const gallery = document.querySelector('[data-installation-gallery]');
  if (!gallery) return;
  const photos = product.gallery.filter(photo => photo.featuredInUse);
  if (photos.length < 2) return;
  const image = gallery.querySelector('img');
  const caption = gallery.querySelector('figcaption');
  const colorId = new URLSearchParams(location.search).get('color');
  let selectedColor = product.colors.find(color => color.id === colorId) || product.colors[0];
  const photoUrl = (photo, color) => assetUrl(photo.colorVariants[color.id]);
  const photoAlt = (photo, color) => t(`installation.alt.${photos.indexOf(photo)}`, { color: colorName(color) });
  image.src = photoUrl(photos[0], selectedColor);
  image.alt = photoAlt(photos[0], selectedColor);
  image.dataset.installationColor = selectedColor.id;
  const frame = document.createElement('div');
  frame.className = 'installation-frame';
  frame.tabIndex = 0;
  frame.setAttribute('aria-label', t('installation.keyboard'));
  image.before(frame);
  frame.append(image);
  image.draggable = false;
  caption.innerHTML = `<div class="installation-controls">
    <button type="button" class="carousel-arrow" data-installation-prev aria-label="${t('installation.previous')}">←</button>
    <span data-installation-status role="status" aria-live="polite">${colorName(selectedColor)} · ${t('installation.photo.0')} · 1 / ${photos.length}</span>
    <button type="button" class="carousel-arrow" data-installation-next aria-label="${t('installation.next')}">→</button>
    </div><div class="installation-caption"><span>${t('installation.caption')}</span>
    <a data-installation-full href="${photoUrl(photos[0], selectedColor)}" target="_blank" rel="noopener noreferrer">${t('installation.full')} <span aria-hidden="true">↗</span></a></div>
    <p class="installation-error" role="alert"></p>`;
  const status = caption.querySelector('[data-installation-status]');
  const full = caption.querySelector('[data-installation-full]');
  const error = caption.querySelector('.installation-error');
  let active = 0;
  let requested = 0;
  let sequence = 0;
  async function move(step) {
    requested = (requested + step + photos.length) % photos.length;
    const index = requested;
    const request = ++sequence;
    const photo = photos[index];
    const color = selectedColor;
    const next = new Image();
    next.src = photoUrl(photo, color);
    frame.setAttribute('aria-busy', 'true');
    error.textContent = '';
    try {
      await next.decode();
      if (request !== sequence) return;
      image.src = next.src;
      image.alt = photoAlt(photo, color);
      image.dataset.installationColor = color.id;
      full.href = next.src;
      status.textContent = `${colorName(color)} · ${t(`installation.photo.${index}`)} · ${index + 1} / ${photos.length}`;
      active = index;
    } catch {
      if (request === sequence) {
        requested = active;
        error.textContent = t('gallery.error');
      }
    } finally {
      if (request === sequence) frame.setAttribute('aria-busy', 'false');
    }
  }
  document.addEventListener('product-color-change', event => {
    if (event.detail.id === selectedColor.id && image.dataset.installationColor === selectedColor.id) return;
    selectedColor = event.detail;
    move(0);
  });
  caption.querySelector('[data-installation-prev]').addEventListener('click', () => move(-1));
  caption.querySelector('[data-installation-next]').addEventListener('click', () => move(1));
  frame.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let pointer;
  frame.addEventListener('pointerdown', event => { pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; });
  frame.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
  });
  frame.addEventListener('pointercancel', () => { pointer = null; });
}
