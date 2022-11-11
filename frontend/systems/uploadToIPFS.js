import { toast } from 'react-toastify';
import { getWeb3StorageClient } from './getWeb3StorageClient';

const web3StorageClient = getWeb3StorageClient();

const uploadToIPFS = async (files, setIpfsUploadProgress) => {
  try {
    // Get the total size of the files
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    let uploadProgress = 0;

    // Update the progress on each chunk
    const onStoredChunk = (size) => {
      uploadProgress += size;
      setIpfsUploadProgress(((uploadProgress / totalSize) * 100).toFixed());
    };

    // Get originFileObj for each file
    const filesArray = files.map((file) => file.originFileObj);

    // Upload files to IPFS
    const cid = await web3StorageClient.put(filesArray, {
      onRootCidReady,
      onStoredChunk,
      maxChunkSize: 1024 * 1024, // 1MiB
    });
    setIpfsUploadProgress(100);

    return cid;
  } catch (err) {
    console.log(err);
    setIpfsUploadProgress('error');
    return false;
  }
};

const onRootCidReady = (cid) => {
  console.log(`Uploading to IPFS: ${cid}`);
};

export { uploadToIPFS };
