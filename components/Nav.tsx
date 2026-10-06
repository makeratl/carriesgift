import GiftButton from './GiftButton';
import styles from './Nav.module.css';

export default function Nav() {
  return (
    <header className={styles.bar}>
      <div className={`wrap ${styles.inner}`}>
        <a href="#top" className={`hand ${styles.logo}`}>Carrie&apos;s Gift</a>
        <nav className={styles.right}>
          <div className={styles.links}>
            <a href="#story">Her story</a>
            <a href="#updates">Updates</a>
            <a href="#learn">Learn</a>
            <a href="#wall">Birthday wall</a>
          </div>
          <GiftButton from="nav" className={`btn-primary ${styles.cta}`}>Add a bead</GiftButton>
        </nav>
      </div>
    </header>
  );
}
