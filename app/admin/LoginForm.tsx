'use client';

import { useActionState } from 'react';
import { sendMagicLink } from './actions';
import a from './admin.module.css';

export default function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, null);
  if (state?.sent) return <p>Check your email for a sign-in link.</p>;
  return (
    <form action={action} className={a.row}>
      <input name="email" type="email" required placeholder="you@example.com" aria-label="Email" className={a.input} />
      <button className={a.btn} disabled={pending}>{pending ? 'Sending…' : 'Email me a link'}</button>
      {state?.error && <p className={a.err}>{state.error}</p>}
    </form>
  );
}
