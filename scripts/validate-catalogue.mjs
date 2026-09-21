import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const products = JSON.parse(await readFile(new URL('src/data/products.json', root), 'utf8'));
const seen = new Set();
let imageCount = 0;

for (const product of products) {
  assert(product.id && product.name && product.description, 'Product identity is required');
  assert(!seen.has(product.id), `Duplicate product: ${product.id}`);
  seen.add(product.id);
  assert(product.gallery.length && product.specs.length, 'Photos and specifications are required');
  const colors = new Set(product.colors.map(color => color.id));
  const views = new Set(product.views.map(view => view.id));
  assert.equal(colors.size, product.colors.length, 'Duplicate color IDs');
  assert.equal(views.size, product.views.length, 'Duplicate view IDs');
  assert.equal(Object.keys(product.variants).length, views.size);
  const paths = product.gallery.map(photo => {
    assert(photo.caption && photo.alt, 'Every product photo needs a caption and alt text');
    return photo.image;
  });
  for (const color of product.colors) assert.match(color.hex, /^#[\da-f]{6}$/i);
  for (const photo of product.gallery.filter(photo => photo.featuredInUse)) {
    assert(photo.colorAlt?.includes('{color}'), 'In-use photos need color-aware alt text');
    assert.equal(Object.keys(photo.colorVariants || {}).length, colors.size, 'Incomplete in-use color variants');
    for (const color of product.colors) paths.push(photo.colorVariants[color.id]);
  }
  for (const view of product.views) {
    assert.equal(Object.keys(product.variants[view.id]).length, colors.size, `Incomplete ${view.id} variants`);
    for (const color of product.colors) paths.push(product.variants[view.id][color.id]);
  }
  for (const path of paths) {
    assert(path.startsWith('assets/') && !path.includes('..'), `Invalid image path: ${path}`);
    await access(new URL(path, root));
    imageCount++;
  }
  const listedColors = new Set();
  for (const shop of product.marketplaces) {
    assert.equal(new URL(shop.url).protocol, 'https:', 'Marketplace links must use HTTPS');
    assert(colors.has(shop.colorId), 'Marketplace color must match a product color');
    if (shop.listedColorId) assert(colors.has(shop.listedColorId), 'Linked edition must match a product color');
    assert(!listedColors.has(shop.colorId), 'Only one primary listing per color');
    listedColors.add(shop.colorId);
    assert(['allegro.pl', 'allegrolokalnie.pl'].includes(new URL(shop.url).hostname), 'Expected a supplied Allegro marketplace URL');
  }
}
console.log(`Catalogue valid: ${products.length} product, ${imageCount} image references.`);
