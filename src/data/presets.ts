import type { Dimensions } from '@/lib/types';

export type DimensionGroup = Record<string, Dimensions>;

export const dimensionPresets: Record<'Desktop' | 'Mobile', DimensionGroup> = {
  Desktop: {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '1440p': { width: 2560, height: 1440 },
    '2160p (4K)': { width: 3840, height: 2160 },
  },
  Mobile: {
    'iPhone SE': { width: 750, height: 1334 },
    'iPhone Plus': { width: 1080, height: 1920 },
    'iPhone Pro': { width: 1170, height: 2532 },
    'iPhone Pro Max': { width: 1290, height: 2796 },
    'Pixel 8': { width: 1080, height: 2400 },
  },
};
