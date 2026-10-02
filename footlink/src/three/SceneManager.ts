import * as THREE from 'three';
import gsap from 'gsap';
import { LightingSetup } from './LightingSetup';
import { ModelLoader } from './ModelLoader';
import { MODEL_PATHS, MODEL_CONFIGS, MODEL_TRANSITIONS } from '../utils/constants';

type ModelSection = keyof typeof MODEL_PATHS;
type SceneSection = ModelSection | 'footer';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private lighting: LightingSetup;
  private modelLoader: ModelLoader;
  
  public models: Partial<Record<ModelSection, THREE.Group>> = {};
  public modelGroup: THREE.Group; // Group to hold the active model for floating animations
  
  private clock: THREE.Clock;
  private basePositionY: number = 0; // Store the base position to fix floating accumulation
  private isFloatingEnabled: boolean = true;
  private activeSection: SceneSection = 'hero';
  private initialLoadComplete: boolean = false;
  private loadingModels = new Set<ModelSection>();
  private activeModel: THREE.Group | null = null;
  private activeModelSection: ModelSection | null = null;
  private modelBaseScales = new WeakMap<THREE.Group, THREE.Vector3>();
  private transitionTimeline: gsap.core.Timeline | null = null;
  private transitionPhase: 'enter' | 'exit' | null = null;
  private transitionDirection: -1 | 0 | 1 = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    this.lighting = new LightingSetup(this.scene);
    this.modelLoader = new ModelLoader();
    this.clock = new THREE.Clock();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  public async init() {
    this.lighting.init();
    this.animate();

    // Start all requests together, but let the hero render as soon as it is ready.
    const heroLoad = this.loadModel('hero');
    void this.loadModel('features');
    await heroLoad;

    if (this.models.hero) {
      this.setActiveModel('hero', 0);
    } else {
      const firstLoadedSection = (['features'] as ModelSection[])
        .find((section) => this.models[section]);
      if (firstLoadedSection) this.setActiveModel(firstLoadedSection, 0);
    }

    this.initialLoadComplete = true;
  }

  private async loadModel(section: ModelSection): Promise<void> {
    if (this.models[section] || this.loadingModels.has(section)) return;
    this.loadingModels.add(section);

    try {
      const model = await this.modelLoader.load(MODEL_PATHS[section]);
      this.applyConfig(model, MODEL_CONFIGS[section]);
      this.models[section] = model;

      const mayUseAsFallback = this.initialLoadComplete
        && this.modelGroup.children.length === 0
        && this.activeSection !== 'menu'
        && this.activeSection !== 'footer';
      if ((this.initialLoadComplete && this.activeSection === section) || mayUseAsFallback) {
        this.setActiveModel(section, this.transitionDirection);
      }
    } catch (error) {
      console.error(`Falló la carga del modelo de ${section}:`, error);
    } finally {
      this.loadingModels.delete(section);
    }
  }

  private applyConfig(model: THREE.Group, config: (typeof MODEL_CONFIGS)[ModelSection]) {
    model.scale.multiplyScalar(config.scale);
    model.position.set(config.position.x, config.position.y, config.position.z);
    model.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    this.modelBaseScales.set(model, model.scale.clone());
    model.visible = false; // Hide all initially
  }

  public preloadModel(section: ModelSection): void {
    void this.loadModel(section);
  }

  public setActiveModel(section: SceneSection, direction: -1 | 0 | 1 = 1) {
    this.activeSection = section;
    this.transitionDirection = direction;

    if (section === 'footer') {
      if (!this.activeModel || this.transitionPhase === 'exit') return;
      this.stopTransition();
      this.startExiting(this.activeModel);
      return;
    }

    const activeModel = this.models[section];
    if (!activeModel) {
      // Keep the current product on screen while the next GLB loads. If it was
      // already leaving, bring it back instead of showing an empty canvas.
      if (this.transitionPhase === 'exit' && this.activeModel && this.activeModelSection) {
        const currentModel = this.activeModel;
        const currentSection = this.activeModelSection;
        this.stopTransition();
        this.startEntering(currentModel, currentSection, false);
      }
      if (section === 'menu') {
        void this.loadModel('menu');
      }
      return;
    }

    if (this.activeModel === activeModel) {
      this.lighting.updateForSection(section);
      if (this.transitionPhase === 'exit') {
        const currentModel = this.activeModel;
        this.stopTransition();
        this.startEntering(currentModel, section, false);
      }
      return;
    }

    // Finish an exit already in progress, then enter whichever section is
    // current at that moment. This prevents rapid scrolls stacking models.
    if (this.transitionPhase === 'exit') return;

    if (this.transitionPhase === 'enter') this.stopTransition();

    if (this.activeModel) {
      this.startExiting(this.activeModel);
    } else {
      this.startEntering(activeModel, section, true);
    }
  }

  private startEntering(
    model: THREE.Group,
    section: ModelSection,
    fromOffset: boolean
  ): void {
    const config = MODEL_CONFIGS[section];
    const compactLayout = this.camera.aspect < 1;
    const mobileY = section === 'menu'
      ? config.position.y + 1.35
      : section === 'features'
        ? -1.86
        : -1.42;
    const targetPosition = new THREE.Vector3(
      compactLayout ? 0 : config.position.x,
      compactLayout ? mobileY : config.position.y,
      config.position.z
    );
    const viewportScale = compactLayout
      ? Math.min(0.62, Math.max(0.46, this.camera.aspect * 0.95))
      : 1;
    const targetScale = (this.modelBaseScales.get(model) ?? model.scale)
      .clone()
      .multiplyScalar(viewportScale);
    const targetRotation = new THREE.Euler(config.rotation.x, config.rotation.y, config.rotation.z);
    const entrySide = MODEL_TRANSITIONS[section].enterFrom;

    this.lighting.updateForSection(section);
    this.modelGroup.rotation.set(0, 0, 0);
    this.modelGroup.position.set(0, 0, 0);
    this.activeModel = model;
    this.activeModelSection = section;
    this.isFloatingEnabled = false;
    this.basePositionY = targetPosition.y;
    model.visible = true;
    if (model.parent !== this.modelGroup) this.modelGroup.add(model);

    if (fromOffset) {
      model.position.set(
        targetPosition.x + entrySide * 1.05,
        targetPosition.y - 0.2,
        targetPosition.z - 0.35
      );
      model.scale.copy(targetScale).multiplyScalar(0.86);
      model.rotation.set(
        targetRotation.x + 0.08,
        targetRotation.y + entrySide * 0.32,
        targetRotation.z
      );
    }

    this.transitionPhase = 'enter';
    let timeline!: gsap.core.Timeline;
    timeline = gsap.timeline({
      onComplete: () => {
        if (this.transitionTimeline !== timeline) return;
        this.transitionTimeline = null;
        this.transitionPhase = null;
        this.isFloatingEnabled = true;

        const requestedSection = this.activeSection;
        if (
          requestedSection !== section
          && (requestedSection === 'footer' || this.models[requestedSection])
        ) {
          this.setActiveModel(requestedSection, this.transitionDirection);
        }
      }
    });

    this.transitionTimeline = timeline;
    timeline.to(model.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: fromOffset ? 0.58 : 0.42,
      ease: 'power3.out'
    }, 0);
    timeline.to(model.scale, {
      x: targetScale.x,
      y: targetScale.y,
      z: targetScale.z,
      duration: fromOffset ? 0.58 : 0.42,
      ease: 'power3.out'
    }, 0);
    timeline.to(model.rotation, {
      x: targetRotation.x,
      y: targetRotation.y,
      z: targetRotation.z,
      duration: fromOffset ? 0.58 : 0.42,
      ease: 'power2.out'
    }, 0);
  }

  private startExiting(model: THREE.Group): void {
    this.isFloatingEnabled = false;
    this.transitionPhase = 'exit';
    const exitScale = model.scale.clone().multiplyScalar(0.82);
    const exitSide = this.activeModelSection
      ? MODEL_TRANSITIONS[this.activeModelSection].exitTo
      : -1;
    const distance = Math.max(0.1, this.camera.position.z - model.position.z);
    const horizontalHalfView = distance
      * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
      * this.camera.aspect;
    const exitX = exitSide * (horizontalHalfView + 1.45);
    let timeline: gsap.core.Timeline;

    timeline = gsap.timeline({
      onComplete: () => {
        if (this.transitionTimeline !== timeline) return;
        this.modelGroup.remove(model);
        model.visible = false;
        if (this.activeModel === model) {
          this.activeModel = null;
          this.activeModelSection = null;
        }
        this.transitionTimeline = null;
        this.transitionPhase = null;
        this.isFloatingEnabled = true;

        const requestedSection = this.activeSection;
        if (requestedSection !== 'footer') {
          const incomingModel = this.models[requestedSection];
          if (incomingModel) {
            this.startEntering(incomingModel, requestedSection, true);
          }
        }
      }
    });

    this.transitionTimeline = timeline;
    timeline.to(model.position, {
      x: exitX,
      y: model.position.y + 0.22,
      z: model.position.z - 0.25,
      duration: 0.42,
      ease: 'power2.in'
    }, 0);
    timeline.to(model.scale, {
      x: exitScale.x,
      y: exitScale.y,
      z: exitScale.z,
      duration: 0.42,
      ease: 'power2.in'
    }, 0);
    timeline.to(model.rotation, {
      y: model.rotation.y + exitSide * 0.22,
      duration: 0.42,
      ease: 'power2.in'
    }, 0);
  }

  private stopTransition(): void {
    this.transitionTimeline?.kill();
    this.transitionTimeline = null;
    this.transitionPhase = null;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    if (this.isFloatingEnabled && this.activeModel) {
      // FIX: Do not accumulate +=, use absolute set based on basePositionY
      this.activeModel.position.y = this.basePositionY + Math.sin(elapsedTime * 1.5) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (
      this.activeModel
      && this.activeModelSection
      && this.transitionPhase !== 'exit'
    ) {
      const model = this.activeModel;
      const section = this.activeModelSection;
      this.stopTransition();
      this.startEntering(model, section, false);
    }
  }

  // Getters for scroll animations
  public getCamera() { return this.camera; }
  public getModelGroup() { return this.modelGroup; }
}
