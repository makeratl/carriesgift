'use client';

import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { SITE_URL, shareMessage } from '@/lib/config';
import { useSite } from './SiteProvider';

export function useShare() {
  const { toast } = useSite();
  const [url, setUrl] = useState(SITE_URL);
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- use the real origin once mounted (previews, localhost)
  useEffect(() => { setUrl(location.href.split('#')[0]); }, []);
  const msg = shareMessage(url);
  return {
    copyLabel: copied ? 'Link copied' : 'Copy link',
    copy: async () => {
      try { await navigator.clipboard.writeText(url); } catch { /* clipboard blocked; toast anyway */ }
      track('share_click', { channel: 'copy' });
      setCopied(true); toast('Link copied');
      setTimeout(() => setCopied(false), 2000);
    },
    sms: 'sms:?&body=' + encodeURIComponent(msg),
    mail: 'mailto:?subject=' + encodeURIComponent('A birthday gift for Carrie') + '&body=' + encodeURIComponent(msg),
    fb: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
    onShare: (channel: string) => () => track('share_click', { channel }),
  };
}

export default function ShareButtons({ className, linkClass, copyClass }: { className?: string; linkClass?: string; copyClass?: string }) {
  const s = useShare();
  return (
    <div className={className}>
      <span className="hand" style={{ fontSize: 26, marginRight: 4 }}>pass it on:</span>
      <button type="button" className={copyClass} onClick={s.copy}>{s.copyLabel}</button>
      <a href={s.sms} className={linkClass} onClick={s.onShare('sms')}>Text</a>
      <a href={s.mail} className={linkClass} onClick={s.onShare('email')}>Email</a>
      <a href={s.fb} target="_blank" rel="noopener" className={linkClass} onClick={s.onShare('facebook')}>Facebook</a>
    </div>
  );
}
