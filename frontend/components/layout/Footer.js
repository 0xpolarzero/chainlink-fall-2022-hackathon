import styles from '../../styles/modules/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        Built by polarzero during the
        <a
          className={styles.nosocial}
          href='https://blog.chain.link/chainlink-fall-2022-hackathon/'
          target='_blank'
          rel='noopener noreferrer'
        >
          Chainlink Fall 2022 Hackathon
        </a>
      </div>
      <div>
        <a
          href='https://twitter.com/0xpolarzero'
          target='_blank'
          rel='noopener noreferrer'
        >
          <i className='fab fa-twitter'></i>
        </a>
        <a
          href='https://github.com/polar0/'
          target='_blank'
          rel='noopener noreferrer'
        >
          <i className='fab fa-github'></i>
        </a>
        <a
          href='https://polarzero.xyz/'
          target='_blank'
          rel='noopener noreferrer'
        >
          <i className='fas fa-globe'></i>
        </a>
      </div>
    </footer>
  );
}
