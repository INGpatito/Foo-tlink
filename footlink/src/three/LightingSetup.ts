import * as THREE from 'three';

export class LightingSetup {
  private scene: THREE.Scene;
  
  private ambientLight!: THREE.AmbientLight;
  private dirLightMain!: THREE.DirectionalLight;
  private dirLightFill!: THREE.DirectionalLight;
  private spotLight!: THREE.SpotLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public init() {
    // Base ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Main directional (Key light)
    this.dirLightMain = new THREE.DirectionalLight(0xfff5e6, 2.0); // Warm tone
    this.dirLightMain.position.set(5, 5, 5);
    this.scene.add(this.dirLightMain);

    // Fill light (Cool tone to balance)
    this.dirLightFill = new THREE.DirectionalLight(0xddeeff, 1.0);
    this.dirLightFill.position.set(-5, 0, -5);
    this.scene.add(this.dirLightFill);

    // Spotlight for dramatic effect
    this.spotLight = new THREE.SpotLight(0xffffff, 5.0);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.angle = Math.PI / 6;
    this.spotLight.penumbra = 0.5;
    this.scene.add(this.spotLight);
  }

  public updateForSection(section: 'hero' | 'features' | 'menu') {
    // Transition lighting based on section
    switch (section) {
      case 'hero': // Burger
        this.ambientLight.intensity = 0.5;
        this.dirLightMain.intensity = 2.5;
        this.dirLightMain.position.set(5, 2, 5); // Lower angle for dramatic shadows
        this.dirLightFill.intensity = 0.5;
        this.dirLightFill.color.setHex(0xddeeff);
        this.spotLight.intensity = 0;
        break;
      case 'features': // Pizza
        this.ambientLight.intensity = 1.0; // Flat, bright editorial look
        this.dirLightMain.intensity = 1.0;
        this.dirLightMain.position.set(0, 10, 0); // Top down lighting
        this.dirLightFill.intensity = 0.8;
        this.dirLightFill.color.setHex(0xddeeff);
        this.spotLight.intensity = 2.0; // Overhead spot
        break;
      case 'menu': // Donut
        this.ambientLight.intensity = 0.6;
        this.dirLightMain.intensity = 3.0; // Bright highlights for glaze
        this.dirLightMain.position.set(3, 5, 5);
        this.dirLightFill.intensity = 1.5;
        this.dirLightFill.color.setHex(0x6b4eff); // Violet fill
        this.spotLight.intensity = 0;
        break;
    }
  }
}
