import type { Note } from './data';

async function post<T>(url: string, input: unknown, fallback: string): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || fallback);
  return data;
}

export const postNote = (input: { name: string; body: string; website?: string }) =>
  post<Note>('/api/notes', input, 'Could not pin your note. Try again?');

export const confirmGift = (input: { amount: number; name: string; body: string; website?: string }) =>
  post<{ note: Note | null }>('/api/gifts', input, 'Could not count your gift. Try again?');
