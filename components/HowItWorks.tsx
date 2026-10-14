import { STEPS } from '@/lib/content';
import s from './Sections.module.css';
import { withLinks } from './withLinks';

export default function HowItWorks() {
  return (
    <section id="story" className={`wrap ${s.story}`}>
      <div className={`hand ${s.kickerT}`}>how one kidney helps two people</div>
      <h2 className="h2">The voucher swap, in plain words</h2>
      <div className={s.steps}>
        {STEPS.map(st => (
          <div key={st.n} className={s.stepCard}>
            <div className={s.stepNum} style={{ background: st.bg, color: st.fg }}>{st.n}</div>
            <div className={s.stepTitle}>{st.title}</div>
            <div className={s.stepBody}>{withLinks(st.body)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
