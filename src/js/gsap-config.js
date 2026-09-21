// Shared timing and responsive limits for the progressive animation layer.
export const motionConfig = Object.freeze({
  enabled: true,
  duration: 0.85,
  stagger: 0.1,
  revealDistance: 24,
  parallaxDistance: 24,
  ease: 'power2.out',
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  desktopQuery: '(min-width: 769px)',
});

export async function loadAnimationEngine() {
  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
