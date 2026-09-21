import { motionConfig as cfg, loadAnimationEngine } from './gsap-config.js';

// The HTML is always readable. Motion starts only after the engine has loaded.
export function initMotion() {
  if (!cfg.enabled || !document.body.dataset.page) return () => {};
  const root = document.documentElement;
  const preference = matchMedia(cfg.reducedMotionQuery);
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
      const { gsap, ScrollTrigger, SplitText, Lenis } = await loadAnimationEngine();
      await document.fonts?.ready;
      if (current !== version) return;
      media = gsap.matchMedia();
      disposeEngine = () => media.revert();
      media.add({ desktop: cfg.desktopQuery, tall: cfg.tallQuery, mobile: '(max-width: 768px)' }, context => {
        const { desktop, tall } = context.conditions;
        const pending = [];
        const decorations = [];
        const cleanups = [];
        root.dataset.motion = desktop ? 'desktop' : 'mobile';

        // Smooth, eased scrolling on desktop. Touch devices keep their native momentum.
        if (desktop) {
          const lenis = new Lenis({ lerp: cfg.scrollLerp });
          const tick = time => lenis.raf(time * 1000);
          lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
          const onAnchor = event => {
            const link = event.target.closest('a[href^="#"]:not(.skip-link)');
            const target = link && document.getElementById(decodeURIComponent(link.hash.slice(1)));
            if (!target) return;
            event.preventDefault();
            // Lenis honours the page's scroll-padding-top, so the header offset needs no extra value.
            lenis.scrollTo(target.closest('.pin-spacer') || target, { duration: 1.6 });
            history.pushState(null, '', link.hash);
          };
          document.addEventListener('click', onAnchor);
          cleanups.push(() => {
            document.removeEventListener('click', onAnchor);
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33);
            lenis.destroy();
          });
        }

        function register(trigger, targets, tween, entrance) {
          pending.push({ trigger, targets, tween });
          if (entrance) tween.play();
          else ScrollTrigger.create({ trigger, start: 'top 88%', once: true, onEnter: () => tween.play() });
        }

        // Headings rise through a mask line by line; everything else fades up.
        function reveal(trigger, elements, entrance = false) {
          const targets = [...elements];
          if (!targets.length || revealed.has(trigger)) return;
          // Do not hide content already reached via an anchor, history or Tab.
          if (!entrance && trigger.getBoundingClientRect().top < innerHeight * .88) {
            revealed.add(trigger);
            return;
          }
          const splits = [];
          const dur = desktop ? cfg.duration : cfg.duration * .7;
          const tween = gsap.timeline({
            paused: true,
            onStart: () => revealed.add(trigger),
            onComplete: () => splits.forEach(split => split.revert()),
          });
          targets.forEach((element, index) => {
            const at = index * cfg.stagger * (desktop ? 1 : .6);
            if (/^H[1-3]$/.test(element.tagName)) {
              const split = SplitText.create(element, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
              splits.push(split);
              tween.from(split.lines, { yPercent: 110, duration: dur * 1.25, ease: cfg.lineEase, stagger: .1 }, at);
            } else {
              tween.from(element, {
                opacity: 0, y: desktop ? cfg.revealDistance : 14, duration: dur, ease: cfg.ease, clearProps: 'opacity,transform',
              }, at);
            }
          });
          register(trigger, targets, tween, entrance);
        }

        // Curtain-style wipe for framed images.
        function wipe(target, entrance = false) {
          if (!target || revealed.has(target)) return;
          if (!entrance && target.getBoundingClientRect().top < innerHeight * .9) {
            revealed.add(target);
            return;
          }
          const radius = getComputedStyle(target).borderRadius || '0px';
          const tween = gsap.fromTo(target,
            { clipPath: `inset(0% 0% 100% 0% round ${radius})` },
            {
              clipPath: `inset(0% 0% 0% 0% round ${radius})`, duration: cfg.duration * 1.2, ease: cfg.wipeEase,
              delay: entrance ? .25 : 0, paused: true, clearProps: 'clipPath', onStart: () => revealed.add(target),
            });
          register(target, [target], tween, entrance);
        }

        function addProgress(marker) {
          if (!marker) return null;
          const track = document.createElement('span');
          track.className = 'chapter-progress';
          track.setAttribute('aria-hidden', 'true');
          const fill = document.createElement('span');
          track.append(fill);
          marker.append(track);
          decorations.push(track);
          return fill;
        }

        const hero = document.querySelector('.hero-copy, .story-hero, .product-intro');
        if (hero && scrollY < 24 && !location.hash) {
          reveal(hero, hero.children, true);
          wipe(document.querySelector('.hero-art img'), true);
        }
        document.querySelectorAll('.feature-section-heading, .about-teaser-copy, .details-copy, .color-copy, .contact-section, .use-steps li').forEach(section => {
          reveal(section, section.children);
        });
        // Feature cards cascade as a row on desktop; on mobile each card reveals on its own.
        const grid = document.querySelector('.feature-grid');
        if (grid && desktop) reveal(grid, grid.children);
        else document.querySelectorAll('.feature').forEach(card => reveal(card, card.children));
        document.querySelectorAll('.about-teaser img, .story-product-image .image-frame, .in-use-photo .installation-frame').forEach(image => wipe(image));

        // Chapters inside the stage share one pinned viewport and swap in place as you scroll.
        const stage = desktop && tall ? document.querySelector('[data-story-stage]') : null;
        const staged = [];

        document.querySelectorAll('[data-story-chapter]').forEach(chapter => {
          const marker = chapter.querySelector('.chapter-marker');
          const content = chapter.querySelector('.chapter-content') || chapter;
          const fill = addProgress(marker);
          const intro = marker ? marker.querySelectorAll('.chapter-number, .eyebrow, .chapter-illustration') : [];
          if (stage?.contains(chapter)) {
            // The stage timeline owns everything after the heading, so the time-based reveal leaves it alone.
            const steps = [...content.children].filter(child => child.tagName !== 'H2');
            staged.push({ chapter, fill, steps });
            if (staged.length === 1) reveal(chapter, [...intro, ...[...content.children].filter(child => !steps.includes(child))]);
            return;
          }
          reveal(chapter, [...intro, ...content.children]);
          ScrollTrigger.create({ trigger: chapter, start: 'top 55%', end: 'bottom 35%', toggleClass: 'is-current' });
          if (fill) gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: {
            trigger: chapter, start: 'top 65%', end: 'bottom 40%', scrub: true,
          } });
        });

        if (stage) {
          stage.classList.add('is-staged');
          // The stage pushes the product photo several screens down; fetch it now so it is ready when the stage lets go.
          document.querySelector('.story-product-image img')?.setAttribute('loading', 'eager');
          const timeline = gsap.timeline({ defaults: { ease: 'none' } });
          const dist = cfg.revealDistance;
          const shown = [];
          let cursor = 0;
          staged.forEach(({ chapter, fill, steps }, index) => {
            chapter.classList.add('is-current');
            const inner = chapter.firstElementChild;
            const begin = index ? cursor + .5 : 0;
            if (index) {
              // The previous chapter lifts away while this one settles into the same spot.
              const { chapter: previous } = staged[index - 1];
              timeline.to(previous, { opacity: 0, duration: .8, ease: 'power1.in' }, cursor)
                .to(previous.firstElementChild, { y: -dist, duration: .8, ease: 'power2.in' }, cursor)
                .fromTo(chapter, { opacity: 0 }, { opacity: 1, duration: .9 }, begin)
                .fromTo(inner, { y: dist }, { y: 0, duration: .9, ease: 'power2.out' }, begin);
              cursor += 1.4;
            }
            gsap.set(steps, { opacity: 0, y: dist });
            const links = steps.filter(step => step.matches('a'));
            gsap.set(links, { pointerEvents: 'none' });
            // Each new paragraph arrives while the one before it steps back.
            steps.forEach((step, i) => {
              const at = cursor + i * 1.5;
              timeline.to(step, { opacity: 1, y: 0, ease: 'power2.out', duration: 1 }, at);
              if (i) timeline.to(steps[i - 1], { opacity: .3, duration: 1 }, at);
              if (links.includes(step)) timeline.set(step, { pointerEvents: 'auto' }, at);
            });
            const done = cursor + (steps.length - 1) * 1.5 + 1;
            shown.push(done);
            // Everything comes back to full strength before the chapter gives way.
            timeline.to(steps, { opacity: 1, duration: .6 }, done + .2);
            cursor = done + 1.4;
            if (fill) timeline.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: cursor - begin - .6 }, begin);
          });
          timeline.to({}, { duration: .2 });
          const trigger = ScrollTrigger.create({
            animation: timeline, trigger: stage, start: 'top 100px', end: () => `+=${Math.round(timeline.duration() * cfg.pinUnit)}`,
            pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          });
          // Keyboard focus on a hidden chapter's link brings that chapter into view.
          const focusStage = event => {
            const index = staged.findIndex(({ chapter }) => chapter.contains(event.target));
            if (index < 1) return;
            window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * shown[index] / timeline.duration(), behavior: 'instant' });
          };
          document.addEventListener('focusin', focusStage);
          cleanups.push(() => {
            document.removeEventListener('focusin', focusStage);
            stage.classList.remove('is-staged');
          });
        }

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
          // The photo drifts inside its frame; the frame itself stays put.
          document.querySelectorAll('img[data-parallax]').forEach(image => {
            gsap.fromTo(image, { yPercent: -cfg.parallax, scale: 1.14 }, {
              yPercent: cfg.parallax, scale: 1.14, ease: 'none', scrollTrigger: {
                trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: true,
              },
            });
          });
          // The two rings drift together as the wedding chapter comes into view (the stage animates its own).
          if (!stage) document.querySelectorAll('.story-rings span').forEach((ring, index) => {
            gsap.from(ring, { x: index ? 56 : -56, opacity: 0, ease: 'none', scrollTrigger: {
              trigger: '.story-wedding', start: 'top 75%', end: 'top 25%', scrub: true,
            } });
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
        // A refresh during the browser's initial anchor scroll can cancel it.
        // Restore only an untouched initial deep link, never a visitor's scroll position.
        let interacted = false;
        const initialHash = location.hash;
        const markInteraction = () => { interacted = true; };
        const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
        interactionEvents.forEach(type => window.addEventListener(type, markInteraction, { passive: true, once: true }));
        const restoreAnchor = () => {
          if (!active || interacted || !initialHash || location.hash !== initialHash) return;
          try {
            const target = document.getElementById(decodeURIComponent(initialHash.slice(1)));
            (target?.closest('.pin-spacer') || target)?.scrollIntoView({ behavior: 'instant', block: 'start' });
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
          cleanups.forEach(cleanup => cleanup());
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
