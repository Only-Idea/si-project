import { initNavigation } from './navigation.js';
import { initColorViewers } from './product-colors.js';
import { product } from './catalogue.js';
import { initMotion } from './motion.js';
import { initInstallationGallery } from './installation-gallery.js';
import { initLanguage, t } from './i18n.js';

if (initLanguage()) {
  initNavigation();
  initColorViewers();
  initInstallationGallery();
  document.querySelectorAll('[data-product-specs]').forEach(list => {
    list.replaceChildren(...product.specs.map((spec, index) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = t(`spec.label.${index}`);
      value.textContent = t(`spec.value.${index}`);
      row.append(term, value);
      return row;
    }));
  });
  const disposeMotion = initMotion();
  if (import.meta.hot) import.meta.hot.dispose(disposeMotion);
}
