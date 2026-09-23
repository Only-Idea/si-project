import { product } from './catalogue.js';
import price from '../data/price.json';
import { t, colorName, language } from './i18n.js';

export function purchaseForColor(color) {
  const listing = product.marketplaces.find(shop => shop.colorId === color.id);
  const edition = listing && product.colors.find(item => item.id === (listing.listedColorId || listing.colorId));
  const redirectedFinish = edition && edition.id !== color.id;
  const values = { color: colorName(color), edition: edition && (language === 'en' ? colorName(edition).toLowerCase() : colorName(edition)), market: listing?.name };
  return listing ? {
    href: listing.url,
    label: t(redirectedFinish ? 'purchase.redirectLabel' : 'purchase.label', values),
    note: t(redirectedFinish ? 'purchase.redirectNote' : 'purchase.note', values),
    external: true,
  } : {
    href: `mailto:si3dproject@gmail.com?subject=${encodeURIComponent(t('purchase.subject', values))}`,
    label: t('purchase.emailLabel'),
    note: t('purchase.emailNote', values),
    external: false,
  };
}

// A price older than a week is hidden rather than shown wrong; Allegro stays the source of truth.
const WEEK = 7 * 24 * 3600 * 1000;
function livePrice() {
  if (!price.amount || Date.now() - Date.parse(price.updatedAt) > WEEK) return '';
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: price.currency }).format(price.amount);
}

export function updateProductPurchase(color) {
  const purchase = purchaseForColor(color);
  document.querySelectorAll('[data-product-shop]').forEach(link => {
    link.href = purchase.href;
    if (purchase.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = purchase.external ? '↗' : '→';
    link.replaceChildren(document.createTextNode(purchase.label + ' '), arrow);
  });
  const shown = purchase.external && livePrice();
  document.querySelectorAll('[data-purchase-note]').forEach(note => { note.textContent = shown ? `${shown} · ${purchase.note}` : purchase.note; });
}
