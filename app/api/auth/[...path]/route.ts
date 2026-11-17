import { auth } from '@/lib/auth';

// Proxies sign-in, magic-link verification and session calls to Neon Auth.
const notConfigured = () => Response.json({ error: 'Auth is not configured.' }, { status: 503 });
const h = auth?.handler();

export const GET = h?.GET ?? notConfigured;
export const POST = h?.POST ?? notConfigured;
