export type Vec3 = [number, number, number];

export class Vector {
  coords: Vec3;

  constructor(coords: Vec3) {
    this.coords = coords;
  }

  length(): number {
    const [x, y, z] = this.coords;
    return Math.sqrt(x * x + y * y + z * z);
  }

  normalise(): this {
    const l = this.length();
    if (l === 0) return this;
    this.coords = [this.coords[0] / l, this.coords[1] / l, this.coords[2] / l];
    return this;
  }
}

export const dot3 = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
