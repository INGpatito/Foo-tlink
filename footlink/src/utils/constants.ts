export const THEME_COLORS = {
  brand1: '#FBE5C8',
  brand2: '#F2A65A',
  brand3: '#E86A33',
  brand4: '#C7452A',
  brand5: '#5B8A2B',
  charcoal: '#181512',
  violet: '#6B4EFF',
  plum: '#26192F'
};

export const MODEL_PATHS = {
  hero: new URL('../../stylized-3d-cheeseburger-rapid-assets/source/438b5714-5600-4eef-b364-03f11e3a7fb8.glb', import.meta.url).href,
  features: new URL('../../slice-of-pizza/source/Slice of Pizza.glb', import.meta.url).href,
  menu: '/models/donut-happy.glb',
};

export const MODEL_CONFIGS = {
  hero: {
    scale: 1,
    position: { x: 1.4, y: -0.12, z: 0 },
    rotation: { x: 0.2, y: 0, z: 0 }
  },
  features: {
    scale: 1,
    position: { x: -1.3, y: -0.12, z: 0 },
    rotation: { x: Math.PI / 2 - 0.35, y: 0, z: 0 }
  },
  menu: {
    scale: 1,
    position: { x: 1.4, y: -0.08, z: 0 },
    rotation: { x: 0.45, y: 0, z: 0.1 }
  },
};

// Keep the food motion tied to the product composition rather than scroll
// direction: pizza travels left-to-right, while the donut travels right-to-left.
export const MODEL_TRANSITIONS = {
  hero: { enterFrom: 1, exitTo: 1 },
  features: { enterFrom: -1, exitTo: 1 },
  menu: { enterFrom: 1, exitTo: -1 },
} as const;
