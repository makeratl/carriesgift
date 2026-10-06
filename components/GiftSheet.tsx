'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { BEAD_VALUE, CHARITY, FUNDRAISER_URL, NOTE_MAX, fmtUSD } from '@/lib/config';
import { confirmGift } from '@/lib/client';
import { BEAD_COLORS, BEAD_COUNT } from '@/lib/necklace';
import { useShare } from './Share';
import { useSite } from './SiteProvider';
import styles from './GiftSheet.module.css';

const AMOUNTS = [25, 50, 100, 250, 'other'] as const;
type Amount = (typeof AMOUNTS)[number];

export default function GiftSheet({ onClose }: { onClose: () => void }) {
  const { stats, setStats, popBeads, addNote } = useSite();
  const share = useShare();
  // 1 choose → 2 welcome back → 3 confirm + note → 4 thanks
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState<Amount>(100);
  const [custom, setCustom] = useState('');
  const [gave, setGave] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [website, setWebsite] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const raised = stats.raised;
  const filled = Math.min(BEAD_COUNT, Math.floor(raised / BEAD_VALUE));
  const amt = amount === 'other' ? parseInt(custom.replace(/[^0-9]/g, ''), 10) || 0 : amount;
  const adds = Math.min(BEAD_COUNT, Math.floor((raised + amt) / BEAD_VALUE)) - filled;
  const toNext = BEAD_VALUE - (raised % BEAD_VALUE);
  const preview = adds > 0 ? Array.from({ length: Math.min(adds, 8) }, (_, i) => BEAD_COLORS[(filled + i) % 3]) : ['#e3dac7'];
  const impact = !amt ? 'Pick an amount to see what it adds.'
    : adds > 0 ? `Adds ${adds} bead${adds > 1 ? 's' : ''} to her necklace.`
    : filled >= BEAD_COUNT ? 'Her necklace is full, and every extra dollar still helps.'
    : `Gets her ${fmtUSD(amt)} closer to the next bead (${fmtUSD(toNext)} to go).`;
  const gaveAmt = parseInt(gave.replace(/[^0-9]/g, ''), 10) || 0;

  function toCharity() {
    if (amt < 1) return setErr('Choose or enter an amount.');
    // Open synchronously inside the click so popup blockers allow it.
    if (FUNDRAISER_URL) window.open(FUNDRAISER_URL, '_blank', 'noopener');
    track('donate_click', { from: 'gift_sheet', amount: amt });
    setGave(String(amt));
    setErr('');
    setStep(2);
  }

  async function confirm() {
    if (gaveAmt < 1) return setErr('Enter the amount you gave.');
    setBusy(true);
    try {
      const { note: n } = await confirmGift({ amount: gaveAmt, name, body: note.trim(), website });
      setStats({ gifts: stats.gifts + 1, ...(n ? { notes: stats.notes + 1 } : {}) });
      if (n) addNote(n);
      track('gift_confirmed', { amount: gaveAmt, with_note: !!n });
      if (n) track('note_posted', { from: 'gift' });
      setErr('');
      setStep(4);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not count your gift. Try again?');
    } finally {
      setBusy(false);
    }
  }

  function seeBead() {
    onClose();
    document.getElementById('necklace')?.scrollIntoView({ behavior: 'smooth' });
    // Pop the most recently filled beads. The fill itself comes from the charity's total.
    const n = Math.min(filled, Math.max(1, Math.floor(gaveAmt / BEAD_VALUE)));
    setTimeout(() => popBeads(Array.from({ length: n }, (_, i) => filled - n + i)), 450);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Give in Carrie's honor" onClick={e => e.stopPropagation()}>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={styles.close}>×</button>

        {step === 1 && (
          <div className={styles.col}>
            <div>
              <div className={`hand ${styles.kicker}`}>add to her necklace</div>
              <div className={styles.title}>Give in Carrie&apos;s honor</div>
            </div>
            <div className={styles.chips}>
              {AMOUNTS.map(a => {
                const on = amount === a;
                return (
                  <button
                    key={a} type="button" aria-pressed={on}
                    className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                    onClick={() => { setAmount(a); setErr(''); track('gift_amount_selected', { amount: String(a) }); }}
                  >
                    <span>{a === 'other' ? 'Other' : '$' + a}</span>
                    <span className={styles.chipSub}>{a === 'other' ? 'any amount' : a >= 100 ? `${a / 100} bead${a > 100 ? 's' : ''}` : 'toward a bead'}</span>
                  </button>
                );
              })}
            </div>
            {amount === 'other' && (
              <input
                value={custom} onChange={e => { setCustom(e.target.value); setErr(''); }} autoFocus
                inputMode="numeric" placeholder="Amount in dollars" aria-label="Amount in dollars" className={styles.custom}
              />
            )}
            <div className={styles.impact}>
              <div className={styles.previewBeads}>{preview.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
              <span>{impact}</span>
            </div>
            {err && <div className={styles.error} role="alert">{err}</div>}
            <button type="button" onClick={toCharity} className={`btn-primary ${styles.big}`}>Continue to {CHARITY}</button>
            <div className={styles.fine}>You&apos;ll finish on {CHARITY}&apos;s secure tribute page. Your tax receipt comes from them.</div>
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.col} ${styles.center}`} style={{ padding: '12px 0' }}>
            <div className={styles.dots} aria-hidden>
              <span style={{ background: '#f6c945' }} />
              <span style={{ background: '#2fb5b8', animationDelay: '.2s' }} />
              <span style={{ background: '#e0478f', animationDelay: '.4s' }} />
            </div>
            <div className={`hand ${styles.kicker}`} style={{ fontSize: 30 }}>welcome back!</div>
            <div className={styles.title} style={{ fontSize: 24, marginTop: 0 }}>Did your gift go through?</div>
            <div className={styles.body}>
              {FUNDRAISER_URL
                ? `${CHARITY}'s tribute page opened in a new tab. Once you've given there, come back and tell us so we can pin it to Carrie's wall.`
                : `The tribute page isn't live yet. Check back soon to finish your ${fmtUSD(amt)} gift.`}
            </div>
            <button type="button" onClick={() => { setErr(''); setStep(3); }} className={`btn-primary ${styles.big}`}>Yes, I gave</button>
            {FUNDRAISER_URL && <a href={FUNDRAISER_URL} target="_blank" rel="noopener" className={styles.reopen}>Not yet. Open the tribute page again</a>}
            <button type="button" onClick={() => setStep(1)} className={styles.back}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div className={styles.col}>
            <div>
              <div className={`hand ${styles.kicker}`}>thank you!</div>
              <div className={styles.title}>Pin your gift to her wall</div>
            </div>
            <label className={styles.field}>
              <span>Amount you gave</span>
              <input
                value={gave} onChange={e => { setGave(e.target.value); setErr(''); }}
                inputMode="numeric" aria-label="Amount you gave" className={styles.custom}
              />
              <small>Only Steven and Carrie see amounts. Your note just shows a bead.</small>
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={60} aria-label="Your name" className={styles.line} />
            <textarea
              value={note} onChange={e => { setNote(e.target.value); setErr(''); }} placeholder="Happy birthday, Carrie… (optional)"
              rows={3} maxLength={NOTE_MAX} aria-label="Birthday note" className={`hand ${styles.line} ${styles.note}`}
            />
            <input value={website} onChange={e => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden className={styles.hp} />
            {err && <div className={styles.error} role="alert">{err}</div>}
            <button type="button" onClick={confirm} disabled={busy} className={`btn-primary ${styles.big}`}>{note.trim() ? 'Pin it with my gift' : 'Count my gift'}</button>
            <button type="button" onClick={() => setStep(2)} className={styles.back}>Back</button>
          </div>
        )}

        {step === 4 && (
          <div className={`${styles.col} ${styles.center}`} style={{ gap: 14, padding: '8px 0' }}>
            <div className={`hand ${styles.thanks}`}>thank you!</div>
            <div className={styles.title} style={{ fontSize: 22, textWrap: 'balance' }}>Your gift brings her next bead closer.</div>
            <div className={styles.body}>Want to double it? Send the page to one friend who&apos;d want to celebrate Carrie too.</div>
            <div className={styles.shareRow}>
              <button type="button" onClick={share.copy} className={styles.outline}>{share.copyLabel}</button>
              <a href={share.sms} onClick={share.onShare('sms')} className={styles.outline}>Text a friend</a>
            </div>
            <button type="button" onClick={seeBead} className={`btn-primary ${styles.big}`} style={{ marginTop: 6 }}>See your bead</button>
          </div>
        )}
      </div>
    </div>
  );
}
