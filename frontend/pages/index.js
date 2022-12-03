import Link from 'next/link';
import ParticleLogo from '../components/home/ParticleLogo';
import { useWidth } from '../systems/hooks/useWidth';
import { Button, Card, Divider } from 'antd';

const gridStyle = {
  minWidth: '200px',
  alignSelf: 'center',
  height: '100%',
};

export default function Home() {
  const width = useWidth();

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
          {width > 768 ? (
            <div className='left'>
              <ParticleLogo />
            </div>
          ) : null}
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
              <Link href='/dashboard'>
                <Button type='primary' className='action-btn'>
                  Publish your promise
                </Button>
              </Link>
              <br />
              <Link href='/explore-twitter-verified'>
                <Button type='primary' className='action-btn'>
                  Explore verified Twitter accounts
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className='section section-about'>
          <div className='faq'>
            <div className='header'>
              <Divider orientation='left'>
                <div className='caption'>Get started</div>
              </Divider>
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
