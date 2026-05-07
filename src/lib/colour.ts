import type { HSLColour } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export const hslToCss = ([h, s, l]: HSLColour): string =>
  `hsl(${h}, ${s}%, ${l}%)`;

export const hslToRgb = ([h, s, l]: HSLColour): [number, number, number] => {
  const hh = h / 360;
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const h1 = hh * 6;
  const x = c * (1 - Math.abs((h1 % 2) - 1));

  let rgb: [number, number, number];
  if (h1 < 1) rgb = [c, x, 0];
  else if (h1 < 2) rgb = [x, c, 0];
  else if (h1 < 3) rgb = [0, c, x];
  else if (h1 < 4) rgb = [0, x, c];
  else if (h1 < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  const m = ll - c / 2;
  return [
    Math.round((rgb[0] + m) * 255),
    Math.round((rgb[1] + m) * 255),
    Math.round((rgb[2] + m) * 255),
  ];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const v = clamp(Math.round(n), 0, 255).toString(16);
    return v.length === 1 ? `0${v}` : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const s = hex.replace('#', '');
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return [r, g, b];
  }
  if (s.length === 6) {
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  return [0, 0, 0];
};

export const rgbToHsl = (r: number, g: number, b: number): HSLColour => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const hexToHsl = (hex: string): HSLColour => {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

export const hslToHex = (hsl: HSLColour): string => {
  const [r, g, b] = hslToRgb(hsl);
  return rgbToHex(r, g, b);
};

export const randomBrightHex = (): string => hslToHex([Math.floor(Math.random() * 360), 70, 55]);
