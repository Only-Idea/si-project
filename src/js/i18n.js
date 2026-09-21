import translations from '../data/translations.json';

const supported = ['pl', 'en', 'de'];
const storageKey = 'si-language';
const requested = new URLSearchParams(location.search).get('lang');
let remembered;
try { remembered = localStorage.getItem(storageKey); } catch { /* Storage may be disabled. */ }
export const language = supported.includes(requested) ? requested
  : requested !== null ? 'pl' : supported.includes(remembered) ? remembered : 'pl';

export function t(key, values = {}) {
  const text = translations[language][key] ?? translations.pl[key];
  if (text === undefined) throw new Error(`Missing translation: ${key}`);
  return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

export const colorName = color => t(`color.${typeof color === 'string' ? color.toLowerCase() : color.id}`);

export function localizedUrl(path) {
  const url = new URL(path, location.href);
  url.searchParams.set('lang', language);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function initLanguage() {
  document.documentElement.lang = language;
  try { localStorage.setItem(storageKey, language); } catch { /* URL navigation still works. */ }
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });
  for (const attribute of ['alt', 'aria-label', 'content']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
    });
  }
  document.querySelectorAll('a[href]').forEach(link => {
    const raw = link.getAttribute('href');
    if (raw.startsWith('#')) return;
    const url = new URL(raw, location.href);
    if (url.origin === location.origin && /\/(?:index|about|products)\.html$/.test(url.pathname)) {
      link.href = localizedUrl(url.href);
    }
  });
  document.querySelectorAll('[data-language-select]').forEach(select => {
    select.value = language;
    select.addEventListener('change', () => {
      if (!supported.includes(select.value)) return;
      const url = new URL(location.href);
      url.searchParams.set('lang', select.value);
      // Reload before the animation engine splits headings, keeping its state clean.
      location.assign(url.href);
    });
  });
}
