import { hexToHsl } from '@/lib/colour';
import type { HSLColour } from '@/lib/types';

export const brand = {
  primary: '#1F7A8C',
  primaryLight: '#62A2AF',
  primaryLighter: '#8FBDC6',
  primaryLightest: '#D2E4E8',
  primaryDark: '#165562',
  primaryDarker: '#103D46',
  slateGrey: '#70798C',
  oldWhite: '#F5F1ED',
  oldWhiteLight: '#FAF8F6',
} as const;

export const signal = {
  red: '#D62839',
  yellow: '#E5DD49',
  green: '#7EC657',
  orange: '#E69859',
  purple: '#8B63A6',
  blue: '#35478C',
  darkBlue: '#022B3A',
} as const;

const toPalette = (hexes: string[]): HSLColour[] => hexes.map(hexToHsl);

export type NamedPalette = {
  name: string;
  colours: HSLColour[];
};

export const namedPalettes: NamedPalette[] = [
  {
    name: 'Ocean',
    colours: toPalette([brand.primary, brand.primaryLight, brand.primaryLightest]),
  },
  {
    name: 'Deep',
    colours: toPalette([signal.darkBlue, brand.primaryDarker, brand.primary]),
  },
  {
    name: 'Sunset',
    colours: toPalette([signal.red, signal.orange, signal.yellow]),
  },
  {
    name: 'Forest',
    colours: toPalette([brand.primaryDark, brand.primary, signal.green]),
  },
  {
    name: 'Royal',
    colours: toPalette([signal.darkBlue, signal.blue, signal.purple]),
  },
  {
    name: 'Warm',
    colours: toPalette([signal.orange, signal.yellow, brand.oldWhite]),
  },
  {
    name: 'Cyber',
    colours: toPalette([signal.red, signal.purple, signal.blue]),
  },
  {
    name: 'Mist',
    colours: toPalette([brand.slateGrey, brand.primaryLighter, brand.oldWhiteLight]),
  },
];
