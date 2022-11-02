import { Skeleton } from 'antd';
import { syntaxError } from 'graphql';
import { useEffect, useState } from 'react';
import IpfsDisplayPdf from './IpfsDisplayPdf';
import IpfsDisplayDirectory from './IpfsDisplayDirectory';

export default function IpfsResolver({ uri }) {
  const [resolvedData, setResolvedData] = useState({
    link: '',
    content: '',
  });
  const [isDisplayReady, setIsDisplayReady] = useState(false);
  const [isDirectory, setIsDirectory] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getLinkFromCid();
  }, []);

  const getLinkFromCid = async () => {
    try {
      const cid = await getCidFromUri(uri);
      // List the content of the directory at the provided CID (URI)
      const dir = `https://ipfs.io/api/v0/ls?arg=${cid}`;
      console.log(cid);

      // Fetch curl -X POST dir with headers=<value> with size=true
      const res = await fetch(dir, {
        method: 'POST',
      }).catch((err) => {
        console.log(err);
        setIsError(true);
      });
      const data = await res.json();

      // If there is only one file in the directory, and it is a PDF, we can display it
      if (data.Objects[0].Links.length === 1) {
        const pdf = data.Objects[0].Links[0].Hash;
        const pdfUrl = 'https://ipfs.io/ipfs/' + pdf;
        setResolvedData({
          link: pdfUrl,
          content: 'pdf',
        });
        setIsDisplayReady(true);
        // If it contains multiple files, we can just display the directory
      } else if (data.Objects[0].Links.length > 1) {
        const pdfUrl = 'https://ipfs.io/ipfs/' + cid;
        setResolvedData({
          link: pdfUrl,
          content: data.Objects[0].Links,
        });
        setIsDirectory(true);
        setIsDisplayReady(true);
      }
    } catch (err) {
      setIsError(true);
      console.log(err);
    }
  };

  if (isError) {
    return (
      <div className='error-message'>There was an error displaying the PDF</div>
    );
  }

  if (!isDisplayReady) {
    return <Skeleton active />;
  }

  if (isDirectory) {
    return (
      <IpfsDisplayDirectory
        link={resolvedData.link}
        content={resolvedData.content}
      />
    );
  }

  return <IpfsDisplayPdf link={resolvedData.link} />;
}

const getCidFromUri = async (uri) => {
  let cid;
  // Try to extract the cid of the provided uri, if there are any prefix or suffix
  if (uri.includes('ipfs://ipfs/')) {
    cid = uri.split('ipfs://ipfs/')[1];
  } else if (uri.includes('ipfs///')) {
    cid = uri.split('ipfs///')[1];
  } else if (uri.includes('ipfs://')) {
    cid = uri.split('ipfs://')[1];
  } else if (uri.includes('ipfs.io/ipfs/')) {
    cid = uri.split('ipfs.io/ipfs/')[1];
  } else if (uri.includes('ipfs.io/ipns/')) {
    cid = uri.split('ipfs.io/ipns/')[1];
  } else {
    cid = uri;
  }

  return cid;
};
