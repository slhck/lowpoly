import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createCanvas } from 'canvas';
import { describe, it } from 'vitest';

import { Lowpoly } from './lowpoly';
import type { HSLColour } from './types';

const luminance = (r: number, g: number, b: number): number =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

type Shade = { r: number; g: number; b: number; lum: number; count: number };

function parseFill(fill: string): { r: number; g: number; b: number } | null {
  const m = /rgba?\((\d+),(\d+),(\d+)/.exec(fill);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

function shadesFromFills(fills: readonly string[]): Shade[] {
  const counts = new Map<string, number>();
  for (const f of fills) counts.set(f, (counts.get(f) ?? 0) + 1);
  const shades: Shade[] = [];
  for (const [fill, count] of counts) {
    const c = parseFill(fill);
    if (!c) continue;
    shades.push({ ...c, count, lum: luminance(c.r, c.g, c.b) });
  }
  shades.sort((a, b) => a.lum - b.lum);
  return shades;
}

const fmt = (s: Shade): string =>
  `rgb(${String(s.r).padStart(3)}, ${String(s.g).padStart(3)}, ${String(s.b).padStart(
    3,
  )})  lum=${s.lum.toFixed(1).padStart(5)}  count=${s.count}`;

async function render(
  colours: HSLColour[],
  overrides: { dither?: number; depth?: number; variance?: number; cellSize?: number } = {},
  saveAs?: string,
) {
  const width = 640;
  const height = 360;
  const canvas = createCanvas(width, height);
  const lowpoly = new Lowpoly(canvas as unknown as HTMLCanvasElement);
  await lowpoly.render({
    variance: overrides.variance ?? 30,
    cellSize: overrides.cellSize ?? 40,
    depth: overrides.depth ?? 20,
    dither: overrides.dither ?? 10,
    shadingStrength: 5,
    paletteCompression: 0,
    darkLift: 60,
    gradientAngle: 135,
    image: null,
    colours,
    useImage: false,
    seed: 42,
  });
  if (saveAs) {
    const out = resolve(process.cwd(), `test-output/${saveAs}`);
    writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(`  saved: ${out}`);
  }
  return lowpoly.getFills();
}

function report(label: string, fills: readonly string[]) {
  const shades = shadesFromFills(fills);
  const lums = shades.map((s) => s.lum);
  const minLum = Math.min(...lums);
  const maxLum = Math.max(...lums);
  const sorted = [...lums].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];

  console.log(`\n=== ${label} ===`);
  console.log(`triangles: ${fills.length}, distinct fills: ${shades.length}`);
  console.log(
    `luminance: min=${minLum.toFixed(1)}  p10=${p10.toFixed(1)}  median=${median.toFixed(
      1,
    )}  p90=${p90.toFixed(1)}  max=${maxLum.toFixed(1)}  spread=${(maxLum - minLum).toFixed(1)}`,
  );
  console.log('darkest 6:');
  for (const s of shades.slice(0, 6)) console.log('  ' + fmt(s));
  console.log('lightest 6:');
  for (const s of shades.slice(-6)) console.log('  ' + fmt(s));
}

const LIGHT: HSLColour[] = [
  [200, 60, 70],
  [180, 50, 80],
  [160, 40, 75],
];

const MID: HSLColour[] = [
  [210, 50, 50],
  [180, 50, 50],
  [150, 50, 50],
];

const DARK: HSLColour[] = [
  [240, 50, 25],
  [200, 60, 30],
  [260, 40, 20],
];

const WIDE_L: HSLColour[] = [
  [195, 60, 30],
  [200, 30, 80],
];

const WARM: HSLColour[] = [
  [0, 75, 55],
  [30, 90, 55],
  [50, 95, 55],
];

describe('Lowpoly shade range — realistic defaults (dither=10, depth=20)', () => {
  it('LIGHT pastel palette', async () => {
    report('LIGHT @ defaults', await render(LIGHT, {}, 'light.png'));
  });
  it('MID-tone palette', async () => {
    report('MID @ defaults', await render(MID, {}, 'mid.png'));
  });
  it('DARK palette', async () => {
    report('DARK @ defaults', await render(DARK, {}, 'dark.png'));
  });
});

describe('Lowpoly — wide-luminance palette (dark + light in same gradient)', () => {
  it('WIDE_L palette', async () => {
    report('WIDE_L @ defaults', await render(WIDE_L, {}, 'wide-l.png'));
  });
});

describe('Lowpoly — saturated warm palette (red→orange→yellow)', () => {
  it('WARM @ defaults (default depth)', async () => {
    report('WARM @ defaults', await render(WARM, {}, 'warm.png'));
  });
  it('WARM @ high depth (more back-facing triangles)', async () => {
    report('WARM @ depth=80', await render(WARM, { depth: 80 }, 'warm-deep.png'));
  });
});

describe('Lowpoly — isolating contributions', () => {
  it('LIGHT, dither=0, depth=0 (background-only baseline)', async () => {
    report('LIGHT flat (no dither, no depth)', await render(LIGHT, { dither: 0, depth: 0 }));
  });
  it('LIGHT, dither=0, depth=20 (shading only)', async () => {
    report('LIGHT shading-only', await render(LIGHT, { dither: 0, depth: 20 }));
  });
  it('LIGHT, dither=10, depth=0 (dither only)', async () => {
    report('LIGHT dither-only', await render(LIGHT, { dither: 10, depth: 0 }));
  });
});
