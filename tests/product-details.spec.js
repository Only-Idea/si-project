import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

test('each finish opens its supplied marketplace; selection survives reload', async ({ page, context }) => {
  await context.route(/https:\/\/(allegro\.pl|allegrolokalnie\.pl)\//, route => route.fulfill({ status: 200, body: 'Marketplace navigation test' }));
  const listings = [
    ['Green', '18881264719', 'Allegro'],
    ['Blue', '18883876669', 'Allegro'],
    ['Black', 'rep=1089105869', 'Allegro Lokalnie'],
    ['Orange', '18883894172', 'Allegro'],
    ['Red', '18883894172', 'Allegro'],
  ];
  await page.goto('/products.html');
  for (const [color, id, market] of listings) {
    await page.getByRole('button', { name: color, exact: true }).click();
    await expect(page.locator('.carousel-viewport .is-selected')).toHaveAttribute('data-color-image', color);
    await expect(page).toHaveURL(new RegExp(`color=${color.toLowerCase()}`));
    for (const link of await page.locator('[data-product-shop]').all()) {
      await expect(link).toHaveAttribute('href', new RegExp(id));
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toContainText(market);
    }
    if (color === 'Red') {
      await expect(page.locator('[data-product-shop]').first()).toHaveText('Order orange on Allegro ↗');
      await expect(page.locator('[data-purchase-note]').first()).toContainText('opens the orange edition');
    }
    const href = await page.locator('[data-product-shop]').first().getAttribute('href');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('[data-product-shop]').first().click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await popup.close();
    await page.reload();
    await expect(page.locator('.carousel-viewport .is-selected')).toHaveAttribute('data-color-image', color);
  }
});

test('installation gallery supports both professional photos, keyboard, swipe and retry', async ({ page }) => {
  await page.goto('/products.html#details');
  const image = page.locator('[data-installation-gallery] img');
  const next = page.getByRole('button', { name: 'Next installation photo', exact: true });
  const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'));
  const second = manifest['assets/images/line-holder/generated/in-use/photo-02-professional.png'].file;
  await page.route(`**/${second}`, route => route.abort());
  await next.click();
  await expect(page.locator('.installation-error')).toContainText('could not load');
  await expect(image).toHaveAttribute('src', /photo-01-professional/);
  await page.unroute(`**/${second}`);
  await next.click();
  await expect(image).toHaveAttribute('src', /photo-02-professional/);
  await expect(page.locator('[data-installation-full]')).toHaveAttribute('href', new RegExp(second));
  await expect(page.locator('.installation-error')).toBeEmpty();
  await page.locator('.installation-frame').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(image).toHaveAttribute('src', /photo-01-professional/);
  await page.locator('.installation-frame').dispatchEvent('pointerdown', { pointerId: 1, clientX: 220, clientY: 120 });
  await page.locator('.installation-frame').dispatchEvent('pointerup', { pointerId: 1, clientX: 80, clientY: 125 });
  await expect(image).toHaveAttribute('src', /photo-02-professional/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const height = await page.locator('[data-color-preview]').evaluate(element => element.offsetHeight);
    for (const color of ['Black', 'Red', 'Orange', 'Green']) {
      await page.getByRole('button', { name: color, exact: true }).click();
      await expect(page.locator('.carousel-viewport .is-selected')).toHaveAttribute('data-color-image', color);
      expect(await page.locator('[data-color-preview]').evaluate(element => element.offsetHeight)).toBe(height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('[data-product-specs]')).toContainText('ABS');
    await expect(page.locator('.included-note')).toContainText('one holder');
    await page.getByText('Where do I choose quantity and delivery?', { exact: true }).click();
    await expect(page.locator('.product-questions details[open]')).toContainText('Allegro Lokalnie');
    await page.getByText('Where do I choose quantity and delivery?', { exact: true }).click();
    await page.locator('#details').screenshot({ path: `test-results/product-details-${width}.png` });
  }
});

test('product specifications and orange purchase link work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/products.html');
  await expect(page.locator('[data-product-specs]')).toContainText('ABS');
  await expect(page.locator('[data-product-shop]')).toHaveAttribute('href', /offerId=18883894172/);
  await expect(page.locator('[data-purchase-note]')).toContainText('Orange edition');
  await page.getByText('What comes with the holder?', { exact: true }).click();
  await expect(page.locator('.product-questions details[open]')).toContainText('One ABS holder');
  await context.close();
});
