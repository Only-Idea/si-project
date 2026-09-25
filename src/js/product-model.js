// Photos / 360° video switch. The video (~120 KB) is only requested when first opened.
export function initProductModel(viewer) {
  const panel = viewer.querySelector('[data-product-model]');
  const viewport = viewer.querySelector('.carousel-viewport');
  const carousel = viewer.querySelector('.carousel-controls');
  const switches = [...viewer.querySelectorAll('[data-product-view]')];
  const video = panel.querySelector('video');
  const GAIN = 2.2; // body color strength

  switches.forEach(button => button.addEventListener('click', () => {
    const is360 = button.dataset.productView === '3d';
    switches.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panel.hidden = !is360;
    viewport.hidden = is360;
    carousel.hidden = is360;
    if (!is360) return video.pause();
    if (!video.src) video.src = video.dataset.src;
    video.play().catch(() => {}); // ponytail: autoplay blocked (e.g. data saver) leaves the first frame
  }));

  const matrix = viewer.querySelector('[data-color-matrix]');
  video.style.filter = 'url(#model-color)';
  return {
    // ponytail: neutrals stay, green-dominant pixels become the target color, shading kept; GAIN tunes body brightness
    setColor({ hex }) {
      const T = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
      const row = c => `${0.633 - 0.5 * GAIN * c} ${-0.267 + GAIN * c} ${0.633 - 0.5 * GAIN * c} 0 0`;
      matrix.setAttribute('values', `${T.map(row).join(' ')} 0 0 0 1 0`);
    },
  };
}
