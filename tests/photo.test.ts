import { describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';

vi.mock('server-only', () => ({}));
const { processPhoto } = await import('../lib/photo');

const photo = (w: number, h: number, orientation?: number) => {
  const img = sharp({ create: { width: w, height: h, channels: 3, background: '#e0478f' } }).jpeg();
  return (orientation ? img.withMetadata({ orientation, exif: { IFD0: { Make: 'iPhone' } } }) : img).toBuffer();
};

describe('processPhoto', () => {
  it('caps the long side at 1600px', async () => {
    const out = await processPhoto(await photo(4032, 3024));
    expect([out.width, out.height]).toEqual([1600, 1200]);
  });

  it('leaves small photos at their size', async () => {
    const out = await processPhoto(await photo(800, 600));
    expect([out.width, out.height]).toEqual([800, 600]);
  });

  it('applies phone rotation and strips EXIF', async () => {
    const input = await photo(400, 300, 6);
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const out = await processPhoto(input);
    expect([out.width, out.height]).toEqual([300, 400]);
    const meta = await sharp(out.data).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.exif).toBeUndefined();
  });
});
