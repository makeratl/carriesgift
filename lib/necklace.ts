// Necklace geometry: a direct port of the prototype's `layout()`
// (design/prototype/Carrie's Gift Site.dc.html). Keep in sync with tests.

export const BEAD_COUNT = 50;
export const BEAD_COLORS = ['#f6c945', '#2fb5b8', '#e0478f'] as const;

export type Bead = { x: number; y: number; rank: number; filled: boolean; color: string | null };

export type NecklaceLayout = {
  bead: number;
  top: number;
  depth: number;
  beads: Bead[];
  points: string;
  cx: number;
  bottom: number;
  pendTop: number;
  pendLeft: number;
  pendSize: number;
  height: number;
  innerTop: number;
  innerW: number;
  compact: boolean;
};

export function rankOf(k: number, bothEnds = true) {
  return bothEnds ? (k < 25 ? 2 * k : 2 * (49 - k) + 1) : k;
}

export function layoutNecklace(W: number, filled: number, bothEnds = true): NecklaceLayout {
  const bead = W >= 900 ? 26 : W >= 600 ? 24 : 20;
  const target = BEAD_COUNT * bead * 1.27;
  const top = bead / 2 + 4, x0 = bead / 2, x1 = W - bead / 2;
  const sample = (depth: number, n: number) => {
    const p: [number, number][] = [];
    for (let j = 0; j <= n; j++) {
      const t = j / n;
      p.push([x0 + t * (x1 - x0), top + depth * (1 - Math.pow(2 * t - 1, 2))]);
    }
    return p;
  };
  const len = (p: [number, number][]) => {
    let s = 0;
    for (let j = 1; j < p.length; j++) s += Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]);
    return s;
  };

  let lo = 40, hi = 2400;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (len(sample(mid, 120)) < target) lo = mid; else hi = mid;
  }
  const depth = Math.max(hi, W * 0.42);

  const pts = sample(depth, 500), cum = [0];
  for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  const L = cum[cum.length - 1];

  let jj = 0;
  const beads: Bead[] = Array.from({ length: BEAD_COUNT }, (_, k) => {
    const tgt = L * (k + 0.5) / BEAD_COUNT;
    while (jj < cum.length - 1 && cum[jj] < tgt) jj++;
    const [x, y] = pts[jj];
    const rank = rankOf(k, bothEnds);
    const on = rank < filled;
    return { x, y, rank, filled: on, color: on ? BEAD_COLORS[rank % 3] : null };
  });

  const bottom = top + depth, compact = W < 600, pendSize = compact ? 104 : 132, pendTop = bottom + 24;
  const innerTop = Math.round(bead + (compact ? 30 : 56)), blockH = compact ? 150 : 340;
  const yb = innerTop + blockH;
  const interior = (x1 - x0) * Math.sqrt(Math.max(0, 1 - (yb - top) / depth)) - 2 * bead - 12;
  const innerW = Math.round(Math.max(160, Math.min(compact ? 260 : 560, interior)));

  return {
    bead, top, depth, beads,
    points: pts.filter((_, j) => j % 10 === 0 || j === 500).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '),
    cx: W / 2, bottom, pendTop, pendLeft: W / 2 - pendSize / 2, pendSize,
    height: Math.ceil(pendTop + pendSize + 8), innerTop, innerW, compact,
  };
}
