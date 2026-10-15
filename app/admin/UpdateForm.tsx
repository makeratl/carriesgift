'use client';

import { useActionState, useRef, useState } from 'react';
import { postUpdate } from './actions';
import a from './admin.module.css';

const MAX_SIDE = 1600, TARGET = 900_000;

/** Shrinks a phone photo in the browser so it fits under the 1MB Server Action limit. */
async function shrink(file: File): Promise<Blob> {
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch {
    // Formats the browser can't decode (e.g. HEIC outside Safari): send as-is if small enough.
    if (file.size <= TARGET) return file;
    throw new Error('This browser can’t read that photo. Try a JPEG, or post from your phone.');
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  for (const q of [0.85, 0.75, 0.6]) {
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= TARGET) return blob;
  }
  throw new Error('That photo is too large. Try a smaller one.');
}

export default function UpdateForm({ defaultWho }: { defaultWho: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(async (_: unknown, form: FormData) => {
    const file = form.get('photo');
    if (file instanceof File && file.size > 0) {
      try { form.set('photo', await shrink(file), 'photo.jpg'); }
      catch (e) { return { error: (e as Error).message }; }
    }
    const res = await postUpdate(null, form);
    if (res.ok) { formRef.current?.reset(); setPreview(null); }
    return res;
  }, null);

  return (
    <form ref={formRef} action={action} className={a.col}>
      <div className={a.row}>
        <select name="who" defaultValue={defaultWho} className={a.input}><option>Steven</option><option>Carrie</option></select>
        <input name="date_label" placeholder="Date label (default: today)" className={a.input} />
      </div>
      <input name="title" required placeholder="Title" className={a.input} />
      <textarea name="body" required rows={4} placeholder="What's new?" className={a.input} />
      <label className={a.col}>
        <span className={a.muted}>Photo (optional)</span>
        <input name="photo" type="file" accept="image/*"
          onChange={e => { const f = e.target.files?.[0]; setPreview(p => { if (p) URL.revokeObjectURL(p); return f ? URL.createObjectURL(f) : null; }); }} />
      </label>
      {preview && <>
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
        <img src={preview} alt="" className={a.preview} />
        <input name="image_alt" maxLength={300} placeholder="Describe the photo (for people using screen readers)" className={a.input} />
      </>}
      <div><button className={a.btn} disabled={pending}>{pending ? 'Posting…' : 'Post'}</button></div>
      {state?.error && <p className={a.err}>{state.error}</p>}
    </form>
  );
}
