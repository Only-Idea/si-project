import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const settled = page => expect.poll(async () => {
  const before = await page.evaluate(() => scrollY);
  await page.waitForTimeout(200);
  return before === await page.evaluate(() => scrollY);
}).toBe(true);
const opacity = locator => locator.evaluate(element => +getComputedStyle(element).opacity);

test('desktop story scrolls smoothly and swaps chapters 01-03 in place before the page moves on', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about.html?lang=pl');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  await expect(page.locator('.story-hero h1 .split-line')).toHaveCount(0);

  const stage = page.locator('.story-stage');
  const [one, two, three] = await stage.locator(':scope > section').all();
  const figure = page.locator('.story-product-image');
  const pin = await stage.evaluate(element => {
    const spacer = element.closest('.pin-spacer');
    return { start: spacer.getBoundingClientRect().top + scrollY - 100, distance: spacer.offsetHeight - element.offsetHeight };
  });
  const at = fraction => page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), pin.start + pin.distance * fraction);
  const visible = async chapters => { for (const [chapter, shown] of chapters) await expect.poll(() => opacity(chapter)).toBe(shown); };

  await at(.02);
  await expect(stage).toHaveCSS('position', 'fixed');
  await visible([[one, 1], [two, 0], [three, 0]]);
  await expect(one.locator('h2')).toHaveCSS('opacity', '1');
  await expect.poll(() => opacity(one.locator('.chapter-content > p').last())).toBe(0);
  await at(.24); // chapter 01 has read through: its last paragraph is in, the first has stepped back
  await expect.poll(() => opacity(one.locator('.chapter-content > p').last())).toBe(1);
  await expect.poll(() => opacity(one.locator('.chapter-content > p').first())).toBeLessThan(1);
  await at(.5); // chapter 02 has replaced it in the same spot; the page has not moved on to the image
  await visible([[one, 0], [two, 1], [three, 0]]);
  await expect(stage).toHaveCSS('position', 'fixed');
  expect(await figure.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(900);
  await at(.8);
  await visible([[one, 0], [two, 0], [three, 1]]);
  await expect(three.locator('.text-link')).toHaveCSS('pointer-events', 'none'); // hidden links are not clickable
  expect(await figure.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(900);
  await at(.98);
  await expect(three.locator('.text-link')).toHaveCSS('pointer-events', 'auto');
  await expect.poll(() => opacity(three.locator('.text-link'))).toBe(1);
  await at(.9);
  const progress = page.locator('.reading-progress > span');
  await expect.poll(() => progress.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(.1);
  await page.screenshot({ path: 'test-results/motion-story-desktop.png' });
  await at(1);
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'instant' })); // the stage lets go and the image arrives
  await expect(stage).not.toHaveCSS('position', 'fixed');
  await expect(figure).toBeInViewport();

  const frame = page.locator('.story-product-image .image-frame');
  const picture = frame.locator('img');
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveCSS('clip-path', 'none');
  const initial = await picture.evaluate(element => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'instant' }));
  await expect.poll(() => picture.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
  await expect.poll(() => picture.evaluate(element => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42) <= element.offsetHeight * .08)).toBe(true);
  await expect(page.locator('.story-product-image')).toHaveCSS('transform', 'none');
  await page.locator('.contact-email').focus();
  await expect(page.locator('.contact-email')).toHaveCSS('opacity', '1');
  await expect(page.locator('.contact-email')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('home hero wipes its image in and feature cards cascade', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html?lang=en');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.hero-art img')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('.hero h1 .split-line')).toHaveCount(0);
  const cards = page.locator('.feature');
  await expect(cards.first()).toHaveCSS('opacity', '0');
  await cards.first().scrollIntoViewIfNeeded();
  for (const card of await cards.all()) await expect(card).toHaveCSS('opacity', '1');
  await expect(cards.first()).toHaveCSS('translate', 'none');
});

test('motion adapts to mobile and live reduced-motion changes without duplicate effects', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about.html?lang=pl');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.reading-progress')).toHaveCount(1);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('.reading-progress, .chapter-progress, .pin-spacer')).toHaveCount(0);
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  await expect(page.locator('#poczatek .chapter-content > p').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.story-product-image img')).toHaveCSS('transform', 'none');
  await expect(page.locator('.story-product-image .image-frame')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.reading-progress')).toHaveCount(1);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.locator('.story-product-image').scrollIntoViewIfNeeded();
    await expect(page.locator('.story-product-image img')).toHaveCSS('transform', 'none');
    await expect(page.locator('.reading-progress')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('.story-wedding').scrollIntoViewIfNeeded();
  await expect(page.locator('.story-wedding h2')).toHaveCSS('opacity', '1');
  await expect(page.locator('#poczatek .chapter-content > p').last()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/motion-story-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 640 });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#poczatek .chapter-content > p').last()).toHaveCSS('opacity', '1');
});

test('anchors and product controls remain usable with motion enabled', async ({ page }) => {
  await page.goto('/index.html?lang=en');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /desktop|mobile/);
  await expect(page.locator('.hero .split-line')).toHaveCount(0); // the entrance has finished moving the controls
  await page.getByRole('link', { name: 'Explore the line holder' }).click();
  await page.getByRole('button', { name: 'Orange', exact: true }).click();
  await expect(page.locator('.carousel-viewport .is-selected')).toHaveAttribute('data-color-image', 'Orange');
  await page.getByRole('link', { name: 'Order', exact: true }).click();
  await expect(page).toHaveURL(/products.html\?color=orange&lang=en$/);
  await page.getByRole('link', { name: 'Product details', exact: true }).click();
  await expect(page.locator('#details h2')).toHaveCSS('opacity', '1');
  await settled(page); // the smooth anchor scroll has finished
  await page.locator('#details [data-product-shop]').scrollIntoViewIfNeeded();
  await expect(page.locator('#details [data-product-shop]')).toBeInViewport();
  await page.goto('/about.html?lang=pl#poczatek');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /desktop|mobile/);
  await expect(page.locator('#poczatek h2')).toHaveCSS('opacity', '1');
  await expect(page.locator('#poczatek h2')).toBeInViewport();
  await page.goto('/about.html?lang=pl');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await expect(page.locator('.story-hero .split-line')).toHaveCount(0);
  await page.getByRole('link', { name: /Poznaj naszą historię/ }).click();
  await settled(page);
  await expect(page.locator('#poczatek h2')).toBeInViewport();
  await expect(page).toHaveURL(/about.html\?lang=pl#poczatek$/);
  expect(Math.abs((await page.locator('#poczatek').boundingBox()).y - 100)).toBeLessThan(3); // lands right under the header, ready to pin
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
  await page.goto('/about.html?lang=pl');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'unavailable');
  await expect(page.locator('.story-hero h1')).toHaveCSS('opacity', '1');
  await page.locator('.contact-email').focus();
  await expect(page.locator('.contact-email')).toBeFocused();
});
