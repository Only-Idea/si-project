import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { seoPlugin } from './scripts/seo.mjs';

const page = name => fileURLToPath(new URL(name, import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    publicDir: 'public',
    appType: 'mpa',
    plugins: [seoPlugin({ siteUrl: env.SITE_URL, indexable: env.SEO_INDEXABLE !== 'false' })],
    build: {
      manifest: true,
      rolldownOptions: {
        input: {
          home: page('index.html'),
          about: page('about.html'),
          products: page('products.html'),
        },
      },
    },
  };
});
