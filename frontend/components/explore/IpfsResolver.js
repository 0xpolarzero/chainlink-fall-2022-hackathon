import IpfsDisplayPdf from './IpfsDisplayPdf';
import IpfsDisplayDirectory from './IpfsDisplayDirectory';
import { getContentFromCid } from '../../systems/getContentFromCid';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

export default function IpfsResolver({ uri }) {
  const [resolvedData, setResolvedData] = useState({
    link: '',
    content: '',
  });
  const [isDisplayReady, setIsDisplayReady] = useState(false);
  const [isDirectory, setIsDirectory] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getContentFromCid(uri)
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
      <IpfsDisplayDirectory
        link={resolvedData.link}
        originalContent={resolvedData.content}
        baseCid={resolvedData.baseCid}
      />
    );
  }

  return <IpfsDisplayPdf link={resolvedData.link} />;
}
