// Shared timing and responsive limits for the progressive animation layer.
export const motionConfig = Object.freeze({
  enabled: true,
  duration: 1.1,
  stagger: 0.12,
  revealDistance: 36,
  ease: 'power3.out',
  lineEase: 'expo.out',
  wipeEase: 'power3.inOut',
  scrollLerp: 0.09,
  parallax: 6,
  pinUnit: 200,
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  desktopQuery: '(min-width: 769px)',
  tallQuery: '(min-height: 680px)',
});

export async function loadAnimationEngine() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  return { gsap, ScrollTrigger, SplitText, Lenis };
}
