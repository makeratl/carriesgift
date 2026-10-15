@AGENTS.md

# Working with Carrie

This is Carrie's birthday and kidney-donation site, live at https://kidney.carrieburns.net. Carrie is new to
development, so keep it simple: plain language, no jargon, and confirm what you're about to change before you change it.
Steven (makeratl) built it and is the person to ask when something is beyond a copy or photo edit.

## First-time setup (Carrie's Mac)
This is a brand-new setup on Carrie's Mac and she is new to Git. If any of these are missing, walk her through them one
step at a time, run the commands for her where you can, and explain each in a sentence. Check before installing.
1. Command line tools (`git --version`; if missing, `xcode-select --install` and she clicks Install).
2. Homebrew (`brew --version`; if missing, install from https://brew.sh. It will ask for her Mac password, which she types herself).
3. Node and the GitHub CLI: `brew install node gh`.
4. GitHub sign-in: `gh auth login` (GitHub.com, HTTPS, log in with a web browser), then `gh auth setup-git`.
   Her GitHub account is `cre8ivecsb`, already a collaborator on `makeratl/carriesgift`.
5. Git identity: `git config --global user.name "Carrie Burns"` and her email for `user.email` (ask her which one).
6. Clone into `~/carriesgift` (`gh repo clone makeratl/carriesgift ~/carriesgift`), then `npm install` inside it.
7. `npm run dev` and open http://localhost:3077 to confirm it runs. No `.env.local` is needed; it shows demo data.
Never ask her to paste passwords or tokens into the chat.

## How a change goes live
1. **Check for a pull first, every time, before touching anything.** Steven sometimes publishes changes on Carrie's
   behalf between her sessions. Run `git status` and `git pull`; if anything came down, tell her in a sentence what
   changed (`git log --oneline -5`) so she isn't surprised. If she has unsaved local edits and the pull complains,
   stop and sort it out with her before editing.
2. Make the edit.
3. `npm test && npm run lint && npm run build`. All three must pass. If they don't, fix it or stop and tell Carrie.
4. Optionally preview it: `npm run dev`, then http://localhost:3077 (shows demo data without `.env.local`; that's fine).
5. Show Carrie the change in plain words, then commit and `git push` to `main`.
6. Vercel deploys `main` automatically, usually within a couple of minutes. Check the live site after.

Pull again right before pushing. Never force-push, rewrite history, or delete branches. If a push is rejected,
`git pull` and try again; if that reports a conflict, don't guess, explain it to Carrie and suggest asking Steven.

## Where things live
- **Almost all the words** are in `lib/content.ts`:
  - `TIMELINE`: "Her road to donating" steps. Titles are Title Case.
  - `FAQ`: questions and answers. Answers can link with `[link text](https://...)`.
  - `FACTS`: the big numbers next to the FAQ.
  - `LINKS`: the "Join her" cards. `STEPS`: how the voucher program works.
  - `GALLERY_SLOTS`: photos in "Along the way" (see below).
- Charity name, goal and share message: `lib/config.ts`. Surgery and birthday dates: `lib/dates.ts`.
- Page sections are in `components/` (one file each, e.g. `Hero.tsx`, `Timeline.tsx`).

## Adding photos to "Along the way"
1. Resize to about 1200px on the long side, save as `.jpg` in `public/gallery/` with a simple name (`hospital-day.jpg`).
2. In `lib/content.ts`, add `src: '/gallery/hospital-day.jpg'` to the matching `GALLERY_SLOTS` entry, or add a new
   `{ label: '...', src: '...' }` entry. The label is the photo's alt text, so describe the photo.

## Not done through code
- **Posting an update** (the Updates section): Carrie does this at https://kidney.carrieburns.net/admin, signing in
  with her email link. She can attach one photo per update right from her phone, with a short description.
  No code or push needed. For a photo that belongs with a post, this is the way, not the gallery.
- Gift totals, hiding wall notes, hiding gifts: also `/admin`.

## Leave alone unless Steven says otherwise
- `.env*` files, secrets, API keys. Never commit or print them.
- `supabase/`, `app/admin/`, `app/api/`, `app/auth/`, `lib/rallybound.ts`, `lib/data.ts`, `proxy.ts`: data, login and the
  live donation total.
- Dependencies (`package.json`) and `next.config.ts`.
If a request needs one of these, explain that and suggest asking Steven.
