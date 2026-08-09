// Deterministic Pseudo-Random Number Generator (PRNG) using Mulberry32 algorithm
export class SeededRandom {
  private state: number;

  constructor(seed: number = 428912) {
    this.state = seed;
  }

  // Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive)
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns random integer between min (inclusive) and max (inclusive)
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Returns random float between min and max rounded to 1 decimal place
  public nextFloat(min: number, max: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    const val = this.next() * (max - min) + min;
    return Math.round(val * factor) / factor;
  }

  // Pick random element from array
  public pick<T>(arr: T[]): T {
    const idx = this.nextInt(0, arr.length - 1);
    return arr[idx];
  }
}
