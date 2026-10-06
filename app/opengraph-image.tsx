import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Static share card for launch. Phase 2: draw the live necklace from lib/necklace.ts.
export const alt = "Carrie is giving a kidney to someone she's never met. Add a bead to her birthday necklace.";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BEADS = ['#f6c945', '#2fb5b8', '#e0478f'];

export default async function Image() {
  const photo = `data:image/jpeg;base64,${await readFile(join(process.cwd(), 'public/carrie.jpg'), 'base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#fbf8f1', padding: '0 72px', gap: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 28 }}>
          <div style={{ fontSize: 30, color: '#c22a72', fontWeight: 700 }}>For her birthday, Nov 3</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, color: '#2b2620' }}>
            Carrie is giving a kidney to someone she&apos;s never met.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: BEADS[i % 3] }} />
            ))}
            <div style={{ fontSize: 28, color: '#4a4339', marginLeft: 12 }}>Add a bead to her necklace</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#fff', padding: '16px 16px 56px', transform: 'rotate(2.5deg)', boxShadow: '0 18px 40px rgba(60,40,10,.18)' }}>
          <img src={photo} width={380} height={380} alt="" style={{ objectFit: 'cover' }} />
        </div>
      </div>
    ),
    size,
  );
}
