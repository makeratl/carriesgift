'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Stats } from '@/lib/data';
import { todayET } from '@/lib/dates';
import GiftSheet from './GiftSheet';
import styles from './SiteProvider.module.css';

type Ctx = {
  stats: Stats;
  setStats: (patch: Partial<Stats>) => void;
  today: string;
  openGift: () => void;
  toast: (text: string) => void;
  /** Bead ranks to run the pop animation on, plus a key to restart it. */
  fresh: { ranks: number[]; key: number };
  popBeads: (ranks: number[]) => void;
  /** Notes posted from this browser this session (gift sheet or wall). */
  myNotes: NewNote[];
  addNote: (n: NewNote) => void;
};

export type NewNote = { id: string; name: string; body: string; via_gift?: boolean };

const SiteCtx = createContext<Ctx | null>(null);

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error('useSite outside SiteProvider');
  return c;
}

export default function SiteProvider({ initialStats, initialToday, children }: { initialStats: Stats; initialToday: string; children: React.ReactNode }) {
  const [stats, setAll] = useState(initialStats);
  // Server renders with its idea of "today" (cached up to a minute). Correct it after mount.
  const [today, setToday] = useState(initialToday);
  const [giftOpen, setGiftOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [fresh, setFresh] = useState<{ ranks: number[]; key: number }>({ ranks: [], key: 0 });
  const [myNotes, setMyNotes] = useState<NewNote[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync to the browser clock
  useEffect(() => { setToday(todayET()); }, []);

  const toast = useCallback((text: string) => {
    setToastText(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastText(''), 2000);
  }, []);

  const value: Ctx = {
    stats,
    setStats: patch => setAll(s => ({ ...s, ...patch })),
    today,
    openGift: () => setGiftOpen(true),
    toast,
    fresh,
    popBeads: ranks => setFresh(f => ({ ranks, key: f.key + 1 })),
    myNotes,
    addNote: n => setMyNotes(list => [n, ...list]),
  };

  return (
    <SiteCtx.Provider value={value}>
      {children}
      {giftOpen && <GiftSheet onClose={() => setGiftOpen(false)} />}
      {toastText && <div className={styles.toast} role="status">{toastText}</div>}
    </SiteCtx.Provider>
  );
}
