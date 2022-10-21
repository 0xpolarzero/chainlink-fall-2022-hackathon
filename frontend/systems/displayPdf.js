import { Viewer, Worker } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { useEffect, useState } from 'react';

const displayPdf = (pdfUri) => {
  const [availableHeight, setAvailableHeight] = useState(0);
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform = (slot) => ({
    ...slot,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  useEffect(() => {
    // We want the PDF to take all the available height
    // but keep seing the Panel content and the other Collapsible headers
    const nowAvailableHeight = getAvailableHeightForPdf();
    setAvailableHeight(nowAvailableHeight < 350 ? 350 : nowAvailableHeight);
  }, []);

  // In the frontend & in the Smart Contract we make sure it can only start with ipfs://
  if (!pdfUri.startsWith('ipfs://')) {
    return <div>Invalid PDF URI. It was not uploaded to IPFS.</div>;
  }

  const formattedUri = formatUri(pdfUri);

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
              fileUrl={formattedUri}
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
};

const formatUri = (uri) => {
  const formattedUri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');

  return formattedUri;
};

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

export { displayPdf };
