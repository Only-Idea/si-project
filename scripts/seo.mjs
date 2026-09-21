import { readFileSync } from 'node:fs';
import { parse, parseFragment, serialize } from 'parse5';
import { languages, pages, pageFile, pageRoute } from '../src/js/site-routes.js';

const copy = JSON.parse(readFileSync(new URL('../src/data/translations.json', import.meta.url), 'utf8'));
const locales = { pl: 'pl_PL', en: 'en_GB', de: 'de_DE' };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const setAttr = (node, name, value) => {
  const existing = node.attrs.find(item => item.name === name);
  if (existing) existing.value = value;
  else node.attrs.push({ name, value });
};

export function siteSettings(siteUrl = '', indexable = true, fallback = 'http://127.0.0.1:4173/') {
  const url = new URL(siteUrl || fallback);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be a public HTTP(S) URL without credentials, query parameters or a fragment.');
  }
  url.pathname = url.pathname.replace(/\/?$/, '/');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (siteUrl && !local && url.protocol !== 'https:') throw new Error('Use HTTPS for the public SITE_URL.');
  return { base: url.href, indexable: Boolean(siteUrl) && !local && indexable };
}

export function canonicalUrl(settings, page, language) {
  return new URL(pageFile(page, language), settings.base).href;
}

export function socialMetadata(settings, page, language) {
  const key = pages[page];
  const image = page === 'about' ? 'our-story.jpg' : 'line-holder.jpg';
  return {
    title: copy[language][`${key}.title`],
    description: copy[language][`${key}.meta`],
    url: canonicalUrl(settings, page, language),
    image: new URL(`social/${image}`, settings.base).href,
    alt: copy[language][page === 'about' ? 'alt.workbench' : 'alt.fiveColors'],
  };
}

export function renderSeoPage(html, { page, language = 'pl', settings }) {
  const document = parse(html, { scriptingEnabled: false });
  let head;
  const visit = node => {
    if (node.tagName === 'html') setAttr(node, 'lang', language);
    if (node.tagName === 'head') head = node;
    if (node.attrs) {
      const key = attr(node, 'data-i18n');
      if (key) {
        if (!(key in copy[language])) throw new Error(`Missing ${language} translation: ${key}`);
        node.childNodes = parseFragment(copy[language][key]).childNodes;
        for (const child of node.childNodes) child.parentNode = node;
      }
      for (const field of ['content', 'alt', 'aria-label']) {
        const attributeKey = attr(node, `data-i18n-${field}`);
        if (attributeKey) setAttr(node, field, copy[language][attributeKey]);
      }
      if (node.tagName === 'a') {
        const href = attr(node, 'href');
        if (href && !href.startsWith('#')) {
          const url = new URL(href, settings.base);
          const route = pageRoute(url.pathname);
          if (url.origin === new URL(settings.base).origin && route && url.pathname.endsWith('.html')) {
            url.searchParams.delete('lang');
            setAttr(node, 'href', pageFile(route.page, language) + url.search + url.hash);
          }
        }
      }
      if (node.tagName === 'option' && languages.includes(attr(node, 'value'))) {
        node.attrs = node.attrs.filter(item => item.name !== 'selected');
        if (attr(node, 'value') === language) setAttr(node, 'selected', '');
      }
    }
    for (const child of node.childNodes || []) visit(child);
  };
  visit(document);
  const meta = socialMetadata(settings, page, language);
  // Replacing existing metadata makes the transform safe to apply to built HTML again.
  head.childNodes = head.childNodes.filter(node => !(
    node.tagName === 'meta' && (attr(node, 'name') === 'robots' || /^(og:|twitter:)/.test(attr(node, 'property') || attr(node, 'name') || '')) ||
    node.tagName === 'link' && (attr(node, 'rel') === 'canonical' || attr(node, 'hreflang'))
  ));
  const tags = [
    `<meta name="robots" content="${settings.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">`,
    `<link rel="canonical" href="${escape(meta.url)}">`,
    ...languages.map(lang => `<link rel="alternate" hreflang="${lang}" href="${escape(canonicalUrl(settings, page, lang))}">`),
    `<link rel="alternate" hreflang="x-default" href="${escape(canonicalUrl(settings, page, 'pl'))}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="SI 3D PROJECT">',
    `<meta property="og:locale" content="${locales[language]}">`,
    ...languages.filter(lang => lang !== language).map(lang => `<meta property="og:locale:alternate" content="${locales[lang]}">`),
    ...Object.entries({ title: meta.title, description: meta.description, url: meta.url, image: meta.image, 'image:alt': meta.alt, 'image:type': 'image/jpeg', 'image:width': '1200', 'image:height': '800' })
      .map(([name, content]) => `<meta property="og:${name}" content="${escape(content)}">`),
    ...(meta.image.startsWith('https:') ? [`<meta property="og:image:secure_url" content="${escape(meta.image)}">`] : []),
    '<meta name="twitter:card" content="summary_large_image">',
    ...Object.entries({ title: meta.title, description: meta.description, image: meta.image, 'image:alt': meta.alt })
      .map(([name, content]) => `<meta name="twitter:${name}" content="${escape(content)}">`),
  ];
  for (const node of parseFragment('\n' + tags.join('\n') + '\n').childNodes) {
    node.parentNode = head;
    head.childNodes.push(node);
  }
  return serialize(document);
}

export function sitemapXml(settings) {
  const entries = Object.keys(pages).flatMap(page => languages.map(language => {
    const alternates = [...languages, 'x-default'].map(lang =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escape(canonicalUrl(settings, page, lang === 'x-default' ? 'pl' : lang))}"/>`).join('\n');
    return `  <url>\n    <loc>${escape(canonicalUrl(settings, page, language))}</loc>\n${alternates}\n  </url>`;
  }));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

export function robotsTxt(settings) {
  return `User-agent: *\n${settings.indexable ? 'Allow: /' : 'Disallow: /'}\n\nSitemap: ${new URL('sitemap.xml', settings.base).href}\n`;
}

export function seoPlugin({ siteUrl = '', indexable = true } = {}) {
  const settings = siteSettings(siteUrl, indexable);
  let developmentServer;
  const effectiveSettings = () => {
    if (!developmentServer) return settings;
    const address = developmentServer.httpServer.address();
    const port = typeof address === 'object' && address ? address.port : developmentServer.config.server.port;
    return siteSettings(siteUrl, false, `http://127.0.0.1:${port}/`);
  };
  return {
    name: 'static-seo-and-language-pages',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        const route = pageRoute(context.path);
        return route ? renderSeoPage(html, { ...route, settings: effectiveSettings() }) : html;
      },
    },
    configureServer(server) {
      developmentServer = server;
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url, 'http://localhost');
        const preview = effectiveSettings();
        if (url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml') {
          response.setHeader('Content-Type', url.pathname.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
          response.end(url.pathname.endsWith('.xml') ? sitemapXml(preview) : robotsTxt(preview));
          return;
        }
        const route = pageRoute(url.pathname);
        if (!route || !/\.(en|de)\.html$/.test(url.pathname)) return next();
        try {
          const source = readFileSync(new URL(`../${route.page}.html`, import.meta.url), 'utf8');
          const transformed = await server.transformIndexHtml(url.pathname, source, request.originalUrl);
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(renderSeoPage(transformed, { ...route, settings: preview }));
        } catch (error) { next(error); }
      });
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        for (const page of Object.keys(pages)) {
          const source = bundle[`${page}.html`];
          if (!source) throw new Error(`Missing built page: ${page}`);
          for (const language of ['en', 'de']) {
            this.emitFile({ type: 'asset', fileName: pageFile(page, language), source: renderSeoPage(String(source.source), { page, language, settings }) });
          }
        }
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(settings) });
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(settings) });
      },
    },
  };
}
