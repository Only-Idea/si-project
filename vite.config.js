import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const page = name => fileURLToPath(new URL(name, import.meta.url));

export default defineConfig({
  base: './',
  publicDir: false,
  appType: 'mpa',
  plugins: [{
    name: 'include-style-guide-document',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'docs/style-guide.md', source: readFileSync(page('docs/style-guide.md')) });
    },
  }],
  build: {
    manifest: true,
    rolldownOptions: {
      input: {
        home: page('index.html'),
        about: page('about.html'),
        products: page('products.html'),
        styleGuide: page('style-guide.html'),
      },
    },
  },
});
