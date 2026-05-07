import type { Settings } from '@/lib/types';
import { namedPalettes } from './palette';

export const defaultSettings: Settings = {
  dimensions: { width: 1920, height: 1080 },
  geometry: {
    variance: 30,
    cellSize: 40,
    depth: 20,
    dither: 10,
  },
  rendering: {
    shadingStrength: 5,
    paletteCompression: 0,
    darkLift: 60,
    gradientAngle: 135,
  },
  colour: namedPalettes[0].colours,
  image: null,
  useImage: false,
  seed: 1,
};
