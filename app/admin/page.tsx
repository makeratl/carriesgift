import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { currentAdmin } from '@/lib/auth';
import { fmtUSD } from '@/lib/config';
import { getLiveRaised } from '@/lib/data';
import { deleteUpdate, saveStats, setGiftHidden, setNoteHidden, signOut } from './actions';
import LoginForm from './LoginForm';
import UpdateForm from './UpdateForm';
import a from './admin.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: "Admin · Carrie's Gift", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const email = await currentAdmin();
  const c = db();

  if (!c) return <main className={a.main}><h1>Admin</h1><p>The database isn&apos;t configured yet. Set the env vars in <code>.env.local</code>.</p></main>;
  if (!email) return (
    <main className={a.main}>
      <h1 className="hand" style={{ fontSize: 44 }}>Carrie&apos;s Gift admin</h1>
      <p>Sign in with your email. Only Steven and Carrie have access.</p>
      <LoginForm />
    </main>
  );

  const [[s], [regs], updates, notes, gifts, live] = await Promise.all([
    c`select * from stats where id = 1`,
    c`select count(*)::int as count from registrations`,
    c`select id, who, title, body, date_label, image_path from updates order by created_at desc`,
    c`select id, name, body, hidden, via_gift, created_at from notes order by created_at desc limit 200`,
    c`select id, amount, name, hidden, created_at from gifts order by created_at desc limit 500`,
    getLiveRaised(),
  ]);
  const shownGifts = gifts.filter(g => !g.hidden);
  const confirmedSum = shownGifts.reduce((t, g) => t + g.amount, 0);

  return (
    <main className={a.main}>
      <div className={a.head}>
        <h1 className="hand" style={{ fontSize: 44, margin: 0 }}>Carrie&apos;s Gift admin</h1>
        <form action={signOut}><span className={a.muted}>{email} · </span><button className={a.link}>Sign out</button></form>
      </div>

      <section className={a.card}>
        <h2>Necklace total</h2>
        <p className={a.muted}>
          {live !== null
            ? <>Live from the tribute page: <b>{fmtUSD(live)}</b> (checked every 5 minutes). The fallback below is only used if the page can&apos;t be read.</>
            : <><b>Couldn&apos;t read the tribute page right now</b>, so the site is showing the fallback total below. Copy it from the charity dashboard.</>}
        </p>
        <form action={saveStats} className={a.grid}>
          <label>Fallback total ($)<input name="raised" inputMode="numeric" defaultValue={s.raised} className={a.input} /></label>
          <label>Extra gifts<input name="gifts_offset" inputMode="numeric" defaultValue={s.gifts_offset} className={a.input} />
            <small className={a.muted}>Gifts made without confirming here. Shown count = {shownGifts.length} confirmed + this.</small></label>
          <label>Registered donors offset<input name="registered_offset" inputMode="numeric" defaultValue={s.registered_offset} className={a.input} />
            <small className={a.muted}>{regs.count} clicked on the site; shown total = clicks + offset</small></label>
          <div><button className={a.btn}>Save</button></div>
        </form>
      </section>

      <section className={a.card}>
        <h2>Confirmed gifts</h2>
        <p className={a.muted}>Honor system: people who tapped &quot;Yes, I gave&quot;. {shownGifts.length} gifts, {fmtUSD(confirmedSum)} self-reported{live !== null ? ` vs ${fmtUSD(live)} on the tribute page` : ''}. Hide anything that looks bogus.</p>
        <ul className={a.list}>
          {gifts.map(g => (
            <li key={g.id} style={{ opacity: g.hidden ? .5 : 1 }}>
              <div><b>{fmtUSD(g.amount)}</b> · {g.name} <span className={a.muted}>· {new Date(g.created_at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}{g.hidden ? ' · hidden' : ''}</span></div>
              <form action={setGiftHidden}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="hidden" value={String(!g.hidden)} /><button className={a.link}>{g.hidden ? 'Unhide' : 'Hide'}</button></form>
            </li>
          ))}
        </ul>
      </section>

      <section className={a.card}>
        <h2>Post an update</h2>
        <UpdateForm defaultWho={email.includes('carrie') ? 'Carrie' : 'Steven'} />
        <ul className={a.list}>
          {updates.map(u => (
            <li key={u.id}>
              <div><b>{u.title}</b> <span className={a.muted}>· {u.who} · {u.date_label}{u.image_path ? ' · with photo' : ''}</span><div>{u.body}</div></div>
              <form action={deleteUpdate}><input type="hidden" name="id" value={u.id} /><button className={a.link}>Delete</button></form>
            </li>
          ))}
        </ul>
      </section>

      <section className={a.card}>
        <h2>Birthday wall</h2>
        <p className={a.muted}>Notes appear right away. Hide anything that shouldn&apos;t be there.</p>
        <ul className={a.list}>
          {notes.map(n => (
            <li key={n.id} style={{ opacity: n.hidden ? .5 : 1 }}>
              <div><b>{n.name}</b> <span className={a.muted}>· {new Date(n.created_at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}{n.via_gift ? ' · with a gift' : ''}{n.hidden ? ' · hidden' : ''}</span><div className="hand" style={{ fontSize: 22 }}>{n.body}</div></div>
              <form action={setNoteHidden}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="hidden" value={String(!n.hidden)} /><button className={a.link}>{n.hidden ? 'Unhide' : 'Hide'}</button></form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
