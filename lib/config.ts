export const CHARITY = process.env.NEXT_PUBLIC_CHARITY_NAME || 'National Kidney Foundation';
export const FUNDRAISER_URL = process.env.NEXT_PUBLIC_FUNDRAISER_URL || '';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidney.carrieburns.net';
export const GOAL = 5000;
export const BEAD_VALUE = 100;
export const NOTE_MAX = 180;

export const fmtUSD = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export const shareMessage = (url: string) =>
  `For Carrie's birthday, help string her a necklace of gifts for ${CHARITY}. She's donating a kidney to a stranger on Oct 20. ${url}`;
