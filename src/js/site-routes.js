export const languages = ['pl', 'en', 'de'];
export const pages = { index: 'home', products: 'product', about: 'about' };

export function pageRoute(pathname) {
  const match = pathname.match(/^(.*\/)(index|products|about)(?:\.(en|de))?\.html$/);
  if (match) return { directory: match[1], page: match[2], language: match[3] || 'pl' };
  if (pathname.endsWith('/')) return { directory: pathname, page: 'index', language: 'pl' };
  return null;
}

export function pageFile(page, language = 'pl') {
  return `${page}${language === 'pl' ? '' : `.${language}`}.html`;
}
