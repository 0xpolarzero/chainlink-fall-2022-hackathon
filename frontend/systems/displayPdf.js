import { Viewer, Worker } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';

const displayPdf = (pdfUri) => {
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform = (slot) => ({
    ...slot,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  if (
    !pdfUri.startsWith('ipfs://') &&
    !pdfUri.startsWith('https://ipfs.io/ipfs/')
  ) {
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
            height: '600px',
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

export { displayPdf };
