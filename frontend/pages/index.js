import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <section className='section section-home'>
        <div className='left'></div>
        <div className='right'>
          <div className='title'>
            <div className='title-main'>PROMISE</div>
          </div>
          <div className='caption'>
            <p>
              Expose your roadmap or letter of intent in a fully on-chain and
              decentralized way. Bring accountability to your project.
            </p>
            <p>It's time to hold founders accountable for their promises.</p>
          </div>
          <div className='action'>
            <button className='action-btn styled'>
              <Link href='/explore-promises'>Explore the directory</Link>
            </button>
            <button className='action-btn styled'>
              <Link href='/user-promises'>Publish your promise</Link>
            </button>
          </div>
        </div>
      </section>
      <section className='section section-about'>section 2</section>
    </main>
  );
}
