import { product, variantUrl } from './catalogue.js';
import { purchaseForColor } from './product-purchase.js';

export function renderColorViewer(first = product.colors[0], isProductPage = false) {
  const purchase = purchaseForColor(first);
  return `
    <figure class="color-stage" role="region" aria-roledescription="carousel" aria-label="Product photos">
      <div class="carousel-viewport" tabindex="0" aria-label="Product photos. Use left and right arrow keys to browse.">
        <img data-color-image="${first.name}" data-view="studio" class="is-selected" src="${variantUrl(first.name, 'studio')}" alt="${first.name} masonry line holder with black knob and silver screw on a white stone platform" width="1536" height="1024" loading="lazy" draggable="false">
      </div>
      <div class="carousel-controls">
        <button type="button" class="carousel-arrow" data-carousel-prev aria-label="Previous photo"><span aria-hidden="true">←</span></button>
        <div class="carousel-dots" role="group" aria-label="Choose a photo">
          ${product.views.map((view, index) => `<button type="button" class="carousel-dot" data-carousel-slide="${index}" aria-label="Show photo ${index + 1} of ${product.views.length}" aria-current="${index === 0}"><span></span></button>`).join('')}
        </div>
        <button type="button" class="carousel-arrow" data-carousel-next aria-label="Next photo"><span aria-hidden="true">→</span></button>
      </div>
    </figure>
    <div class="color-copy">
      <p class="eyebrow">${product.name}</p>
      <h2 id="color-preview-title">${isProductPage ? 'Choose your<br>finish.' : 'A color.<br>Your character.'}</h2>
      <p>The same considered design.<br>A finish that feels like you.</p>
      <fieldset class="product-color-picker"><legend>Choose your color</legend>
        <div class="product-color-options">
          ${product.colors.map(color => `<button type="button" class="product-color-option" data-product-color="${color.name}" style="--product-color:${color.hex}" aria-label="${color.name}" aria-pressed="${color.id === first.id}">${color.name}</button>`).join('')}
        </div>
      </fieldset>
      <p class="sr-only" data-color-status role="status" aria-atomic="true">${first.name}, photo 1 of ${product.views.length}.</p>
      <p class="color-error" data-color-error role="alert"></p>
      <p class="color-preview-note">${product.colorNote}</p>
      ${isProductPage
        ? `<div class="product-purchase"><a class="button" data-product-shop href="${purchase.href}">${purchase.label} <span aria-hidden="true">↗</span></a><p class="marketplace-note" data-purchase-note>${purchase.note}</p><a class="text-link" href="#details">Product details <span aria-hidden="true">↓</span></a></div>`
        : `<a class="button color-order" data-product-order href="products.html?color=${first.id}">Order <span aria-hidden="true">→</span></a>`}
    </div>`;
}
