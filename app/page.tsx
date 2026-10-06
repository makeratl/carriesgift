import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import JoinHer from '@/components/JoinHer';
import Learn from '@/components/Learn';
import Nav from '@/components/Nav';
import Necklace from '@/components/Necklace';
import SiteProvider from '@/components/SiteProvider';
import Timeline from '@/components/Timeline';
import Updates from '@/components/Updates';
import Wall from '@/components/Wall';
import { PAGE_SIZE, getNotes, getStats, getUpdates } from '@/lib/data';
import { todayET } from '@/lib/dates';

export const revalidate = 60;

export default async function Home() {
  const [stats, notes, updates] = await Promise.all([getStats(), getNotes(0), getUpdates()]);
  return (
    <SiteProvider initialStats={stats} initialToday={todayET()}>
      <Nav />
      <main>
        <Hero />
        <Necklace />
        <HowItWorks />
        <Timeline />
        <Updates updates={updates} />
        <Learn />
        <JoinHer />
        <Wall initialNotes={notes} hasMore={notes.length === PAGE_SIZE} />
        <Gallery />
      </main>
      <Footer />
    </SiteProvider>
  );
}
