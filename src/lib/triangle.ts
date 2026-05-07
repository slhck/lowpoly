import { cross3, Vector, type Vec3 } from './vector';
import type { Vertex } from './vertex';

export class Triangle {
  vertices: [Vertex, Vertex, Vertex];

  constructor(vertices: [Vertex, Vertex, Vertex]) {
    this.vertices = vertices;
  }

  getCentre() {
    const [a, b, c] = this.vertices;
    return {
      x: (a.x + b.x + c.x) / 3,
      y: (a.y + b.y + c.y) / 3,
    };
  }

  getNormal(): Vector {
    const [a, b, c] = this.vertices;
    const v1: Vec3 = [b.x - a.x, b.y - a.y, b.z - a.z];
    const v2: Vec3 = [c.x - a.x, c.y - a.y, c.z - a.z];
    return new Vector(cross3(v1, v2)).normalise();
  }
}
