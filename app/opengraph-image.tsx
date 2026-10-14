import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { SITE_URL } from '@/lib/config';

// Static share card (texts, iMessage, Facebook, WhatsApp). Rendered once at build.
// Output as JPEG: a photo in a PNG is ~450KB, and WhatsApp drops previews over ~300KB.
export const alt = "Carrie is giving a kidney to someone she's never met. Add a bead to her birthday necklace.";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';

const BEADS = ['#f6c945', '#2fb5b8', '#e0478f'];

// A short draped strand: beads on a shallow parabola, like the necklace on the page.
const STRAND = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  return { x: t * 520, y: 46 * (1 - Math.pow(2 * t - 1, 2)), color: BEADS[i % 3] };
});

export default async function Image() {
  const [photo, figtree600, figtree800, caveat] = await Promise.all([
    readFile(join(process.cwd(), 'public/carrie-piedmont.jpg')).then(b => sharp(b).resize(400, 400).jpeg({ quality: 82 }).toBuffer()),
    readFile(join(process.cwd(), 'assets/fonts/figtree-600.woff')),
    readFile(join(process.cwd(), 'assets/fonts/figtree-800.woff')),
    readFile(join(process.cwd(), 'assets/fonts/caveat-700.woff')),
  ]);
  const host = new URL(SITE_URL).host;

  const png = await new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fbf8f1', padding: '0 64px 0 72px', alignItems: 'center', fontFamily: 'Figtree', color: '#2b2620' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 40 }}>
          <div style={{ fontFamily: 'Caveat', fontSize: 44, color: '#c22a72', transform: 'rotate(-2deg)', marginBottom: 6 }}>for her birthday, Nov 3</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.2 }}>
            Carrie is giving a kidney to someone she&apos;s never met.
          </div>
          <div style={{ display: 'flex', position: 'relative', width: 540, height: 80, marginTop: 30 }}>
            <svg width="540" height="80" style={{ position: 'absolute', left: 0, top: 0 }}>
              <polyline points={STRAND.map(b => `${b.x + 11},${b.y + 11}`).join(' ')} fill="none" stroke="#cbbd9f" strokeWidth="2" />
            </svg>
            {STRAND.map((b, i) => (
              <div key={i} style={{ position: 'absolute', left: b.x, top: b.y, width: 22, height: 22, borderRadius: 11, background: b.color, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,.15)' }} />
            ))}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#4a4339', marginTop: 4 }}>Add a bead to her birthday necklace</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#1f7f82', marginTop: 8 }}>{host}</div>
        </div>
        <div style={{ display: 'flex', position: 'relative', padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '16px 16px 0', transform: 'rotate(2.5deg)', boxShadow: '0 18px 40px rgba(60,40,10,.18)' }}>
            <img src={`data:image/jpeg;base64,${photo.toString('base64')}`} width={380} height={380} alt="" />
            <div style={{ fontFamily: 'Caveat', fontSize: 34, height: 66, display: 'flex', alignItems: 'center' }}>Oct 20: surgery. Nov 3: cake.</div>
          </div>
          <div style={{ position: 'absolute', top: 2, left: 150, width: 120, height: 32, background: 'rgba(246,201,69,.8)', transform: 'rotate(-5deg)' }} />
          <div style={{ position: 'absolute', bottom: -6, right: -26, width: 90, height: 28, background: 'rgba(47,181,184,.65)', transform: 'rotate(38deg)' }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Figtree', data: figtree600, weight: 600, style: 'normal' },
        { name: 'Figtree', data: figtree800, weight: 800, style: 'normal' },
        { name: 'Caveat', data: caveat, weight: 700, style: 'normal' },
      ],
    },
  ).arrayBuffer();

  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { 'content-type': 'image/jpeg' } });
}
