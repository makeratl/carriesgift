'use client';

import { useState } from 'react';
import { FAQ } from '@/lib/content';
import s from './Sections.module.css';

// Turns `[text](url)` in an answer into an external link.
function withLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? <a key={i} href={m[2]} target="_blank" rel="noopener">{m[1]}</a> : part;
  });
}

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className={s.faq}>
      {FAQ.map(([q, a], i) => (
        <div key={q} className={s.faqItem}>
          <button type="button" className={s.faqQ} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{q}</span>
            <span className={s.faqSign} aria-hidden>{open === i ? '–' : '+'}</span>
          </button>
          {open === i && <div className={s.faqA}>{withLinks(a)}</div>}
        </div>
      ))}
    </div>
  );
}
