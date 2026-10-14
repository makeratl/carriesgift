// Final-draft copy, lifted verbatim from the prototype. Steven proofreads.
import { CHARITY } from './config';

export const C = { y: '#f6c945', t: '#2fb5b8', m: '#e0478f' } as const;

export const TIMELINE: { when?: string; k: string; d: string }[] = [
  { when: 'Oct 2025', k: 'The Ask', d: "Juliette posted on Facebook about needing a kidney. Carrie's BMI of 39 (down from 48 in Dec 2024) wouldn't even allow submission, so she added \u201cbe healthy enough to donate a kidney\u201d to her health goals." },
  { when: 'May 2026', k: 'Testing', d: 'BMI of 34.5 reached and application accepted. Testing (and waiting) at Piedmont Transplant Center began. They make very sure you\u2019re healthy enough to give.' },
  { when: 'Aug 2026', k: 'Approved', d: 'Cleared by the transplant team. The search began for a blood and tissue match through National Kidney Registry affiliates.' },
  { when: 'Sept 2026', k: 'Match Found', d: 'A match turned up in Florida, someone waiting for a living donor (like her friend), and the surgery date was set.' },
  { when: 'Oct 20', k: 'Surgery Day', d: 'Pre-op on Oct 13 locked in the final arrangements. Then laparoscopic surgery at Piedmont, and her left foster kidney heads to the beach. Pretty fitting.' },
  { k: 'Recovery', d: 'One to two days in the hospital (gotta get walking and close those rings), then a few weeks easing off strength training while her body heals.' },
  { when: 'Nov 3', k: 'Her Birthday', d: 'By now \u201cSolo Mio,\u201d her remaining kidney, has picked up the slack. The hope: her left kidney is thriving at its new job, and Juliette has a match and a surgery date set, or is close to it.' },
];

// FAQ answers support inline [text](url) links, rendered by components/Faq.tsx.
export const FAQ: [string, string][] = [
  ['Can you live a normal life with one kidney?', 'Yes. Most living donors go on to live full, healthy lives. The remaining kidney grows and takes on more of the work. Read more about [the side effects of living with one kidney](https://www.kidneyregistry.com/for-donors/kidney-donation-blog/what-are-the-side-effects-of-living-with-one-kidney/).'],
  ['How does helping a stranger help her friend?', 'Through the [National Kidney Registry\u2019s voucher program](https://www.kidneyregistry.com/for-donors/voucher-program/), a donor gives to a compatible stranger, and the person they name receives a voucher. That moves them to the living donor list, where the search begins for a living donor who matches them.'],
  ['What does recovery look like?', 'Usually one to three days in the hospital, a few weeks off work, and no heavy lifting for about six weeks. Everyone heals differently. If you know Carrie, keeping her from doing things is challenging. [More about recovery](https://www.kidney.org/kidney-topics/what-to-expect-after-donation).'],
  ["Who pays for a living donor's costs?", "The recipient's insurance covers the medical side. Travel, lodging and lost wages often aren't covered, which is why programs like the [National Kidney Registry\u2019s Donor Shield](https://www.donorshield.com/kidney-donors/donor-protections/) exist."],
  ['Where does my donation go?', `Straight to the ${CHARITY}, a registered 501(c)(3), through its own tribute fundraiser. You get the receipt from them, and we never hold the money.`],
];

// Waitlist ~90k (OPTN/NKR, checked 2026-10-10). Living donations/yr and kidney lifespan per Carrie (2026-10-11).
export const FACTS = [
  { n: '~90,000', l: 'people in the U.S. waiting for a kidney', color: C.y },
  { n: '~6,500', l: 'living kidney donations every year', color: C.t },
  { n: '20–40 yrs', l: 'length of time the average kidney from a living donor lasts', color: C.m },
  { n: '1', l: 'kidney is all a healthy donor needs', color: C.y },
];

export const LINKS = [
  { title: 'Register as a donor', desc: 'Sign up as an organ, eye and tissue donor in a couple of minutes.', host: 'registerme.org', url: 'https://registerme.org', color: C.y },
  { title: 'Explore living donation', desc: 'Learn what being a living kidney donor involves.', host: 'kidney.org', url: 'https://www.kidney.org/kidney-topics/becoming-living-donor', color: C.t },
  { title: 'How voucher donation works', desc: 'The program that lets one gift help a loved one later.', host: 'kidneyregistry.org', url: 'https://www.kidneyregistry.org', color: C.m },
  { title: 'Help for donor costs', desc: 'Lost wages, travel and lodging reimbursed for living donors.', host: 'donorshield.com', url: 'https://www.donorshield.com/kidney-donors/', color: C.y },
];

export const STEPS = [
  { n: 1, bg: C.y, fg: '#2b2620', title: 'Carrie gives', body: 'After months of testing, approval and the search for a match, her kidney goes to a stranger on the living donor list who is a strong match.' },
  { n: 2, bg: C.t, fg: '#2b2620', title: 'Her friend moves up', body: 'Because Carrie donated, Juliette receives a voucher and moves to the living donor list, and the search begins for a living donor who matches her.' },
  { n: 3, bg: C.m, fg: '#fff', title: 'Two lives transformed', body: "One act of generosity leads to two transplants, and sometimes a whole chain of them (if sites like this one do their job). It doesn't cost anything to [find out if you can donate](https://www.kidneyregistry.com/for-donors/kidney-donation-blog/does-it-cost-anything-to-get-tested-as-a-living-kidney-donor/)!" },
];

// Add `src: '/gallery/xyz.jpg'` as Steven's photos come in.
export const GALLERY_SLOTS: { label: string; src?: string }[] = [
  { label: 'training walk' }, { label: 'hospital day' }, { label: 'recovery' }, { label: 'birthday' },
];

export const NOTE_COLORS = ['#fbe08a', '#bfe9e7', '#f8c6dc'];
export const NOTE_ROTS = ['-2deg', '1.5deg', '-1deg', '2deg'];

export const WHO_COLOR: Record<string, string> = { Steven: C.y, Carrie: C.t };
