import styles from '../styles/Home.module.css';
import '../styles/globals.css';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <div className={styles.container}>
      <Header />
      <Component {...pageProps} />
      {/* <Footer /> */}
    </div>
  );
}

export default MyApp;
