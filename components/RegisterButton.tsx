'use client';

import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { useSite } from './SiteProvider';
import s from './Sections.module.css';

const hasCookie = () => typeof document !== 'undefined' && /(?:^|;\s*)cg_reg=/.test(document.cookie);

export default function RegisterButton() {
  const { setStats, toast } = useSite();
  const [did, setDid] = useState(false);
  const [busy, setBusy] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the cookie once on mount
  useEffect(() => { setDid(hasCookie()); }, []);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch('/api/register', { method: did ? 'DELETE' : 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats({ registered: data.registered });
      setDid(!did);
      if (!did) track('register_click');
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Something went wrong. Try again?');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.registerRow}>
      <button type="button" className={s.registerBtn} disabled={busy} aria-pressed={did} onClick={toggle} style={{ background: did ? '#2fb5b8' : '#f6c945' }}>
        {did ? 'Thank you, you’re counted' : 'I registered as a donor'}
      </button>
      <span className={s.registerHint}>Registered as a donor? Tell us and we&apos;ll count you in Carrie&apos;s total.</span>
    </div>
  );
}
