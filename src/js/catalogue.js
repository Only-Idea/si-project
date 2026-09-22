import products from '../data/products.json';

// Explicit imports let Vite fingerprint every dynamically selected image.
const images = import.meta.glob([
  '../../assets/images/line-holder/generated/colors/{green,blue,red,black,orange}/*.webp',
  '../../assets/images/line-holder/generated/in-use/*.webp',
], { eager: true, query: '?url', import: 'default' });

export const product = products.find(item => item.id === 'line-holder');

export function assetUrl(path) {
  const url = images[`../../${path}`];
  if (!url) throw new Error(`Catalogue image is missing: ${path}`);
  return url;
}

export function variantUrl(colorName, view) {
  const color = product.colors.find(item => item.name === colorName);
  return assetUrl(product.variants[view][color.id]);
}
