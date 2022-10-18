import styles from '../styles/Home.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export const Header = () => {
  const [active, setActive] = useState(0);

  const handleNavItemClick = (e) => {
    // if (typeof window === 'undefined') return;
    const root = document.querySelector(':root');
    root.style.setProperty('--tab-nav-current-item', e);
    setActive(e);

    if (e === 2) smoothScrollTo('.section-about');
  };

  const smoothScrollTo = (target) => {
    // See if active page is home or another page
    const home = document.querySelector('.section-home');
    document.querySelector(target).scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleNavItemHover = (e) => {
    const root = document.querySelector(':root');
    root.style.setProperty('--tab-nav-current-item', e);
  };

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <Link href='/'>
          <a onClick={() => smoothScrollTo('.section-home')}>PROMISE</a>
        </Link>
      </div>
      <TabNav>
        <Link href='/'>
          <a
            className={active === 2 ? 'active' : ''}
            onClick={() => handleNavItemClick(2)}
            onMouseEnter={() => handleNavItemHover(2)}
            onMouseLeave={() => handleNavItemHover(active)}
            to='.about'
          >
            The project
          </a>
        </Link>
        <Link href='/explore'>
          <a
            className={active === 1 ? 'active' : ''}
            onClick={() => handleNavItemClick(1)}
            onMouseEnter={() => handleNavItemHover(1)}
            onMouseLeave={() => handleNavItemHover(active)}
          >
            Explore
          </a>
        </Link>
        <Link href='/user'>
          <a
            className={active === 0 ? 'active' : ''}
            onClick={() => handleNavItemClick(0)}
            onMouseEnter={() => handleNavItemHover(0)}
            onMouseLeave={() => handleNavItemHover(active)}
          >
            Your promises
          </a>
        </Link>
      </TabNav>
    </header>
  );
};

const TabNav = ({ children, className }) => {
  useEffect(() => {
    const root = document.querySelector(':root');
    root.style.setProperty('--tab-nav-items', children.length);
  }, [children]);
  return (
    <div className={[styles.links, className].join(' ')}>
      {children}
      <div className={styles.slider} role='presentation'></div>
    </div>
  );
};
