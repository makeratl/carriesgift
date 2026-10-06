'use client';

import { TIMELINE } from '@/lib/content';
import { timelineStatuses, type Status } from '@/lib/dates';
import { useSite } from './SiteProvider';
import s from './Sections.module.css';

const LOOK: Record<Status, { tag: string; dot: string; ring: string; color: string }> = {
  done: { tag: 'Done', dot: '#2fb5b8', ring: '#2fb5b8', color: '#1f7f82' },
  next: { tag: 'Next', dot: '#fff', ring: '#c22a72', color: '#c22a72' },
  ahead: { tag: 'Ahead', dot: '#fff', ring: '#c9bb9f', color: '#8a8070' },
};

export default function Timeline() {
  const { today } = useSite();
  const statuses = timelineStatuses(today);
  return (
    <section className={s.band}>
      <div className={s.bandInner}>
        <h2 className="h3">Her road to October 20</h2>
        <ol className={s.timeline} style={{ listStyle: 'none', padding: 0, margin: '32px 0 0' }}>
          {TIMELINE.map((t, i) => {
            const look = LOOK[statuses[i]];
            return (
              <li key={t.k} className={s.tStep}>
                <div className={s.tDot} style={{ background: look.dot, borderColor: look.ring }} />
                <div className={s.tTag} style={{ color: look.color }}>{look.tag}</div>
                <div className={s.tTitle}>{t.k}</div>
                <div className={s.tBody}>{t.d}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
