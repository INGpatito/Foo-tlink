import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SceneManager } from '../three/SceneManager';
import { THEME_COLORS } from '../utils/constants';

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimations {
  private lenis!: Lenis;
  private sceneManager: SceneManager;
  private lastLenisScroll = 0;
  private lastLenisLimit = 0;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  public init() {
    this.initLenis();
    this.initGSAP();
  }

  private initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      infinite: true,
      syncTouch: true,
      anchors: true,
      stopInertiaOnNavigate: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    this.lastLenisScroll = this.lenis.scroll;
    this.lastLenisLimit = this.lenis.limit;
    this.lenis.on('scroll', (lenis) => {
      ScrollTrigger.update();

      // ScrollTrigger sees the physical scroll position jump from one end to
      // the other. Explicitly settle the scene at that loop boundary so the
      // last intermediate trigger cannot leave the wrong product active.
      const currentScroll = lenis.scroll;
      const loopLimit = lenis.limit;
      const limitChanged = Math.abs(loopLimit - this.lastLenisLimit) > 1;
      if (!limitChanged && loopLimit > 0 && currentScroll < this.lastLenisScroll - loopLimit / 2) {
        this.sceneManager.setActiveModel('hero', -1);
        document.body.setAttribute('data-section', 'hero');
      } else if (!limitChanged && loopLimit > 0 && currentScroll > this.lastLenisScroll + loopLimit / 2) {
        this.sceneManager.setActiveModel('footer', 1);
        document.body.setAttribute('data-section', 'footer');
      }
      this.lastLenisScroll = currentScroll;
      this.lastLenisLimit = loopLimit;
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  private initGSAP() {
    // Start with a warm, dimensional glow that will crossfade with each section.
    gsap.set('body', {
      backgroundColor: THEME_COLORS.brand1,
      color: THEME_COLORS.charcoal,
      '--ambient-primary': 'rgba(242, 166, 90, 0.42)',
      '--ambient-secondary': 'rgba(231, 106, 51, 0.22)',
      '--ambient-tertiary': 'rgba(255, 241, 214, 0.5)'
    });

    // Section 1: Hero (Burger) -> Features (Pizza)
    ScrollTrigger.create({
      trigger: '#features-root',
      start: 'top bottom',
      end: 'top center',
      scrub: true,
      onEnter: () => {
        this.sceneManager.setActiveModel('features', 1);
        this.sceneManager.preloadModel('menu');
        document.body.setAttribute('data-section', 'features');
      },
      onLeaveBack: () => {
        this.sceneManager.setActiveModel('hero', -1);
        document.body.setAttribute('data-section', 'hero');
      }
    });

    // Animate Body Color to Charcoal for Pizza
    gsap.to('body', {
      backgroundColor: THEME_COLORS.charcoal,
      color: THEME_COLORS.brand1,
      '--ambient-primary': 'rgba(232, 106, 51, 0.34)',
      '--ambient-secondary': 'rgba(107, 78, 255, 0.2)',
      '--ambient-tertiary': 'rgba(199, 69, 42, 0.16)',
      ease: 'none',
      scrollTrigger: {
        trigger: '#features-root',
        start: 'top bottom',
        end: 'top center',
        scrub: true,
      }
    });

    // Section 2: Features (Pizza) -> Menu (Donut)
    ScrollTrigger.create({
      trigger: '#menu-root',
      start: 'top bottom',
      end: 'top center',
      scrub: true,
      onEnter: () => {
        this.sceneManager.setActiveModel('menu', 1);
        document.body.setAttribute('data-section', 'menu');
      },
      onLeaveBack: () => {
        this.sceneManager.setActiveModel('features', -1);
        document.body.setAttribute('data-section', 'features');
      }
    });

    // Shift into a deeper plum with violet and berry light for the donut.
    gsap.to('body', {
      backgroundColor: THEME_COLORS.plum,
      color: '#ffffff',
      '--ambient-primary': 'rgba(107, 78, 255, 0.4)',
      '--ambient-secondary': 'rgba(232, 106, 51, 0.23)',
      '--ambient-tertiary': 'rgba(197, 91, 164, 0.22)',
      ease: 'none',
      scrollTrigger: {
        trigger: '#menu-root',
        start: 'top bottom',
        end: 'top center',
        scrub: true,
      }
    });

    // The donut GLB is prefetched once the visitor reaches the pizza section.
    // Section 3: Footer
    ScrollTrigger.create({
      trigger: '#footer-root',
      start: 'top center',
      onEnter: () => {
        this.sceneManager.setActiveModel('footer');
        document.body.setAttribute('data-section', 'footer');
      },
      onLeaveBack: () => {
        this.sceneManager.setActiveModel('menu', -1);
        document.body.setAttribute('data-section', 'menu');
      }
    });

    // Keep the footer palette scroll-driven too, so wrapping back to the hero
    // resets the whole page theme instead of leaving a stale footer tween.
    gsap.to('body', {
      backgroundColor: THEME_COLORS.charcoal,
      color: THEME_COLORS.brand1,
      '--ambient-primary': 'rgba(232, 106, 51, 0.28)',
      '--ambient-secondary': 'rgba(107, 78, 255, 0.13)',
      '--ambient-tertiary': 'rgba(199, 69, 42, 0.14)',
      ease: 'none',
      scrollTrigger: {
        trigger: '#footer-root',
        start: 'top bottom',
        end: 'top center',
        scrub: true,
      }
    });

    // Parallax elements
    gsap.utils.toArray('.editorial-block').forEach((el: any) => {
      gsap.to(el, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }
}
