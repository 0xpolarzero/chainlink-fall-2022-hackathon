import Script from 'next/script';
import { useEffect, useState } from 'react';
import Logo from '../../asset/logo-home.png';

export default function ParticleLogo() {
  const [isParticleDisplayed, setIsParticleDisplayed] = useState(false);
  const initParticles = () => {
    const nextParticle = new NextParticle(document.querySelector('#logo'));
    setIsParticleDisplayed(true);
  };

  useEffect(() => {
    if (typeof NextParticle !== 'undefined' && !isParticleDisplayed) {
      initParticles();
    }
  }, []);

  return (
    <div className='logo-home'>
      <Script src='/nextparticle.min.js' onLoad={initParticles} />

      <img
        src={Logo.src}
        alt='logo'
        id='logo'
        // className='next-particle'
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
