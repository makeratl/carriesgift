// Reads the live "raised" total from the charity's Rallybound tribute page.
// The page server-renders: <div id="NewProgressAmtRaised"><span class="was-raised">$1,234</span> raised of $5,000 goal

export function parseRaised(html: string): number | null {
  const i = html.indexOf('id="NewProgressAmtRaised"');
  if (i < 0) return null;
  const m = html.slice(i, i + 400).match(/class="was-raised"[^>]*>\s*\$\s*([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? Math.floor(n) : null;
}

export async function fetchRaised(url: string): Promise<number | null> {
  if (!/rallybound\.org/.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), headers: { 'user-agent': "CarriesGift/1.0 (+https://gift.carrieburns.net)" }, cache: 'no-store' });
    if (!res.ok) return null;
    return parseRaised(await res.text());
  } catch {
    return null;
  }
}
