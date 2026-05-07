export type Dimensions = { width: number; height: number };

export type HSLColour = readonly [number, number, number];

export type ImageInfo = {
  src: string;
  width: number;
  height: number;
} | null;

export type GeometrySettings = {
  variance: number;
  cellSize: number;
  depth: number;
  dither: number;
};

export type RenderingSettings = {
  shadingStrength: number;
  paletteCompression: number;
  darkLift: number;
  gradientAngle: number;
};

export type Settings = {
  dimensions: Dimensions;
  geometry: GeometrySettings;
  rendering: RenderingSettings;
  colour: HSLColour[];
  image: ImageInfo;
  useImage: boolean;
  seed: number;
};
