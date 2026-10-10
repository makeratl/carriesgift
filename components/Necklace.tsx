'use client';

import { useEffect, useRef, useState } from 'react';
import { BEAD_VALUE, CHARITY, GOAL, fmtUSD } from '@/lib/config';
import { birthdayLabel } from '@/lib/dates';
import { BEAD_COUNT, layoutNecklace } from '@/lib/necklace';
import GiftButton from './GiftButton';
import { useSite } from './SiteProvider';
import styles from './Necklace.module.css';

const SSR_WIDTH = 1000;

export default function Necklace() {
  const { stats, today, fresh } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(SSR_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const nw = Math.round(e.contentRect.width);
      if (nw) setW(prev => (Math.abs(nw - prev) > 2 ? nw : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filled = Math.min(BEAD_COUNT, Math.floor(stats.raised / BEAD_VALUE));
  const n = layoutNecklace(w, filled);
  const left = BEAD_COUNT - filled;
  const leftLabel = left > 0 ? `${left} beads to go` : 'Her necklace is complete!';
  const kicker = <div className={`hand ${styles.kicker}`}>every bead is $100 for the {CHARITY}</div>;
  const title = 'Help us string her necklace';

  return (
    <section id="necklace" className={styles.outer}>
      <div className={styles.card}>
        <div className={styles.tape} aria-hidden />
        {n.compact && (
          <div className={styles.compactHead}>
            {kicker}
            <h2 className={styles.h2Compact}>{title}</h2>
          </div>
        )}
        <div ref={ref} className={styles.stage} style={{ height: n.height }}>
          <svg width="100%" height={n.height} className={styles.thread} aria-hidden>
            <polyline points={n.points} fill="none" stroke="#cbbd9f" strokeWidth="2" />
            <line x1={n.cx} y1={n.bottom} x2={n.cx} y2={n.pendTop} stroke="#cbbd9f" strokeWidth="2" />
          </svg>
          <div role="img" aria-label={`${filled} of ${BEAD_COUNT} beads filled`}>
            {n.beads.map((b, k) => {
              const fi = fresh.ranks.indexOf(b.rank);
              return (
                <div
                  key={fi >= 0 ? `${k}-${fresh.key}` : k}
                  title={b.filled ? `Bead ${b.rank + 1} · $100` : 'Empty bead'}
                  className={b.filled ? styles.beadOn : styles.beadOff}
                  style={{
                    left: b.x - n.bead / 2, top: b.y - n.bead / 2, width: n.bead, height: n.bead,
                    background: b.color ?? undefined,
                    animation: fi >= 0 ? `beadPop .7s cubic-bezier(.3,1.6,.5,1) ${(0.15 * fi + 0.1).toFixed(2)}s both` : undefined,
                  }}
                />
              );
            })}
          </div>
          <div className={styles.inner} style={{ top: n.innerTop, width: n.innerW }}>
            {!n.compact && (
              <>
                {kicker}
                <h2 className={styles.h2}>{title}</h2>
              </>
            )}
            <div className={styles.amount} style={{ fontSize: n.compact ? 40 : undefined }}>{fmtUSD(stats.raised)}</div>
            <div className={styles.of}>of {fmtUSD(GOAL)} · {stats.gifts} gifts so far</div>
            <GiftButton from="necklace" className={`btn-primary ${styles.cta}`}>Add a bead</GiftButton>
            {!n.compact && <div className={`hand ${styles.left}`}>{leftLabel}</div>}
          </div>
          <div className={styles.pendant} style={{ left: n.pendLeft, top: n.pendTop, width: n.pendSize, height: n.pendSize }}>
            <div className={`hand ${styles.pendDate}`}>Nov 3</div>
            <div className={styles.pendLabel}>{birthdayLabel(today)}</div>
          </div>
        </div>
        <div className={styles.pills}>
          {n.compact && <div className={`hand ${styles.left} ${styles.leftCompact}`}>{leftLabel}</div>}
          <a href="#learn" className={`${styles.pill} ${styles.pillT}`}><b>{stats.registered}</b>new registered donors</a>
          <a href="#wall" className={`${styles.pill} ${styles.pillM}`}><b>{stats.notes}</b>birthday notes</a>
        </div>
      </div>
    </section>
  );
}
