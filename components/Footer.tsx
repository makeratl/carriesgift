import { CHARITY } from '@/lib/config';
import ShareButtons from './Share';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <ShareButtons className={styles.share} linkClass={styles.link} copyClass={styles.copy} />
        <div className={styles.disclaimer}>
          Every bead goes directly to the {CHARITY}, a registered 501(c)(3), through its own tribute page. We never hold or handle donations.
        </div>
      </div>
    </footer>
  );
}
