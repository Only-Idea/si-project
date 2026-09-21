import { t, colorName, localizedUrl } from './i18n.js';
import { product, variantUrl } from './catalogue.js';
import { purchaseForColor } from './product-purchase.js';

export function renderColorViewer(first = product.colors[0], isProductPage = false) {
  const purchase = purchaseForColor(first);
  return `
    <figure class="color-stage" role="region" aria-roledescription="${t('gallery.role')}" aria-label="${t('gallery.label')}">
      <div class="carousel-viewport" tabindex="0" aria-label="${t('gallery.keyboard')}">
        <img data-color-image="${first.name}" data-view="studio" class="is-selected" src="${variantUrl(first.name, 'studio')}" alt="${t('gallery.alt', { color: colorName(first), view: t('view.studio') })}" width="1536" height="1024" loading="lazy" draggable="false">
      </div>
      <div class="carousel-controls">
        <button type="button" class="carousel-arrow" data-carousel-prev aria-label="${t('gallery.previous')}"><span aria-hidden="true">←</span></button>
        <div class="carousel-dots" role="group" aria-label="${t('gallery.choose')}">
          ${product.views.map((view, index) => `<button type="button" class="carousel-dot" data-carousel-slide="${index}" aria-label="${t('gallery.show', { index: index + 1, total: product.views.length })}" aria-current="${index === 0}"><span></span></button>`).join('')}
        </div>
        <button type="button" class="carousel-arrow" data-carousel-next aria-label="${t('gallery.next')}"><span aria-hidden="true">→</span></button>
      </div>
    </figure>
    <div class="color-copy">
      <p class="eyebrow">${t('product.name')}</p>
      <h2 id="color-preview-title">${t(isProductPage ? 'color.headingProduct' : 'color.headingHome')}</h2>
      <p>${t('color.lead')}</p>
      <fieldset class="product-color-picker"><legend>${t('color.choose')}</legend>
        <div class="product-color-options">
          ${product.colors.map(color => `<button type="button" class="product-color-option" data-product-color="${color.name}" style="--product-color:${color.hex}" aria-label="${colorName(color)}" aria-pressed="${color.id === first.id}">${colorName(color)}</button>`).join('')}
        </div>
      </fieldset>
      <p class="sr-only" data-color-status role="status" aria-atomic="true">${t('gallery.status', { color: colorName(first), index: 1, total: product.views.length })}</p>
      <p class="color-error" data-color-error role="alert"></p>
      <p class="color-preview-note">${t('color.note')}</p>
      ${isProductPage
        ? `<div class="product-purchase"><a class="button" data-product-shop href="${purchase.href}">${purchase.label} <span aria-hidden="true">↗</span></a><p class="marketplace-note" data-purchase-note>${purchase.note}</p><a class="text-link" href="#details">${t('product.detailsLink')}</a></div>`
        : `<a class="button color-order" data-product-order href="${localizedUrl(`products.html?color=${first.id}`)}">${t('color.orderArrow')}</a>`}
    </div>`;
}
