# Handoff: Carrie's Gift (birthday fundraiser site)

## Overview
A one-page tribute and fundraising site for Carrie. She is donating a kidney to a stranger on **Oct 20, 2026**, through a voucher/paired program that moves a friend of hers (who stays anonymous) up the list. Her birthday is **Nov 3, 2026**. The site asks friends to do one of three things in her name:

1. **Give** to a kidney charity. Every $100 adds a "bead" to her necklace, and the goal is **$5,000 = 50 beads**.
2. **Register** as an organ donor, counted with a self-reported "I registered" button.
3. **Sign** her birthday wall.

**Money never touches this site.** Every Donate CTA goes to the charity's own tribute / peer-to-peer fundraiser page (a 501(c)(3), which issues the receipts). The site only *displays* a total.

Target: `<sub>.carrieburns.net` (e.g. `gift.carrieburns.net`), deployed on Vercel.

## About the design files
The files in `prototype/` and `explorations/` are **design references built in HTML**. They are prototypes showing the intended look and behavior, not production code. Rebuild them in a real app. The recommended stack is below. Open `prototype/Carrie's Gift Site.dc.html` in a browser to click through everything. `support.js` is only the prototype runtime and should not be shipped.

## Fidelity
**High-fidelity.** Recreate the colors, type, spacing, copy and the necklace geometry exactly. Copy is final-draft; Steven should proofread it.

## Recommended stack
- **Next.js (App Router) + TypeScript** on Vercel. Most of the page is static and server-rendered. The necklace, gift sheet, wall form and register button are client islands.
- **Styling:** Tailwind or CSS Modules. Either works; use the tokens below.
- **Fonts:** `next/font/google` for Figtree (400–800) and Caveat (500, 700).
- **Data:** small, so use one of these:
  - **Neon Postgres** via the Vercel Marketplace (tables below), or
  - **Upstash Redis** via the Vercel Marketplace (a list for messages, counters for registrations).
- **Total raised:** **Vercel Edge Config** (`raised`, `gifts`), updated by hand from the charity dashboard. Alternatively, use a tiny password-protected `/admin` page that writes to the DB. Only use the charity's API or embed widget if it offers one. Most NKF/AKF tribute pages don't have a public API.
- **Spam protection** for the wall: Cloudflare Turnstile or Vercel BotID, a honeypot field, an IP rate limit (e.g. 3 posts / 10 min), and a 180-character max.
- **Moderation:** new notes get `approved=false` by default, approved from `/admin`. Or auto-approve with a profanity filter and an admin hide button. Recommended: auto-approve plus the hide button, because friends and family expect to see their note immediately.
- **Updates (Steven/Carrie posts):** MDX files in `/content/updates/*.mdx` (frontmatter: `who`, `date`, `title`), committed to the repo, or rows in the DB editable from `/admin`.
- **Sharing:** a dynamic Open Graph image via `@vercel/og` that draws the necklace with the current fill and total. This matters, because most traffic will come from texts and Facebook.
- **Analytics:** Vercel Web Analytics. Track `donate_click`, `gift_amount_selected`, `note_posted`, `register_click`, `share_click{channel}`.

### Domain setup
1. Vercel → Project → Settings → Domains → add `gift.carrieburns.net`.
2. At the DNS host for carrieburns.net, add `CNAME gift → cname.vercel-dns.com`.
3. Vercel issues SSL automatically.

### Suggested schema (Postgres)
```sql
create table notes (id uuid primary key default gen_random_uuid(), name text not null default 'A friend',
  body text not null check (char_length(body) <= 180), created_at timestamptz default now(), hidden boolean default false);
create table registrations (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), fingerprint text);
-- seed registrations count offset in config if needed
```
### API routes
- `GET /api/notes`: visible notes, newest first, paginated at 24.
- `POST /api/notes {name?, body, turnstileToken}`: validate, then insert. Returns the note.
- `POST /api/register`: increments the count. Dedupe with a cookie, and allow undo with `DELETE`.
- `GET /api/stats`: `{raised, gifts, registered, notes}`. Cache with `revalidate: 60`.

### Environment / config
- `CHARITY_NAME`: e.g. "National Kidney Foundation". Not decided yet; NKF, AKF or LKDN.
- `FUNDRAISER_URL`: the charity's tribute page URL. Every Donate CTA opens this.
- `GOAL = 5000`, `BEAD_VALUE = 100` (derived: 50 beads).
- `SURGERY_DATE = 2026-10-20`, `BIRTHDAY = 2026-11-03` (America/New_York or the local timezone).

## Page structure (single route `/`)
Max content width is **1192px**, centered. Horizontal padding is `clamp(20px, 5vw, 56px)`. The page background is paper `#fbf8f1`.

1. **Sticky nav.** Translucent paper (`rgba(251,248,241,.92)` + 8px backdrop blur), with a 1px dashed bottom border `#ddd3bf`, 14px vertical padding.
   - Logo: "Carrie's Gift", Caveat 700 32px.
   - Links: "Her story", "Updates", "Learn", "Birthday wall". Figtree 600 15px, gap 26px, smooth-scroll with a 72px offset. Hidden when the viewport is under 820px.
   - CTA: "Add a bead", a magenta pill (`#c22a72`, white, 10×20 padding, radius 999) that opens the gift sheet.
2. **Hero.** Two columns, `repeat(auto-fit, minmax(min(100%,340px),1fr))`, gap `clamp(32px,5vw,56px)`.
   - Left column:
     - Kicker: "for her birthday, Nov 3", Caveat 30px magenta, rotate −2°.
     - H1: "Carrie is giving a kidney to someone she's never met.", Figtree 800, `clamp(40px,6vw,62px)`, line-height 1.02, letter-spacing −0.025em, `text-wrap: balance`.
     - Body: 17–19px, line-height 1.55, color `#4a4339`, max-width 540px.
     - Buttons: primary "Add a bead: give $100" (magenta pill, 16×28 padding, 17px 700, shadow `0 6px 16px rgba(194,42,114,.25)`, hover translateY −2px). Secondary "Leave a birthday note" (2px ink outline; on hover, ink fill with paper text) scrolls to the wall.
     - Fine print, 14px `#6b6255`: "Any amount helps. You give on {charity}'s own secure page, so we never handle the money."
   - Right column: a polaroid, max-width 460px.
     - White frame with 14/14/64 padding, rotate 2.5°, shadow `0 18px 40px rgba(60,40,10,.16), 0 2px 6px rgba(60,40,10,.08)`.
     - Square photo, `object-fit: cover`.
     - Caption, Caveat 27px: "Oct 20: surgery. Nov 3: cake."
     - Tape strips: yellow `rgba(246,201,69,.75)` 110×30 rotated −5° at the top; turquoise `rgba(47,181,184,.6)` 86×26 rotated 38° at the bottom-right.
3. **Necklace card.** The signature element; see the algorithm below.
   - White card, max-width 1080, radius 24, 1px border `#e8e0cf`, `box-shadow: 0 2px 0 #e8e0cf`, with a turquoise tape strip at the top-left.
   - Inside the U (desktop and tablet), centered:
     - Caveat line "every bead is $100 for {charity}" (turquoise `#1f9a9d`).
     - H2 "Help us string her necklace".
     - Total in Figtree 800 `clamp(40px,6vw,60px)`.
     - "of $5,000 · {gifts} gifts so far".
     - "Add a bead" button.
     - Caveat "{n} beads to go" in magenta.
   - Pendant: a 132px magenta circle (104px on mobile) hanging 24px below the lowest point. It shows "Nov 3" in Caveat and "{N} DAYS" (12px 700, tracked) as a countdown. That label becomes TOMORROW / TODAY / HAPPY BIRTHDAY as the date arrives.
   - Below the card: two stat pills, "{registered} new registered donors" (turquoise tint `#f4fbfb`, border `#cfeceb`) and "{notes} birthday notes" (magenta tint `#fdf3f8`, border `#f6d3e4`). They scroll to Learn and Wall.
4. **How it works** ("The voucher swap, in plain words").
   - Caveat kicker "how one kidney helps two people".
   - Three cards: white, radius 18, border `#ece4d3`, 28px padding, each with a 52px numbered circle (yellow, turquoise, magenta with white text).
   - Copy: 1 "Carrie gives" / 2 "Her friend moves up" / 3 "Two lives change". Exact text is in the prototype.
5. **Timeline** ("Her road to October 20"). Band `#f4eddd`. Grid `repeat(auto-fit,minmax(150px,1fr))`.
   - Each step has a 2px dashed top rule `#c9bb9f` and a 20px dot sitting on the rule.
   - Status is computed from today's date:
     - Done: turquoise fill.
     - Next: white with a 3px magenta ring, magenta tag.
     - Ahead: white with a 3px `#c9bb9f` ring.
   - Steps: The ask → Getting ready → Approved → Oct 20 → Recovery → Nov 3.
6. **Updates.** Intro column plus a list of cards (white, radius 16).
   - Each card has a 36px avatar circle with an initial: Steven is yellow, Carrie is turquoise.
   - Header shows name and date. Then the title (20px 700) and body (16px).
7. **Learn.**
   - Facts column: number in 40px 800 with a 2px colored top rule.
     - "~90,000 people in the U.S. waiting for a kidney"
     - "15–20 yrs typical life of a living-donor kidney"
     - "1 kidney is all a healthy donor needs"
     - **Verify these against NKF/OPTN before launch.**
   - FAQ accordion: one open at a time; the first is open by default. +/– glyph in magenta, dashed dividers. The answer fades in (0.25s).
8. **Join her.** Ink band `#2b2620`.
   - Four link cards that open in a new tab:
     - registerme.org
     - lkdn.org
     - kidneyregistry.org
     - livingdonorassistance.org
   - Below them, the button "I registered as a donor". Yellow, and it turns turquoise with "Thank you, you're counted" when toggled.
9. **Birthday wall.** Grid `repeat(auto-fill,minmax(min(100%,230px),1fr))`, gap 24.
   - The first cell is the form: dashed 2px `#d8ccb4` card, a name input, a Caveat textarea (max 180), and "Pin it to the wall".
   - Empty submit shows "Write a few words first."
   - Notes are sticky notes that cycle three colors (`#fbe08a`, `#bfe9e7`, `#f8c6dc`) and four rotations (−2°, 1.5°, −1°, 2°).
   - Text is Caveat 25px; the name is Figtree 700 13px. A new note fades up.
   - Toast: "Pinned to Carrie's wall".
10. **Gallery** ("Along the way"). Grid `minmax(160px,1fr)`, rows 180px. The hero photo spans 2×2. Other slots are for Steven's photos: training walk, hospital day, recovery, birthday.
11. **Footer.**
    - Share: "Copy link" (copies the URL and shows a toast), "Text" (`sms:?&body=`), "Email" (`mailto:`), "Facebook" (sharer.php).
    - Share message: "For Carrie's birthday, help string her a necklace of gifts for {charity}. She's donating a kidney to a stranger on Oct 20. {url}".
    - Disclaimer: "Every bead goes directly to {charity}, a registered 501(c)(3), through its own tribute page. We never hold or handle donations."
    - Remove the "Prototype: reset demo data" link in production.

## Gift sheet (modal; a bottom sheet on mobile is fine)
Overlay `rgba(43,38,32,.55)`. Panel: paper, radius 22, max-width 480. It fades up over 0.3s. Close with the × button (40px) or by clicking the overlay.

1. **Choose.**
   - Header: "add to her necklace" (Caveat, turquoise) and "Give in Carrie's honor".
   - Amount chips: $25 / $50 / **$100 (default)** / $250 / Other. Sub-labels: "toward a bead", "1 bead", "2.5 beads", "any amount".
   - Chip styles: selected is an ink fill; unselected is white with a `#e3dac7` border.
   - "Other" shows a numeric input.
   - Impact line with mini beads: "Adds N beads to her necklace." or "Gets her $X closer to the next bead ($Y to go)."
   - Name field ("for her wall") and an optional note.
   - CTA: "Continue to {charity}". This **opens FUNDRAISER_URL in a new tab**.
   - Fine print: "You'll finish on {charity}'s secure tribute page. Your tax receipt comes from them."
2. **Handoff.** Pulsing tri-color dots and "Finishing on {charity}…" with a "come back" message. In production, offer "I finished my gift" → step 3 and "Back".
   - Optional: if the person entered a note, post it to the wall here, flagged as `via_gift`.
   - Don't add to the money total on the client. The real total comes from config/admin.
3. **Thanks.**
   - "thank you!" in Caveat 44px magenta.
   - "Your gift brings her next bead closer." (Don't claim exact beads before the total is updated.)
   - Share prompt with Copy link / Text a friend.
   - "See your bead": closes the sheet, scrolls to the necklace, and runs the bead-pop animation on the most recent beads.

## Necklace algorithm (port exactly)
Inputs: container width `W` (measured with a ResizeObserver), `filled = min(50, floor(raised / 100))`.
```
bead   = W >= 900 ? 26 : W >= 600 ? 24 : 20          // px
target = 50 * bead * 1.27                            // desired arc length (keeps beads from touching)
top    = bead/2 + 4;  x0 = bead/2;  x1 = W - bead/2
curve(t) = ( x0 + t*(x1-x0),  top + depth * (1 - (2t-1)^2) )   // a U-shaped parabola, t in [0,1]
depth  = binary-search so arcLength(curve) ≈ target, then max(depth, 0.42*W)
place 50 beads at equal arc-length steps: s_k = L*(k+0.5)/50
fill order (default "both ends"): rank(k) = k<25 ? 2k : 2(49-k)+1   // alternates L/R, meeting at the pendant
bead k is filled if rank(k) < filled; filled color = [#f6c945, #2fb5b8, #e0478f][rank % 3]
pendant: center x = W/2, top = top + depth + 24, size 132 (104 if W<600)
container height = pendantTop + pendantSize + 8
```
- Filled bead: gloss `inset -3px -4px 0 rgba(0,0,0,.15), inset 3px 3px 0 rgba(255,255,255,.35)`. Empty bead: `#fbf8f1` fill with a 2px dashed `#d3c6ab` border.
- Thread: an SVG polyline through the curve plus a vertical line down to the pendant. Stroke `#cbbd9f`, 2px.
- Inner content block: centered, top = `bead + 56` (or `+30` if compact).
- Width = interior chord at the block's bottom edge: `(x1-x0)*sqrt(1-(yBottom-top)/depth) - 2*bead - 12`, clamped to 160–560 (or ≤260 on compact). Assume the block is 340px tall (150px compact).
- **Compact (W < 600):**
  - The Caveat line and H2 move *above* the necklace.
  - Only the total, "of $5,000 · N gifts" and the button stay inside the U.
  - "N beads to go" moves below, next to the stat pills.
- Bead-pop animation: `@keyframes beadPop {0%{scale:0} 60%{scale:1.35} 100%{scale:1}}`, 0.7s, `cubic-bezier(.3,1.6,.5,1)`, staggered 0.15s per new bead.
- Respect `prefers-reduced-motion` by turning off the pop and pulse.
- Good extras:
  - Render the same geometry server-side for the OG image.
  - Show a tooltip "Bead 12 · $100" on hover.

## Design tokens
**Color**
- Ink `#2b2620`
- Paper `#fbf8f1`
- Paper-band `#f4eddd`
- White `#ffffff`
- Body text `#4a4339`
- Muted `#6b6255`
- Faint `#8a8070`
- Rule/dashed `#ddd3bf`, `#e3dac7`, `#ece4d3`, `#e8e0cf`, `#c9bb9f`
- Accents, pulled from the necklace in Carrie's photo:
  - Yellow `#f6c945`
  - Turquoise `#2fb5b8`; text-safe turquoise `#1f9a9d` / `#1f7f82`
  - Magenta bead `#e0478f`; text/button magenta `#c22a72` (white text passes AA)
- Note tints `#fbe08a`, `#bfe9e7`, `#f8c6dc`
- On the ink band: secondary text `#cfc6b6`, card bg `rgba(255,255,255,.06)`, border `rgba(255,255,255,.14)`

**Type**
- Figtree everywhere for UI and body.
- Caveat only for handwritten accents: kickers, notes, captions, logo.
- H1 `clamp(40px,6vw,62px)`/1.02/800/−0.025em. H2 `clamp(30px,4.5vw,40px)`/800/−0.02em. Body 16–19px/1.55. Small 13–14px.

**Radius**
- Pills 999
- Necklace card 24
- Modal 22
- Cards 16–18
- Gallery 12
- Sticky notes 0

**Shadow**
- Polaroid: see the hero section.
- Note: `0 8px 18px rgba(60,40,10,.12)`
- Modal: `0 30px 60px rgba(0,0,0,.25)`
- Card lip: `0 2px 0 #e8e0cf`

**Spacing**
- Section vertical padding `clamp(64px,9vw,96px)`
- Card padding 22–32
- Grid gaps 14–28

## State
- Server: `raised`, `gifts` (config), `registeredCount`, `notes[]`, `updates[]`.
- Client:
  - Gift sheet: `step` (1–3), `amount`, `customAmount`, `name`, `note`, `error`.
  - Wall form: `draftName`, `draftText`, `error`.
  - Also `faqOpenIndex`, `didRegister` (cookie), `freshBeads[]`, `toast`, and the measured necklace width.
- Countdown and timeline statuses are derived from the current date.

## Assets
- `prototype/assets/carrie.jpg`: hero and gallery photo (provided by Steven). Ask for higher-resolution originals plus the four gallery shots.
- No icons are used. All decoration is CSS (tape strips, beads, dots).

## Launch checklist
- [ ] Pick the charity and create the tribute fundraiser. Set `CHARITY_NAME` and `FUNDRAISER_URL`.
- [ ] Carrie or the transplant center confirms the voucher/paired-program wording in "How it works" and the FAQ.
- [ ] Verify the facts against NKF/OPTN. Keep the friend anonymous; nothing about the recipient.
- [ ] Wire up the notes and registrations storage, Turnstile and the admin hide button.
- [ ] Add the OG image, favicon (a magenta bead), and title "Carrie's Gift: string her a birthday necklace".
- [ ] Domain `gift.carrieburns.net` on Vercel.
- [ ] Soft-launch to family about a week before Oct 20, post updates during recovery, and reveal to Carrie by Nov 3.

## Files
- `prototype/Carrie's Gift Site.dc.html`: the final interactive prototype; the source of truth. Data, copy and the necklace math are in the `<script data-dc-script>` logic class.
- `prototype/support.js`, `prototype/assets/`: needed only to open the prototype locally.
- `explorations/Carrie's Gift.dc.html`: earlier directions. 1a, 1b, 1c, 2a, and 2b, the draped necklace that was chosen.
