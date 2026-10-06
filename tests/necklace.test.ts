import { describe, expect, it } from 'vitest';
import { layoutNecklace } from '../lib/necklace';

// Verbatim copy of the prototype's layout() (minus the `fresh` animation bits),
// used as the reference implementation.
function protoLayout(W: number, filled: number, bothEnds: boolean) {
  const bead = W >= 900 ? 26 : W >= 600 ? 24 : 20;
  const target = 50 * bead * 1.27, top = bead / 2 + 4, x0 = bead / 2, x1 = W - bead / 2;
  const sample = (depth: number, n: number) => { const p: number[][] = []; for (let j = 0; j <= n; j++) { const t = j / n; p.push([x0 + t * (x1 - x0), top + depth * (1 - Math.pow(2 * t - 1, 2))]); } return p; };
  const len = (p: number[][]) => { let s = 0; for (let j = 1; j < p.length; j++) s += Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]); return s; };
  let lo = 40, hi = 2400;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (len(sample(mid, 120)) < target) lo = mid; else hi = mid; }
  const depth = Math.max(hi, W * 0.42);
  const pts = sample(depth, 500), cum = [0];
  for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  const L = cum[cum.length - 1];
  let jj = 0;
  const beads = Array.from({ length: 50 }, (_, k) => {
    const tgt = L * (k + 0.5) / 50;
    while (jj < cum.length - 1 && cum[jj] < tgt) jj++;
    const [x, y] = pts[jj];
    const rank = bothEnds ? (k < 25 ? 2 * k : 2 * (49 - k) + 1) : k;
    return { left: x - bead / 2, top: y - bead / 2, on: rank < filled, rank };
  });
  const bottom = top + depth, pend = W < 600 ? 104 : 132, pendTop = bottom + 24;
  const compact = W < 600, innerTop = Math.round(bead + (compact ? 30 : 56)), blockH = compact ? 150 : 340;
  const yb = innerTop + blockH, interior = (x1 - x0) * Math.sqrt(Math.max(0, 1 - (yb - top) / depth)) - 2 * bead - 12;
  const innerW = Math.max(160, Math.min(compact ? 260 : 560, interior));
  return { beads, bead, bottom, pendTop, pend, h: Math.ceil(pendTop + pend + 8), innerTop, innerW: Math.round(innerW), compact };
}

describe('layoutNecklace matches the prototype', () => {
  for (const W of [320, 360, 640, 768, 1000, 1080]) {
    for (const filled of [0, 18, 49, 50]) {
      it(`W=${W} filled=${filled}`, () => {
        const a = layoutNecklace(W, filled, true), b = protoLayout(W, filled, true);
        expect(a.bead).toBe(b.bead);
        expect(a.bottom).toBeCloseTo(b.bottom, 6);
        expect(a.pendTop).toBeCloseTo(b.pendTop, 6);
        expect(a.pendSize).toBe(b.pend);
        expect(a.height).toBe(b.h);
        expect(a.innerTop).toBe(b.innerTop);
        expect(a.innerW).toBe(b.innerW);
        expect(a.compact).toBe(b.compact);
        a.beads.forEach((bd, k) => {
          expect(bd.x - a.bead / 2).toBeCloseTo(b.beads[k].left, 6);
          expect(bd.y - a.bead / 2).toBeCloseTo(b.beads[k].top, 6);
          expect(bd.rank).toBe(b.beads[k].rank);
          expect(bd.filled).toBe(b.beads[k].on);
        });
      });
    }
  }

  it('fills from both ends, meeting at the pendant', () => {
    const { beads } = layoutNecklace(1000, 2);
    expect(beads[0].filled).toBe(true);
    expect(beads[49].filled).toBe(true);
    expect(beads[1].filled).toBe(false);
  });
});
