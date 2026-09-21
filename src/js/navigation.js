import { t } from './i18n.js';

export function initNavigation() {
  const navigation = document.querySelector('#navigation');
  const menu = document.querySelector('.menu-toggle');
  const openLabel = t('nav.open');
  const closeLabel = t('nav.close');
  function closeMenu(restoreFocus = false) {
    navigation?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', openLabel);
    if (restoreFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? closeLabel : openLabel);
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true' && !document.querySelector('dialog[open]')) closeMenu(true);
  });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

}
