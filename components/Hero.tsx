import Image from 'next/image';
import { CHARITY } from '@/lib/config';
import GiftButton from './GiftButton';
import styles from './Hero.module.css';
import carrie from '@/public/carrie-mug.jpg';

export default function Hero() {
  return (
    <section id="top" className={`wrap ${styles.hero}`}>
      <div>
        <div className={`hand ${styles.kicker}`}>for her birthday, Nov 3</div>
        <h1 className={styles.h1}>Carrie is giving a kidney to someone she&apos;s never met.</h1>
        <p className={styles.lede}>
          She wasn&apos;t a match for a friend who needs one, so she found another way. By donating to a stranger, she moves her friend up the list for a kidney of her own. Surgery is October 20. For her birthday, we&apos;re stringing her a necklace of gifts in her name.
        </p>
        <div className={styles.buttons}>
          <GiftButton from="hero" className={`btn-primary ${styles.primary}`}>Add a bead: give $100</GiftButton>
          <a href="#wall" className={`btn-outline ${styles.secondary}`}>Leave a birthday note</a>
        </div>
        <div className={styles.fine}>Any amount helps. You give on the {CHARITY}&apos;s own secure page, so we never handle the money, and you receive a tax-deductible donation receipt.</div>
      </div>
      <div className={styles.photoWrap}>
        <div className={styles.polaroid}>
          <Image src={carrie} alt="Carrie sipping from a Frida Kahlo mug" priority placeholder="blur" sizes="(max-width: 520px) 90vw, 432px" className={styles.photo} />
          <div className={`hand ${styles.caption}`}>Oct 20: surgery. Nov 3: cake.</div>
          <div className={styles.tapeTop} aria-hidden />
        </div>
        <div className={styles.tapeCorner} aria-hidden />
      </div>
    </section>
  );
}
