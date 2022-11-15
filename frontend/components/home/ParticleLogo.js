import Script from 'next/script';
import { useEffect, useState } from 'react';
import Logo from '../../asset/logo-home.png';

export default function ParticleLogo() {
  const initParticles = () => {
    // const nextParticle = new NextParticle(document.querySelector('#logo'));
    // const availableWidth =
    //   document.querySelector('.section-home').getBoundingClientRect().width / 2;
    // const usableWidth = availableWidth /*  * 0.7 */
    //   .toFixed();
  };

  return (
    <div className='logo-home'>
      <Script src='/nextparticle.min.js' onLoad={initParticles} />

      <img
        src={Logo.src}
        alt='logo'
        id='logo'
        className='next-particle'
        data-max-width='30%'
        data-particle-gap='1'
        data-gravity='0.15'
        data-mouse-force='20'
        data-renderer='webgl'
        data-particle-size='0.5'
      />
    </div>
  );
}
