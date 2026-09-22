import { t } from './i18n.js';

// Keep the 3D engine and the CAD download off the initial page load.
export function initProductModel(viewer, first) {
  const panel = viewer.querySelector('[data-product-model]');
  const viewport = viewer.querySelector('.carousel-viewport');
  const carousel = viewer.querySelector('.carousel-controls');
  const switches = [...viewer.querySelectorAll('[data-product-view]')];
  const status = panel.querySelector('[data-model-status]');
  const retry = panel.querySelector('[data-model-retry]');
  const toolbar = panel.querySelector('[data-model-toolbar]');
  let selected = first;
  let engine;
  let loading = false;

  function fail() {
    engine?.dispose();
    engine = null;
    panel.dataset.state = 'error';
    status.textContent = t('model.error');
    toolbar.hidden = true;
    retry.hidden = false;
  }

  async function load() {
    if (engine || loading) return;
    loading = true;
    panel.dataset.state = 'loading';
    panel.setAttribute('aria-busy', 'true');
    status.textContent = t('model.loading');
    retry.hidden = true;
    try {
      const { createProductModel } = await import('./product-model-scene.js');
      engine = await createProductModel(panel.querySelector('[data-model-canvas]'), {
        label: t('model.keyboard'),
        onContextLost: fail,
      });
      engine.setColor(selected);
      engine.setVisible(!panel.hidden);
      panel.dataset.state = 'ready';
      status.textContent = '';
      toolbar.hidden = false;
    } catch {
      fail();
    } finally {
      loading = false;
      panel.setAttribute('aria-busy', 'false');
    }
  }

  switches.forEach(button => button.addEventListener('click', () => {
    const isModel = button.dataset.productView === '3d';
    switches.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panel.hidden = !isModel;
    viewport.hidden = isModel;
    carousel.hidden = isModel;
    engine?.setVisible(isModel);
    if (isModel) load();
  }));
  retry.addEventListener('click', load);
  panel.querySelectorAll('[data-model-action]').forEach(button => {
    button.addEventListener('click', () => engine?.action(button.dataset.modelAction));
  });
  if (import.meta.hot) import.meta.hot.dispose(() => engine?.dispose());
  return {
    setColor(color) {
      selected = color;
      engine?.setColor(color);
    },
  };
}
