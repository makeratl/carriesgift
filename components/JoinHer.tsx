import { LINKS } from '@/lib/content';
import RegisterButton from './RegisterButton';
import s from './Sections.module.css';

export default function JoinHer() {
  return (
    <section className={s.ink}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className={`hand ${s.kickerY}`}>feeling inspired?</div>
        <h2 className={`h2 ${s.joinTitle}`}>Do what Carrie did, or something smaller</h2>
        <div className={s.links}>
          {LINKS.map(l => (
            <a key={l.host} href={l.url} target="_blank" rel="noopener" className={s.linkCard} data-register={l.host === 'registerme.org' || undefined}>
              <span className={s.linkDot} style={{ background: l.color }} />
              <span className={s.linkTitle}>{l.title}</span>
              <span className={s.linkDesc}>{l.desc}</span>
              <span className={s.linkHost}>{l.host} →</span>
            </a>
          ))}
        </div>
        <RegisterButton />
      </div>
    </section>
  );
}
