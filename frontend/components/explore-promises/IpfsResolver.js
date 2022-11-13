import IpfsDisplayPdf from './IpfsDisplayPdf';
import IpfsDisplayDirectory from './IpfsDisplayDirectory';
import FormattedAddress from '../utils/FormattedAddress';
import { getContentFromCid } from '../../systems/tasks/getContentFromCid';
import { getWeb3StorageClient } from '../../systems/tasks/getWeb3StorageClient';
import { Badge, Popover, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

const web3StorageClient = getWeb3StorageClient();

export default function IpfsResolver({ ipfsCid, contractAddress }) {
  const [resolvedData, setResolvedData] = useState({
    link: '',
    content: '',
  });
  const [isDisplayReady, setIsDisplayReady] = useState(false);
  const [isDirectory, setIsDirectory] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getContentFromCid(ipfsCid)
      .then((data) => {
        if (data) {
          if (data.content === 'pdf') {
            setResolvedData({
              link: data.link,
              content: 'pdf',
            });
            setIsDisplayReady(true);
          } else {
            // It's a directory
            setResolvedData({
              link: data.link,
              content: data.content,
              baseCid: data.baseCid,
            });
            setIsDirectory(true);
            setIsDisplayReady(true);
          }
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        setIsError(true);
        console.log(err);
      });
  }, []);

  if (isError) {
    return (
      <div className='error-message'>
        There was an error displaying the content
      </div>
    );
  }

  if (!isDisplayReady) {
    return <Skeleton active />;
  }

  if (isDirectory) {
    return (
      <>
        <IpfsDisplayDirectory
          link={resolvedData.link}
          originalContent={resolvedData.content}
          baseCid={resolvedData.baseCid}
        />
        <IpfsPinning ipfsCid={ipfsCid} />
      </>
    );
  }

  return (
    <>
      <IpfsDisplayPdf link={resolvedData.link} />
      <IpfsPinning ipfsCid={ipfsCid} />
    </>
  );
}

const IpfsPinning = ({ ipfsCid }) => {
  const [ipfsPeers, setIpfsPeers] = useState([null]);
  const [badgeColor, setBadgeColor] = useState('var(--toastify-color-warning)');

  // Get the pinning status of the IPFS content
  const getIpfsPinningStatus = async () => {
    const info = await web3StorageClient.status(ipfsCid);
    setIpfsPeers(info.pins);
  };

  useEffect(() => {
    getIpfsPinningStatus();
  }, []);

  useEffect(() => {
    if (ipfsPeers.length <= 3) {
      setBadgeColor('var(--toastify-color-warning)');
    } else {
      setBadgeColor('var(--toastify-color-success)');
    }
  }, [ipfsPeers]);

  if (!ipfsPeers || ipfsPeers.length === 0 || ipfsPeers[0] === null) {
    return (
      <div className='security'>
        <Skeleton
          active
          paragraph={false}
          avatar={{ size: 'small' }}
          title={false}
        />
      </div>
    );
  }

  return (
    <div className='security'>
      <div className='ipfs-pins'>
        <Popover
          content={
            <div>
              This IPFS content is currently being pinned by{' '}
              <b>{ipfsPeers.length} peers</b>. <br />
              The more peers that pin the content, the more secure it is. <br />
              If you want to pin the content yourself, and make it un-deletable,
              you can: <br />
              <a
                href='https://docs.ipfs.tech/how-to/companion-node-types/'
                target='_blank'
                rel='noreferrer'
              >
                - follow this guide to run your own IPFS node
              </a>
              <br />- use the IPFS CID as the content to pin:{' '}
              <FormattedAddress
                address={ipfsCid}
                isShrinked={true}
                type='ipfs'
              />
              <br />
              <br />
              Current peers pinning this content:
              <br />
              {ipfsPeers.map((peer) => (
                <>
                  <FormattedAddress
                    key={peer.peerId}
                    address={peer.peerId}
                    isShrinked={true}
                    type='ipfs'
                  />
                  <br />
                </>
              ))}
            </div>
          }
        >
          <Badge
            count={ipfsPeers.length}
            color={badgeColor}
            style={{ marginRight: '-0.5rem' }}
          >
            <i className='fas fa-sitemap' />
          </Badge>
        </Popover>
      </div>
    </div>
  );
};
