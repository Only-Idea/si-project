import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--preview');
const output = resolve(root, preview ? 'test-results/product-renders/preview' : 'test-results/product-renders');
const samples = preview ? 128 : 512;
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const product = JSON.parse(await readFile(resolve(root, 'src/data/products.json'), 'utf8'))[0];
const server = await createServer({
  configFile: false, root, publicDir: 'public', appType: 'custom',
  // Use the renderer version tested by three-gpu-pathtracer; the site keeps its own version.
  cacheDir: 'node_modules/.vite-product-render',
  resolve: { alias: [
    { find: /^three$/, replacement: resolve(root, 'node_modules/three-render/build/three.module.js') },
    { find: /^three\/addons\//, replacement: resolve(root, 'node_modules/three-render/examples/jsm') + '/' },
  ] },
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  optimizeDeps: { noDiscovery: true, include: ['three', 'three-gpu-pathtracer'] },
});
server.middlewares.use('/__render', (_request, response) => {
  response.setHeader('Content-Type', 'text/html');
  response.end(`<!doctype html><html><head><link rel="icon" href="data:,"></head><body><script type="module">import {createStudio} from "/scripts/render-product-scene.js"; window.studioReady=createStudio({pixelRatio:${preview ? 1 : 1.5}});</script></body></html>`);
});
let browser;
try {
  await mkdir(output, { recursive: true });
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(chrome) ? chrome : undefined) });
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } });
  page.setDefaultTimeout(60_000);
  page.on('pageerror', error => console.error(error));
  page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
  await page.goto('http://127.0.0.1:5180/__render');
  await page.waitForFunction(() => window.studioReady);
  await page.evaluate(() => window.studioReady);
  for (const color of preview ? product.colors.filter(color => color.id === 'orange') : product.colors) {
    console.log(`Rendering ${color.id}: ${samples} samples`);
    const data = await page.evaluate(async ({ hex, samples }) => (await window.studioReady).render(hex, samples), { hex: color.hex, samples });
    const path = resolve(output, `${color.id}.webp`);
    await writeFile(path, Buffer.from(data, 'base64'));
    console.log(`Saved ${path}`);
  }
  if (process.argv.includes('--apply') && !preview) {
    for (const color of product.colors) {
      await copyFile(resolve(output, `${color.id}.webp`), resolve(root, product.variants.studio[color.id]));
    }
    console.log('Replaced the five catalogue studio images.');
  }
} finally {
  await browser?.close();
  await server.close();
}
