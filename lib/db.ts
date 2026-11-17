import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

/** Neon Postgres over HTTP. Server only. Null when DATABASE_URL isn't set (local design work shows demo data). */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= neon(url);
  return client;
}

export type Sql = NonNullable<ReturnType<typeof db>>;
