import translations from '../data/translations.json';
import { languages as supported, pageRoute, pageFile } from './site-routes.js';

const storageKey = 'si-language';
const requested = new URLSearchParams(location.search).get('lang');
const route = pageRoute(location.pathname);
let remembered;
try { remembered = localStorage.getItem(storageKey); } catch { /* Storage may be disabled. */ }
export const language = supported.includes(requested) ? requested
  : requested !== null ? 'pl' : route?.language !== 'pl' && route?.language ? route.language
    : supported.includes(remembered) ? remembered : 'pl';

export function t(key, values = {}) {
  const text = translations[language][key] ?? translations.pl[key];
  if (text === undefined) throw new Error(`Missing translation: ${key}`);
  return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

export const colorName = color => t(`color.${typeof color === 'string' ? color.toLowerCase() : color.id}`);

export function localizedUrl(path, locale = language) {
  const url = new URL(path, location.href);
  const target = pageRoute(url.pathname);
  if (target) url.pathname = target.directory + pageFile(target.page, locale);
  url.searchParams.delete('lang');
  return `${url.pathname}${url.search}${url.hash}`;
}

export function initLanguage() {
  try { localStorage.setItem(storageKey, language); } catch { /* URL navigation still works. */ }
  // Legacy ?lang= links and saved preferences lead to real, crawlable language pages.
  const destination = localizedUrl(location.href);
  if (destination !== location.pathname + location.search + location.hash) {
    location.replace(destination);
    return false;
  }
  document.documentElement.lang = language;
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
    if (url.origin === location.origin && pageRoute(url.pathname)) {
      link.href = localizedUrl(url.href);
    }
  });
  document.querySelectorAll('[data-language-select]').forEach(select => {
    select.value = language;
    select.addEventListener('change', () => {
      if (!supported.includes(select.value)) return;
      try { localStorage.setItem(storageKey, select.value); } catch { /* The URL retains the language. */ }
      // Reload before the animation engine splits headings, keeping its state clean.
      location.assign(localizedUrl(location.href, select.value));
    });
  });
  return true;
}
