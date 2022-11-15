import Link from 'next/link';
import ThreeScene from '../components/three/ThreeScene';
import { Button } from 'antd';

export default function Home() {
  return (
    <main className='home'>
      <section className='section section-home'>
        <div className='left'>
          <div className='logo-home'>
            <ThreeScene />
          </div>
        </div>
        <div className='right'>
          <div className='title'>
            <div className='title-main'>promise</div>
          </div>
          <div className='caption'>
            <p>
              A blockchain service for founders, creators and regular users.
            </p>
            <p>
              Built to help improve trust in our digital relationships and make
              founders more accountable for their promises.
            </p>
          </div>
          <div className='action'>
            <Link href='/explore-promises'>
              <Button type='primary' className='action-btn'>
                Explore the directory
              </Button>
            </Link>
            <Link href='/user-dashboard'>
              <Button type='primary' className='action-btn'>
                Publish your promise
              </Button>
            </Link>
            <br />
            <Link href='/explore-twitter-verified'>
              <Button type='primary' className='action-btn'>
                Explore verified Twitter handles
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className='section section-about'>section 2</section>
    </main>
  );
}
