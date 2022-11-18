import IpfsDisplayDirectory from './IpfsDisplayDirectory';
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
          // We actually don't want to display PDFs like this anymore
          // since it sometimes shows the PDF in an incorrect way
          // such as cropped or with a white background
          // if (data.content === 'pdf') {
          //   setResolvedData({
          //     link: data.link,
          //     content: 'pdf',
          //   });
          //   setIsDisplayReady(true);
          // } else {
          // It's a directory
          setResolvedData({
            link: data.link,
            content: data.content,
            baseCid: data.baseCid,
          });
          setIsDirectory(true);
          setIsDisplayReady(true);
          // }
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

  // if (isDirectory) {
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
  // }

  // return (
  //   <>
  //     <IpfsDisplayPdf link={resolvedData.link} />
  //     <IpfsPinning ipfsCid={ipfsCid} />
  //   </>
  // );
}

const IpfsPinning = ({ ipfsCid }) => {
  const [ipfsStatus, setIpfsStatus] = useState([null]);
  const [longestDeal, setLongestDeal] = useState(0);
  const [isDealLongEnough, setIsDealLongEnough] = useState(false);
  const [badgeColor, setBadgeColor] = useState('var(--toastify-color-warning)');

  // Get the pinning status of the IPFS content
  const getIpfsPinningStatus = async () => {
    const status = await web3StorageClient.status(ipfsCid);

    // Get the longest deal
    if (status.deals.length > 0) {
      const longestDeal = status.deals.reduce((a, b) => {
        return a.expiration > b.expiration ? a : b;
      });

      const currentDate = new Date();
      const expirationDate = new Date(longestDeal.expiration);
      const diffTime = Math.abs(expirationDate - currentDate);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

      if (diffMonths > 12) {
        setIsDealLongEnough(true);
      } else {
        setIsDealLongEnough(false);
      }
      setLongestDeal(expirationDate.toLocaleDateString());
    }

    console.log(status);
    setIpfsStatus(status);
  };

  useEffect(() => {
    getIpfsPinningStatus();
  }, []);

  useEffect(() => {
    // Consider it's secure enough if there are at least 3 pins
    // or if the longest deal is at least still valid for 12 months
    if ((ipfsStatus.pins && ipfsStatus.pins.length > 3) || isDealLongEnough) {
      setBadgeColor('var(--toastify-color-success)');
    } else {
      setBadgeColor('var(--toastify-color-warning)');
    }
  }, [ipfsStatus]);

  if (!ipfsStatus || ipfsStatus.pins === undefined) {
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
              <b>{ipfsStatus.pins.length} peers</b>. <br />
              The more peers that pin the content, the more secure it is. <br />
              <a
                href='https://docs.usepromise.xyz/how-to-use/indexing-an-ipfs-directory'
                target='_blank'
                rel='noopener noreferrer'
              >
                Follow the documentation to learn how to start pinning content
                and contribute to making it undeletable
              </a>
              .
              {ipfsStatus.deals.length > 0 && (
                <>
                  <br />
                  <br />
                  The persistence if this content is guaranteed by{' '}
                  <b>{ipfsStatus.deals.length} deals</b> with Filecoin.
                  <br />
                  The longest deal ends on <b>{longestDeal}</b>.
                </>
              )}
            </div>
          }
        >
          <Badge
            count={ipfsStatus.pins.length}
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
