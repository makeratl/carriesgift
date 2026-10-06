'use client';

import { track } from '@vercel/analytics';
import { useSite } from './SiteProvider';

export default function GiftButton({ className, children, from }: { className?: string; children: React.ReactNode; from: string }) {
  const { openGift } = useSite();
  return (
    <button type="button" className={className} onClick={() => { track('donate_click', { from }); openGift(); }}>
      {children}
    </button>
  );
}
