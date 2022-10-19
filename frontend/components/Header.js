import styles from '../styles/Home.module.css';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export const Header = ({ activePage, setActivePage }) => {
  const updateSlider = (i) => {
    const root = document.querySelector(':root');
    root.style.setProperty('--tab-nav-current-item', i);
  };

  const handleNavItemClick = (e, i) => {
    updateSlider(i);
    setActivePage(i);

    if (e && i === 0) smoothScrollTo(e.target.attributes.to.value);
  };

  const smoothScrollTo = (target) => {
    // Make sure the activePage page is '/' and not '/explore-promises' or '/user-promises'
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return;

    document.querySelector(target).scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateSlider(activePage);
  }, [activePage]);

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <Link href='/'>
          <a
            onClick={() => {
              smoothScrollTo('.section-home');
              handleNavItemClick(null, 0);
            }}
          >
            PROMISE
          </a>
        </Link>
      </div>
      <TabNav>
        {/* <Link href='/'>
          <a
            className={activePage === 0 ? 'active' : ''}
            onClick={(e) => handleNavItemClick(e, 0)}
            onMouseEnter={() => updateSlider(0)}
            onMouseLeave={() => updateSlider(activePage)}
            to='.section-home'
          ></a>
        </Link> */}
        <Link href='/'>
          <a
            className={activePage === 0 ? 'active' : ''}
            onClick={(e) => handleNavItemClick(e, 0)}
            onMouseEnter={() => updateSlider(0)}
            onMouseLeave={() => updateSlider(activePage)}
            to='.section-about'
          >
            The project
          </a>
        </Link>
        <Link href='/explore-promises'>
          <a
            className={activePage === 1 ? 'active' : ''}
            onClick={(e) => handleNavItemClick(e, 1)}
            onMouseEnter={() => updateSlider(1)}
            onMouseLeave={() => updateSlider(activePage)}
          >
            Explore
          </a>
        </Link>
        <Link href='/user-promises'>
          <a
            className={activePage === 2 ? 'active' : ''}
            onClick={(e) => handleNavItemClick(e, 2)}
            onMouseEnter={() => updateSlider(2)}
            onMouseLeave={() => updateSlider(activePage)}
          >
            Your promises
          </a>
        </Link>
        <ConnectButton
          label='Connect'
          showBalance={false}
          showNetwork={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'avatar',
          }}
          chainStatus={{
            smallScreen: 'icon',
            largeScreen: 'full',
          }}
        />
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
