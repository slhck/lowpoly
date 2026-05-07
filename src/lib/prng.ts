/**
 * Park–Miller PRNG. Seed must be a 32-bit signed integer in (0, 2^31 - 1).
 * https://en.wikipedia.org/wiki/Lehmer_random_number_generator
 */
export class PRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = 0;
    this.reset(seed);
  }

  reset(seed: number): void {
    let s = Math.floor(seed) % 2147483647;
    if (s <= 0) s += 2147483646;
    this.seed = s;
  }

  /** Returns a pseudo-random integer in [1, 2^31 - 2]. */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed;
  }

  /** Returns a pseudo-random number in [min, max). */
  generate(min = 0, max = 1): number {
    return min + ((this.next() - 1) / 2147483646) * (max - min);
  }
}
