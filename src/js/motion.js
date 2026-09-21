import { motionConfig, loadAnimationEngine } from './gsap-config.js';

// The HTML is always readable. Motion starts only after the engine has loaded.
export function initMotion() {
  if (!motionConfig.enabled || !document.body.dataset.page) return () => {};
  const root = document.documentElement;
  const preference = matchMedia(motionConfig.reducedMotionQuery);
  const revealed = new WeakSet();
  let version = 0;
  let disposeEngine = () => {};

  async function configure() {
    const current = ++version;
    disposeEngine();
    disposeEngine = () => {};
    root.dataset.motion = preference.matches ? 'reduced' : 'loading';
    if (preference.matches) return;
    let media;
    try {
      const { gsap, ScrollTrigger } = await loadAnimationEngine();
      if (current !== version) return;
      media = gsap.matchMedia();
      disposeEngine = () => media.revert();
      media.add({ desktop: motionConfig.desktopQuery, mobile: '(max-width: 768px)' }, context => {
        const desktop = context.conditions.desktop;
        const pending = [];
        const decorations = [];
        root.dataset.motion = desktop ? 'desktop' : 'mobile';

        function reveal(trigger, elements, entrance = false) {
          const targets = [...elements];
          if (!targets.length || revealed.has(trigger)) return;
          // Do not hide content already reached via an anchor, history or Tab.
          if (!entrance && trigger.getBoundingClientRect().top < innerHeight * .88) {
            revealed.add(trigger);
            return;
          }
          const tween = gsap.from(targets, {
            opacity: 0, y: desktop ? motionConfig.revealDistance : 12,
            duration: desktop ? motionConfig.duration : .55,
            stagger: motionConfig.stagger, ease: motionConfig.ease,
            paused: true, immediateRender: false, clearProps: 'opacity,transform',
            onStart: () => revealed.add(trigger),
          });
          pending.push({ trigger, targets, tween });
          if (entrance) tween.play();
          else ScrollTrigger.create({ trigger, start: 'top 88%', once: true, onEnter: () => tween.play() });
        }

        const hero = document.querySelector('.hero-copy, .story-hero, .product-intro');
        if (hero && scrollY < 24 && !location.hash) reveal(hero, hero.children, true);
        document.querySelectorAll('.feature-section-heading, .feature, .about-teaser-copy, .details-copy, .contact-section, .use-steps li').forEach(section => {
          reveal(section, section.children);
        });
        document.querySelectorAll('[data-story-chapter]').forEach(chapter => {
          const content = chapter.querySelector('.chapter-content') || chapter;
          reveal(chapter, content.children);
          ScrollTrigger.create({ trigger: chapter, start: 'top 55%', end: 'bottom 35%', toggleClass: 'is-current' });
          const marker = chapter.querySelector('.chapter-marker');
          if (marker) {
            const track = document.createElement('span');
            track.className = 'chapter-progress';
            track.setAttribute('aria-hidden', 'true');
            const fill = document.createElement('span');
            track.append(fill);
            marker.append(track);
            decorations.push(track);
            gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: {
              trigger: chapter, start: 'top 65%', end: 'bottom 40%', scrub: true,
            } });
          }
        });

        const story = document.querySelector('.about-page');
        if (story) {
          const progress = document.createElement('div');
          progress.className = 'reading-progress';
          progress.setAttribute('aria-hidden', 'true');
          const fill = document.createElement('span');
          progress.append(fill);
          document.querySelector('.site-header').append(progress);
          decorations.push(progress);
          gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: {
            trigger: story, start: 'top top', end: 'bottom bottom', scrub: true,
          } });
        }

        if (desktop) {
          document.querySelectorAll('.design-hero, .story-product-image, .in-use-photo').forEach(figure => {
            gsap.fromTo(figure, { y: -motionConfig.parallaxDistance }, {
              y: motionConfig.parallaxDistance, ease: 'none', scrollTrigger: {
                trigger: figure, start: 'top bottom', end: 'bottom top', scrub: .6,
              },
            });
          });
          const rings = document.querySelector('.story-rings');
          if (rings) gsap.fromTo(rings, { x: -10, rotation: -8 }, {
            x: 10, rotation: 8, ease: 'none', scrollTrigger: {
              trigger: '.story-wedding', start: 'top bottom', end: 'bottom top', scrub: .7,
            },
          });
        }

        const focus = event => {
          pending.forEach(({ trigger, targets, tween }) => {
            if (targets.some(target => target === event.target || target.contains(event.target))) {
              revealed.add(trigger);
              tween.progress(1).pause();
            }
          });
        };
        document.addEventListener('focusin', focus);
        // Refresh when typography and late images settle; clean up on preference changes/HMR.
        const refresh = () => ScrollTrigger.refresh();
        const images = [...document.images].filter(image => !image.complete);
        images.forEach(image => image.addEventListener('load', refresh, { once: true }));
        let active = true;
        document.fonts?.ready.then(() => { if (active) refresh(); });
        refresh();
        // A refresh during the browser's initial smooth anchor scroll can cancel it.
        // Restore only an untouched initial deep link, never a visitor's scroll position.
        let interacted = false;
        const markInteraction = () => { interacted = true; };
        const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
        interactionEvents.forEach(type => window.addEventListener(type, markInteraction, { passive: true, once: true }));
        const restoreAnchor = () => {
          if (!active || interacted || !location.hash || scrollY >= 24) return;
          try {
            document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' });
            ScrollTrigger.update();
          } catch { /* An invalid fragment should not interrupt the page. */ }
        };
        const anchorFrame = requestAnimationFrame(restoreAnchor);
        window.addEventListener('load', restoreAnchor, { once: true });
        return () => {
          active = false;
          cancelAnimationFrame(anchorFrame);
          window.removeEventListener('load', restoreAnchor);
          interactionEvents.forEach(type => window.removeEventListener(type, markInteraction));
          document.removeEventListener('focusin', focus);
          images.forEach(image => image.removeEventListener('load', refresh));
          decorations.forEach(element => element.remove());
          document.querySelectorAll('[data-story-chapter]').forEach(chapter => chapter.classList.remove('is-current'));
        };
      });
    } catch (error) {
      media?.revert();
      if (current === version) root.dataset.motion = 'unavailable';
      console.warn('Motion is unavailable; the static page remains usable.', error);
    }
  }
  preference.addEventListener('change', configure);
  configure();
  return () => {
    version++;
    preference.removeEventListener('change', configure);
    disposeEngine();
    delete root.dataset.motion;
  };
}
