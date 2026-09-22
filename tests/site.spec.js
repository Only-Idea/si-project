import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Functional/layout checks use the accessible static presentation; motion has its own suite.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { if (!localStorage.getItem('si-language')) localStorage.setItem('si-language', 'en'); });
});

const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'));
const imagePath = (view, color) => '/' + manifest[`assets/images/line-holder/generated/colors/${color}/${view}.webp`].file;

async function expectPhoto(page, color, view) {
  const image = page.locator('.carousel-viewport .is-selected');
  await expect(image).toHaveAttribute('data-color-image', color);
  await expect(image).toHaveAttribute('data-view', view);
  expect(await image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
}

test('home page: Studio Blue, CAD hero, order link and responsive sections', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('si-design-palette', 'clay'));
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/index.html?palette=sage');
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
    await expect(page.locator('h1')).toHaveText('Ideas, made real.Layer by layer.');
    await page.locator('.design-hero img').evaluate(image => image.decode());
    await expect(page.locator('.design-hero img')).toHaveAttribute('src', /design-process/);
    await expect(page.locator('form, dialog, .palette-bar, .catalogue, [data-product-view], [data-color-label], [data-contact]')).toHaveCount(0);
    await expect(page.getByText('Cinematic', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /conversation|talk/i })).toHaveCount(0);
    await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:studio@example.com');
    await expect(page.locator('[data-product-order]')).toHaveAttribute('href', /products.en.html\?color=green$/);
    await expect(page.locator('#details, [data-product-shop]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const visibleText = await page.locator('main').innerText();
    expect(visibleText).not.toContain('#00AE42');
    expect(visibleText).not.toContain('Green ·');
    if (width < 768) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page.keyboard.press('Escape');
      await expect(page.locator('.menu-toggle')).toBeFocused();
    }
    await page.locator('.hero').screenshot({ path: `test-results/single-product-hero-${width}.png` });
  }
  const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.hash.slice(1)));
  for (const id of new Set(anchors)) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  const sources = await page.locator('img').evaluateAll(images => images.map(image => image.src));
  for (const source of new Set(sources)) expect((await request.get(source)).ok()).toBe(true);
  expect(errors).toEqual([]);
});

test('carousel keeps text fixed, preserves color across all five photos, and supports keyboard/swipe', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/index.html#product-colors');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-color-preview]').scrollIntoViewIfNeeded();
    const bounds = await page.locator('.color-copy').boundingBox();
    const height = await page.locator('[data-color-preview]').evaluate(element => element.offsetHeight);
    const views = ['studio', 'front', 'rear', 'left', 'right'];
    for (let index = 0; index < views.length; index++) {
      await page.locator(`[data-carousel-slide="${index}"]`).click();
      for (const color of ['Green', 'Blue', 'Red', 'Orange', 'Black']) {
        await page.locator(`[data-product-color="${color}"]`).click();
        await expectPhoto(page, color, views[index]);
        await expect(page.locator('[data-product-color][aria-pressed="true"]')).toHaveCount(1);
        await expect(page.locator('.carousel-dot[aria-current="true"]')).toHaveCount(1);
        const current = await page.locator('.color-copy').boundingBox();
        expect(current.x).toBe(bounds.x);
        expect(current.width).toBe(bounds.width);
        expect(await page.locator('[data-color-preview]').evaluate(element => element.offsetHeight)).toBe(height);
      }
    }
    await page.getByRole('button', { name: 'Next photo', exact: true }).click();
    await expectPhoto(page, 'Black', 'studio');
    await page.locator('.carousel-viewport').focus();
    await page.keyboard.press('ArrowLeft');
    await expectPhoto(page, 'Black', 'right');
    await page.keyboard.press('ArrowRight');
    await expectPhoto(page, 'Black', 'studio');
    await page.locator('.carousel-viewport').dispatchEvent('pointerdown', { pointerId: 1, clientX: 200, clientY: 100 });
    await page.locator('.carousel-viewport').dispatchEvent('pointerup', { pointerId: 1, clientX: 80, clientY: 110 });
    await expectPhoto(page, 'Black', 'front');
    await page.locator('.carousel-viewport').dispatchEvent('pointerdown', { pointerId: 2, clientX: 200, clientY: 100 });
    await page.locator('.carousel-viewport').dispatchEvent('pointerup', { pointerId: 2, clientX: 195, clientY: 210 });
    await expectPhoto(page, 'Black', 'front');
    await page.locator('[data-product-color="Blue"]').focus();
    await page.keyboard.press('Enter');
    await expectPhoto(page, 'Blue', 'front');
    expect(await page.locator('.is-selected').evaluate(image => getComputedStyle(image).transitionDuration)).toBe('0s');
    await page.locator('[data-color-preview]').screenshot({ path: `test-results/product-carousel-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('carousel handles failed loads and ignores stale selections', async ({ page }) => {
  const frontBlue = imagePath('front', 'blue');
  await page.route(`**${frontBlue}`, route => route.abort());
  await page.goto('/index.html#product-colors');
  await page.locator('[data-product-color="Blue"]').click();
  await expectPhoto(page, 'Blue', 'studio');
  await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expect(page.locator('[data-color-error]')).toContainText('could not load');
  await expectPhoto(page, 'Blue', 'studio');
  await expect(page.locator('[data-carousel-slide="0"]')).toHaveAttribute('aria-current', 'true');
  await page.unroute(`**${frontBlue}`);
  await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expectPhoto(page, 'Blue', 'front');
  await expect(page.locator('[data-color-error]')).toBeEmpty();
  const rearRed = imagePath('rear', 'red');
  await page.route(`**${rearRed}`, async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.continue(); });
  await page.evaluate(() => {
    document.querySelector('[data-product-color="Red"]').click();
    document.querySelector('[data-carousel-slide="2"]').click();
    document.querySelector('[data-product-color="Black"]').click();
  });
  await expectPhoto(page, 'Black', 'rear');
  await page.waitForTimeout(500);
  await expectPhoto(page, 'Black', 'rear');
});

test('order opens a real product page with the selected color; subpages work responsively', async ({ page }) => {
  await page.goto('/index.html#product-colors');
  await page.getByRole('button', { name: 'Red', exact: true }).click();
  await expectPhoto(page, 'Red', 'studio');
  await page.getByRole('link', { name: 'Order', exact: true }).click();
  await expect(page).toHaveURL(/products.en.html\?color=red$/);
  await expectPhoto(page, 'Red', 'studio');
  await page.reload();
  await expectPhoto(page, 'Red', 'studio');
  await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expectPhoto(page, 'Red', 'front');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['products.html', 'about.html']) {
      const lang = route === 'about.html' ? 'pl' : 'en';
      await page.goto('/' + route + '?lang=' + lang);
      await expect(page).toHaveURL(new RegExp(route.replace('.html', lang === 'pl' ? '.html' : '.' + lang + '.html') + '$'));
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('#navigation [aria-current="page"]')).toHaveAttribute('href', new RegExp(route.replace('.html', lang === 'pl' ? '.html' : '.' + lang + '.html') + '$'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.hash.slice(1)));
      for (const id of new Set(anchors)) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
      if (route === 'products.html') {
        await expect(page.locator('#details')).toContainText('Small details. A clear purpose.');
        await expect(page.locator('#details h2')).toHaveText('Keep everyline in place.');
        await expect(page.locator('[data-product-specs]')).toContainText('Up to 24 mm');
        await expect(page.locator('#details [data-product-shop]')).toHaveAttribute('href', /offerId=18881264719/);
        await page.locator('[data-color-preview]').screenshot({ path: `test-results/product-page-${width}.png` });
      } else {
        await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
        await expect(page.locator('h1')).toContainText('Miały być Bieszczady.');
        await expect(page.locator('[data-story-chapter]')).toHaveCount(4);
        await expect(page.locator('.story-together')).toContainText('Nie jesteśmy firmą ani dużą drukarnią.');
        await page.locator('.story-product-image img').scrollIntoViewIfNeeded(); // a lazy image far down the page only loads once near the viewport
        await page.locator('.story-product-image img').evaluate(image => image.decode());
        await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:studio@example.com');
        if (width < 768) {
          await page.getByRole('button', { name: 'Otwórz menu', exact: true }).click();
          await page.keyboard.press('Escape');
          await expect(page.getByRole('button', { name: 'Otwórz menu', exact: true })).toBeFocused();
        }
        await page.screenshot({ path: `test-results/about-story-${width}.png`, fullPage: true });
      }
    }
  }
  await page.goto('/products.html?color=orange');
  await expectPhoto(page, 'Orange', 'studio');
  await expect(page.locator('[data-product-color]')).toHaveCount(5);
  await page.goto('/products.html?color=unknown');
  await expectPhoto(page, 'Green', 'studio');
  await expect(page.locator('form, dialog')).toHaveCount(0);
});
