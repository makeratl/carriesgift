import Image from 'next/image';
import { GALLERY_SLOTS } from '@/lib/content';
import carrie from '@/public/carrie.jpg';
import s from './Sections.module.css';

export default function Gallery() {
  return (
    <section className={`wrap ${s.gallery}`}>
      <h2 className="h3">Along the way</h2>
      <div className={s.galleryGrid}>
        <Image src={carrie} alt="Carrie" sizes="(max-width: 520px) 90vw, 400px" className={s.galleryHero} />
        {/* Placeholder slots only show in dev; drop real photos into GALLERY_SLOTS as they arrive. */}
        {GALLERY_SLOTS.map(g => g.src
          ? <Image key={g.label} src={g.src} alt={g.label} width={400} height={400} className={s.galleryPhoto} />
          : process.env.NODE_ENV !== 'production' && <div key={g.label} className={s.gallerySlot}>{g.label}</div>)}
      </div>
    </section>
  );
}
