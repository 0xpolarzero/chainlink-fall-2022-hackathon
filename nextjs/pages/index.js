import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Head>
        <title>Roadmap.network</title>
        <meta name='description' content='Roadmap app description' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div>test</div>
    </main>
  );
}
