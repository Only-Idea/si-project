import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const copy = JSON.parse(readFileSync(new URL('../src/data/translations.json', import.meta.url), 'utf8'));
const plain = text => text.replace(/<[^>]+>/g, '');
test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

for (const lang of ['pl', 'en', 'de']) {
  test(`${lang}: all pages, metadata, galleries and responsive navigation`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [route, key] of [['index', 'home'], ['products', 'product'], ['about', 'about']]) {
      await page.goto(`/${route}.html?lang=${lang}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('[data-language-select]')).toHaveValue(lang);
      await expect(page).toHaveTitle(copy[lang][`${key}.title`]);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy[lang][`${key}.meta`]);
      await expect(page.locator('h1')).toHaveText(plain(copy[lang][`${key}.heading`]));
      await expect(page.locator('#navigation [data-i18n="nav.about"]')).toHaveText(copy[lang]['nav.about']);
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route}, ${lang}, ${width}`).toBe(true);
        await expect(page.locator('[data-language-select]')).toBeInViewport();
        if (width === 390) {
          await page.locator('.menu-toggle').click();
          await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-label', copy[lang]['nav.close']);
          await expect(page.locator('#navigation')).toBeVisible();
          await page.keyboard.press('Escape');
          await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-label', copy[lang]['nav.open']);
          await page.screenshot({ path: `test-results/${route}-${lang}-390.png` });
        }
      }
    }
    await page.goto(`/products.html?lang=${lang}&color=blue`);
    await page.getByRole('button', { name: copy[lang]['color.green'], exact: true }).click();
    const installed = page.locator('[data-installation-gallery] img');
    await expect(installed).toHaveAttribute('data-installation-color', 'green');
    await expect(installed).toHaveAttribute('alt', copy[lang]['installation.alt.0'].replace('{color}', copy[lang]['color.green']));
    await page.getByRole('button', { name: copy[lang]['installation.next'], exact: true }).click();
    await expect(page.locator('[data-installation-status]')).toContainText(copy[lang]['installation.photo.1']);
    await page.getByRole('button', { name: copy[lang]['color.red'], exact: true }).click();
    await expect(page.locator('[data-purchase-note]').first()).toContainText(lang === 'en' ? 'orange' : copy[lang]['color.orange']);
    expect(errors).toEqual([]);
  });
}

test('Polish is the default; changing language retains product color and section', async ({ page }) => {
  await page.goto('/products.html?color=blue#details');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByRole('button', { name: 'Niebieski', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const lang of ['de', 'en', 'pl']) {
    await page.locator('[data-language-select]').selectOption(lang);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    const url = new URL(page.url());
    expect(url.searchParams.get('color')).toBe('blue');
    expect(url.searchParams.get('lang')).toBe(lang);
    expect(url.hash).toBe('#details');
    await expect(page.locator('[data-installation-gallery] img')).toHaveAttribute('data-installation-color', 'blue');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  }
  await page.locator('[data-language-select]').selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('#navigation [data-i18n="nav.about"]').click();
  await expect(page).toHaveURL(/about.html\?lang=de$/);
  await expect(page.locator('h1')).toContainText('Geplant war ein Bergurlaub.');
  await page.goto('/index.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByRole('button', { name: 'Blau', exact: true }).click();
  await page.locator('[data-product-order]').click();
  await expect(page).toHaveURL(/products.html\?color=blue&lang=de$/);
});

test('explicit language works without storage and invalid language falls back to Polish', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  });
  await page.goto('/index.html?lang=de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('#navigation [data-i18n="nav.product"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.goto('/index.html?lang=invalid');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
});

test('default Polish content remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [route, key] of [['index', 'home'], ['products', 'product'], ['about', 'about']]) {
    await page.goto(`http://127.0.0.1:4173/${route}.html`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.locator('h1')).toHaveText(plain(copy.pl[`${key}.heading`]));
    await expect(page.locator('#navigation [data-i18n="nav.about"]')).toHaveText('O nas');
  }
  await context.close();
});
