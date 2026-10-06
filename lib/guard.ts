import 'server-only';
import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkBotId } from 'botid/server';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

export const isProfane = (s: string) => matcher.hasMatch(s);

export function ipHash(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update((process.env.IP_SALT || 'carries-gift') + ip).digest('hex').slice(0, 32);
}

export async function isBot() {
  if (process.env.NODE_ENV !== 'production') return false;
  try { return (await checkBotId()).isBot; } catch { return false; }
}

export const cleanName = (v: unknown) => String(v ?? '').trim().slice(0, 60) || 'A friend';

/** Error message for a wall note body, or null if it's fine. */
export function noteError(body: string, name: string, max: number) {
  if (!body) return 'Write a few words first.';
  if (body.length > max) return `Keep it under ${max} characters.`;
  if (isProfane(body) || isProfane(name)) return "Let's keep it birthday-friendly.";
  return null;
}

/** True if this IP has written `limit` rows to `table` in the last `minutes`. */
export async function rateLimited(c: SupabaseClient, table: 'notes' | 'gifts', ip_hash: string, limit: number, minutes = 10) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await c.from(table).select('id', { count: 'exact', head: true }).eq('ip_hash', ip_hash).gte('created_at', since);
  return (count ?? 0) >= limit;
}
