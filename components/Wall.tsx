'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';
import { NOTE_MAX } from '@/lib/config';
import { NOTE_COLORS, NOTE_ROTS } from '@/lib/content';
import type { Note } from '@/lib/data';
import { postNote } from '@/lib/client';
import { useSite } from './SiteProvider';
import styles from './Wall.module.css';

export default function Wall({ initialNotes, hasMore: initialHasMore }: { initialNotes: Note[]; hasMore: boolean }) {
  const { myNotes, addNote, setStats, stats, toast } = useSite();
  const [older, setOlder] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mine = new Set(myNotes.map(n => n.id));
  const notes = [...myNotes, ...initialNotes.filter(n => !mine.has(n.id)), ...older];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return setError('Write a few words first.');
    setBusy(true);
    try {
      const note = await postNote({ name, body, website });
      addNote(note);
      setStats({ notes: stats.notes + 1 });
      setName(''); setText(''); setError('');
      track('note_posted', { from: 'wall' });
      toast('Pinned to Carrie’s wall');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not pin your note. Try again?');
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    const res = await fetch(`/api/notes?page=${page}`);
    const more: Note[] = await res.json();
    setOlder(o => [...o, ...more]);
    setPage(p => p + 1);
    if (more.length < 24) setHasMore(false);
  }

  return (
    <section id="wall" className={`wrap ${styles.section}`}>
      <div className={`hand ${styles.kicker}`}>she&apos;ll read every one</div>
      <h2 className="h2" style={{ marginBottom: 30 }}>Sign her birthday wall</h2>
      <div className={styles.grid}>
        <form className={styles.form} onSubmit={submit}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={60} aria-label="Your name" className={styles.name} />
          <textarea
            value={text} onChange={e => { setText(e.target.value); setError(''); }}
            placeholder="Happy birthday, Carrie…" rows={4} maxLength={NOTE_MAX} aria-label="Your note"
            className={`hand ${styles.text}`}
          />
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <input value={website} onChange={e => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden className={styles.hp} />
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button type="submit" className={`btn-primary ${styles.pin}`} disabled={busy}>Pin it to the wall</button>
        </form>
        {notes.map((m, i) => (
          <div
            key={m.id}
            className={styles.note}
            style={{ background: NOTE_COLORS[i % 3], transform: `rotate(${NOTE_ROTS[i % 4]})`, animation: mine.has(m.id) ? 'fadeUp .4s ease both' : undefined }}
          >
            <div className={`hand ${styles.noteText}`}>{m.body}</div>
            <div className={styles.noteName}>
              {m.via_gift && <span className={styles.giftBead} title="Gave in Carrie’s honor" aria-label="Gave in Carrie’s honor" role="img" />}
              {m.name}
            </div>
          </div>
        ))}
      </div>
      {hasMore && <div style={{ textAlign: 'center', marginTop: 32 }}><button type="button" onClick={loadMore} className={styles.more}>Show more notes</button></div>}
    </section>
  );
}
