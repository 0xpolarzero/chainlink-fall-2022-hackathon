import Link from 'next/link';
import { Button } from 'antd';

export default function Home() {
  return (
    <main className='home'>
      <section className='section section-home'>
        <div className='left'></div>
        <div className='right'>
          <div className='title'>
            <div className='title-main'>promise</div>
          </div>
          <div className='caption'>
            <p>
              Expose your roadmap or letter of intent in a fully on-chain and
              decentralized way. Bring accountability to your project.
            </p>
            <p>It's time to hold founders accountable for their promises.</p>
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
          </div>
        </div>
      </section>
      <section className='section section-about'>section 2</section>
    </main>
  );
}
