import styles from '../styles/Home.module.css';
import { useEffect } from 'react';

export default function userPromises({ setActivePage }) {
  useEffect(() => {
    setActivePage(2);
  }, []);

  return (
    <main className={styles.main}>
      <section className='section section-user'></section>
    </main>
  );
}
