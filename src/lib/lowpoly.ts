import { hslToCss } from './colour';
import { drawImageCover } from './draw-image';
import { PRNG } from './prng';
import { Triangle } from './triangle';
import type { HSLColour, ImageInfo } from './types';
import { dot3, Vector } from './vector';
import { Vertex } from './vertex';

const normalise = (val: number, max: number, min = 0) => (val - min) / (max - min);

function gradientEndpoints(
  width: number,
  height: number,
  angleDeg: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const length = Math.abs(width * cos) + Math.abs(height * sin);
  const cx = width / 2;
  const cy = height / 2;
  return {
    x0: cx - (cos * length) / 2,
    y0: cy - (sin * length) / 2,
    x1: cx + (cos * length) / 2,
    y1: cy + (sin * length) / 2,
  };
}

function computeMeanLum(data: Uint8ClampedArray): number {
  let total = 0;
  let count = 0;
  const stride = 4 * 64;
  for (let i = 0; i < data.length; i += stride) {
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    count++;
  }
  return total / count;
}

export type RenderOptions = {
  variance: number;
  cellSize: number;
  depth: number;
  dither: number;
  shadingStrength: number;
  paletteCompression: number;
  darkLift: number;
  gradientAngle: number;
  image: ImageInfo;
  colours: HSLColour[];
  useImage: boolean;
  seed: number;
};

export class Lowpoly {
  private element: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private points: Vertex[] = [];
  private triangles: Triangle[] = [];
  private fills: string[] = [];
  private debugSamples: { bgLum: number; lightDot: number; shadow: number; specular: number }[] = [];

  getFills(): readonly string[] {
    return this.fills;
  }

  private variance = 4;
  private cellSize = 50;
  private depth = 0;
  private dither = 0;

  private shadingStrength = 0.05;
  private paletteCompression = 0;
  private darkLift = 0.6;
  private gradientAngle = 135;

  private image: ImageInfo = null;
  private useImage = false;

  private colours: HSLColour[] = [];

  private columnCount = 0;
  private rowCount = 0;

  private imageData: Uint8ClampedArray | null = null;
  private bgMeanLum = 0;

  private readonly light: Vector;
  private readonly prng: PRNG;

  constructor(element: HTMLCanvasElement) {
    this.element = element;
    const ctx = element.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.light = new Vector([0.5, 0.5, 1.5]).normalise();
    this.prng = new PRNG(0);
    this.ctx.strokeStyle = '#fff';
  }

  private drawTriangle(vertices: Triangle['vertices']) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.fill();
  }

  private async drawBackground(): Promise<void> {
    const { ctx, element, colours } = this;
    ctx.clearRect(0, 0, element.width, element.height);

    if (this.image && this.image.src && this.useImage) {
      const baseImage = new Image();
      baseImage.crossOrigin = 'Anonymous';
      baseImage.src = this.image.src;
      await new Promise<void>((resolve, reject) => {
        baseImage.onload = () => {
          drawImageCover(ctx, baseImage);
          resolve();
        };
        baseImage.onerror = () => reject(new Error('Failed to load image'));
      });
      return;
    }

    ctx.globalCompositeOperation = 'multiply';

    if (colours.length > 1) {
      const meanL = colours.reduce((sum, [, , l]) => sum + l, 0) / colours.length;
      const softened: HSLColour[] = colours.map(([h, s, l]) => [
        h,
        s,
        l + (meanL - l) * this.paletteCompression,
      ]);
      const { x0, y0, x1, y1 } = gradientEndpoints(
        element.width,
        element.height,
        this.gradientAngle,
      );
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      softened.forEach((c, i) => {
        gradient.addColorStop(i / (softened.length - 1), hslToCss(c));
      });
      ctx.fillStyle = gradient;
    } else if (colours.length === 1) {
      ctx.fillStyle = hslToCss(colours[0]);
    }

    ctx.beginPath();
    ctx.fillRect(0, 0, element.width, element.height);
    ctx.closePath();
    ctx.fill();

    const overlay = ctx.createLinearGradient(0, 0, 0, element.height);
    overlay.addColorStop(0, '#fff');
    overlay.addColorStop(1, '#eee');

    ctx.beginPath();
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, element.width, element.height);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawPoly(tri: Triangle, index: number) {
    const { element, ctx, dither, imageData } = this;
    if (!imageData) return;

    const centre = tri.getCentre();

    const ditherX = (dither / 200) * element.width;
    const ditherY = (dither / 200) * element.height;
    centre.x += this.prng.generate() * ditherX - ditherX / 2;
    centre.y += this.prng.generate() * ditherY - ditherY / 2;

    if (centre.x < 0) centre.x = 0;
    if (centre.x > element.width - 1) centre.x = element.width - 1;
    if (centre.y < 0) centre.y = 0;
    if (centre.y > element.height - 1) centre.y = element.height - 1;

    const pixel = (Math.floor(centre.x) + Math.floor(centre.y) * element.width) * 4;
    let red = imageData[pixel];
    let green = imageData[pixel + 1];
    let blue = imageData[pixel + 2];
    const alpha = imageData[pixel + 3];

    const sampledLum = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    if (sampledLum > 0 && sampledLum < this.bgMeanLum) {
      const lifted = sampledLum + (this.bgMeanLum - sampledLum) * this.darkLift;
      const ratio = lifted / sampledLum;
      red = Math.min(255, red * ratio);
      green = Math.min(255, green * ratio);
      blue = Math.min(255, blue * ratio);
    }

    const normal = tri.getNormal();
    const lightDot = dot3(this.light.coords, normal.coords);
    const lambert = normalise(lightDot, 1, -1);
    const shadow = 1 - this.shadingStrength * (1 - lambert);

    const r = normalise(red, 255) * shadow;
    const g = normalise(green, 255) * shadow;
    const b = normalise(blue, 255) * shadow;

    this.debugSamples[index] = {
      bgLum: sampledLum,
      lightDot,
      shadow,
      specular: 0,
    };

    const fill = `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
      b * 255,
    )},${alpha / 255})`;
    ctx.fillStyle = fill;
    this.fills[index] = fill;

    this.drawTriangle(tri.vertices);
  }

  private generatePoints() {
    const { rowCount, columnCount, cellSize, variance, depth } = this;
    const points: Vertex[] = [];
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const v = new Vertex();
        v.y = i * cellSize * 0.866 - cellSize;
        v.y += (this.prng.generate() - 0.5) * variance * cellSize * 2;
        if (i % 2 === 0) {
          v.x = j * cellSize - cellSize;
        } else {
          v.x = j * cellSize - cellSize + cellSize / 2;
        }
        v.x += (this.prng.generate() - 0.5) * variance * cellSize * 2;
        v.z = (this.prng.generate() * depth * cellSize) / 50;
        points.push(v);
      }
    }
    this.points = points;
  }

  private generateTriangles() {
    const { points, rowCount, columnCount } = this;
    const tris: Triangle[] = [];
    for (let i = 0; i < points.length; i++) {
      const currentRow = Math.floor(i / columnCount);
      if (i % columnCount !== columnCount - 1 && i < (rowCount - 1) * columnCount) {
        const square = [
          points[i],
          points[i + 1],
          points[columnCount + i + 1],
          points[columnCount + i],
        ];
        if (currentRow % 2 !== 0) {
          tris.push(new Triangle([square[0], square[2], square[3]]));
          tris.push(new Triangle([square[0], square[1], square[2]]));
        } else {
          tris.push(new Triangle([square[0], square[1], square[3]]));
          tris.push(new Triangle([square[1], square[2], square[3]]));
        }
      }
    }
    this.triangles = tris;
  }

  async render(options: RenderOptions): Promise<{ png: string; svg: string }> {
    // yield a frame so the loader can paint
    await new Promise((r) => setTimeout(r, 0));

    this.variance = options.variance / 100;
    this.cellSize = options.cellSize * 3 + 30;
    this.depth = options.depth;
    this.dither = options.dither;
    this.shadingStrength = options.shadingStrength / 100;
    this.paletteCompression = options.paletteCompression / 100;
    this.darkLift = options.darkLift / 100;
    this.gradientAngle = options.gradientAngle;
    this.image = options.image;
    this.useImage = options.useImage;
    this.colours = options.colours;
    this.prng.reset(options.seed);
    this.fills = [];
    this.debugSamples = [];

    const gridWidth = this.element.width + this.cellSize * 2;
    const gridHeight = this.element.height + this.cellSize * 2;
    this.columnCount = Math.ceil(gridWidth / this.cellSize) + 2;
    this.rowCount = Math.ceil(gridHeight / (this.cellSize * 0.865));

    this.generatePoints();
    this.generateTriangles();

    const { element, ctx, triangles } = this;
    ctx.clearRect(0, 0, element.width, element.height);

    await this.drawBackground();
    this.imageData = ctx.getImageData(0, 0, element.width, element.height).data;
    this.bgMeanLum = computeMeanLum(this.imageData);

    for (let i = 0; i < triangles.length; i++) {
      this.drawPoly(triangles[i], i);
    }

    this.debugLogFills();

    return {
      png: element.toDataURL(),
      svg: this.toSVGDataUrl(),
    };
  }

  private debugLogFills() {
    if (typeof window === 'undefined') return;

    const counts = new Map<string, number>();
    for (const f of this.fills) counts.set(f, (counts.get(f) ?? 0) + 1);

    type Shade = { fill: string; r: number; g: number; b: number; lum: number; count: number };
    const shades: Shade[] = [];
    for (const [fill, count] of counts) {
      const m = /rgba?\((\d+),(\d+),(\d+)/.exec(fill);
      if (!m) continue;
      const r = +m[1];
      const g = +m[2];
      const b = +m[3];
      shades.push({ fill, r, g, b, lum: 0.2126 * r + 0.7152 * g + 0.0722 * b, count });
    }
    shades.sort((a, b) => a.lum - b.lum);

    const lums = shades.map((s) => s.lum);
    const sorted = [...lums].sort((a, b) => a - b);
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const median = sorted[sorted.length >> 1] ?? 0;
    const p10 = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
    const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? 0;

    const bgLums = this.debugSamples.map((s) => s.bgLum);
    const bgMin = Math.min(...bgLums);
    const bgMax = Math.max(...bgLums);

    console.groupCollapsed(
      `[lowpoly] ${this.triangles.length} tris, ${shades.length} distinct fills, ` +
        `lum spread=${(max - min).toFixed(1)} (min=${min.toFixed(1)} med=${median.toFixed(
          1,
        )} max=${max.toFixed(1)})`,
    );
    console.log('clamps in use:', {
      shadingStrength: this.shadingStrength,
      paletteCompression: this.paletteCompression,
      darkLift: this.darkLift,
      gradientAngle: this.gradientAngle,
    });
    console.log(`bg mean lum (target floor anchor): ${this.bgMeanLum.toFixed(1)}`);
    console.log(
      `bg sampled luminance: min=${bgMin.toFixed(1)} max=${bgMax.toFixed(1)} spread=${(
        bgMax - bgMin
      ).toFixed(1)}`,
    );
    console.log(`fill percentiles: min=${min.toFixed(1)} p10=${p10.toFixed(1)} p90=${p90.toFixed(1)} max=${max.toFixed(1)}`);
    console.log('darkest 6 fills:');
    console.table(
      shades.slice(0, 6).map((s) => ({
        fill: s.fill,
        lum: +s.lum.toFixed(1),
        count: s.count,
      })),
    );
    console.log('lightest 6 fills:');
    console.table(
      shades.slice(-6).map((s) => ({
        fill: s.fill,
        lum: +s.lum.toFixed(1),
        count: s.count,
      })),
    );

    const outliers = this.debugSamples
      .map((s, i) => ({ i, ...s, fill: this.fills[i] }))
      .filter((s) => {
        const m = /rgba?\((\d+),(\d+),(\d+)/.exec(s.fill ?? '');
        if (!m) return false;
        const lum = 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3];
        return lum < median - 20;
      })
      .slice(0, 8);
    if (outliers.length) {
      console.log(`outliers (>20 lum below median):`);
      console.table(
        outliers.map((o) => ({
          tri: o.i,
          fill: o.fill,
          bgLum: +o.bgLum.toFixed(1),
          lightDot: +o.lightDot.toFixed(2),
          shadow: +o.shadow.toFixed(3),
          specular: +o.specular.toFixed(3),
        })),
      );
    }
    console.groupEnd();
  }

  private toSVG(): string {
    const { element, triangles, fills } = this;
    const { width, height } = element;
    const polygons = triangles
      .map((tri, i) => {
        const fill = fills[i];
        if (!fill) return '';
        const points = tri.vertices.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(' ');
        return `<polygon points="${points}" fill="${fill}"/>`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${polygons}</svg>`;
  }

  private toSVGDataUrl(): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(this.toSVG())}`;
  }
}
