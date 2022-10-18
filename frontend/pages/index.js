import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Head>
        <title>Promise</title>
        <meta name='description' content='Roadmap app description' />
        <link rel='icon' href='/favicon.ico' />
        {/* Free SVG Background by <a target="_blank" href="https://bgjar.com">BGJar</a> */}
      </Head>

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
            <div className='action'>
              <button className='action-btn styled'>
                Explore the directory
              </button>
              <button className='action-btn styled'>
                Publish your promise
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className='section section-about'>section 2</section>
    </main>
  );
}
