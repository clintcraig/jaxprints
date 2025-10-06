export interface RestorationOptions {
  restoreFace: boolean;
  colorize: boolean;
  upscale: boolean;
  cleanNoise: boolean;
}

export interface TarpDesignOptions {
  name: string;
  age: string;
  theme: string;
  orientation: 'Portrait' | 'Landscape';
}