import Link from 'next/link';
import ParticleLogo from '../components/home/ParticleLogo';
import { Button, Card, Divider } from 'antd';

const gridStyle = {
  minWidth: '200px',
  textAlign: 'center',
  alignSelf: 'center',
  height: '100%',
};

export default function Home() {
  const faqLinks = [
    {
      title: 'Understanding a promise',
      path: 'how-to-use/exploring-promises',
    },
    {
      title: 'Creating a promise',
      path: 'how-to-use/creating-a-promise',
    },
    {
      title: 'Interacting with your promises',
      path: 'how-to-use/interacting-with-promises',
    },
    {
      title: 'Verifying your Twitter account',
      path: 'how-to-use/verifying-a-twitter-account',
    },
    {
      title: 'How is the Twitter verification performed?',
      path: 'chainlink-external-adapters/twitter-account-verification',
    },
    {
      title:
        'How are the persistance and integrity of a promise content ensured?',
      path: 'chainlink-external-adapters/ipfs-and-arweave-verification',
    },
  ];

  const goToDocumentation = (path) => {
    window.open(`https://docs.usepromise.xyz/${path}`, '_blank').focus();
  };

  return (
    <>
      <main className='home'>
        <section className='section section-home'>
          <div className='left'>
            <ParticleLogo />
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
                Built to help improve trust in our digital relationships and
                make founders more accountable for their promises.
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
        <Divider />
        <section className='section section-about'>
          <div className='faq'>
            <div className='header'>
              <div className='title'>How to use</div>
              <div className='caption'>Useful links to get started</div>
            </div>

            <div className='links-list'>
              <Card title={false} bordered={false}>
                {faqLinks.map((link, index) => (
                  <Card.Grid
                    key={index}
                    style={gridStyle}
                    onClick={() => goToDocumentation(link.path)}
                  >
                    {link.title}
                  </Card.Grid>
                ))}
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
