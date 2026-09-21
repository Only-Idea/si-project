// Apply before first paint; explicit share links take precedence over saved preference.
(() => {
  const options = ['blue', 'sage', 'clay'];
  let palette = new URLSearchParams(location.search).get('palette');
  if (!options.includes(palette)) {
    try { palette = localStorage.getItem('si-design-palette'); } catch { /* Storage may be unavailable in a local file. */ }
  }
  document.documentElement.dataset.palette = options.includes(palette) ? palette : 'blue';
})();
