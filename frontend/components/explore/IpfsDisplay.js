import { Viewer, Worker } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

export default function IpfsDisplay({ uri, link, setLink }) {
  const [availableHeight, setAvailableHeight] = useState(0);
  const [isDisplayReady, setIsDisplayReady] = useState(false);
  const [isDirectory, setIsDirectory] = useState(false);
  const [isError, setIsError] = useState(false);
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform = (slot) => ({
    ...slot,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  useEffect(() => {
    formatPdfLink();
    // We want the PDF to take all the available height
    // but keep seing the Panel content and the other Collapsible headers
    const nowAvailableHeight = getAvailableHeightForPdf();
    setAvailableHeight(nowAvailableHeight < 350 ? 350 : nowAvailableHeight);
  }, []);

  const formatPdfLink = () => {
    try {
      // In case there is a prefix, keep just the CID
      // If there is ipfs:/// or ipfs:// of ipfs.io/ipfs/ or ipfs.io/ipfs... remove it. If there is a / at the end, remove what's after
      const cid =
        uri.split('ipfs://').length > 1
          ? uri.split('ipfs:///')[1].split('/')[0]
          : uri.split('ipfs.io/ipfs/').length > 1
          ? uri.split('ipfs.io/ipfs/')[1].split('/')[0]
          : uri.split('ipfs.io/ipfs')[1].split('/')[0];

      // List the content of the directory at the provided CID (URI)
      const dir = 'https://ipfs.io/api/v0/ls?arg=' + cid;
      fetch(dir)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          // If there is only one file in the directory, and it is a PDF, we can display it
          if (data.Objects[0].Links.length === 1) {
            const pdf = data.Objects[0].Links[0].Hash;
            const pdfUrl = 'https://ipfs.io/ipfs/' + pdf;
            setLink(pdfUrl);
            setIsDisplayReady(true);
            // If it contains multiple files, we can just display the directory
          } else if (data.Objects[0].Links.length > 1) {
            const pdfUrl = 'https://ipfs.io/ipfs/' + cid;
            setLink(pdfUrl);
            setIsDirectory(true);
            setIsDisplayReady(true);
          }
        });
    } catch (err) {
      setIsError(true);
      console.log(err);
    }
  };

  if (isError) {
    return 'There was an error displaying the PDF';
  }

  if (!isDisplayReady) {
    return <Skeleton active />;
  }

  if (isDirectory) {
    return (
      <div className='pdf-display'>
        <iframe
          title='pdf'
          src={link}
          style={{ height: availableHeight, width: '100%' }}
        />
      </div>
    );
  }

  try {
    return (
      <Worker workerUrl='https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.js'>
        <div
          className='rpv-core__viewer'
          style={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            // Fill the available space in the parent but don't overflow
            height: `${availableHeight}px`,
          }}
        >
          <div
            style={{
              alignItems: 'center',
              backgroundColor: '#eeeeee',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              padding: '0.25rem',
            }}
          >
            <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>;
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Viewer
              fileUrl={link}
              theme='light'
              plugins={[toolbarPluginInstance]}
            />
          </div>
        </div>
      </Worker>
    );
  } catch (error) {
    console.log(error);
    return 'There was an error loading the PDF. Please visit the provided link.';
  }
}

const getAvailableHeightForPdf = () => {
  const navbarHeight = document
    .querySelector('header')
    .getBoundingClientRect().height;

  const panelHeaderHeight = document
    .querySelector('.ant-collapse-header')
    .getBoundingClientRect().height;
  const combinedPanelHeadersHeight =
    document.querySelectorAll('.ant-collapse-item').length * panelHeaderHeight;

  const contentHLeftHeight = document
    .querySelector('.ant-collapse-item-active .card-item.contract-identity')
    .getBoundingClientRect().height;
  const contentRightHeight = document
    .querySelector('.ant-collapse-item-active .card-item.parties')
    .getBoundingClientRect().height;
  const highestContentHeight = Math.max(contentHLeftHeight, contentRightHeight);

  const titleHeight = document
    .querySelector('.header')
    .getBoundingClientRect().height;

  const paginationHeight = document
    .querySelector('.ant-pagination')
    .getBoundingClientRect().height;

  // Main padding (7rem + 4rem)
  const paddingHeight = 11 * 16;
  // Gaps: Header -> Content = 2rem ; Content -> Pagination = 1rem
  const gapHeight = 3 * 16;

  const nowAvailableHeight =
    window.innerHeight -
    navbarHeight -
    combinedPanelHeadersHeight -
    highestContentHeight -
    titleHeight -
    paginationHeight -
    paddingHeight -
    gapHeight;

  return nowAvailableHeight;
};
