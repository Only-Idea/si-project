import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('desktop story reveals chapters, tracks reading and adds restrained parallax', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about.html');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  const chapter = page.locator('.story-wedding');
  await chapter.evaluate(element => window.scrollTo({ top: element.offsetTop - innerHeight * .7, behavior: 'instant' }));
  await expect(chapter.locator('h2')).not.toHaveCSS('transform', 'none');
  await expect(chapter.locator('h2')).toHaveCSS('opacity', '1');
  await expect(chapter.locator('.chapter-content > p').last()).toHaveCSS('opacity', '1');
  await chapter.evaluate(element => window.scrollTo({ top: element.offsetTop - innerHeight * .3, behavior: 'instant' }));
  await expect(chapter).toHaveClass(/is-current/);
  const progress = page.locator('.reading-progress > span');
  await expect.poll(() => progress.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(.1);
  await page.screenshot({ path: 'test-results/motion-story-desktop.png' });

  const picture = page.locator('.story-product-image');
  await picture.scrollIntoViewIfNeeded();
  const initial = await picture.evaluate(element => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'instant' }));
  await expect.poll(() => picture.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
  await expect.poll(() => picture.evaluate(element => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42))).toBeLessThanOrEqual(24);
  await page.locator('.contact-email').focus();
  await expect(page.locator('.contact-email')).toHaveCSS('opacity', '1');
  await expect(page.locator('.contact-email')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('motion adapts to mobile and live reduced-motion changes without duplicate effects', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about.html');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.reading-progress')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.reading-progress, .chapter-progress')).toHaveCount(0);
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  await expect(page.locator('.story-product-image')).toHaveCSS('transform', 'none');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.reading-progress')).toHaveCount(1);
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await page.locator('.story-product-image').scrollIntoViewIfNeeded();
    await expect(page.locator('.story-product-image')).toHaveCSS('transform', 'none');
    await expect(page.locator('.reading-progress')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('.story-wedding').scrollIntoViewIfNeeded();
  await expect(page.locator('.story-wedding h2')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/motion-story-mobile.png' });
});

test('anchors and product controls remain usable with motion enabled', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /desktop|mobile/);
  await page.getByRole('link', { name: 'Explore the line holder' }).click();
  await page.getByRole('button', { name: 'Orange', exact: true }).click();
  await expect(page.locator('.carousel-viewport .is-selected')).toHaveAttribute('data-color-image', 'Orange');
  await page.getByRole('link', { name: 'Order', exact: true }).click();
  await expect(page).toHaveURL(/products.html\?color=orange$/);
  await page.getByRole('link', { name: 'Product details', exact: true }).click();
  await expect(page.locator('#details h2')).toHaveCSS('opacity', '1');
  await page.locator('#details [data-product-shop]').scrollIntoViewIfNeeded();
  await expect(page.locator('#details [data-product-shop]')).toBeInViewport();
  await page.goto('/about.html#poczatek');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /desktop|mobile/);
  await expect(page.locator('#poczatek h2')).toHaveCSS('opacity', '1');
  await expect(page.locator('#poczatek h2')).toBeInViewport();
});

test('the story stays readable when JavaScript or the animation download is unavailable', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:4173/about.html');
  for (const heading of await staticPage.locator('h1, h2').all()) {
    await expect(heading).toHaveCSS('opacity', '1');
    await expect(heading).toBeVisible();
  }
  await expect(staticPage.locator('.contact-email')).toHaveAttribute('href', 'mailto:studio@example.com');
  await context.close();

  const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'));
  const entry = Object.values(manifest).find(entry => entry.src?.endsWith('gsap/index.js'));
  expect(entry).toBeTruthy();
  await page.route(`**/${entry.file}`, route => route.abort());
  await page.goto('/about.html');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'unavailable');
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  await page.locator('.contact-email').focus();
  await expect(page.locator('.contact-email')).toBeFocused();
});
