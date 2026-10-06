import type { Metadata, Viewport } from 'next';
import { Caveat, Figtree } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { BotIdClient } from 'botid/client';
import { SITE_URL } from '@/lib/config';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-figtree' });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-caveat' });

const title = "Carrie's Gift: string her a birthday necklace";
const description = "Carrie is giving a kidney to someone she's never met. For her birthday, add a bead to her necklace, register as a donor, or sign her wall.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description, url: '/', siteName: "Carrie's Gift", type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#fbf8f1' };

const protectedRoutes = [
  { path: '/api/notes', method: 'POST' as const },
  { path: '/api/register', method: 'POST' as const },
  { path: '/api/gifts', method: 'POST' as const },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${caveat.variable}`}>
      <head>
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
