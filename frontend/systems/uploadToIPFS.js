import { Web3Storage } from 'web3.storage';

const web3StorageClient = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY,
});

const uploadToIPFS = async (file) => {
  console.log('Received this file', file);

  const cid = await web3StorageClient.put([file]);

  return cid;
};

export { uploadToIPFS };
