import { product, assetUrl } from './catalogue.js';
import { trapDialogFocus } from './dialog.js';

export function initProducts() {
  const productDialog = document.querySelector('#product-dialog');
  if (productDialog) {
    const specs = productDialog.querySelector('.product-specs');
    specs.replaceChildren(...product.specs.map(spec => {
      const row = document.createElement('div');
      const label = document.createElement('dt');
      const value = document.createElement('dd');
      label.textContent = spec.label;
      value.textContent = spec.value;
      row.append(label, value);
      return row;
    }));
    productDialog.querySelector('.marketplace-link').href = product.marketplaces[0].url;
  }
  const galleryPhotos = product.gallery;
  const thumbnailGroup = productDialog?.querySelector('.gallery-thumbnails');
  function selectGalleryPhoto(index) {
    if (!thumbnailGroup) return;
    const { image, caption, alt } = galleryPhotos[index];
    const src = assetUrl(image);
    const mainImage = productDialog.querySelector('[data-gallery-image]');
    mainImage.src = src;
    mainImage.alt = alt;
    productDialog.querySelector('[data-gallery-caption]').textContent = `${caption} · ${index + 1} / ${galleryPhotos.length}`;
    productDialog.querySelector('[data-gallery-original]').href = src;
    thumbnailGroup.querySelectorAll('button').forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
  }
  if (thumbnailGroup) {
    galleryPhotos.forEach(({ image: path, caption }, index) => {
      const button = document.createElement('button');
      button.className = 'gallery-thumbnail';
      button.setAttribute('aria-label', `Show photo ${index + 1}: ${caption}`);
      button.setAttribute('aria-pressed', String(index === 0));
      const image = document.createElement('img');
      image.src = assetUrl(path);
      image.alt = '';
      image.width = 1080;
      image.height = 1440;
      button.append(image);
      button.addEventListener('click', () => selectGalleryPhoto(index));
      thumbnailGroup.append(button);
    });
  }
  if (productDialog) trapDialogFocus(productDialog);
  const concepts = {
    'line-holder': { name: product.name, description: product.description, category: 'SI 3D PROJECT / Tools', note: product.note },
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

  const requestedConcept = new URLSearchParams(location.search).get('concept');
  if (requestedConcept && concepts[requestedConcept]) openConcept(requestedConcept, document.querySelector(`[data-concept="${requestedConcept}"]`));
}
