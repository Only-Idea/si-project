export function initNavigation() {
  const navigation = document.querySelector('#navigation');
  const menu = document.querySelector('.menu-toggle');
  const polish = document.documentElement.lang === 'pl';
  const openLabel = polish ? 'Otwórz menu' : 'Open navigation';
  const closeLabel = polish ? 'Zamknij menu' : 'Close navigation';
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
