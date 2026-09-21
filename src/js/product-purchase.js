import { product } from './catalogue.js';

export function purchaseForColor(color) {
  const listing = product.marketplaces.find(shop => shop.colorId === color.id);
  const edition = listing && product.colors.find(item => item.id === (listing.listedColorId || listing.colorId));
  const redirectedFinish = edition && edition.id !== color.id;
  return listing ? {
    href: listing.url,
    label: redirectedFinish ? `Order ${edition.name.toLowerCase()} on ${listing.name}` : `Order on ${listing.name}`,
    note: redirectedFinish ? `${color.name} preview. This link opens the ${edition.name.toLowerCase()} edition.` : `${color.name} edition. Price and delivery on ${listing.name}.`,
    external: true,
  } : {
    href: `mailto:studio@example.com?subject=${encodeURIComponent(`${color.name} masonry line holder`)}`,
    label: `Email about ${color.name.toLowerCase()}`,
    note: `Email us about ordering the ${color.name.toLowerCase()} edition.`,
    external: false,
  };
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
  document.querySelectorAll('[data-purchase-note]').forEach(note => { note.textContent = purchase.note; });
}
