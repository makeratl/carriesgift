import 'server-only';
import sharp from 'sharp';

export const UPDATE_PHOTOS = 'update-photos';
// The browser already shrinks photos before upload; this caps what the server will accept.
export const MAX_UPLOAD = 950_000;

/** Re-encodes an uploaded photo: upright, at most 1600px, JPEG, with EXIF (incl. GPS) stripped. */
export async function processPhoto(input: Buffer) {
  const { data, info } = await sharp(input).rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
