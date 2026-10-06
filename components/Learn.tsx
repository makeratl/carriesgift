import { FACTS } from '@/lib/content';
import Faq from './Faq';
import s from './Sections.module.css';

export default function Learn() {
  return (
    <section id="learn" className={`wrap ${s.twoCol} ${s.learn}`}>
      <div className={s.facts}>
        <h2 className="h2">Living donation, briefly</h2>
        {FACTS.map(f => (
          <div key={f.n} style={{ borderTop: `2px solid ${f.color}`, paddingTop: 12 }}>
            <div className={s.factN}>{f.n}</div>
            <div className={s.factL}>{f.l}</div>
          </div>
        ))}
      </div>
      <Faq />
    </section>
  );
}
