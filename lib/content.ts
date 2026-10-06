// Final-draft copy, lifted verbatim from the prototype. Steven proofreads.
import { CHARITY } from './config';

export const C = { y: '#f6c945', t: '#2fb5b8', m: '#e0478f' } as const;

export const TIMELINE: { k: string; d: string }[] = [
  { k: 'The ask', d: "A friend needed a kidney. Carrie wasn't a match, so she found another way." },
  { k: 'Getting ready', d: 'Months of training, early mornings and health checks to qualify as a donor.' },
  { k: 'Approved', d: 'Cleared by the transplant team and matched with a stranger.' },
  { k: 'Oct 13', d: 'Pre-op day. Final tests and one last check-in with the transplant team.' },
  { k: 'Oct 20', d: 'Surgery day. A kidney goes to someone she will likely never meet.' },
  { k: 'Recovery', d: 'A few days in hospital, then weeks of rest at home.' },
  { k: 'Nov 3', d: 'Her birthday, and the day we celebrate what she gave.' },
];

export const FAQ: [string, string][] = [
  ['Can you live a normal life with one kidney?', 'Yes. Most living donors go on to live full, healthy lives. The remaining kidney grows and takes on more of the work.'],
  ['How does helping a stranger help her friend?', 'In a voucher or paired-exchange program, a donor gives to a compatible stranger, and someone they name gets priority for a matching kidney when they need one.'],
  ['What does recovery look like?', 'Usually two to three days in the hospital, a few weeks off work, and no heavy lifting for about six weeks. Everyone heals differently.'],
  ["Who pays for a living donor's costs?", "The recipient's insurance covers the medical side. Travel, lodging and lost wages often aren't covered, which is why programs like NLDAC exist."],
  ['Where does my donation go?', `Straight to ${CHARITY}, a registered 501(c)(3), through its own tribute fundraiser. You get the receipt from them, and we never hold the money.`],
];

// TODO before launch: verify against NKF/OPTN.
export const FACTS = [
  { n: '~90,000', l: 'people in the U.S. waiting for a kidney', color: C.y },
  { n: '15–20 yrs', l: 'typical life of a living-donor kidney', color: C.t },
  { n: '1', l: 'kidney is all a healthy donor needs', color: C.m },
];

export const LINKS = [
  { title: 'Register as a donor', desc: 'Sign up as an organ, eye and tissue donor in a couple of minutes.', host: 'registerme.org', url: 'https://registerme.org', color: C.y },
  { title: 'Explore living donation', desc: 'Learn what being a living kidney donor involves.', host: 'lkdn.org', url: 'https://www.lkdn.org', color: C.t },
  { title: 'How voucher donation works', desc: 'The program that lets one gift help a loved one later.', host: 'kidneyregistry.org', url: 'https://www.kidneyregistry.org', color: C.m },
  { title: 'Help for donor costs', desc: 'Travel and lodging help for living donors.', host: 'livingdonorassistance.org', url: 'https://www.livingdonorassistance.org', color: C.y },
];

export const STEPS = [
  { n: 1, bg: C.y, fg: '#2b2620', title: 'Carrie gives', body: 'Her kidney goes to a stranger who is a strong match and has been waiting.' },
  { n: 2, bg: C.t, fg: '#2b2620', title: 'Her friend moves up', body: 'Because Carrie donated, her friend gets priority for a matching kidney when one is found.' },
  { n: 3, bg: C.m, fg: '#fff', title: 'Two lives change', body: 'One act of generosity leads to two transplants, and sometimes a whole chain of them.' },
];

// Add `src: '/gallery/xyz.jpg'` as Steven's photos come in.
export const GALLERY_SLOTS: { label: string; src?: string }[] = [
  { label: 'training walk' }, { label: 'hospital day' }, { label: 'recovery' }, { label: 'birthday' },
];

export const NOTE_COLORS = ['#fbe08a', '#bfe9e7', '#f8c6dc'];
export const NOTE_ROTS = ['-2deg', '1.5deg', '-1deg', '2deg'];

export const WHO_COLOR: Record<string, string> = { Steven: C.y, Carrie: C.t };
