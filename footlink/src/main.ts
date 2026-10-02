import { SceneManager } from './three/SceneManager';
import { ScrollAnimations } from './animations/ScrollAnimations';
import { initNavbar } from './ui/Navbar';
import { initHeroSection } from './sections/HeroSection';
import { initFeaturesSection } from './sections/FeaturesSection';
import { initMenuSection } from './sections/MenuSection';
import { initFooterSection } from './sections/FooterSection';
import { initLoginModal } from './ui/LoginModal';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize UI Elements First
    initNavbar(document.getElementById('navbar-root'));
    initHeroSection(document.getElementById('hero-root'));
    initFeaturesSection(document.getElementById('features-root'));
    initMenuSection(document.getElementById('menu-root'));
    initFooterSection(document.getElementById('footer-root'));
    initLoginModal(document.getElementById('login-modal-root'));

    // 2. Initialize Three.js Scene
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('WebGL Canvas not found');

    const sceneManager = new SceneManager(canvas);
    await sceneManager.init();

    // 3. Initialize Scroll Animations (GSAP + Lenis)
    const scrollAnimations = new ScrollAnimations(sceneManager);
    scrollAnimations.init();

    console.log('Footlink está listo.');

  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});
