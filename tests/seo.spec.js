import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'parse5';
import { siteSettings, renderSeoPage, robotsTxt, sitemapXml } from '../scripts/seo.mjs';

const copy = JSON.parse(readFileSync(new URL('../src/data/translations.json', import.meta.url), 'utf8'));
const getElements = html => {
  const nodes = [];
  const visit = node => { if (node.tagName) nodes.push(node); (node.childNodes || []).forEach(visit); };
  visit(parse(html));
  return nodes;
};
const attr = (node, name) => node?.attrs.find(item => item.name === name)?.value;
const tag = (nodes, key, value) => nodes.find(node => attr(node, key) === value);

// Request HTML directly, as a social crawler does: no JavaScript or saved language.
test('all nine static pages expose localized SEO and downloadable social images', async ({ request }) => {
  for (const [page, key] of [['index', 'home'], ['products', 'product'], ['about', 'about']]) {
    for (const language of ['pl', 'en', 'de']) {
      const file = `${page}${language === 'pl' ? '' : '.' + language}.html`;
      const response = await request.get('/' + file);
      expect(response.ok()).toBe(true);
      const nodes = getElements(await response.text());
      expect(attr(nodes.find(node => node.tagName === 'html'), 'lang')).toBe(language);
      expect(attr(tag(nodes, 'property', 'og:title'), 'content')).toBe(copy[language][`${key}.title`]);
      expect(attr(tag(nodes, 'property', 'og:description'), 'content')).toBe(copy[language][`${key}.meta`]);
      const canonical = attr(tag(nodes, 'rel', 'canonical'), 'href');
      expect(canonical).toBe(`http://127.0.0.1:4173/${file}`);
      expect(attr(tag(nodes, 'property', 'og:url'), 'content')).toBe(canonical);
      expect(nodes.filter(node => attr(node, 'rel') === 'canonical')).toHaveLength(1);
      expect(nodes.filter(node => attr(node, 'hreflang'))).toHaveLength(4);
      expect(attr(tag(nodes, 'name', 'twitter:card'), 'content')).toBe('summary_large_image');
      const imageUrl = attr(tag(nodes, 'property', 'og:image'), 'content');
      const image = await request.get(new URL(imageUrl).pathname);
      expect(image.ok()).toBe(true);
      expect(image.headers()['content-type']).toContain('image/jpeg');
      expect((await image.body()).length).toBeGreaterThan(10000);
      expect(imageUrl).toContain(page === 'about' ? 'our-story.jpg' : 'line-holder.jpg');
      expect(attr(tag(nodes, 'property', 'og:image:width'), 'content')).toBe('1200');
      expect(attr(tag(nodes, 'property', 'og:image:height'), 'content')).toBe('800');
    }
  }
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Disallow: /');
  expect(await robots.text()).toContain('Sitemap: http://127.0.0.1:4173/sitemap.xml');
  const sitemap = await request.get('/sitemap.xml');
  const xml = await sitemap.text();
  expect(sitemap.ok()).toBe(true);
  expect(xml.match(/<loc>/g)).toHaveLength(9);
  expect(xml).not.toContain('?color=');
  expect(xml).not.toContain('?lang=');
});

test('public URL enables indexing, with canonical and sitemap URLs in each language', async () => {
  const settings = siteSettings('https://seo-validation.test/');
  const source = readFileSync(new URL('../about.html', import.meta.url), 'utf8');
  const html = renderSeoPage(source, { page: 'about', language: 'de', settings });
  const nodes = getElements(html);
  expect(attr(tag(nodes, 'name', 'robots'), 'content')).toBe('index, follow, max-image-preview:large');
  expect(attr(tag(nodes, 'rel', 'canonical'), 'href')).toBe('https://seo-validation.test/about.de.html');
  expect(attr(tag(nodes, 'property', 'og:image:secure_url'), 'content')).toBe('https://seo-validation.test/social/our-story.jpg');
  expect(html).toContain('Am Anfang war');
  expect(robotsTxt(settings)).toContain('Allow: /');
  expect(sitemapXml(settings)).not.toContain('127.0.0.1');
  expect(robotsTxt(siteSettings('https://seo-validation.test', false))).toContain('Disallow: /');
  expect(() => siteSettings('https://seo-validation.test/?color=green')).toThrow();
  expect(() => siteSettings('http://seo-validation.test')).toThrow();
  const subdirectory = siteSettings('https://seo-validation.test/studio');
  expect(sitemapXml(subdirectory)).toContain('https://seo-validation.test/studio/products.en.html');
});

test('localized pages are readable without JavaScript and strip tracking from canonical', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const lang of ['pl', 'en', 'de']) {
    const file = `products${lang === 'pl' ? '' : '.' + lang}.html`;
    await page.goto(`http://127.0.0.1:4173/${file}?color=blue&utm_source=test`);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveText(copy[lang]['product.heading']);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `http://127.0.0.1:4173/${file}`);
    await expect(page.locator('#navigation [data-i18n="nav.about"]')).toHaveText(copy[lang]['nav.about']);
  }
  await context.close();
});

test('legacy language links retain their section after redirect and animation setup', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about.html?lang=pl#poczatek');
  await expect(page).toHaveURL(/\/about.html#poczatek$/);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('#poczatek h2')).toBeInViewport();
});
