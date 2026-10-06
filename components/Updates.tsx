import { WHO_COLOR } from '@/lib/content';
import type { Update } from '@/lib/data';
import s from './Sections.module.css';

const CARRIE_PLACEHOLDER: Update = {
  id: 'carrie-soon', who: 'Carrie', date_label: 'After Oct 20', title: 'First update from recovery',
  body: "Carrie will post here once she's home and resting. Check back after surgery day.",
};

export default function Updates({ updates }: { updates: Update[] }) {
  const list = updates.some(u => u.who === 'Carrie') ? updates : [...updates, CARRIE_PLACEHOLDER];
  return (
    <section id="updates" className={`wrap ${s.twoCol} ${s.updates}`}>
      <div>
        <div className={`hand ${s.kickerM}`}>from the recovery couch</div>
        <h2 className="h2">Updates from Steven and Carrie</h2>
        <p className={s.intro}>Short notes before and after surgery. Carrie may add her own once she&apos;s back on her feet.</p>
      </div>
      <div className={s.updateList}>
        {list.map(u => (
          <article key={u.id} className={s.updateCard}>
            <div className={s.updateHead}>
              <div className={s.avatar} style={{ background: WHO_COLOR[u.who] }}>{u.who[0]}</div>
              <div style={{ fontWeight: 700 }}>{u.who}</div>
              <div className={s.updateDate}>{u.date_label}</div>
            </div>
            <div className={s.updateTitle}>{u.title}</div>
            <div className={s.updateBody}>{u.body}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
